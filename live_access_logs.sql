-- Cria tabela para logs de acesso ao dashboard vivo
CREATE TABLE IF NOT EXISTS public.live_dashboard_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    viewer_ip TEXT,
    viewer_region TEXT,
    viewer_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Permissões
ALTER TABLE public.live_dashboard_access_logs ENABLE ROW LEVEL SECURITY;

-- Usuário dono pode ver seus logs
CREATE POLICY "Users can view logs of their dashboard"
ON public.live_dashboard_access_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuário dono pode inserir logs (necessário para a Edge Function via Service Role, mas útil deixar policy)
-- Na verdade, a Edge Function usa Service Role, que ignora RLS. 
-- Mas se quisermos permitir logs vindos do cliente (menos seguro), criaríamos policy.
-- Por enquanto, sem policy de INSERT para anon/authenticated, apenas service_role insere.
