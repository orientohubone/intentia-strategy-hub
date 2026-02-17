-- UPDATE - Feature de Controle Geral de Integrações
-- Melhorar a feature que controla o acesso à página de Integrações

UPDATE feature_flags 
SET feature_name = 'Página de Integrações de Marketing',
    description = 'Acesso à página completa de integrações com plataformas de anúncios. Controla a exibição dos cards de conexão e gerenciamento de contas do Google Ads, Meta Ads, LinkedIn Ads e TikTok Ads.',
    status = 'active',
    status_message = 'Conecte suas contas de anúncios. Disponível nos planos Professional e Enterprise.'
WHERE feature_key = 'integrations';

-- Verificar a atualização
SELECT 
  feature_key,
  feature_name,
  description,
  status,
  status_message,
  category
FROM feature_flags 
WHERE feature_key = 'integrations';
