-- Update SEO feature flags with new descriptions (v4.x)
-- Run this in Supabase SQL Editor

UPDATE feature_flags SET
  feature_name = 'SEO & Performance',
  description = 'Core Web Vitals, SERP ranking (Serper.dev), backlinks, concorrentes e visibilidade em LLMs. Auto-restore da última análise salva ao selecionar projeto.'
WHERE feature_key = 'seo_analysis';

UPDATE feature_flags SET
  feature_name = 'Histórico de Análises',
  description = 'Até 10 análises salvas por projeto com auto-restore. Restauração com um clique. Exportação em PDF, HTML e JSON.'
WHERE feature_key = 'performance_monitoring';

UPDATE feature_flags SET
  feature_name = 'Inteligência SEO por IA',
  description = 'Visibilidade em LLMs (Gemini/Claude), backlinks, autoridade de domínio e monitoramento de concorrentes via API keys do usuário.'
WHERE feature_key = 'ai_performance_analysis';
