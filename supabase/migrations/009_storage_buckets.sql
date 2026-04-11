-- Migration 009: Supabase Storage buckets + policies
-- Dependances : 002

-- ===================== STORAGE BUCKETS =====================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', false),
  ('avatars', 'avatars', true),
  ('logos', 'logos', true);

-- ===================== STORAGE POLICIES: documents =====================
-- Structure: {organization_id}/{type}/{filename}

-- Staff peut tout faire dans le bucket documents de son org
CREATE POLICY "documents_staff_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND public.is_staff()
    AND (storage.foldername(name))[1] = public.organization_id()::text
  );

CREATE POLICY "documents_staff_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND public.is_staff()
    AND (storage.foldername(name))[1] = public.organization_id()::text
  );

CREATE POLICY "documents_staff_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND public.is_staff()
    AND (storage.foldername(name))[1] = public.organization_id()::text
  );

CREATE POLICY "documents_staff_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = public.organization_id()::text
  );

-- Formateur peut lire les documents de son org
CREATE POLICY "documents_formateur_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND public.user_role() = 'formateur'
    AND (storage.foldername(name))[1] = public.organization_id()::text
  );

-- Apprenants peuvent lire les documents de leur org
CREATE POLICY "documents_apprenant_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND (storage.foldername(name))[1] = public.organization_id()::text
  );

-- ===================== STORAGE POLICIES: avatars =====================

CREATE POLICY "avatars_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===================== STORAGE POLICIES: logos =====================

CREATE POLICY "logos_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "logos_manage_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND public.is_admin()
    AND (storage.foldername(name))[1] = public.organization_id()::text
  );
