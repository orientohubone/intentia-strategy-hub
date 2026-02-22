import { Brain, Database, MessageCircle, Zap } from "lucide-react";

const pillars = [
  {
    icon: Brain,
    title: "Contexto Total",
    description: "A Tia acessa 22 fontes de dados em paralelo — projetos, campanhas, métricas, budget, benchmarks, públicos e mais. Ela sabe tudo sobre sua conta.",
  },
  {
    icon: MessageCircle,
    title: "Linguagem Natural",
    description: "Sem menus, sem filtros, sem dashboards. Pergunte como falaria com uma colega de trabalho e receba respostas diretas com dados reais.",
  },
  {
    icon: Database,
    title: "Dados Reais, Não Genéricos",
    description: "Cada resposta é baseada nos seus dados — seus projetos, suas campanhas, seu budget. Nada de respostas genéricas de chatbot.",
  },
  {
    icon: Zap,
    title: "Resposta Instantânea",
    description: "Powered by Google Gemini com sua própria API key. Respostas em segundos com formatação rica em markdown.",
  },
];

export default function TiaOrigin() {
  return (
    <section id="tia-origin" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Por que a Tia é <span className="text-primary">diferente</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            Ela não é um chatbot genérico. É uma assistente que vive dentro da sua plataforma,
            com acesso completo ao seu contexto estratégico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative rounded-2xl border border-border/50 bg-card/30 p-6 hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <pillar.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
