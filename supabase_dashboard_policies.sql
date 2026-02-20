-- ATENÇÃO: Estes comandos tornam os dados de campanhas, métricas e budget PÚBLICOS para leitura.
-- Isso permite que o dashboard funcione sem login (modo TV), mas qualquer pessoa com a URL do Supabase
-- poderia teoricamente consultar esses dados se souber os endpoints.

-- Habilitar leitura para usuários anônimos (anon) na tabela 'campaigns'
create policy "Enable read access for all users"
on "public"."campaigns"
as PERMISSIVE
for SELECT
to public
using (true);

-- Habilitar leitura para usuários anônimos na tabela 'campaign_metrics'
create policy "Enable read access for all users"
on "public"."campaign_metrics"
as PERMISSIVE
for SELECT
to public
using (true);

-- Habilitar leitura para usuários anônimos na tabela 'budget_allocations'
create policy "Enable read access for all users"
on "public"."budget_allocations"
as PERMISSIVE
for SELECT
to public
using (true);

-- Habilitar leitura para usuários anônimos na tabela 'projects' (necessário para o join projects!inner)
create policy "Enable read access for all users"
on "public"."projects"
as PERMISSIVE
for SELECT
to public
using (true);

-- Se a view v_campaign_metrics_summary não funcionar automaticamente, certifique-se
-- que as tabelas base dela também tenham permissão ou que a view seja SECURITY DEFINER.
-- (Geralmente liberar as tabelas base acima é suficiente para Views SECURITY INVOKER)
