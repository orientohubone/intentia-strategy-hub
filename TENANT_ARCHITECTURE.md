# Arquitetura Multi-Tenant - Intentia Strategy Hub

## Visão Geral

O sistema implementa uma arquitetura multi-tenant onde cada usuário tem seu contexto completamente isolado, garantindo privacidade e segurança dos dados.

## Estratégia de Isolamento

### 1. **Row Level Security (RLS)**
Cada tabela no Supabase inclui `user_id` como chave de particionamento:
- **Proteção automática** via RLS policies
- **Isolamento total** dos dados por usuário
- **Performance otimizada** com índices em `user_id`

### 2. **Estrutura de Tabelas**

#### `tenant_settings`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → auth.users)
- company_name (text)
- plan (enum: starter/professional/enterprise)
- monthly_analyses_limit (integer)
- analyses_used (integer)
- created_at/updated_at (timestamps)
```

#### `projects`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → auth.users)
- name (text)
- niche (text)
- url (text)
- score (integer)
- status (enum: pending/analyzing/completed)
- channel_scores (jsonb)
- last_update (text)
- created_at/updated_at (timestamps)
```

## Hooks de Gerenciamento

### `useAuth()`
- **Gerenciamento de sessão** do usuário
- **Estado global** de autenticação
- **Listeners** para mudanças de auth state

### `useTenantData()`
- **CRUD operations** com isolamento automático
- **Validação de limites** do plano do usuário
- **Cache local** para performance
- **Sincronização** real-time

### `ProtectedRoute`
- **Guard component** para rotas protegidas
- **Redirect automático** para `/auth` se não autenticado
- **Loading states** para melhor UX

## Fluxo de Dados

### 1. **Autenticação**
```
Login → Supabase Auth → Session → useAuth() → Estado Global
```

### 2. **Acesso aos Dados**
```
Componente → useTenantData() → 
  supabase.from('tabela').select('*').eq('user_id', user.id)
```

### 3. **Criação de Dados**
```
Formulário → createProject() → 
  Validação de limites → 
  Insert com user_id → 
  Atualização de contador
```

## Segurança Implementada

### RLS Policies (Exemplos)
```sql
-- Usuários só podem ver seus próprios dados
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários só podem inserir seus próprios dados
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar seus próprios dados
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários só podem deletar seus próprios dados
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);
```

## Validações de Negócio

### Limites por Plano
- **Starter**: 1 análise/mês
- **Professional**: Ilimitado
- **Enterprise**: Ilimitado + features extras

### Controle de Acesso
- **Dashboard**: Apenas usuários autenticados
- **Criação de projetos**: Verificação de limites
- **API endpoints**: Validação de `user_id`

## Performance

### Índices Otimizados
```sql
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tenant_settings_user_id ON tenant_settings(user_id);
```

### Cache Strategy
- **React Query** para cache client-side
- **Local state** para dados frequentes
- **Real-time subscriptions** para atualizações

## Escalabilidade

### Horizontal Scaling
- **Novos tenants** sem impacto nos existentes
- **Isolamento natural** via particionamento
- **Backup individual** por tenant se necessário

### Vertical Scaling
- **Planos diferenciados** por uso
- **Limites configuráveis** via admin
- **Upgrade automático** de planos

## Monitoramento

### Métricas por Tenant
- **Contagem de análises** por usuário
- **Planos ativos** e utilização
- **Performance** por tenant

### Logs de Auditoria
- **Acesso aos dados** (who/what/when)
- **Mudanças de configuração**
- **Tentativas de acesso não autorizado**

## Implementação Futura

### Features Planejadas
- **Sub-accounts** para empresas
- **Custom domains** por tenant
- **Advanced analytics** por tenant
- **API rate limiting** individual

### Compliance
- **GDPR compliance** por tenant
- **Data export** individual
- **Data retention** configurável

## Resumo

A arquitetura garante:
✅ **Isolamento completo** dos dados
✅ **Segurança** em múltiplas camadas
✅ **Performance** otimizada
✅ **Escalabilidade** sustentável
✅ **Compliance** com regulamentações
