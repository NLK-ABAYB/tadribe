-- Migration 014: Fix ALL RLS infinite recursion (42P17) bugs
--
-- Bug 1 — contacts self-reference (blocks INSERT on companies):
--   11 "entreprise" policies use: company_id IN (SELECT company_id FROM contacts ...)
--   contacts_entreprise_select references itself → companies → contacts → contacts → ∞
--
-- Bug 2 — sessions ↔ enrollments mutual reference (blocks all queries on these tables):
--   sessions_apprenant_select subqueries enrollments;
--   enrollments_formateur_select subqueries sessions.
--   → sessions → enrollments → sessions → ∞
--
-- Fix: SECURITY DEFINER helper functions that bypass RLS to resolve
-- lookup data, then rewrite every cross-table policy to use these helpers.
-- This eliminates all cycles from the RLS dependency graph.
--
-- Supersedes migration 013 (same partial fix, was never applied remotely).

-- =====================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER = bypass RLS, STABLE = cacheable)
-- =====================================================================

-- 1. Returns the company_id(s) accessible to the current 'entreprise' user.
CREATE OR REPLACE FUNCTION public.entreprise_company_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT company_id
  FROM public.contacts
  WHERE user_id = auth.uid()
    AND company_id IS NOT NULL;
$$;

-- 2. Returns session IDs where the current 'formateur' is the assigned trainer.
CREATE OR REPLACE FUNCTION public.formateur_session_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.id
  FROM public.sessions s
  JOIN public.trainers t ON t.id = s.trainer_id
  WHERE t.profile_id = auth.uid();
$$;

-- 3. Returns trainer IDs linked to the current 'formateur' profile.
CREATE OR REPLACE FUNCTION public.formateur_trainer_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.trainers WHERE profile_id = auth.uid();
$$;

-- 4. Returns session IDs for the current 'apprenant'/'apprenti' user.
CREATE OR REPLACE FUNCTION public.apprenant_session_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.session_id
  FROM public.enrollments e
  JOIN public.beneficiaries b ON b.id = e.beneficiary_id
  WHERE b.profile_id = auth.uid();
$$;

-- 5. Returns beneficiary IDs for the current 'apprenant'/'apprenti' profile.
CREATE OR REPLACE FUNCTION public.apprenant_beneficiary_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid();
$$;

-- 6. Returns enrollment IDs for the current 'apprenant'/'apprenti' profile.
CREATE OR REPLACE FUNCTION public.apprenant_enrollment_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.id
  FROM public.enrollments e
  JOIN public.beneficiaries b ON b.id = e.beneficiary_id
  WHERE b.profile_id = auth.uid();
$$;

-- Lock down all helpers: only authenticated users may call them.
REVOKE ALL ON FUNCTION public.entreprise_company_ids() FROM public;
REVOKE ALL ON FUNCTION public.formateur_session_ids() FROM public;
REVOKE ALL ON FUNCTION public.formateur_trainer_ids() FROM public;
REVOKE ALL ON FUNCTION public.apprenant_session_ids() FROM public;
REVOKE ALL ON FUNCTION public.apprenant_beneficiary_ids() FROM public;
REVOKE ALL ON FUNCTION public.apprenant_enrollment_ids() FROM public;

GRANT EXECUTE ON FUNCTION public.entreprise_company_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.formateur_session_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.formateur_trainer_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apprenant_session_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apprenant_beneficiary_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apprenant_enrollment_ids() TO authenticated;

-- =====================================================================
-- BUG 1 FIX: Replace all "entreprise" policies that subquery contacts
-- =====================================================================

-- 1. CONTACTS (self-referencing → now uses helper)
DROP POLICY IF EXISTS "contacts_entreprise_select" ON public.contacts;
CREATE POLICY "contacts_entreprise_select"
  ON public.contacts FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- 2. COMPANIES
