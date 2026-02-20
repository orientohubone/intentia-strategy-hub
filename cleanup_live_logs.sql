-- Opção 1: Limpeza TOTAL imediata (Zera o contador agora)
TRUNCATE TABLE public.live_dashboard_access_logs;

-- Opção 2: Limpeza de registros antigos (ex: mais antigos que 24 horas)
-- Útil para rodar periodicamente (cron job) e não deixar a tabela crescer infinitamente
DELETE FROM public.live_dashboard_access_logs
WHERE created_at < NOW() - INTERVAL '24 hours';
