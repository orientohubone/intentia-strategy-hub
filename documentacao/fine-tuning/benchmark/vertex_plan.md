# Plano de Implementação — Vertex AI (Saúde da Operação x Benchmark)

## Objetivo
Preparar uso do Vertex AI (text/chat ou fine-tune futuro) para entregar insights de "Saúde da Operação x Benchmark" via Edge Function segura.

## Estrutura de Dados
- Formato: `.jsonl` (uma linha por objeto).
- Schema sugerido:
  ```json
  {"input": "texto/indicadores", "targets": {"score": 0-100, "alertas": []}, "metadata": {"canal": "meta|google|linkedin|tiktok", "nicho": "b2b", "kpis": {"cpc": 1.2, "cpa": 50, "roas": 2.3}, "fonte": "interno|benchmark"}}
  ```
- Idioma: pt-BR. Normalizar métricas (BRL). Marcar fonte (interno/benchmark).
- Manifest opcional (manifest.json): dataset_version, hash, row_count.

## Armazenamento
- Bucket GCS dedicado (ex.: `vertex-training-benchmark`).
- Layout: `bench_ops_v1/part-000.jsonl` etc.
- Acesso mínimo: service account com Storage read, Vertex AI user.

## Segredos
- Criar SA key JSON com permissão mínima.
- Salvar no Supabase (project `vofizgftwxgyosjrwcqy`): `GOOGLE_VERTEX_SA_KEY`, `GOOGLE_VERTEX_REGION` (ex.: `southamerica-east1`).

## Edge Function (nova)
- Nome sugerido: `vertex-benchmark`.
- Passos: validar token Supabase -> ler payload (projectId, canal, KPIs) -> montar prompt/chamada Vertex -> retornar score/insights.
- Não expor SA key: usar google-auth para assinar requisição (workload identity se disponível; caso contrário, chave JSON via secret).
- Logs em tabela `vertex_logs` (user_id, project_id, channel, request_id, latency, status). Rate limit por usuário (ex.: 10/min).

## Chamadas Vertex
- MVP: modelo generativo (text/chat) via REST.
- Futuro: fine-tune no Vertex com o `.jsonl` (registrar job_id/status).
- Region única p/ reduzir latência/custo.

## Integração Front
- Card “Saúde da Operação x Benchmark” chama `vertex-benchmark` e exibe: score, alertas por canal, benchmark de referência, recomendações de budget/ROI/CAC-LTV.
- Cache curto (TanStack Query) p/ evitar excesso de chamadas.

## Próximos Passos
1) Definir dataset benchmark e gerar `.jsonl` + manifest.
2) Criar bucket GCS e subir arquivos.
3) Provisionar service account + secrets no Supabase.
4) Implementar Edge `vertex-benchmark` (auth + chamada Vertex + formatação resposta).
5) Conectar card no LiveDashboard e validar latência/custos.
