import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Shield, AlertCircle, CheckCircle } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Termos de Serviço" path="/termos-de-servico" description="Termos de serviço da Intentia. Condições de uso da plataforma de análise estratégica para marketing B2B." />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Termos de <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Serviço</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Última atualização: 6 de Fevereiro de 2026
          </p>
          <p className="text-muted-foreground">
            Estes Termos de Serviço regem o uso da plataforma Intentia Strategy Hub e estabelecem os direitos e responsabilidades entre você e a Intentia.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Acceptance */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Aceitação dos Termos</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Ao acessar e usar a plataforma Intentia, você aceita estes Termos de Serviço. Se você não concorda com estes termos, não use nossa plataforma.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Você deve ter pelo menos 18 anos para usar nossos serviços</li>
                <li>Você é responsável por manter a confidencialidade de sua conta</li>
                <li>Você concorda em fornecer informações verdadeiras e precisas</li>
                <li>Você pode usar nossos serviços apenas para fins legais</li>
              </ul>
            </div>
          </div>

          {/* Services */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Nossos Serviços</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                A Intentia oferece serviços de análise estratégica de marketing digital para empresas B2B:
              </p>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Serviços Incluídos</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Análise de URL e proposta de valor</li>
                  <li>Benchmark competitivo</li>
                  <li>Score de adequação por canal de mídia</li>
                  <li>Alertas estratégicos e recomendações</li>
                  <li>Relatórios detalhados e insights</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Limitações do Serviço</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Não garantimos resultados específicos de marketing</li>
                  <li>Nosso serviço é ferramenta de análise, não consultoria direta</li>
                  <li>Limites de uso conforme seu plano contratado</li>
                  <li>Reservamo o direito de modificar ou descontinuar serviços</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Accounts */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Contas de Usuário</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Responsabilidades do Usuário</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Manter suas informações de cadastro atualizadas</li>
                  <li>Proteger sua senha contra acesso não autorizado</li>
                  <li>Notificar imediatamente sobre uso não autorizado</li>
                  <li>Usar o serviço de acordo com estes termos</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Suspensão e Término</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Podemos suspender sua conta por violação destes termos</li>
                  <li>Podemos remover conteúdo que viole nossos termos</li>
                  <li>Você pode encerrar sua conta a qualquer momento</li>
                  <li>Dados podem ser retidos conforme lei aplicável</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Propriedade Intelectual</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Nossos Direitos</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>A plataforma e seu conteúdo são de nossa propriedade</li>
                  <li>Logotipos, marcas e designs são protegidos</li>
                  <li>Código-fonte e algoritmos são confidenciais</li>
                  <li>Reservamos todos os direitos não concedidos</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Seus Direitos</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Você mantém direitos sobre seus dados</li>
                  <li>Relatórios gerados são seus para uso comercial</li>
                  <li>Pode usar insights para suas estratégias</li>
                  <li>Não pode revender ou redistribuir nosso serviço</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Pagamentos e Planos</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Planos e Preços</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Oferecemos planos mensais com diferentes recursos</li>
                  <li>Preços podem mudar com aviso prévio de 30 dias</li>
                  <li>Planos pagos são não reembolsáveis</li>
                  <li>Upgrade de plano é imediato</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Faturamento</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Cobranças são feitas mensalmente</li>
                  <li>Podemos usar terceiros para processamento</li>
                  <li>Você autoriza cobranças automáticas</li>
                  <li>Contas vencadas podem ser suspensas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Isenções de Responsabilidade</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Na máxima extensão permitida por lei, a Intentia não se responsabiliza por:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Resultados de marketing obtidos com nossas análises</li>
                <li>Decisões de negócio baseadas em nossos insights</li>
                <li>Interrupções ou falhas no serviço</li>
                <li>Perdas indiretas ou consequenciais</li>
                <li>Conteúdo de terceiros ou links externos</li>
              </ul>
              <p>
                Nossos serviços são fornecidos "como estão" sem garantias de qualquer tipo.
              </p>
            </div>
          </div>

          {/* Changes */}
          <div className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Alterações nos Termos</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Podemos atualizar estes termos periodicamente para refletir mudanças em nossos serviços ou requisitos legais.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Alterações significativas serão comunicadas com 30 dias de antecedência</li>
                <li>Uso continuado do serviço constitui aceitação das alterações</li>
                <li>Última data de atualização será sempre exibida</li>
                <li>Alterações entram em vigor na data especificada</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Entre em Contato</h2>
            <p className="text-muted-foreground mb-4">
              Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> intentia@orientohub.com.br</p>
              <p><strong>Telefone:</strong> +55 (14) 99861-8547</p>
              <p><strong>Endereço:</strong> Rua Eduardo Paulo de Souza, 296 — Pompeia, SP 17584-284</p>
              <p><strong>Horário:</strong> Segunda a Sexta, 9h às 18h (horário de Brasília)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Aceite nossos termos e comece a transformar sua estratégia de marketing hoje mesmo.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
            Criar Minha Conta
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      <BackToTop />
      {/* Back to Home Button */}
      <BackToHomeButton />
    </div>
  );
}
