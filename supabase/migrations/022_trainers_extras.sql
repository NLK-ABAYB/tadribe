-- Migration 022: extend trainers with SIRET and certifications
-- Dependencies: 004 (trainers)

ALTER TABLE public.trainers
  ADD COLUMN IF NOT EXISTS siret text,
  ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb;

-- Allow SIRET uniqueness when set (organizational scope — same trainer can
-- exist under two orgs conceptually, so scope by organization_id via a partial
-- index rather than a unique constraint on the column alone).
CREATE UNIQUE INDEX IF NOT EXISTS idx_trainers_siret_per_org
  ON public.trainers(organization_id, siret)
  WHERE siret IS NOT NULL;
