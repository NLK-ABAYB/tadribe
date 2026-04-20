-- supabase/seed.sql
-- Run after migrations to seed demo/test data.
-- Each block is idempotent: re-running the file will not duplicate rows.

-- Invoice line for FAC-2024-001 (was missing — caused empty PDF table on the demo invoice).
-- Total HT for this invoice is 3 600,00 €.
INSERT INTO public.invoice_lines (invoice_id, description, quantity, unit_price_ht, total_ht, line_order)
SELECT i.id, 'Formation Management d''équipe en environnement agile', 1, 3600, 3600, 0
FROM public.invoices i
WHERE i.invoice_number = 'FAC-2024-001'
  AND NOT EXISTS (
    SELECT 1 FROM public.invoice_lines l WHERE l.invoice_id = i.id
  );
