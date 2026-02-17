-- Verificar todas as features que podem estar relacionadas a telas
SELECT 
  feature_key,
  feature_name,
  description,
  status,
  status_message,
  category
FROM feature_flags 
WHERE 
  feature_key LIKE '%integration%' 
  OR feature_key LIKE '%screen%'
  OR feature_key LIKE '%upgrade%'
  OR feature_key LIKE '%development%'
  OR feature_key LIKE '%dev%'
  OR feature_key LIKE '%gate%'
  OR feature_key LIKE '%access%'
  OR feature_name LIKE '%telas%'
  OR feature_name LIKE '%screens%'
  OR description LIKE '%telas%'
  OR description LIKE '%screens%'
ORDER BY category, sort_order;
