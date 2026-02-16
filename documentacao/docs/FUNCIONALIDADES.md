# Funcionalidades Implementadas — Intentia Strategy Hub

> Todas as features listadas estão **[COMPLETO]**.

---

## 🔐 Autenticação e Segurança
- Login/Signup redesenhado (split layout: form + gradient panel)
- Supabase Auth (signInWithPassword, signUp)
- User metadata integration (full_name, company_name)
- Row Level Security (RLS) por user_id em todas as tabelas
- Session management com localStorage
- ProtectedRoute wrapper com redirect (`?redirect=`)
- Design system aplicado na tela de auth
- Botão "Voltar" padronizado scroll-aware
- Fluxo "Esqueceu sua senha" com resetPasswordForEmail
- Autocomplete attributes em todos os inputs
- Painel direito contextual (textos mudam por modo)

## 🧭 Navegação e UI
- Header dropdown com hover sensitivo
- SPA navigation com React Router v6
- Dashboard sidebar com active state e dados reais do tenant
- DashboardLayout wrapper compartilhado
- Toast notifications (Sonner) + AlertDialog para confirmações
- Design system com variáveis CSS (--primary, --gradient-primary)

## 🌙 Dark Mode
- ThemeProvider (next-themes) integrado
- ThemeToggle com ícones Sun/Moon no DashboardHeader
- ForceLightMode wrapper para páginas públicas
- Isolamento: dark mode no sistema não afeta site público
- Notificações com cores adaptáveis (opacity-based)

## 📊 Dashboard Principal
- Dados reais do Supabase (sem mocks)
- Cards de projetos com scores e status
- Insights estratégicos compactos — lista colapsável com expand/collapse
- Scores por canal com seletor de projeto
- Estatísticas dinâmicas com total real de insights
- Welcome Section com card gradient-primary + ScoreRing
- Card de campanhas recentes (até 6, badges coloridos, pacing bar)
- Projetos recentes com expand/collapse (limita a 2 por padrão)

## 🚀 CRUD de Projetos + Análise de URL + Análise por IA
- Criar/Editar/Excluir projetos com validações
- URLs de concorrentes (competitor_urls array)
- Análise heurística automática (Edge Function fetch HTML)
- Scores: proposta de valor, clareza, jornada, SEO, conversão, conteúdo
- Channel scores por projeto (Google, Meta, LinkedIn, TikTok)
- Insights gerados automaticamente (warnings, opportunities, improvements)
- Benchmarks automáticos para concorrentes (SWOT + gap analysis)
- Análise por IA sob demanda com seletor de modelo (Gemini + Claude)
- Resultados IA: resumo, prontidão, SWOT, canais, recomendações
- Exportação de análise IA: JSON, Markdown, HTML, PDF
- Notificação após análise (guard anti-duplicação via useRef)
- Contador duplo: projetos ativos + análises ao lado do botão criar

## 💡 Insights Estratégicos + Enriquecimento por IA
- Agrupados por projeto em seções colapsáveis
- Enriquecimento por IA — botão por grupo (Select modelo + lab-bubble animation)
- Campos IA: deepAnalysis, rootCause, impact, actionPlan, relatedMetrics, benchmarkContext
- Novos insights gerados por IA (source: "ai") com prioridade
- Badges visuais: IA (roxo), Enriquecido (Brain), prioridade colorida
- Card expandível + Dialog de detalhes com fullscreen
- Filtros por tipo, busca, stats cards, expandir/recolher todos

## 👥 Público-Alvo
- CRUD completo de públicos-alvo
- Agrupados por projeto em seções colapsáveis
- Vinculação com projetos (opcional)
- Cards visuais com badges (indústria, porte, local)
- Keywords como tags + busca + formulário com validações

## 🎯 Benchmark Competitivo + Enriquecimento por IA
- Agrupados por projeto em seções colapsáveis com score médio
- Geração automática a partir de competitor_urls
- Análise SWOT + scores detalhados + gap analysis
- Enriquecimento por IA: resumo, ameaça, gaps, posicionamento, plano de ação
- Exportação benchmark IA: JSON, Markdown, HTML, PDF
- BenchmarkDetailDialog com fullscreen
- Limite de 5 benchmarks no Starter com badge indicador

## ⚙️ Configurações
- Perfil do usuário com avatar upload, nome, empresa, bio
- Integrações de IA — API keys por usuário (Gemini + Claude)
  - Validação, seleção de modelo, badge de status, máscara de key
  - Proteção contra autofill de senha
- Backup & Segurança de Dados:
  - Info box sobre proteção RLS + mensagem de uso consciente
  - Criar Backup (4/mês no Starter) + Exportar Dados (JSON de 12 tabelas)
  - Lista de backups com download e exclusão individual
