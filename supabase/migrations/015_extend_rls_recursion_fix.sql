-- Migration 015: Extend RLS recursion fix to remaining policies
--
-- Migration 014 introduced SECURITY DEFINER helpers and rewrote most
-- cross-table policies on contacts/companies/sessions/enrollments/...
-- This migration:
--   * re-asserts the helpers (idempotent: CREATE OR REPLACE) as a safety net
--     if 014 was partially applied or rolled back
--   * extends the helper pattern to attendances_formateur_all, which still
--     used an inline enrollments × sessions × trainers JOIN
--   * rewrites a few remaining USING clauses on sessions/enrollments that
--     still referenced contacts directly, to use entreprise_company_ids()
--
-- Safe to re-run on any database state (all DROPs are IF EXISTS and all
-- CREATE FUNCTIONs use OR REPLACE).

-- =====================================================================
-- HELPERS (idempotent re-creation)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.entreprise_company_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT company_id
  FROM public.contacts
  WHERE user_id = auth.uid()
    AND company_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.formateur_session_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.id
  FROM public.sessions s
  JOIN public.trainers t ON t.id = s.trainer_id
  WHERE t.profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.formateur_trainer_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.trainers WHERE profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.apprenant_session_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.session_id
  FROM public.enrollments e
  JOIN public.beneficiaries b ON b.id = e.beneficiary_id
  WHERE b.profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.apprenant_beneficiary_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.apprenant_enrollment_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.id
  FROM public.enrollments e
  JOIN public.beneficiaries b ON b.id = e.beneficiary_id
  WHERE b.profile_id = auth.uid();
$$;

-- New: enrollment IDs belonging to the current 'entreprise' user.
CREATE OR REPLACE FUNCTION public.entreprise_enrollment_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.enrollments
  WHERE company_id IN (SELECT public.entreprise_company_ids());
$$;

-- New: invoice IDs belonging to the current 'entreprise' user.
CREATE OR REPLACE FUNCTION public.entreprise_invoice_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.invoices
  WHERE company_id IN (SELECT public.entreprise_company_ids());
$$;

REVOKE ALL ON FUNCTION public.entreprise_company_ids() FROM public;
REVOKE ALL ON FUNCTION public.formateur_session_ids() FROM public;
REVOKE ALL ON FUNCTION public.formateur_trainer_ids() FROM public;
REVOKE ALL ON FUNCTION public.apprenant_session_ids() FROM public;
REVOKE ALL ON FUNCTION public.apprenant_beneficiary_ids() FROM public;
REVOKE ALL ON FUNCTION public.apprenant_enrollment_ids() FROM public;
REVOKE ALL ON FUNCTION public.entreprise_enrollment_ids() FROM public;
REVOKE ALL ON FUNCTION public.entreprise_invoice_ids() FROM public;

GRANT EXECUTE ON FUNCTION public.entreprise_company_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.formateur_session_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.formateur_trainer_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apprenant_session_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apprenant_beneficiary_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apprenant_enrollment_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.entreprise_enrollment_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.entreprise_invoice_ids() TO authenticated;

-- =====================================================================
-- RE-APPLY SESSIONS / ENROLLMENTS POLICIES (safety net, idempotent)
-- =====================================================================

-- sessions_formateur_select (uses formateur_trainer_ids helper)
DROP POLICY IF EXISTS "sessions_formateur_select" ON public.sessions;
CREATE POLICY "sessions_formateur_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND trainer_id IN (SELECT public.formateur_trainer_ids())
  );

-- sessions_apprenant_select (uses apprenant_session_ids helper)
DROP POLICY IF EXISTS "sessions_apprenant_select" ON public.sessions;
CREATE POLICY "sessions_apprenant_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND id IN (SELECT public.apprenant_session_ids())
  );

-- sessions_entreprise_select (now goes through entreprise_enrollment_ids)
DROP POLICY IF EXISTS "sessions_entreprise_select" ON public.sessions;
CREATE POLICY "sessions_entreprise_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND id IN (
      SELECT session_id FROM public.enrollments
      WHERE id IN (SELECT public.entreprise_enrollment_ids())
    )
  );

-- enrollments_formateur_select (uses formateur_session_ids helper)
DROP POLICY IF EXISTS "enrollments_formateur_select" ON public.enrollments;
CREATE POLICY "enrollments_formateur_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND session_id IN (SELECT public.formateur_session_ids())
  );

-- enrollments_apprenant_select (uses apprenant_beneficiary_ids helper)
DROP POLICY IF EXISTS "enrollments_apprenant_select" ON public.enrollments;
CREATE POLICY "enrollments_apprenant_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (SELECT public.apprenant_beneficiary_ids())
  );

-- enrollments_entreprise_select (uses entreprise_company_ids helper)
DROP POLICY IF EXISTS "enrollments_entreprise_select" ON public.enrollments;
CREATE POLICY "enrollments_entreprise_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- =====================================================================
-- ATTENDANCES: rewrite formateur policy using helpers (was inline JOIN)
-- =====================================================================

DROP POLICY IF EXISTS "attendances_formateur_all" ON public.attendances;
CREATE POLICY "attendances_formateur_all"
  ON public.attendances FOR ALL
  USING (
    public.user_role() = 'formateur'
    AND enrollment_id IN (
      SELECT id FROM public.enrollments
      WHERE session_id IN (SELECT public.formateur_session_ids())
    )
  );

-- attendances_apprenant_select (safety re-apply)
DROP POLICY IF EXISTS "attendances_apprenant_select" ON public.attendances;
CREATE POLICY "attendances_apprenant_select"
  ON public.attendances FOR SELECT
  USING (
    public.user_role() IN ('apprenant', 'apprenti')
    AND enrollment_id IN (SELECT public.apprenant_enrollment_ids())
  );

-- =====================================================================
-- COMPANIES / CONTACTS / BENEFICIARIES / INVOICES (idempotent safety net)
-- =====================================================================

DROP POLICY IF EXISTS "contacts_entreprise_select" ON public.contacts;
CREATE POLICY "contacts_entreprise_select"
  ON public.contacts FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

DROP POLICY IF EXISTS "companies_entreprise_select" ON public.companies;
CREATE POLICY "companies_entreprise_select"
  ON public.companies FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND id IN (SELECT public.entreprise_company_ids())
  );

DROP POLICY IF EXISTS "beneficiaries_entreprise_select" ON public.beneficiaries;
CREATE POLICY "beneficiaries_entreprise_select"
  ON public.beneficiaries FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

DROP POLICY IF EXISTS "invoices_entreprise_select" ON public.invoices;
CREATE POLICY "invoices_entreprise_select"
  ON public.invoices FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

DROP POLICY IF EXISTS "payments_entreprise_select" ON public.payments;
CREATE POLICY "payments_entreprise_select"
  ON public.payments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND invoice_id IN (SELECT public.entreprise_invoice_ids())
  );

DROP POLICY IF EXISTS "funding_entreprise_select" ON public.funding_dossiers;
CREATE POLICY "funding_entreprise_select"
  ON public.funding_dossiers FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

DROP POLICY IF EXISTS "documents_entreprise_select" ON public.documents;
CREATE POLICY "documents_entreprise_select"
  ON public.documents FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

DROP POLICY IF EXISTS "complaints_select_own_entreprise" ON public.complaints;
CREATE POLICY "complaints_select_own_entreprise"
  ON public.complaints FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

DROP POLICY IF EXISTS "visits_entreprise_select" ON public.apprentice_visits;
CREATE POLICY "visits_entreprise_select"
  ON public.apprentice_visits FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND enrollment_id IN (SELECT public.entreprise_enrollment_ids())
  );
