# Central de Ajuda — Guia de Manutenção

## Estrutura de Arquivos

```
src/components/help/
├── index.ts                  # Barrel export (não precisa editar)
├── helpTypes.ts              # Types/interfaces
├── helpData.tsx              # ⭐ DADOS: categorias, FAQs e filtros
├── YouTubeEmbed.tsx          # Componente de embed YouTube
├── HelpCategoryDetail.tsx    # Card expandido (vídeo + artigos)
├── HelpCategoryGrid.tsx      # Grid de categorias clicáveis
├── HelpFAQSection.tsx        # Seção de perguntas frequentes
├── HelpContactSection.tsx    # Seção de contato
└── GUIA_MANUTENCAO.md        # Este arquivo
```

---

## Como Inserir Vídeos do YouTube

### 1. Obter o Video ID

O Video ID é o código após `v=` na URL do YouTube:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                 ^^^^^^^^^^^^
                                 Este é o videoId
```

### 2. Editar `helpData.tsx`

Abra `src/components/help/helpData.tsx` e localize a categoria desejada pelo `id`.

**Exemplo — Adicionar vídeo na categoria "Diagnóstico de URL":**

```tsx
{
  id: "url-analysis",
  title: "Diagnóstico de URL",
  description: "Análise heurística automática",
  icon: <Target className="h-5 w-5" />,
  color: "text-orange-600",
  videoId: "SEU_VIDEO_ID_AQUI",  // ← Cole o ID do YouTube aqui
  articles: [ ... ]
}
```

### 3. Categorias disponíveis e seus IDs

| ID | Categoria | Vídeo |
|----|-----------|-------|
| `getting-started` | Primeiros Passos | ⏳ |
| `url-analysis` | Diagnóstico de URL | ⏳ |
| `ai-analysis` | Análise por IA | ⏳ |
| `benchmark` | Benchmark Competitivo | ⏳ |
| `channels` | Scores por Canal | ⏳ |
| `insights` | Insights Estratégicos | ⏳ |
| `tactical` | Plano Tático | ⏳ |
| `structured-data` | Dados Estruturados | ⏳ |
| `structured-data-generator` | Gerador de Dados | ⏳ |
| `audiences` | Públicos-Alvo | ⏳ |
| `seo-performance` | SEO & Performance | ⏳ |
| `integrations` | Integrações | ⏳ |
| `exports` | Exportação | ⏳ |
| `settings` | Configurações | ⏳ |
| `operations` | Operações | ⏳ |
| `budget` | Gestão de Budget | ⏳ |
| `calendar` | Calendário | ⏳ |
| `security` | Segurança & Backup | ⏳ |

> Substitua ⏳ por ✅ conforme gravar os vídeos.

---

## Comportamento do Componente YouTubeEmbed

| Estado | O que aparece |
|--------|---------------|
| `videoId: ""` (vazio) | Placeholder cinza com ícone e texto "Vídeo em breve" |
| `videoId: "abc123"` (preenchido, não clicado) | Thumbnail do YouTube com botão play vermelho |
| Após clicar no play | Iframe do YouTube com autoplay |

**Vantagem:** O iframe só carrega quando o usuário clica — não impacta performance da página.

---

## Como Adicionar Nova Categoria

1. Em `helpData.tsx`, adicione um novo objeto no array `helpCategories`:

```tsx
{
  id: "nova-categoria",           // ID único (kebab-case)
  title: "Nome da Categoria",
  description: "Descrição curta",
  icon: <NomeDoIcone className="h-5 w-5" />,  // Lucide icon
  color: "text-cor-600",          // Cor Tailwind
  videoId: "",                    // Vazio até gravar o vídeo
  articles: [
    {
      title: "Título do artigo",
      content: "Conteúdo explicativo do artigo.",
      difficulty: "Iniciante",    // Iniciante | Intermediário | Avançado
    },
  ],
},
```

2. Importe o ícone no topo do arquivo se ainda não estiver importado.

---

## Como Adicionar Nova FAQ

Em `helpData.tsx`, adicione um novo objeto no array `faqItems`:

```tsx
{
  question: "Pergunta aqui?",
  answer: "Resposta detalhada aqui.",
  category: "analise",            // Deve existir em faqCategoryFilters
  difficulty: "iniciante",        // iniciante | intermediario | avancado
  icon: <NomeDoIcone className="h-4 w-4" />,
  color: "text-cor-600",
},
```

### Categorias de FAQ disponíveis

`todos`, `analise`, `ia`, `benchmark`, `exports`, `planos`, `configuracoes`, `seguranca`, `tatico`, `dados`, `operacoes`, `integracoes`

Para adicionar nova categoria de filtro, edite o array `faqCategoryFilters` no mesmo arquivo.

---

## Dicas

- **Vídeos curtos** (2-5 min) funcionam melhor para tutoriais
- **Thumbnails personalizadas** no YouTube melhoram a aparência
- O componente usa `hqdefault.jpg` como thumbnail — resolução 480x360
- Vídeos são carregados com `rel=0&modestbranding=1` (sem sugestões externas)
