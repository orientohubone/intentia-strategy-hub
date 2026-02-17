-- =====================================================
-- LIMPAR E CONSERTAR USUÁRIO META
-- =====================================================

-- 1. Remover tenant_settings órfado
DELETE FROM tenant_settings 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'meta-review@orientohub.com.br'
);

-- 2. Verificar se ainda existe em tenant_settings (deveria estar vazio)
SELECT 'tenant_settings após delete', COUNT(*) as count FROM tenant_settings 
WHERE company_name = 'Meta';

-- 3. Verificar auth.users (deveria estar vazio)
SELECT 'auth.users', COUNT(*) as count FROM auth.users 
WHERE email = 'meta-review@orientohub.com.br';

-- 4. Agora pode criar novo usuário via signup
-- (execute pela página: /create-meta-user)

-- 5. Ou criar manualmente via Admin API (se tiver acesso)
-- SELECT * FROM auth.users WHERE email = 'meta-review@orientohub.com.br';
