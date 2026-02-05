# Deploy no Vercel - Guia Completo

## Configuração Automatizada

O projeto já está configurado para deploy automatizado no Vercel com os seguintes arquivos:

### 1. `vercel.json`
- Configuração de build e output
- Variáveis de ambiente mapeadas
- Otimização de cache para assets estáticos
- Rewrite para SPA routing

### 2. Build Otimizado
- Configuração de chunks separados para melhor performance
- Source maps habilitados
- Output directory: `dist`

## Passos para Deploy

### 1. Conectar Repositório
```bash
# Instale Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Conecte o projeto
vercel link
```

### 2. Configurar Variáveis de Ambiente
No dashboard Vercel, adicione as seguintes environment variables:

```
VITE_SUPABASE_PROJECT_ID=ccmubburnrrxmkhydxoz
VITE_SUPABASE_PUBLISHABLE_KEY=[sua_chave_publica]
VITE_SUPABASE_URL=https://ccmubburnrrxmkhydxoz.supabase.co
```

### 3. Deploy Automático
```bash
# Deploy inicial
vercel --prod

# Deploy automático via Git push
git push origin main
```

## Configurações de Performance

### Build Optimization
- **Code Splitting:** Vendor, router, UI e Supabase separados
- **Tree Shaking:** Remoção automática de código não utilizado
- **Minificação:** JavaScript e CSS otimizados

### Cache Strategy
- **Assets estáticos:** Cache de 1 ano (immutable)
- **HTML:** Cache agressivo com revalidação
- **APIs:** Cache configurado via headers

## Monitoramento

### Vercel Analytics
- Performance metrics
- Core Web Vitals
- User behavior

### Logs
- Build logs disponíveis no dashboard
- Runtime logs em tempo real
- Error tracking integrado

## Domínio Personalizado

### Configuração
```bash
# Adicionar domínio customizado
vercel domains add seu-dominio.com

# Configurar DNS
# A record: 76.76.21.21
# CNAME: cname.vercel-dns.com
```

### SSL
- Certificado SSL automático
- HTTP/2 habilitado
- Redirecionamento automático HTTP→HTTPS

## Preview Deployments

- Cada PR cria um preview deployment
- URLs únicas para cada ambiente
- Feedback automático no GitHub/GitLab

## Troubleshooting

### Build Issues
```bash
# Limpar cache local
rm -rf node_modules dist
npm install

# Verificar build local
npm run build
npm run preview
```

### Environment Variables
- Verifique se todas as variáveis estão configuradas
- Use prefixo `VITE_` para variáveis expostas ao frontend
- Valide chaves do Supabase

### Performance
- Monitore Core Web Vitals
- Verifique bundle size no Vercel Analytics
- Otimize imagens e assets estáticos

## Comandos Úteis

```bash
# Ver status do deploy
vercel ls

# Remover deployment
vercel rm [deployment-url]

# Ver logs
vercel logs

# Re-deploy sem cache
vercel --prod --force
```

## Segurança

- Variáveis de ambiente criptografadas
- HTTPS por padrão
- Headers de segurança configurados
- Proteção contra XSS e CSRF

## Backup e Recovery

- Deploy versionados
- Rollback instantâneo
- Branch protection configurável
- Backup automático de configurações