- Notificações, preferências, gerenciamento de conta
- Card de Plano detalhado com features e CTA de upgrade
- **Dashboard de Uso Centralizado** — 7 métricas com barras de progresso:
  - Projetos ativos, Públicos-alvo, Análises heurísticas, Benchmarks SWOT, Planos táticos, Campanhas, Backups
  - Cores dinâmicas: verde (normal), amarelo (≥80%), vermelho (limite atingido)

## 🎯 Plano Tático por Canal
- Página `/tactical` com seletor de projeto e tabs por canal
- Visão Geral: scores táticos consolidados, alertas de incoerência
- Plano por Canal (Google, Meta, LinkedIn, TikTok): campanha, funil, lances, estrutura, métricas
- Frameworks de Copy: Dor→Solução→Prova→CTA, Comparação, Autoridade, Personalizado
- Segmentação: público × canal × mensagem × prioridade
- Plano de Testes: hipóteses, critérios de sucesso
- Score Tático: coerência, clareza, qualidade
- Templates táticos por nicho B2B (6): SaaS, Consultoria, Indústria, EdTech, Fintech, Saúde
- Playbook gamificado: "Rodar Plano" gera diretivas com prioridades e KPIs
- Scores computados ao carregar, badges coloridos nas abas

## 🛡️ Alertas Estratégicos
- Página `/alertas` com 4 categorias colapsáveis
- Filtros por projeto e tipo, cards expandíveis, stats cards clicáveis
- Empty state, sidebar com ícone ShieldAlert

## 📸 Cases com Screenshots
- Imagens reais do sistema nos 6 cases
- Hover zoom + lightbox fullscreen (ESC/clique/botão X)

## 🔔 Sistema de Notificações
- Hook useNotifications com gestão completa + real-time
- NotificationsDropdown no header (responsivo)
- Deduplicação real-time, handler DELETE
- **notificationService.ts** — serviço centralizado:
  - Projeto criado/excluído, campanha criada/excluída/status alterado
  - Plano tático criado, playbook gerado, público-alvo criado, ICP enriquecido
  - Budget alocado, API key configurada, backup criado, ticket de suporte criado
- Suporte restrito: chat bloqueado para Starter, Professional+ pode responder

## 🔍 Análise Heurística de URLs
- Edge Function `analyze-url` (fetch HTML → regex/contagem)
- Extração de dados estruturados: JSON-LD, Open Graph, Twitter Card, Microdata
- HTML Snapshot limpo (scripts/styles/SVG removidos)
- Progress Tracker visual step-by-step

## 📊 Dados Estruturados & Snapshot
- StructuredDataViewer com abas unificadas (principal + concorrentes)
- Fallback inteligente: sintetiza OG tags do meta
- Badges resumo + seções expansíveis com copy individual

## 🧠 Análise por IA
- aiAnalyzer.ts — motor de análise IA (projetos + benchmarks + insights)
- Edge Function `ai-analyze` — proxy para Claude API
- Chamada direta para Gemini API
- Constantes centralizadas de modelos (aiModels.ts)
- Mensagens de erro melhoradas (404/403 traduzidos)

## 📦 Exportação
- **Análises:** JSON, Markdown, HTML, PDF (projetos + benchmarks)
- **Relatórios PDF:** consolidado por projeto, Dashboard, Insights, Benchmarks
- **CSV:** projetos, insights, benchmarks, audiences, channel scores (BOM UTF-8, separador `;`)

## 📧 Email Templates
- Confirmação de cadastro, redefinição de senha, reautenticação
- Design consistente: header escuro, botão laranja, footer com contato
- Inline styles + variáveis Supabase

## 🖼️ Upload de Foto de Perfil
- AvatarUpload com preview, validação (tipo, 5MB), Storage Supabase

## 📱 Mobile-First Responsiveness
- DashboardLayout, Sidebar (overlay mobile), Header (hamburger)
- Todas as páginas protegidas migradas
- ShowcaseSlider com touch-action:none
- NotificationsDropdown responsivo
- BackToHomeButton scroll-aware
- Breakpoints Tailwind: base = mobile, sm:, md:, lg:

## 📚 Centro de Ajuda
- Base de conhecimento (11 categorias), busca inteligente
- FAQ (17 perguntas), canais de suporte
- Categorias: Segurança & Backup (8 artigos), Dados Estruturados (6 artigos)

## 🧪 Testes Automatizados
- Vitest + jsdom: 6 testes exportCsv + 5 testes exportAnalysis = 12 passando