DROP POLICY IF EXISTS "companies_entreprise_select" ON public.companies;
CREATE POLICY "companies_entreprise_select"
  ON public.companies FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND id IN (SELECT public.entreprise_company_ids())
  );

-- 3. BENEFICIARIES
DROP POLICY IF EXISTS "beneficiaries_entreprise_select" ON public.beneficiaries;
CREATE POLICY "beneficiaries_entreprise_select"
  ON public.beneficiaries FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- 4. ENROLLMENTS — entreprise
DROP POLICY IF EXISTS "enrollments_entreprise_select" ON public.enrollments;
CREATE POLICY "enrollments_entreprise_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- 5. SESSIONS — entreprise
DROP POLICY IF EXISTS "sessions_entreprise_select" ON public.sessions;
CREATE POLICY "sessions_entreprise_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND id IN (
      SELECT session_id FROM public.enrollments
      WHERE company_id IN (SELECT public.entreprise_company_ids())
    )
  );

-- 6. FUNDING DOSSIERS
DROP POLICY IF EXISTS "funding_entreprise_select" ON public.funding_dossiers;
CREATE POLICY "funding_entreprise_select"
  ON public.funding_dossiers FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- 7. INVOICES
DROP POLICY IF EXISTS "invoices_entreprise_select" ON public.invoices;
CREATE POLICY "invoices_entreprise_select"
  ON public.invoices FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- 8. PAYMENTS
DROP POLICY IF EXISTS "payments_entreprise_select" ON public.payments;
CREATE POLICY "payments_entreprise_select"
  ON public.payments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND invoice_id IN (
      SELECT id FROM public.invoices
      WHERE company_id IN (SELECT public.entreprise_company_ids())
    )
  );

-- 9. DOCUMENTS
DROP POLICY IF EXISTS "documents_entreprise_select" ON public.documents;
CREATE POLICY "documents_entreprise_select"
  ON public.documents FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- 10. COMPLAINTS
DROP POLICY IF EXISTS "complaints_select_own_entreprise" ON public.complaints;
CREATE POLICY "complaints_select_own_entreprise"
  ON public.complaints FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- 11. APPRENTICE VISITS — entreprise
DROP POLICY IF EXISTS "visits_entreprise_select" ON public.apprentice_visits;
CREATE POLICY "visits_entreprise_select"
  ON public.apprentice_visits FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      WHERE e.company_id IN (SELECT public.entreprise_company_ids())
    )
  );

-- =====================================================================
-- BUG 2 FIX: Break sessions ↔ enrollments mutual cycle
-- sessions_apprenant_select → enrollments → enrollments_formateur_select → sessions → ∞
-- =====================================================================

-- SESSIONS — formateur (was safe but now uses helper for consistency)
DROP POLICY IF EXISTS "sessions_formateur_select" ON public.sessions;
CREATE POLICY "sessions_formateur_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND trainer_id IN (SELECT public.formateur_trainer_ids())
  );

-- SESSIONS — apprenant (was subquerying enrollments → cycle)
DROP POLICY IF EXISTS "sessions_apprenant_select" ON public.sessions;
CREATE POLICY "sessions_apprenant_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND id IN (SELECT public.apprenant_session_ids())
  );

-- ENROLLMENTS — formateur (was subquerying sessions → cycle)
DROP POLICY IF EXISTS "enrollments_formateur_select" ON public.enrollments;
CREATE POLICY "enrollments_formateur_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND session_id IN (SELECT public.formateur_session_ids())
  );

-- ENROLLMENTS — apprenant (was subquerying beneficiaries — safe but use helper)
DROP POLICY IF EXISTS "enrollments_apprenant_select" ON public.enrollments;
CREATE POLICY "enrollments_apprenant_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (SELECT public.apprenant_beneficiary_ids())
  );

-- =====================================================================
-- ADDITIONAL: Fix other policies that subquery cross-RLS tables
-- =====================================================================

