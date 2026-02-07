import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Cookie, Settings, Shield, Eye, X } from "lucide-react";

export default function CookiePolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Política de <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Cookies</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Última atualização: 6 de Fevereiro de 2026
          </p>
          <p className="text-muted-foreground">
            Esta política explica como a Intentia usa cookies e tecnologias similares para melhorar sua experiência em nosso site e proteger sua privacidade.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* What are Cookies */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">O que são Cookies?</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Cookies são pequenos arquivos de texto que são armazenados em seu dispositivo quando você visita sites. Eles servem para várias finalidades:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Lembrar suas preferências e configurações</li>
                <li>Coletar informações sobre uso do site</li>
                <li>Personalizar conteúdo e anúncios</li>
                <li>Garantir a segurança do site</li>
                <li>Analisar o tráfego e desempenho</li>
              </ul>
              <p>
                Cookies não podem ser usados para executar programas ou infectar seu computador com vírus.
              </p>
            </div>
          </div>

          {/* Types of Cookies */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Tipos de Cookies que Usamos</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cookies Essenciais</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Necessários para o funcionamento básico do site:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Autenticação e login</li>
                  <li>Segurança e prevenção de fraudes</li>
                  <li>Preferências de idioma e região</li>
                  <li>Carrinho de compras e processamento</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cookies de Performance</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Coletam informações sobre como você usa nosso site:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Páginas visitadas e tempo de permanência</li>
                  <li>Taxa de rejeição e erros encontrados</li>
                  <li>Desempenho do site e velocidade</li>
                  <li>Dispositivo e navegador utilizado</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cookies Funcionais</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Melhoram sua experiência lembrando suas escolhas:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Nome de usuário e preferências</li>
                  <li>Configurações personalizadas</li>
                  <li>Localização e fuso horário</li>
                  <li>Itens salvados no carrinho</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cookies de Marketing</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Usados para personalizar anúncios e medir eficácia:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Interesse em produtos específicos</li>
                  <li>Histórico de navegação em outros sites</li>
                  <li>Medição de campanhas publicitárias</li>
                  <li>Personalização de conteúdo</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Cookies de Terceiros</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Usamos serviços de terceiros que também usam cookies para fornecer funcionalidades e analisar o uso do site:
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Google Analytics</h3>
                  <p className="text-sm">Análise de tráfego e comportamento do usuário</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Meta/Facebook</h3>
                  <p className="text-sm">Anúncios personalizados e medição de conversões</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">LinkedIn</h3>
                  <p className="text-sm">Anúncios B2B e análise de profissionais</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Hotjar</h3>
                  <p className="text-sm">Mapas de calor e gravações de sessão</p>
                </div>
              </div>
            </div>
          </div>

          {/* Managing Cookies */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Gerenciando Cookies</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Aceitar ou Recusar Cookies</h3>
                <p className="text-sm mb-2">
                  Você pode controlar cookies através de:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Barra de cookies ao visitar nosso site pela primeira vez</li>
                  <li>Configurações do seu navegador</li>
                  <li>Preferências de conta em nosso painel</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Configurações do Navegador</h3>
                <p className="text-sm mb-2">
                  A maioria dos navegadores permite controlar cookies:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
                  <li><strong>Firefox:</strong> Opções → Privacidade e segurança → Cookies</li>
                  <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
                  <li><strong>Edge:</strong> Configurações → Cookies e permissões de site</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Impacto da Recusa</h3>
                <p className="text-sm mb-2">
                  Recusar cookies pode afetar:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Funcionalidades personalizadas podem não funcionar</li>
                  <li>Experiência de navegação pode ser menos fluida</li>
                  <li>Anúncios podem ser menos relevantes</li>
                  <li>Algumas funcionalidades podem ficar indisponíveis</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Retenção de Dados</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Período de Retenção</h3>
                <p className="text-sm mb-2">
                  Mantemos cookies pelo período necessário:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Sessão:</strong> Cookies temporários expiram ao fechar o navegador</li>
                  <li><strong>Persistentes:</strong> Geralmente 30 dias a 2 anos</li>
                  <li><strong>Autenticação:</strong> Até o logout ou expiração da sessão</li>
                  <li><strong>Preferências:</strong> Até 12 meses sem atividade</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Exclusão de Dados</h3>
                <p className="text-sm mb-2">
                  Você pode solicitar exclusão de dados relacionados a cookies:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Limpar cookies do navegador</li>
                  <li>Solicitar exclusão via intentia@orientohub.com.br</li>
                  <li>Usar ferramentas de privacidade de navegadores</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Atualizações desta Política</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Esta política de cookies pode ser atualizada para refletir mudanças em nossas práticas ou requisitos legais.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Alterações significativas serão comunicadas no site</li>
                <li>Data da última atualização sempre visível</li>
                <li>Continuação do uso indica aceitação das alterações</li>
                <li>Recomendamos revisar esta política periodicamente</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Dúvidas sobre Cookies?</h2>
            <p className="text-muted-foreground mb-4">
              Se você tiver perguntas sobre nossa política de cookies ou como gerenciá-los, entre em contato:
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
            Controle Sua Privacidade
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Entenda como usamos cookies e gerencie suas preferências para uma experiência segura e personalizada.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/dashboard')}>
            Gerenciar Preferências
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
