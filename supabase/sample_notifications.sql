-- =====================================================
-- SAMPLE NOTIFICATIONS FOR TESTING
-- =====================================================

-- Substitua USER_ID_HERE pelo ID real do usuário
-- Você pode encontrar o ID executando: SELECT auth.uid();

-- Inserir notificações de exemplo para teste
INSERT INTO notifications (user_id, title, message, type, action_url, action_text) VALUES
('USER_ID_HERE', 'Bem-vindo ao Intentia!', 'Sua conta foi configurada com sucesso. Comece criando seu primeiro projeto.', 'success', '/projects', 'Criar Projeto'),
('USER_ID_HERE', 'Dica Rápida', 'Sabia que você pode fazer upload da sua foto de perfil? Vá para Configurações para personalizar seu avatar.', 'info', '/settings', 'Configurar Perfil'),
('USER_ID_HERE', 'Primeiros Passos', 'Explore nosso centro de ajuda para tirar máximo proveito da plataforma.', 'info', '/help', 'Ver Ajuda'),
('USER_ID_HERE', 'Benchmark Disponível', 'A funcionalidade de análise competitiva está pronta para uso. Compare-se com concorrentes!', 'success', '/benchmark', 'Fazer Análise');

-- =====================================================
-- COMO USAR:
-- =====================================================

-- 1. Encontre seu user_id executando: SELECT auth.uid();
-- 2. Substitua USER_ID_HERE pelo seu ID real
-- 3. Execute este SQL para criar notificações de teste
-- 4. Recarregue o dashboard e clique no ícone de sinos no header

-- =====================================================
-- VERIFICAÇÃO:
-- =====================================================

-- Para verificar se as notificações foram criadas:
-- SELECT * FROM notifications WHERE user_id = 'SEU_USER_ID_AQUI' ORDER BY created_at DESC;
