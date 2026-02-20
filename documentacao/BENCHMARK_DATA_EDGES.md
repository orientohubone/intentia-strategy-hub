# Benchmark Data Edge Function Strategy

## Objetivo
O objetivo é centralizar os benchmarks de CAC:LTV por nicho em uma edge function (`benchmark-data`). Ela ficará responsável por:

1. Agregar métricas de fontes externas (IBGE, Sebrae, forecasting, marketing analytics, etc.).
2. Normalizar e armazenar os snapshots agregados em `benchmark_external_snapshots`.
3. Retornar um payload com o conjunto de benchmarks, média ponderada e timestamp da última coleta.
4. Permitir refresh via POST (e.g., cron semanal) para garantir dados atualizados.

## Endpoints e payloads
| Método | Caminho | Descrição | Segurança |
|--------|---------|-----------|-----------|
| GET | `/functions/v1/benchmark-data` | Retorna os snapshots mais recentes, média ponderada e `lastUpdated` da orquestração de inteligência competitiva. | Chave `apikey` (anonimo ou service role). |
| POST | `/functions/v1/benchmark-data` | Chama a API Apistemic (via `APISTEMIC_KEY`/`HOST`/`PATH`) para normalizar os resultados e atualizar a tabela `benchmark_external_snapshots`. | Chave `apikey`.

**Resposta esperada:**
```json
{
  "benchmarks": [
    {
      "niche_id": "saas-erp",
      "label": "SaaS ERP",
      "ratio": 3,
      "fetched_at": "2026-02-20T12:00:00Z",
      "source_data": { "ci_source": "competitive-intelligence-service" }
    }
  ],
  "weightedAverage": 3.1,
  "lastUpdated": "2026-02-20T12:00:00Z"
}
```

## Competitive intelligence orchestration
1. **Apistemic**: a edge function chama diretamente a API Apistemic usando `APISTEMIC_KEY`, `APISTEMIC_HOST` e `APISTEMIC_PATH`. O payload esperado deve conter `{ benchmarks: [...] }` (ou `{ data: { benchmarks: [...] } }`).
2. **Normalização**: o handler aplica `normalizeSnapshot` aos resultados para garantir campos obrigatórios (display, source_data, weight) e continua usando `CI_DEFAULT_SNAPSHOTS` quando necessário.
3. **Fallback**: se a Apistemic não responder dentro de 5 segundos ou falhar, o fallback já garante valores default para manter o frontend vivo.

## Cron job semanal
Recomendo configurar via CLI do Supabase após deploy:
```
supabase functions jobs create benchmark-data-weekly --schedule "@weekly" benchmark-data --payload '{"action":"refresh"}'
```
Ou usar `supabase functions jobs update` para editar o job. O job aciona `POST /functions/v1/benchmark-data` e registra logs no Supabase.

## Segurança e monitoramento
- Autorize apenas chave `apikey` (mesma usada pelo hook frontend).  O backend valida contra `ANON_KEY` e `SERVICE_ROLE_KEY`.
- Logs podem ser enviados para `benchmark_data_logs` (tabela adicional) se necessário.
- Registre sucesso/falha e número de fontes que realmente retornaram dados.

## Coordenação com frontend
- O hook `useBenchmarkData` (`src/hooks/useBenchmarkData.ts`) consome o GET e lida com fallback automático.
- Caso o endpoint falhe, o fallback usa valores estáticos de `fallbackBenchmarkSnapshots()` e ainda exibe o aviso no dialog.
- Este documento serve para quando as novas fontes reais forem liberadas: basta apontar os endpoints e mapear os campos na função.

## Passo a passo para colocar o pipeline em produção
1. **Atualize o schema de banco**
   - Execute `supabase db reset` (ou o equivalente do seu processo) para aplicar a migration `supabase/sql/04_migrations/add_benchmark_external_snapshots.sql`.
   - Verifique se a tabela `benchmark_external_snapshots` existe com colunas `niche_id`, `ratio`, `source_data` e timestamps.
2. **Configure o endpoint de inteligência competitiva**
   - A função agora espera uma única URL em `CI_DATA_ENDPOINT` que aproxime dados agregados. Garanta que o payload tenha `{ benchmarks: [...] }` ou `{ data: { benchmarks: [...] } }`.
   - Caso a orquestração não esteja disponível, você pode usar `APISTEMIC_KEY`, `APISTEMIC_HOST` e `APISTEMIC_PATH` para consultar diretamente a API da Apistemic como fallback.
3. **Ajuste variáveis de ambiente**
   - Garanta `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_ANON_KEY` valuam nos segredos da função.
   - Se a função for chamada via webhook/cron, exponha a `apikey` (pode ser a anon key) para o hook frontend.
4. **Faça o deploy da Edge Function**
   - Rode `supabase functions deploy benchmark-data` após atualizar o código.
   - Teste manualmente com `supabase functions call benchmark-data --payload '{}' --method GET` e verifique a resposta JSON.
5. **Agende o cron semanal**
   - Use `supabase functions jobs create benchmark-data-weekly --schedule "@weekly" benchmark-data --payload '{"action":"refresh"}'`.
   - Valide em `supabase functions jobs list` que o job está ativo e que as últimas execuções retornam 200.
6. **Verifique o hook/frontend**
   - Atualize `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` do frontend para apontar ao projeto real.
   - Confirme que `DialogFatorLtv` exibe a média ponderada, lista os novos nichos e mostra a fonte ao clicar em “Ver lista”.
7. **Monitore falhas ou atualizações**
   - Opcional: crie a tabela `benchmark_data_logs` e injete logs dentro da function para registrar erros e os endpoints consultados.
   - Caso a coleta falhe, use o botão “Atualizar” no dialog para acionar manualmente o POST e veja os logs do Supabase para diagnosticar.
