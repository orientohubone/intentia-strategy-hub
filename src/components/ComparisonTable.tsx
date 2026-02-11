import {
  DollarSign,
  Users,
  Search,
  Clock,
  TrendingUp,
  Database,
  FileText,
  Brain,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";

const columns = [
  {
    name: "Estrategista",
    highlight: false,
    rows: [
      { icon: DollarSign, label: "Custo", value: "~R$7.000/mês" },
      { icon: Users, label: "Modelo", value: "Humano dedicado" },
      { icon: Search, label: "Foco", value: "Análise & Direção" },
      { icon: Clock, label: "Velocidade", value: "Horas / dias" },
      { icon: BarChart3, label: "Escalabilidade", value: "Limitada" },
    ],
  },
  {
    name: "Consultoria",
    highlight: false,
    rows: [
      { icon: DollarSign, label: "Custo", value: "~R$10.000/mês" },
      { icon: Database, label: "Modelo", value: "Projeto pontual" },
      { icon: FileText, label: "Foco", value: "Diagnóstico" },
      { icon: Clock, label: "Velocidade", value: "Semanas" },
      { icon: BarChart3, label: "Escalabilidade", value: "Não Escala" },
    ],
  },
  {
    name: "Intentia",
    highlight: true,
    rows: [
      { icon: DollarSign, label: "Custo", value: "R$147/mês" },
      { icon: Brain, label: "Modelo", value: "IA Contínua" },
      { icon: Target, label: "Foco", value: "Estratégia & Execução" },
      { icon: Zap, label: "Velocidade", value: "Tempo Real" },
      { icon: TrendingUp, label: "Escalabilidade", value: "Escala Automática" },
    ],
  },
];

export function ComparisonTable() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Decisão não precisa ser{" "}
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">cara.</span>
            <br />
            Precisa ser{" "}
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">contínua.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enquanto empresas pagam milhares por diagnósticos pontuais ou dependem de pessoas para decidir, a{" "}
            <span className="font-semibold text-foreground">Intentia</span> opera estratégia, tática e execução todos os dias
            — <span className="font-semibold text-primary">por menos de R$5 por dia.</span>
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-14">
          {columns.map((col) => (
            <div
              key={col.name}
              className={`rounded-2xl overflow-hidden transition-all ${
                col.highlight
                  ? "shadow-xl shadow-primary/15 md:scale-105 border-2 border-primary"
                  : "border border-border shadow-sm"
              }`}
            >
              {/* Card header */}
              <div
                className={`px-6 py-4 text-center ${
                  col.highlight
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground"
                }`}
              >
                <h3 className="text-lg font-bold">{col.name}</h3>
              </div>

              {/* Card body */}
              <div className="bg-card p-6 space-y-5">
                {col.rows.map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        col.highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <row.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">{row.label}</p>
                      <p className={`text-sm font-semibold ${col.highlight ? "text-foreground" : "text-foreground"}`}>
                        {row.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="text-center">
          <p className="text-lg md:text-xl font-semibold text-foreground">
            Consultorias analisam. Estrategistas orientam.{" "}
            <span className="text-primary">A Intentia decide e executa continuamente.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
