-- Migration 018: Trigger to auto-update invoices.amount_paid and status on payment changes
-- Dependencies: 006

-- Function to recompute amount_paid and update invoice status
CREATE OR REPLACE FUNCTION public.recompute_invoice_amount_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_paid NUMERIC(12,2);
  v_total_ttc  NUMERIC(12,2);
  v_invoice_id UUID;
BEGIN
  -- Determine which invoice_id is affected
  IF TG_OP = 'DELETE' THEN
    v_invoice_id := OLD.invoice_id;
  ELSE
    v_invoice_id := NEW.invoice_id;
  END IF;

  -- Sum all payments for this invoice
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM public.payments
  WHERE invoice_id = v_invoice_id;

  -- Get total_ttc of the invoice
  SELECT total_ttc INTO v_total_ttc
  FROM public.invoices
  WHERE id = v_invoice_id;

  -- Update amount_paid and derive status
  UPDATE public.invoices
  SET
    amount_paid = v_total_paid,
    status = CASE
      WHEN v_total_paid >= v_total_ttc THEN 'payee'::invoice_status
      WHEN v_total_paid > 0           THEN 'payee_partiellement'::invoice_status
      ELSE status -- keep current status if no payment
    END,
    payment_date = CASE
      WHEN v_total_paid >= v_total_ttc THEN CURRENT_DATE
      ELSE payment_date
    END
  WHERE id = v_invoice_id;

  RETURN NULL; -- after trigger
END;
$$;

-- Trigger on payments table
DROP TRIGGER IF EXISTS trg_recompute_invoice_paid ON public.payments;
CREATE TRIGGER trg_recompute_invoice_paid
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.recompute_invoice_amount_paid();
