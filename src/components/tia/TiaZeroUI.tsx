const examples = [
  {
    question: "Qual o score do meu projeto principal?",
    answer: "Seu projeto **OrientoHub** tem score **72/100** com status Ativo. Os canais mais fortes são Google (85) e LinkedIn (78).",
  },
  {
    question: "Como estão minhas campanhas este mês?",
    answer: "Você tem **4 campanhas ativas** com **R$ 12.450** investidos, **3.2x ROAS** e **847 conversões**.",
  },
  {
    question: "Meu budget está no ritmo certo?",
    answer: "Seu pacing está em **68%** com **R$ 8.200** de **R$ 12.000** planejados. Projeção: **R$ 11.800** — dentro do esperado.",
  },
  {
    question: "Quantos públicos-alvo eu tenho?",
    answer: "Você tem **5 públicos** mapeados. O mais recente é **CTOs de SaaS B2B** vinculado ao projeto OrientoHub.",
  },
  {
    question: "Quais insights eu deveria priorizar?",
    answer: "Você tem **3 alertas** e **2 oportunidades**. O mais urgente: investimento prematuro em TikTok sem landing page otimizada.",
  },
  {
    question: "Me dê um resumo geral da minha conta",
    answer: "**3 projetos**, **4 campanhas**, **12 insights**, **2 benchmarks**, budget de **R$ 12k/mês** com ROAS médio de **3.2x**.",
  },
];

export default function TiaZeroUI() {
  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Zero interface. <span className="text-primary">Só conversa.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Pergunte qualquer coisa sobre sua conta. A Tia responde com dados reais, formatados e acionáveis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {examples.map((ex) => (
            <div
              key={ex.question}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 shadow-lg hover:border-primary/40 hover:shadow-primary/10 transition-all duration-300 space-y-3"
            >
              {/* User question */}
              <div className="flex justify-end">
                <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs max-w-[90%] shadow-lg shadow-primary/20">
                  {ex.question}
                </div>
              </div>

              {/* Tia answer */}
              <div className="flex gap-2">
                <img src="/tia-branco-ponto-laranja.svg" alt="Tia" className="h-4 w-auto shrink-0 mt-0.5" />
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-foreground/80 shadow-lg leading-relaxed">
                  {ex.answer.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={i} className="text-primary font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
