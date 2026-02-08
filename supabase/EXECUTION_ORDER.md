# Guia de Execução — Segurança, Backup & Guardrails

## Ordem de Execução no Supabase SQL Editor

Execute os scripts **nesta ordem exata** no SQL Editor do Supabase Dashboard:

### 1. Security Hardening (PRIMEIRO)
```
security_hardening.sql
```
- Corrige vulnerabilidades em `contact_messages` (SELECT aberto)
- Isola storage de avatars por `user_id`
- Adiciona `security_invoker` nas views
- Previne escalação de plano via client
- Previne reset do contador de análises

### 2. Audit Log
```
audit_log.sql
```
- Cria tabela `audit_log`
- Instala triggers em **todas as 13 tabelas**
- Registra INSERT/UPDATE/DELETE automaticamente
- Remove campos sensíveis (`api_key_encrypted`, `html_snapshot`) dos logs
- Função de cleanup (90 dias)

### 3. User Backup System
```
user_backup.sql
```
- Cria tabela `user_data_backups`
- Função `create_user_backup()` — snapshot completo do tenant
- Função `get_user_backup_data()` — recuperar backup com verificação de ownership
- Trigger automático antes de DELETE em projects
- Backups expiram em 90 dias
- Cleanup automático de backups expirados

### 4. Guardrails
```
guardrails.sql
```
- Soft delete em `projects`, `audiences`, `benchmarks`, `tactical_plans`
- Atualiza RLS para filtrar soft-deleted
- Funções `soft_delete_project()` e `restore_project()`
- Rate limiting com tabela `rate_limits`
- Limite de projetos por plano (Starter: 3, Pro: ilimitado)
- Limite de análises por plano (Starter: 5/mês)
- Rate limit em criação de projetos (10/hora Starter, 50/hora Pro)
- Cleanup automático de soft-deleted (30 dias)

## Cron Jobs (pg_cron)

Após executar os scripts, agende os cron jobs no Supabase:

```sql
-- Limpar audit logs antigos (domingos às 3h)
SELECT cron.schedule('cleanup-audit-logs', '0 3 * * 0', 'SELECT public.cleanup_old_audit_logs()');

-- Limpar backups expirados (domingos às 4h)
SELECT cron.schedule('cleanup-expired-backups', '0 4 * * 0', 'SELECT public.cleanup_expired_backups()');

-- Limpar rate limits antigos (diário às 5h)
SELECT cron.schedule('cleanup-rate-limits', '0 5 * * *', 'SELECT public.cleanup_old_rate_limits()');

-- Limpar soft-deleted (1º de cada mês às 6h)
SELECT cron.schedule('cleanup-soft-deleted', '0 6 1 * *', 'SELECT public.cleanup_soft_deleted()');

-- Limpar notificações lidas antigas (domingos às 3h30)
SELECT cron.schedule('cleanup-old-notifications', '30 3 * * 0', 'SELECT public.cleanup_old_notifications()');
```

## Edge Function: export-user-data

Deploy da Edge Function (se necessário):
```bash
supabase functions deploy export-user-data
```

## Verificação Pós-Execução

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('audit_log', 'user_data_backups', 'rate_limits')
ORDER BY table_name;

-- Verificar RLS ativo
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
ORDER BY tablename;

-- Verificar triggers de audit
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE 'audit_%'
ORDER BY event_object_table;

-- Verificar soft delete columns
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name = 'deleted_at' AND table_schema = 'public';

-- Testar criação de backup (substitua USER_ID)
-- SELECT public.create_user_backup('USER_ID_HERE', 'manual', 'Teste');
```

## Notas Importantes

- **Storage avatars**: Após aplicar `security_hardening.sql`, os avatares devem ser salvos no path `{user_id}/filename.ext` para funcionar com a nova policy
- **Soft delete**: O frontend deve usar `soft_delete_project()` em vez de DELETE direto para projetos
- **Backups automáticos**: São criados automaticamente antes de deletar um projeto (máximo 1 a cada 24h)
- **Rate limits**: Se um usuário exceder o limite, receberá um erro PostgreSQL que deve ser tratado no frontend
