-- Permitir INSERT público na tabela de logs (para garantir que a Edge Function ou Client consiga gravar mesmo se a role não for service_role por algum motivo de config)
CREATE POLICY "Enable insert for all users"
ON "public"."live_dashboard_access_logs"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);
