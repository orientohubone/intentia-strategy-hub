-- Correção do trigger de número do ticket
-- O erro está na comparação de bigint com string

-- Remover trigger antigo
DROP TRIGGER IF EXISTS generate_ticket_number_trigger ON support_tickets;

-- Corrigir a função
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  last_number INTEGER;
BEGIN
  year_part := EXTRACT(year FROM CURRENT_DATE)::TEXT;
  
  -- Buscar último ticket do ano (corrigido)
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM '\d+$') AS INTEGER)), 0) 
  INTO last_number
  FROM support_tickets 
  WHERE ticket_number LIKE 'SUP-' || year_part || '-%';
  
  sequence_part := LPAD((last_number + 1)::TEXT, 5, '0');
  NEW.ticket_number := 'SUP-' || year_part || '-' || sequence_part;
  
  -- Calcular SLA baseado na prioridade
  CASE NEW.priority
    WHEN 'baixa' THEN NEW.sla_deadline := NOW() + INTERVAL '24 hours';
    WHEN 'normal' THEN NEW.sla_deadline := NOW() + INTERVAL '8 hours';
    WHEN 'alta' THEN NEW.sla_deadline := NOW() + INTERVAL '4 hours';
    WHEN 'urgente' THEN NEW.sla_deadline := NOW() + INTERVAL '1 hour';
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();
