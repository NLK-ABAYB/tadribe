-- Migration 023: link quotes → conventions for conversion flow
-- Dependencies: 016 (quotes), 017 (conventions)
--
-- Note: opcos, companies.opco_id and session_slots.topic already exist from
-- migration 003 / 005. This migration only adds the quote→convention link.

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS converted_convention_id uuid REFERENCES public.conventions(id) ON DELETE SET NULL;
