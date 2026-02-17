-- UPDATE - Features de Controle de Telas (Upgrade/Development)
-- Melhorar nomes e descrições das features que controlam as telas de aviso

-- Feature que controla o acesso à página de Integrações
UPDATE feature_flags 
SET feature_name = 'Acesso à Página de Integrações',
    description = 'Controla o acesso à página de integrações com plataformas de anúncios (Google, Meta, LinkedIn, TikTok).'
WHERE feature_key = 'meta_ads_integration';

-- Se existirem outras features relacionadas a telas, vamos atualizar também
-- Verificar se há features de controle de telas específicas
UPDATE feature_flags 
SET feature_name = 'Controle de Telas de Upgrade',
    description = 'Gerencia as mensagens e exibição das telas de upgrade para recursos pagos.'
WHERE feature_key LIKE '%upgrade%' OR feature_key LIKE '%screen%';

UPDATE feature_flags 
SET feature_name = 'Controle de Telas de Desenvolvimento',
    description = 'Gerencia as mensagens e exibição das telas de recursos em desenvolvimento.'
WHERE feature_key LIKE '%development%' OR feature_key LIKE '%dev%';

-- Verificar o que foi atualizado
SELECT 
  feature_key,
  feature_name,
  description,
  status,
  status_message
FROM feature_flags 
WHERE feature_key IN ('meta_ads_integration') 
   OR feature_key LIKE '%upgrade%' 
   OR feature_key LIKE '%screen%'
   OR feature_key LIKE '%development%'
   OR feature_key LIKE '%dev%'
ORDER BY feature_key;
