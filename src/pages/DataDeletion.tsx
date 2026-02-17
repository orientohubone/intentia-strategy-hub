import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trash2, Shield, Mail, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function DataDeletion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Exclusão de Dados" path="/exclusao-de-dados" description="Saiba como solicitar a exclusão dos seus dados pessoais na Intentia. Instruções completas para remoção de conta e dados." />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Exclusão de <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Dados</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Última atualização: 17 de Fevereiro de 2026
          </p>
          <p className="text-muted-foreground">
            Na Intentia, você tem total controle sobre seus dados. Esta página explica como solicitar a exclusão completa dos seus dados pessoais, incluindo dados obtidos através de integrações com plataformas de terceiros como Meta (Facebook/Instagram), Google Ads, LinkedIn e TikTok.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* What Data We Store */}
          <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Dados que Armazenamos</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-sm">
                Quando você utiliza a Intentia e conecta integrações com plataformas de publicidade, podemos armazenar os seguintes dados:
              </p>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Dados da Conta</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Nome, email e informações de perfil</li>
                  <li>Nome da empresa e configurações de conta</li>
                  <li>Preferências e configurações do sistema</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Dados de Integrações (Meta, Google, LinkedIn, TikTok)</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Tokens de acesso OAuth (criptografados)</li>
                  <li>Informações da conta de anúncios (ID, nome)</li>
                  <li>Métricas de campanhas (impressões, cliques, custos)</li>
                  <li>Logs de sincronização</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Dados de Análise</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Projetos, URLs analisadas e resultados</li>
                  <li>Benchmarks, insights e planos táticos</li>
                  <li>Backups criados pelo usuário</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Request Deletion */}
          <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Como Solicitar a Exclusão</h2>
            </div>
            <div className="space-y-6 text-muted-foreground">
              <p className="text-sm">
                Você pode solicitar a exclusão dos seus dados de três formas:
              </p>

              {/* Method 1 */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Pela Plataforma (Recomendado)</h3>
                    <p className="text-sm mb-3">
                      Acesse <strong>Configurações → Gerenciamento da Conta</strong> dentro da plataforma e clique em <strong>"Excluir Conta"</strong>. 
                      Isso removerá permanentemente todos os seus dados, incluindo projetos, análises, integrações e backups.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
                      Ir para Configurações
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Method 2 */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Por Email</h3>
                    <p className="text-sm mb-2">
                      Envie um email para <strong>intentia@orientohub.com.br</strong> com o assunto <strong>"Solicitação de Exclusão de Dados"</strong> incluindo:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Seu nome completo</li>
                      <li>Email cadastrado na plataforma</li>
                      <li>Se deseja exclusão parcial (apenas integrações) ou total (toda a conta)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Method 3 */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Via Plataforma de Terceiros</h3>
                    <p className="text-sm">
                      Se você conectou sua conta Meta (Facebook/Instagram), Google, LinkedIn ou TikTok, pode também revogar o acesso diretamente 
                      nas configurações de privacidade dessas plataformas. Ao revogar, a Intentia será notificada automaticamente e removerá 
                      os dados associados àquela integração.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What Happens After Deletion */}
          <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">O que Acontece Após a Solicitação</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Confirmação imediata</p>
                    <p className="text-sm">Você receberá um email confirmando o recebimento da solicitação.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Processamento em até 30 dias</p>
                    <p className="text-sm">Seus dados serão completamente removidos dos nossos servidores em até 30 dias corridos, conforme a LGPD.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Tokens de integração revogados</p>
                    <p className="text-sm">Todos os tokens OAuth de integrações (Meta, Google, LinkedIn, TikTok) serão revogados e excluídos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificação de conclusão</p>
                    <p className="text-sm">Você receberá um email final confirmando que todos os dados foram excluídos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-foreground">Informações Importantes</h2>
            </div>
            <div className="space-y-4 text-muted-foreground text-sm">
              <ul className="list-disc list-inside space-y-3">
                <li>A exclusão de dados é <strong>irreversível</strong>. Uma vez processada, não será possível recuperar seus dados.</li>
                <li>Recomendamos criar um backup dos seus dados antes de solicitar a exclusão. Você pode fazer isso em <strong>Configurações → Backup & Segurança</strong>.</li>
                <li>Dados anonimizados e agregados para fins estatísticos podem ser mantidos, conforme permitido pela LGPD (Art. 16, IV).</li>
                <li>Dados necessários para cumprimento de obrigações legais podem ser retidos pelo período exigido por lei.</li>
                <li>A exclusão da conta não cancela automaticamente assinaturas ativas. Cancele sua assinatura antes de solicitar a exclusão.</li>
              </ul>
            </div>
          </div>

          {/* Meta-specific section */}
          <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <img src="/meta-ads.svg" alt="Meta" className="h-6 w-6 object-contain" />
              <h2 className="text-2xl font-bold text-foreground">Dados do Meta (Facebook/Instagram)</h2>
            </div>
            <div className="space-y-4 text-muted-foreground text-sm">
              <p>
                Se você conectou sua conta Meta Ads à Intentia, os seguintes dados específicos são armazenados e serão excluídos mediante solicitação:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Token de acesso OAuth do Meta (criptografado)</li>
                <li>ID e nome da conta de anúncios do Meta</li>
                <li>Métricas de campanhas sincronizadas (impressões, cliques, gastos, conversões)</li>
                <li>Logs de sincronização com timestamps</li>
                <li>Mapeamento de campanhas com projetos internos</li>
              </ul>
              <p>
                Você também pode remover o acesso da Intentia diretamente nas <strong>Configurações de Negócios do Meta</strong> → <strong>Integrações</strong> → <strong>Apps e Sites</strong>. 
                Ao remover, seremos notificados e excluiremos automaticamente os dados associados.
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-4">
                <p className="text-xs">
                  <strong className="text-foreground">Conformidade:</strong> Este processo está em conformidade com a Política de Dados do Meta para Desenvolvedores, 
                  a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e o Regulamento Geral de Proteção de Dados (GDPR) da União Europeia.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Entre em Contato</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Se você tiver dúvidas sobre a exclusão dos seus dados ou precisar de assistência:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> intentia@orientohub.com.br</p>
              <p><strong>Assunto:</strong> Solicitação de Exclusão de Dados</p>
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
            Seus Dados, Seu Controle
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Transparência e controle total sobre seus dados pessoais é um direito fundamental.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="xl" onClick={() => navigate('/settings')}>
              Gerenciar Meus Dados
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate('/politica-de-privacidade')}>
              Política de Privacidade
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      <BackToTop />
      <BackToHomeButton />
    </div>
  );
}
