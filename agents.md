# Intentia Strategy Hub - Contexto Completo do Projeto

## Visão Geral

**Nome do Projeto:** Intentia Strategy Hub  
**Tipo:** Aplicação Web React + TypeScript  
**Framework:** Vite + React + TypeScript  
**UI Framework:** shadcn/ui + Tailwind CSS  
**Backend:** Supabase  
**Propósito:** Plataforma de análise estratégica para marketing B2B

## Descrição do Projeto

O Intentia Strategy Hub é uma plataforma SaaS que ajuda empresas B2B a avaliar sua prontidão estratégica para investimentos em marketing digital. A aplicação oferece diagnósticos automatizados de URLs, benchmarking competitivo e scores por canal de mídia.

### Funcionalidades Principais

- **Diagnóstico de URL:** Análise automática de proposta de valor, clareza da oferta e jornada do usuário
- **Benchmark Estratégico:** Comparação com concorrentes e identificação de gaps de mercado
- **Score por Canal:** Avaliação da adequação de Google, Meta, LinkedIn e TikTok para cada negócio
- **Alertas Estratégicos:** Avisos sobre investimentos prematuros ou arriscados em mídia
- **Dashboard Central:** Visualização de projetos, insights e métricas

## Estrutura Técnica

### Stack Tecnológico

**Frontend:**
- React 18.3.1 com TypeScript
- Vite 5.4.19 como bundler
- React Router DOM para navegação
- TanStack Query para gerenciamento de estado assíncrono
- React Hook Form + Zod para formulários

**UI/UX:**
- Tailwind CSS 3.4.17 para estilização
- shadcn/ui components (Radix UI base)
- Lucide React para ícones
- Sonner para notificações toast
- next-themes para tema dark/light

**Backend/Database:**
- Supabase como backend-as-a-service
- Autenticação integrada
- Banco de dados PostgreSQL
- Real-time subscriptions

**Desenvolvimento:**
- ESLint + TypeScript ESLint
- Vitest para testes
- PostCSS + Autoprefixer
- Git version control

### Estrutura de Arquivos

```
intentia-strategy-hub/
├── public/                 # Assets estáticos
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes shadcn/ui
│   │   ├── Dashboard*.tsx # Componentes do dashboard
│   │   ├── Landing*.tsx   # Componentes da landing page
│   │   └── *.tsx          # Outros componentes
│   ├── pages/             # Páginas principais
│   │   ├── Index.tsx      # Home/Landing
│   │   ├── Dashboard.tsx  # Dashboard principal
│   │   ├── Landing.tsx    # Landing page
│   │   └── NotFound.tsx   # Página 404
│   ├── integrations/      # Integrações externas
│   │   └── supabase/      # Cliente Supabase
│   ├── hooks/             # Hooks personalizados
│   ├── lib/               # Utilitários
│   ├── test/              # Testes
│   ├── App.tsx            # App principal
│   └── main.tsx           # Entry point
├── supabase/              # Config Supabase
├── package.json           # Dependências
├── vite.config.ts         # Config Vite
├── tailwind.config.ts     # Config Tailwind
└── tsconfig.json          # Config TypeScript
```

## Componentes Principais

### Dashboard Components
- **DashboardHeader:** Header com navegação e perfil
- **DashboardSidebar:** Sidebar com menu de navegação
- **ProjectCard:** Card para exibir projetos analisados
- **ChannelCard:** Card com scores por canal
- **InsightCard:** Card com insights e alertas
- **StatsCard:** Card com estatísticas gerais
- **ScoreRing:** Componente visual para scores circulares

### Landing Components
- **LandingNav:** Navegação da landing page
- **ScoreRing:** Visualização de scores

### UI Components (shadcn/ui)
- Interface completa com buttons, forms, dialogs, etc.
- Sistema de design consistente
- Acessibilidade e responsividade

## Estado e Dados

### Estado Global
- **TanStack Query:** Cache e gerenciamento de dados assíncronos
- **React Hook Form:** Estado de formulários
- **Context API:** Tema e configurações globais

### Dados Mockados
Atualmente utilizando dados mock para:
- Projetos (SaaS CRM Pro, ERP Connect, FinTech Solutions)
- Insights estratégicos
- Scores por canal
- Estatísticas do dashboard

### Supabase Integration
- **Project ID:** ccmubburnrrxmkhydxoz
- **URL:** https://ccmubburnrrxmkhydxoz.supabase.co
- **Autenticação:** Configurada com localStorage
- **Tipos TypeScript:** Gerados automaticamente

## Rotas da Aplicação

```typescript
/                    # Landing page
/dashboard           # Dashboard principal
/*                   # Página 404
```

## Fluxo do Usuário

1. **Acesso Inicial:** Landing page com apresentação do produto
2. **Cadastro/Login:** Autenticação via Supabase
3. **Dashboard:** Visualização de projetos e análises
4. **Criação de Projeto:** Formulário para nova análise estratégica
5. **Resultados:** Visualização de scores e insights

## Variáveis de Ambiente

```env
VITE_SUPABASE_PROJECT_ID="ccmubburnrrxmkhydxoz"
VITE_SUPABASE_PUBLISHABLE_KEY="[CHAVE_PÚBLICA]"
VITE_SUPABASE_URL="https://ccmubburnrrxmkhydxoz.supabase.co"
```

## Scripts Disponíveis

```json
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build modo desenvolvimento
npm run lint         # Linting do código
npm run preview      # Preview do build
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
```

## Próximos Passos de Desenvolvimento

### Backend/Database
- Implementar schemas no Supabase
- Criar funções para análise de URLs
- Desenvolver algoritmos de scoring
- Configurar autenticação completa

### Frontend
- Conectar componentes com API real
- Implementar formulários de criação de projetos
- Adicionar estados de loading
- Implementar tratamento de erros

### Features
- Análise real de URLs
- Integração com APIs de marketing
- Geração de relatórios
- Sistema de notificações
- Exportação de dados

## Considerações Técnicas

- **Performance:** Vite oferece fast refresh e builds otimizados
- **Escalabilidade:** Arquitetura modular com Supabase
- **Manutenibilidade:** TypeScript e componentes reutilizáveis
- **Acessibilidade:** Componentes Radix UI com suporte ARIA
- **SEO:** Considerar SSR/SSG para produção

## Deploy

O projeto está configurado para deploy via:
- Lovable (plataforma original)
- Vercel/Netlify (build estático)
- Qualquer plataforma compatível com React/Vite
