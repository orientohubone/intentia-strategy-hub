# 📁 Supabase SQL Organization

## 🗂️ Estrutura de Pastas

```
sql/
├── 📁 00_setup/           # Setup inicial do banco
├── 📁 01_schema/          # Schema de tabelas principais
├── 📁 02_security/        # Segurança, RLS, Admin
├── 📁 03_features/        # Features específicas
├── 📁 04_migrations/      # Migrações e updates
├── 📁 05_utils/          # SQLs utilitários e debug
└── 📁 06_views/          # Views e funções
```

---

## 📋 Conteúdo por Pasta

### **00_setup/** - Setup Inicial
- `schema.sql` - Schema base (tenant_settings, projects)
- `storage_setup.sql` - Configuração do bucket avatars
- `verify_isolated_setup.sql` - Setup para verificação por e-mail

### **01_schema/** - Schema de Tabelas
- `schema.sql` - Schema principal
- `tactical_schema.sql` - Camada tática (5 tabelas)
- `ad_integrations.sql` - Integrações com APIs de marketing
- `budget_management.sql` - Gestão de budget e pacing
- `campaign_calendar.sql` - Calendário de campanhas

### **02_security/** - Segurança e Admin
- `security_hardening.sql` - Hardening de segurança
- `audit_log.sql` - Sistema de auditoria
- `guardrails.sql` - Rate limiting e soft delete
- `admin_schema.sql` - Admin Panel schema

### **03_features/** - Features Específicas
- `user_backup.sql` - Sistema de backup
- `notifications.sql` - Sistema de notificações
- `ai_analysis.sql` - Análise por IA

### **04_migrations/** - Migrações
- `add_project_to_audiences.sql` - Update audiences
- `audiences_schema.sql` - Schema de audiências

### **05_utils/** - Utilitários
- `check_user_exists.sql` - Verificação de usuário
- `debug_auth_error.sql` - Debug de autenticação
- `fix_meta_user.sql` - Limpeza de dados
- `create_meta_user.sql` - Criação manual
- `create_user_via_auth.sql` - Criação via auth
- `check_app_url.sql` - Verificação de APP_URL

### **06_views/** - Views e Funções
- `v_dashboard_stats.sql` - Views do dashboard
- `v_project_summary.sql` - Resumo de projetos
- `v_verification_summary.sql` - Logs de verificação

---

## 🚀 Ordem de Execução Recomendada

### **Setup Inicial (Novo Projeto)**
```bash
# 1. Setup base
00_setup/schema.sql
00_setup/storage_setup.sql

# 2. Schema principal
01_schema/schema.sql
01_schema/tactical_schema.sql
01_schema/ad_integrations.sql
01_schema/budget_management.sql
01_schema/campaign_calendar.sql

# 3. Segurança
02_security/security_hardening.sql
02_security/audit_log.sql
02_security/guardrails.sql
02_security/admin_schema.sql

# 4. Features
03_features/user_backup.sql
03_features/notifications.sql
03_features/ai_analysis.sql

# 5. Migrações
04_migrations/add_project_to_audiences.sql
04_migrations/audiences_schema.sql

# 6. Views
06_views/v_dashboard_stats.sql
06_views/v_project_summary.sql
06_views/v_verification_summary.sql
```

---

## 🔧 Scripts de Execução

### **Executar todos SQLs de uma pasta:**
```bash
# Setup inicial
for file in sql/00_setup/*.sql; do
  npx supabase db push --file="$file"
done

# Schema completo
for file in sql/01_schema/*.sql; do
  npx supabase db push --file="$file"
done
```

### **Execução individual:**
```bash
npx supabase db push --file=sql/01_schema/schema.sql
```

---

## 📊 Status dos Arquivos

| Pasta | Arquivos | Status |
|-------|----------|--------|
| 00_setup | 3 | ✅ Completo |
| 01_schema | 5 | ✅ Completo |
| 02_security | 4 | ✅ Completo |
| 03_features | 3 | 🔄 Em andamento |
| 04_migrations | 2 | ✅ Completo |
| 05_utils | 6 | ✅ Completo |
| 06_views | 3 | 🔄 Em andamento |

---

## 🎯 Admin Panel Integration

Nova tab "Database Management" para:
- Visualizar estrutura organizada
- Executar SQLs em ordem
- Monitorar status
- Versionar schemas

---

## 📝 Notas

- Todos os SQLs usam `IF NOT EXISTS` para execução segura
- Views usam `security_invoker = true` para performance
- RLS aplicado em todas as tabelas principais
- Triggers para updated_at automáticos
- Índices otimizados para performance