-- BENEFICIARIES — self (apprenant) — safe but use helper for consistency
DROP POLICY IF EXISTS "beneficiaries_self_select" ON public.beneficiaries;
CREATE POLICY "beneficiaries_self_select"
  ON public.beneficiaries FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND profile_id = auth.uid()
  );

-- TRAINERS — formateur self-select — safe (no cross-ref) but use helper
DROP POLICY IF EXISTS "trainers_self_select" ON public.trainers;
CREATE POLICY "trainers_self_select"
  ON public.trainers FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND profile_id = auth.uid()
  );

-- FUNDING DOSSIERS — apprenant (was subquerying beneficiaries)
DROP POLICY IF EXISTS "funding_apprenant_select" ON public.funding_dossiers;
CREATE POLICY "funding_apprenant_select"
  ON public.funding_dossiers FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (SELECT public.apprenant_beneficiary_ids())
  );

-- INVOICES — apprenant
DROP POLICY IF EXISTS "invoices_apprenant_select" ON public.invoices;
CREATE POLICY "invoices_apprenant_select"
  ON public.invoices FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (SELECT public.apprenant_beneficiary_ids())
  );

-- DOCUMENTS — formateur (was subquerying trainers + sessions)
DROP POLICY IF EXISTS "documents_formateur_select" ON public.documents;
CREATE POLICY "documents_formateur_select"
  ON public.documents FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND (
      trainer_id IN (SELECT public.formateur_trainer_ids())
      OR session_id IN (SELECT public.formateur_session_ids())
    )
  );

-- DOCUMENTS — apprenant
DROP POLICY IF EXISTS "documents_apprenant_select" ON public.documents;
CREATE POLICY "documents_apprenant_select"
  ON public.documents FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (SELECT public.apprenant_beneficiary_ids())
  );

-- COMPLAINTS — apprenant
DROP POLICY IF EXISTS "complaints_select_own_apprenant" ON public.complaints;
CREATE POLICY "complaints_select_own_apprenant"
  ON public.complaints FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (SELECT public.apprenant_beneficiary_ids())
  );

-- APPRENTICE VISITS — apprenti
DROP POLICY IF EXISTS "visits_apprenti_select" ON public.apprentice_visits;
CREATE POLICY "visits_apprenti_select"
  ON public.apprentice_visits FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'apprenti'
    AND enrollment_id IN (SELECT public.apprenant_enrollment_ids())
  );

-- APPRENTICE VISITS — formateur (was subquerying trainers)
DROP POLICY IF EXISTS "visits_formateur_all" ON public.apprentice_visits;
CREATE POLICY "visits_formateur_all"
  ON public.apprentice_visits FOR ALL
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND trainer_id IN (SELECT public.formateur_trainer_ids())
  );

-- EVALUATION RESPONSES — apprenant SELECT
DROP POLICY IF EXISTS "eval_resp_apprenant_select" ON public.evaluation_responses;
CREATE POLICY "eval_resp_apprenant_select"
  ON public.evaluation_responses FOR SELECT
  USING (
    public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (SELECT public.apprenant_beneficiary_ids())
  );

-- EVALUATION RESPONSES — apprenant INSERT
DROP POLICY IF EXISTS "eval_resp_apprenant_insert" ON public.evaluation_responses;
CREATE POLICY "eval_resp_apprenant_insert"
  ON public.evaluation_responses FOR INSERT
  WITH CHECK (
    public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (SELECT public.apprenant_beneficiary_ids())
  );

-- ATTENDANCES — apprenant SELECT (was subquerying enrollments → beneficiaries)
DROP POLICY IF EXISTS "attendances_apprenant_select" ON public.attendances;
CREATE POLICY "attendances_apprenant_select"
  ON public.attendances FOR SELECT
  USING (
    public.user_role() IN ('apprenant', 'apprenti')
    AND enrollment_id IN (SELECT public.apprenant_enrollment_ids())
  );
