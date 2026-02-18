# Feature Flag: Relatórios Estratégicos

## 📍 **Onde Encontrar no Admin Panel**

### **🎯 Tab Feature Flags**
1. **Acesse**: Admin Panel → Feature Flags
2. **Categoria**: "Insights & Alertas" (general)
3. **Feature**: "Relatórios Estratégicos"
4. **Status**: Em Desenvolvimento
5. **Key**: `reports_feature`

### **🔍 Como Gerenciar**

#### **1. Na Tab Feature Flags:**
```
Admin Panel
├── Feature Flags (tab)
│   ├── Insights & Alertas (categoria)
│   │   ├── Relatórios Estratégicos
│   │   │   ├── Status: Em Desenvolvimento
│   │   │   ├── Key: reports_feature
│   │   │   └── Descrição: Acesso à tela de relatórios
```

#### **2. Na Tab Relatórios:**
```
Admin Panel
├── Relatórios (tab)
│   ├── Feature Flag: Relatórios
│   │   ├── Status por plano
│   │   ├── Arquitetura da Feature
│   │   └── Fluxo de implementação
```

### **⚙️ Configuração por Plano**

#### **Status Atual:**
- **Starter**: ❌ Inativo
- **Professional**: ❌ Inativo  
- **Enterprise**: ✅ Ativo

#### **Como Alterar:**
1. **Tab Feature Flags** → **Planos**
2. **Expandir** plano desejado
3. **Insights & Alertas** → **Relatórios Estratégicos**
4. **Toggle** para ativar/desativar

### **🚀 Fluxo Completo**

```
1. Admin Panel → Feature Flags
   ↓
2. Insights & Alertas (categoria)
   ↓
3. Relatórios Estratégicos (feature)
   ↓
4. Alterar status (development → active)
   ↓
5. Configurar planos
   ↓
6. Tab Relatórios (monitoramento)
```

### **📋 SQL para Adicionar Feature**

Execute o script SQL para adicionar a feature:
```sql
-- Arquivo: supabase/sql/add_reports_feature.sql
-- Execute no Supabase Dashboard → SQL Editor
```

### **🔧 Implementação Técnica**

#### **Componentes:**
- **AdminPanel.tsx**: Tab de relatórios
- **Reports.tsx**: Tela principal (pendente)
- **Feature Flag**: `reports_feature`

#### **Arquitetura:**
```
AdminPanel
├── Tab: Relatórios
│   ├── Feature Flag Management
│   ├── Status por Plano
│   └── Arquitetura Info
```

### **✅ Critérios de Sucesso**

- [x] Feature flag criada
- [x] Tab Relatórios implementada
- [x] Status por plano configurável
- [x] Testes automatizados
- [ ] Tela Reports.tsx implementada
- [ ] Integração com usuário final

### **🎯 Próximos Passos**

1. **Implementar tela Reports.tsx**
2. **Integrar com feature flag**
3. **Testar acesso por plano**
4. **Documentar para usuário final**

---

**Status**: Feature flag implementada e gerenciável via Admin Panel ✅
