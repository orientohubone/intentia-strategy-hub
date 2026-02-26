import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const chatMessages = [
  { role: "user" as const, text: "Quantas campanhas ativas eu tenho?" },
  { role: "assistant" as const, text: "Você tem **4 campanhas ativas** com gasto total de **R$ 12.450** e ROAS médio de **3.2x**." },
  { role: "user" as const, text: "Qual projeto tem o melhor score?" },
  { role: "assistant" as const, text: "O projeto **OrientoHub** lidera com score **85/100**. Google (92) e LinkedIn (78) são os canais mais fortes." },
];

function RenderText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="text-primary font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function TiaHero() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (hovered || isOpen) {
      setVisibleMessages(0);
      let idx = 0;
      const showNext = () => {
        idx += 1;
        setVisibleMessages(idx);
        if (idx < chatMessages.length) {
          timeoutRef.current = setTimeout(showNext, idx % 2 === 0 ? 600 : 1200);
        }
      };
      timeoutRef.current = setTimeout(showNext, 400);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisibleMessages(0);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hovered, isOpen]);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-primary/40 text-primary bg-primary/5 px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Assistente de IA Integrada
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 flex items-end justify-center gap-3">
            <span>Conheça a</span>
            <img
              src="/tia-branco-ponto-laranja.svg"
              alt="Tia"
              className="h-12 md:h-16 lg:h-[5rem] w-auto translate-y-[0.06em]"
            />
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            A inteligência por trás da sua estratégia de marketing B2B.
            Ela conhece seus projetos, campanhas, métricas e budget — e transforma dados em decisões.
          </p>

          <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-10">
            Sem prompts complexos. Sem dashboards confusos. Pergunte em linguagem natural e receba respostas com contexto real da sua conta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25"
              onClick={() => navigate("/auth")}
            >
              Começar Grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-base font-semibold"
              onClick={() => {
                document.getElementById("tia-origin")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Como ela funciona
            </Button>
          </div>
        </div>

        {/* Screenshot showcase */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-2xl opacity-60" />

            {/* Screenshot */}
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10">
              <div className="border-beam rounded-2xl" />
              <img
                src="/tiainterface.png"
                alt="Interface da Tia — Assistente IA da Intentia"
                className="w-full h-auto block"
                draggable={false}
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Botão interativo da Tia */}
          <div className="flex justify-center mt-8">
            <div
              className="relative"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* Botão */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex items-center gap-2.5 rounded-full px-5 py-2.5 border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:border-primary/40 hover:shadow-primary/20 transition-all duration-300 active:scale-95"
              >
                <img src="/tia-branco-ponto-laranja.svg" alt="Tia" className="h-5 w-auto" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground leading-tight">Falar com a Tia</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline">Passe o mouse para ver em ação</span>
                    <span className="sm:hidden">Toque para ver em ação</span>
                  </p>
                </div>
              </button>

              {/* Conversa que aparece ao hover */}
              <div
                className="absolute left-1/2 top-full mt-4 w-80 transition-all duration-500 z-50"
                style={{
                  opacity: (hovered || isOpen) ? 1 : 0,
                  transform: `translateX(-50%) ${(hovered || isOpen) ? 'translateY(0)' : 'translateY(-8px)'}`,
                  pointerEvents: (hovered || isOpen) ? 'auto' : 'none',
                }}
              >
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className="transition-all duration-300"
                      style={{
                        opacity: i < visibleMessages ? 1 : 0,
                        transform: i < visibleMessages ? 'translateY(0)' : 'translateY(8px)',
                        transitionDelay: `${i * 50}ms`,
                      }}
                    >
                      {msg.role === "user" ? (
                        <div className="flex justify-end">
                          <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs max-w-[240px] shadow-lg shadow-primary/20">
                            {msg.text}
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <img src="/tia-branco-ponto-laranja.svg" alt="Tia" className="h-4 w-auto shrink-0 mt-0.5" />
                          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-foreground/80 shadow-lg leading-relaxed">
                            <RenderText text={msg.text} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {visibleMessages > 0 && visibleMessages < chatMessages.length && (
                    <div className="flex gap-2">
                      <img src="/tia-branco-ponto-laranja.svg" alt="Tia" className="h-4 w-auto shrink-0" />
                      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-lg">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
