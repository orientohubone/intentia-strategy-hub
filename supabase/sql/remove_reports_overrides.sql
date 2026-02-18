-- Remover todos os overrides da feature de relatórios
-- Isso garante que ninguém tenha acesso privilegiado sem autorização explícita

DELETE FROM user_feature_overrides 
WHERE feature_key = 'reports_feature';

-- Verificar se os overrides foram removidos
SELECT 
  COUNT(*) as overrides_removed
FROM user_feature_overrides 
WHERE feature_key = 'reports_feature';

-- Verificar configuração final
SELECT 
  f.feature_key,
  f.feature_name,
  f.status,
  pf.plan,
  pf.is_enabled as plan_enabled,
  CASE 
    WHEN pf.is_enabled THEN '✅ Plano ATIVO'
    WHEN f.status = 'development' THEN '🔵 Em Desenvolvimento'
    ELSE '❌ Bloqueado'
  END as access_status
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
