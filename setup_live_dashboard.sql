-- =================================================================================================
-- CONFIGURAÇÃO COMPLETA DO LIVE DASHBOARD (ACESSO PÚBLICO/TV)
-- =================================================================================================

-- 1. Cria tabela para logs de acesso ao dashboard vivo
CREATE TABLE IF NOT EXISTS public.live_dashboard_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    viewer_ip TEXT,
    viewer_region TEXT,
    viewer_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita RLS (Row Level Security)
ALTER TABLE public.live_dashboard_access_logs ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Usuário autenticado (dono) pode ver APENAS seus próprios logs
-- Isso garante que um usuário não veja quem está assistindo o dashboard de outro usuário.
CREATE POLICY "Users can view logs of their dashboard"
ON public.live_dashboard_access_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Policy PERMISSIVA: Permitir INSERT público na tabela de logs 
-- Necessário para que a Edge Function (ou cliente anônimo, se configurado assim) consiga gravar logs.
-- A flag AS PERMISSIVE garante que esta regra se sobreponha a restrições padrões.
CREATE POLICY "Enable insert for all users"
ON "public"."live_dashboard_access_logs"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

-- =================================================================================================
-- MANUTENÇÃO E LIMPEZA (Execute manualmente ou configure via pg_cron)
-- =================================================================================================

-- Exemplo 1: Limpeza TOTAL imediata (Zera o contador de espectadores)
-- TRUNCATE TABLE public.live_dashboard_access_logs;

-- Exemplo 2: Limpeza automática de registros antigos (ex: > 24 horas)
-- Recomendado configurar isso via pg_cron se disponível no seu plano Supabase.
-- DELETE FROM public.live_dashboard_access_logs WHERE created_at < NOW() - INTERVAL '24 hours';
