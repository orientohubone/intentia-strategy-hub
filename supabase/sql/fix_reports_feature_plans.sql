-- Corrigir configuração da feature de relatórios
-- Desativar para todos os planos por padrão (só com override)

UPDATE plan_features 
SET is_enabled = false, updated_at = NOW()
WHERE feature_key = 'reports_feature';

-- Verificar configuração atual
SELECT 
  f.feature_key,
  f.feature_name,
  f.status,
  pf.plan,
  pf.is_enabled as plan_enabled,
  CASE 
    WHEN pf.is_enabled THEN '✅ Ativo'
    ELSE '❌ Inativo'
  END as status_display
FROM feature_flags f
LEFT JOIN plan_features pf ON f.feature_key = pf.feature_key
WHERE f.feature_key = 'reports_feature'
ORDER BY 
  CASE pf.plan 
    WHEN 'starter' THEN 1
    WHEN 'professional' THEN 2
    WHEN 'enterprise' THEN 3
    ELSE 4
  END;
