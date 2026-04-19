-- Migration 019: link profiles to beneficiary/contact + invite tracking
-- Dependencies: 002, 003, 005

-- Add portal link columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS beneficiary_id uuid REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_beneficiary ON public.profiles(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_profiles_contact ON public.profiles(contact_id);

-- Backfill: if a beneficiary has profile_id set, mirror to profiles.beneficiary_id
UPDATE public.profiles p
SET beneficiary_id = b.id
FROM public.beneficiaries b
WHERE b.profile_id = p.id
  AND p.beneficiary_id IS NULL;

-- Backfill: if a contact has user_id set, mirror to profiles.contact_id
UPDATE public.profiles p
SET contact_id = c.id
FROM public.contacts c
WHERE c.user_id = p.id
  AND p.contact_id IS NULL;

-- Self-select policy already exists (migration 012). Make sure portal users
-- can always read their own profile row even when no organization_id yet.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_select_self'
  ) THEN
    CREATE POLICY "profiles_select_self"
      ON public.profiles FOR SELECT
      USING (id = auth.uid());
  END IF;
END $$;
