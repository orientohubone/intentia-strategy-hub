import { CheckCircle2, X } from "lucide-react";

const rows = [
  { feature: "Acesso aos seus dados reais", tia: true, others: false },
  { feature: "Contexto de projetos, campanhas e budget", tia: true, others: false },
  { feature: "Respostas em português brasileiro", tia: true, others: false },
  { feature: "Formatação rica (markdown, tabelas)", tia: true, others: true },
  { feature: "Histórico de conversas", tia: true, others: true },
  { feature: "Integrada à plataforma (zero setup)", tia: true, others: false },
  { feature: "Conhece seu plano e limites", tia: true, others: false },
  { feature: "Navega pela plataforma com você", tia: true, others: false },
  { feature: "Usa sua própria API key (sem custo extra)", tia: true, others: false },
  { feature: "Múltiplas conversas simultâneas", tia: true, others: false },
];

export default function TiaComparison() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Tia vs. <span className="text-muted-foreground">Chatbots genéricos</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A diferença entre uma assistente que conhece seu negócio e um chatbot que não sabe quem você é.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_120px_120px] bg-muted/30 px-4 md:px-6 py-3 border-b border-border/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Funcionalidade</span>
              <span className="text-xs font-bold text-primary text-center">
                <img src="/tia-branco-ponto-laranja.svg" alt="Tia" className="h-3.5 w-auto mx-auto" />
              </span>
              <span className="text-xs font-semibold text-muted-foreground text-center">Outros</span>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_120px_120px] px-4 md:px-6 py-3 items-center ${
                  i < rows.length - 1 ? "border-b border-border/30" : ""
                } hover:bg-muted/10 transition-colors`}
              >
                <span className="text-sm text-foreground/80">{row.feature}</span>
                <div className="flex justify-center">
                  {row.tia ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex justify-center">
                  {row.others ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-muted-foreground/60" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
