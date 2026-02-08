import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Database,
  Eye,
  ShieldCheck,
  Server,
  FileCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  HardDrive,
  Fingerprint,
  AlertTriangle,
  Layers,
  Trash2,
  RefreshCw,
} from "lucide-react";

const securityPillars = [
  {
    icon: Lock,
    title: "Isolamento Total de Dados",
    description: "Cada conta opera em um ambiente completamente isolado. Utilizamos Row Level Security (RLS) do PostgreSQL em todas as tabelas, garantindo que nenhum usuário possa acessar dados de outra conta — nem mesmo por acidente.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    features: [
      "RLS ativo em todas as 16+ tabelas do sistema",
      "Políticas de segurança por user_id em SELECT, INSERT, UPDATE e DELETE",
      "Views com security_invoker para respeitar permissões do usuário",
      "Impossível acessar dados de outro tenant via API ou interface",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Proteção contra Escalação",
    description: "Triggers de segurança no banco de dados impedem que qualquer requisição do lado do cliente altere dados sensíveis como plano da conta ou contadores de uso. Apenas processos autorizados do servidor podem modificar esses campos.",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    features: [
      "Trigger anti-escalação de plano (Starter → Professional bloqueado via client)",
      "Trigger anti-reset de contadores de análises",
      "Validação server-side de todas as operações críticas",
      "Rate limiting por plano para prevenir abuso",
    ],
  },
  {
    icon: Database,
    title: "Backup Automático e Manual",
    description: "Seus dados são protegidos com um sistema robusto de backup. Backups automáticos são criados antes de exclusões importantes, e você pode criar snapshots manuais a qualquer momento diretamente nas Configurações.",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    features: [
      "Backup automático antes de exclusão de projetos",
      "Backup manual sob demanda via Configurações",
      "Snapshot completo de todas as tabelas do usuário",
      "Download em JSON para armazenamento local",
    ],
  },
  {
    icon: Eye,
    title: "Auditoria Completa",
    description: "Todas as operações no banco de dados são registradas automaticamente em um log de auditoria. Cada INSERT, UPDATE e DELETE é rastreado com dados anteriores e posteriores, permitindo total rastreabilidade.",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    features: [
      "Audit log automático em todas as 13+ tabelas",
      "Registro de dados antes e depois de cada alteração",
      "Campos sensíveis (API keys, HTML) removidos dos logs",
      "Retenção de 90 dias com limpeza automática",
    ],
  },
];

const guardrails = [
  {
    icon: Trash2,
    title: "Soft Delete",
    description: "Projetos, públicos-alvo, benchmarks e planos táticos não são excluídos permanentemente. Ficam em estado de \"lixeira\" por 30 dias, permitindo recuperação em caso de exclusão acidental.",
  },
  {
    icon: AlertTriangle,
    title: "Rate Limiting",
    description: "Limites de requisições por hora protegem contra uso abusivo. Cada plano tem seus próprios limites, garantindo performance estável para todos os usuários.",
  },
  {
    icon: Layers,
    title: "Limites por Plano",
    description: "Controles automáticos garantem que cada conta respeite os limites do seu plano — número de projetos, análises por mês e funcionalidades disponíveis.",
  },
  {
    icon: RefreshCw,
    title: "Limpeza Automática",
    description: "Processos agendados removem dados expirados: logs de auditoria após 90 dias, backups expirados, rate limits antigos e registros soft-deleted após 30 dias.",
  },
];

const certifications = [
  {
    icon: Server,
    title: "Infraestrutura Supabase",
    description: "Hospedado na infraestrutura Supabase com PostgreSQL gerenciado, backups automáticos do banco, SSL/TLS em todas as conexões e data centers com certificação SOC 2.",
  },
  {
    icon: Fingerprint,
    title: "Autenticação Segura",
    description: "Sistema de autenticação Supabase Auth com hashing bcrypt de senhas, tokens JWT com expiração, proteção contra brute force e suporte a redefinição segura de senha.",
  },
  {
    icon: FileCheck,
    title: "API Keys Isoladas",
    description: "Chaves de API de IA (Gemini/Claude) são armazenadas por usuário com isolamento RLS. Nunca são expostas em logs, backups ou exportações — sempre mascaradas automaticamente.",
  },
  {
    icon: HardDrive,
    title: "Storage Seguro",
    description: "Arquivos como fotos de perfil são armazenados em buckets isolados com políticas de acesso por usuário. Cada usuário só pode acessar e manipular seus próprios arquivos.",
  },
];

export default function Security() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BackToHomeButton />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Segurança de Nível Empresarial
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Seus dados protegidos com{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              segurança robusta
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A Intentia implementa múltiplas camadas de segurança para garantir que seus dados
            estratégicos estejam sempre protegidos, isolados e recuperáveis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Começar Grátis
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">16+</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Tabelas com RLS</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">13+</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Tabelas auditadas</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">90 dias</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Retenção de logs</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">100%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Dados isolados</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              4 Pilares de Segurança
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada camada trabalha em conjunto para criar uma proteção completa dos seus dados estratégicos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {securityPillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border ${pillar.borderColor} p-6 sm:p-8 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-xl ${pillar.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground">{pillar.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{pillar.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {pillar.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guardrails */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Guardrails de Proteção
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mecanismos adicionais que protegem seus dados contra exclusões acidentais, abuso e inconsistências.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guardrails.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-background p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Infraestrutura e Conformidade
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Construído sobre infraestrutura de classe mundial com práticas de segurança modernas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-2xl border border-border p-6 hover:border-primary/20 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground">{cert.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Flow Diagram */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Como Seus Dados São Protegidos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada interação passa por múltiplas camadas de verificação e proteção.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-4 items-center">
              {[
                { step: "1", label: "Autenticação", desc: "JWT + Supabase Auth", icon: Fingerprint },
                { step: "2", label: "Autorização", desc: "RLS por user_id", icon: Lock },
                { step: "3", label: "Operação", desc: "CRUD com validação", icon: Database },
                { step: "4", label: "Auditoria", desc: "Log automático", icon: Eye },
                { step: "5", label: "Backup", desc: "Snapshot periódico", icon: HardDrive },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="relative inline-flex flex-col items-center">
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                        {item.step}
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Backup CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent border border-primary/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Clock className="h-4 w-4" />
              Disponível em todos os planos
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Seus dados, seu controle
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Crie backups manuais, exporte todos os seus dados em JSON e tenha a tranquilidade
              de saber que backups automáticos protegem suas informações antes de qualquer exclusão.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
                Criar Conta Gratuita
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/contato")}>
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
