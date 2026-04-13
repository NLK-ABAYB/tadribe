-- Migration 013: Fix RLS infinite recursion on contacts table (error 42P17)
--
-- Root cause: contacts_entreprise_select policy has a self-referencing subquery:
--   company_id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
-- This causes PostgreSQL to re-evaluate the same policy recursively.
--
-- Fix: Create a SECURITY DEFINER helper function that bypasses RLS to look up
-- the entreprise user's company_id(s), then rewrite all policies that reference
-- contacts in subqueries to use this helper instead.

-- ===================== HELPER FUNCTION =====================

-- Returns the company_id(s) accessible to the current 'entreprise' user,
-- bypassing RLS to avoid infinite recursion.
CREATE OR REPLACE FUNCTION public.entreprise_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.contacts
  WHERE user_id = auth.uid()
    AND company_id IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.entreprise_company_ids() FROM public;
GRANT EXECUTE ON FUNCTION public.entreprise_company_ids() TO authenticated;

-- ===================== FIX CONTACTS POLICIES =====================

-- Drop the problematic self-referencing policy
DROP POLICY IF EXISTS "contacts_entreprise_select" ON public.contacts;

-- Recreate using the helper function (no self-reference)
CREATE POLICY "contacts_entreprise_select"
  ON public.contacts FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== FIX COMPANIES POLICIES =====================

DROP POLICY IF EXISTS "companies_entreprise_select" ON public.companies;

CREATE POLICY "companies_entreprise_select"
  ON public.companies FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== FIX BENEFICIARIES POLICIES =====================

DROP POLICY IF EXISTS "beneficiaries_entreprise_select" ON public.beneficiaries;

CREATE POLICY "beneficiaries_entreprise_select"
  ON public.beneficiaries FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== FIX ENROLLMENTS POLICIES =====================

DROP POLICY IF EXISTS "enrollments_entreprise_select" ON public.enrollments;

CREATE POLICY "enrollments_entreprise_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== FIX SESSIONS POLICIES =====================

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

-- ===================== FIX FUNDING DOSSIERS POLICIES =====================

DROP POLICY IF EXISTS "funding_entreprise_select" ON public.funding_dossiers;

CREATE POLICY "funding_entreprise_select"
  ON public.funding_dossiers FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== FIX INVOICES POLICIES =====================

DROP POLICY IF EXISTS "invoices_entreprise_select" ON public.invoices;

CREATE POLICY "invoices_entreprise_select"
  ON public.invoices FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== FIX PAYMENTS POLICIES =====================

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

-- ===================== FIX DOCUMENTS POLICIES =====================

DROP POLICY IF EXISTS "documents_entreprise_select" ON public.documents;

CREATE POLICY "documents_entreprise_select"
  ON public.documents FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== FIX COMPLAINTS POLICIES =====================

DROP POLICY IF EXISTS "complaints_select_own_entreprise" ON public.complaints;

CREATE POLICY "complaints_select_own_entreprise"
  ON public.complaints FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== FIX APPRENTICE VISITS POLICIES =====================

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
