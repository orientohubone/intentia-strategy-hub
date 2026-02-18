# Edge Functions para Relatórios

## Funcionalidades

### 1. toggle-report-favorite
- **Endpoint**: `/functions/v1/toggle-report-favorite`
- **Método**: POST
- **Descrição**: Alterna o status de favorito de um relatório

**Request Body:**
```json
{
  "reportId": "uuid-do-relatorio",
  "isFavorite": true
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* dados atualizados do relatório */ }
}
```

### 2. download-report
- **Endpoint**: `/functions/v1/download-report`
- **Método**: POST
- **Descrição**: Gera e faz download de relatórios em HTML

**Request Body:**
```json
{
  "reportId": "uuid-do-relatorio"
}
```

**Response**: HTML content para download

## Deploy

### 1. Deploy das Functions
```bash
# Deploy individual
supabase functions deploy toggle-report-favorite
supabase functions deploy download-report

# Deploy todas
supabase functions deploy
```

### 2. Verificar Status
```bash
# Listar functions
supabase functions list

# Verificar logs
supabase functions logs toggle-report-favorite
supabase functions logs download-report
```

## Requisitos

### Database Schema
- Tabela `reports` deve existir (ver `add_reports_metadata.sql`)
- Coluna `metadata` na tabela `insights`
- Coluna `metadata` na tabela `benchmarks`
- Coluna `metadata` na tabela `project_channel_scores`

### Permissões
- Usuários autenticados podem favoritar próprios relatórios
- Usuários podem fazer download dos próprios relatórios
- RLS aplicado em todas as operações

## Tipos de Relatórios Suportados

1. **insight**: Insights estratégicos (da tabela insights)
2. **project_analysis**: Análises completas de projeto
3. **campaign_analysis**: Performance de campanhas
4. **benchmark**: Análises competitivas
5. **consolidated**: Relatórios consolidados

## Estrutura de IDs

- Insights: `insight-{uuid}`
- Reports: `{uuid}` (direto da tabela reports)

## Exemplo de Uso

### Frontend (React)
```typescript
// Favoritar
const { data, error } = await supabase.functions.invoke('toggle-report-favorite', {
  body: { reportId: 'uuid', isFavorite: true }
});

// Download
const { data, error } = await supabase.functions.invoke('download-report', {
  body: { reportId: 'uuid' }
});

// Se data for HTML, fazer download
if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
  const blob = new Blob([data], { type: 'text/html' });
  // ... fazer download
}
```

## Troubleshooting

### Erros Comuns

1. **401 Unauthorized**: Verificar token de autenticação
2. **404 Not Found**: Verificar se tabela/colunas existem
3. **500 Internal Error**: Verificar logs da function

### Debug
```bash
# Verificar logs em tempo real
supabase functions logs toggle-report-favorite --follow
```

## Segurança

- ✅ JWT validation
- ✅ RLS policies
- ✅ User ownership verification
- ✅ CORS headers configurados
