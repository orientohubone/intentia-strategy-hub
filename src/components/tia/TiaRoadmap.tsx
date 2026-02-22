import { CheckCircle2, Circle, Clock } from "lucide-react";

const phases = [
  {
    status: "done" as const,
    title: "Assistente Guiada",
    description: "Onboarding passo a passo com 5 etapas, artigos contextuais e navegação inteligente pela plataforma.",
  },
  {
    status: "done" as const,
    title: "Full Context Architecture",
    description: "22 queries paralelas, 13 seções no system prompt. A Tia conhece cada detalhe da sua conta.",
  },
  {
    status: "done" as const,
    title: "Histórico Multi-Conversa",
    description: "Múltiplas conversas simultâneas com persistência local, retomada e exclusão.",
  },
  {
    status: "done" as const,
    title: "Integração Gemini",
    description: "Use sua própria API key do Google Gemini. Escolha o modelo preferido nas configurações.",
  },
  {
    status: "next" as const,
    title: "Integração Claude",
    description: "Suporte a Anthropic Claude como alternativa ao Gemini para respostas ainda mais profundas.",
  },
  {
    status: "next" as const,
    title: "Streaming de Respostas",
    description: "Respostas em tempo real via SSE — veja a Tia digitando palavra por palavra.",
  },
  {
    status: "planned" as const,
    title: "Memória Persistente",
    description: "Histórico salvo no banco de dados para continuidade entre dispositivos e sessões.",
  },
  {
    status: "planned" as const,
    title: "Ações Diretas",
    description: "A Tia poderá criar projetos, gerar benchmarks e configurar campanhas diretamente pela conversa.",
  },
];

const statusConfig = {
  done: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10", label: "Disponível" },
  next: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", label: "Em breve" },
  planned: { icon: Circle, color: "text-muted-foreground/50", bg: "bg-muted/30", label: "Planejado" },
};

export default function TiaRoadmap() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Roadmap da <span className="text-primary">Tia</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A Tia evolui constantemente. Veja o que já está disponível e o que vem por aí.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {phases.map((phase, i) => {
            const config = statusConfig[phase.status];
            const Icon = config.icon;
            return (
              <div
                key={phase.title}
                className={`flex gap-4 items-start rounded-xl border border-border/50 p-4 transition-colors ${
                  phase.status === "done" ? "bg-card/30 hover:border-primary/30" : "bg-card/10 opacity-80"
                }`}
              >
                <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm">{phase.title}</h3>
                    <span className={`text-[10px] font-medium ${config.color} px-2 py-0.5 rounded-full ${config.bg}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{phase.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
