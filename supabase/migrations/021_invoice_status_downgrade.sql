-- Migration 021: fix invoice status downgrade when all payments are deleted
-- Dependencies: 018

CREATE OR REPLACE FUNCTION public.recompute_invoice_amount_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_invoice uuid := COALESCE(NEW.invoice_id, OLD.invoice_id);
  paid numeric(12,2);
  total numeric(12,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO paid
  FROM public.payments
  WHERE invoice_id = target_invoice;

  SELECT total_ttc INTO total
  FROM public.invoices
  WHERE id = target_invoice;

  UPDATE public.invoices
  SET
    amount_paid = paid,
    status = CASE
      WHEN paid >= total AND total > 0                 THEN 'payee'::invoice_status
      WHEN paid > 0                                    THEN 'payee_partiellement'::invoice_status
      WHEN paid = 0 AND status IN ('payee','payee_partiellement') THEN 'emise'::invoice_status
      ELSE status
    END,
    payment_date = CASE
      WHEN paid >= total AND total > 0 THEN COALESCE(payment_date, CURRENT_DATE)
      WHEN paid = 0                    THEN NULL
      ELSE payment_date
    END
  WHERE id = target_invoice;

  RETURN COALESCE(NEW, OLD);
END;
$$;
