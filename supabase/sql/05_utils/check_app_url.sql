-- =====================================================
-- VERIFICAR APP_URL CONFIGURADO
-- =====================================================

-- Verificar se APP_URL está configurado
SELECT 'APP_URL configurado' as status, value 
FROM pg_settings 
WHERE name = 'app.url';

-- Verificar secrets (não visível via SQL, mas pode testar)
-- Esta query vai falhar se não tiver APP_URL
-- SELECT current_setting('app.url', true);
