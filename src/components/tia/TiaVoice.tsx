import { Quote } from "lucide-react";

const traits = [
  {
    title: "Amigável e direta",
    description: "Fala como uma colega de trabalho experiente em marketing digital B2B. Sem jargão desnecessário, sem enrolação.",
    example: "\"Seu ROAS de 3.2x está acima da média do setor. Mantenha o investimento em Google e considere aumentar LinkedIn.\"",
  },
  {
    title: "Português brasileiro nativo",
    description: "Toda a comunicação é em português brasileiro, com formatação monetária em R$ e linguagem natural.",
    example: "\"Você investiu R$ 8.200 de R$ 12.000 planejados. Pacing em 68% — dentro do esperado para o dia 15.\"",
  },
  {
    title: "Concisa, mas completa",
    description: "Respostas curtas por padrão. Aprofunda apenas quando você pede. Nunca trunca dados no meio.",
    example: "\"3 projetos ativos, 4 campanhas rodando, 12 insights pendentes. Quer detalhes de algum?\"",
  },
  {
    title: "Honesta sobre limites",
    description: "Se não tem a informação, diz. Nunca inventa dados. Sugere onde encontrar o que você precisa.",
    example: "\"Não tenho dados de conversão para TikTok ainda. Configure o pixel e as métricas aparecerão aqui.\"",
  },
];

export default function TiaVoice() {
  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            A <span className="text-primary">voz</span> da Tia
          </h2>
          <p className="text-muted-foreground text-lg">
            Personalidade definida, tom consistente. Ela não é um robô — é uma parceira estratégica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {traits.map((trait) => (
            <div
              key={trait.title}
              className="rounded-2xl border border-border/50 bg-card/30 p-6 hover:border-primary/30 transition-colors"
            >
              <h3 className="font-bold text-lg mb-2">{trait.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{trait.description}</p>
              <div className="flex gap-2 items-start">
                <Quote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/70 italic leading-relaxed">{trait.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
