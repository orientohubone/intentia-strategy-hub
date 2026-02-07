import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Eye, Lock, Database } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Política de <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Privacidade</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Última atualização: 6 de Fevereiro de 2026
          </p>
          <p className="text-muted-foreground">
            Na Intentia, levamos a privacidade dos seus dados muito a sério. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Information We Collect */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Informações que Coletamos</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Informações de Conta</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Nome, email e senha para criação de conta</li>
                  <li>Nome da empresa e cargo (opcional)</li>
                  <li>Informações de perfil e preferências</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Dados de Uso</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>URLs analisadas e resultados de estratégia</li>
                  <li>Configurações de planos e preferências</li>
                  <li>Histórico de análises e relatórios gerados</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Dados Técnicos</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Endereço IP e informações de navegador</li>
                  <li>Logs de acesso e padrões de uso</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Como Usamos Suas Informações</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Para Fornecer Nossos Serviços</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Processar suas análises de estratégia de mídia</li>
                  <li>Gerenciar sua conta e preferências</li>
                  <li>Fornecer suporte técnico e atendimento ao cliente</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Para Melhorar Nossos Serviços</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Analisar padrões de uso para otimizar nossa plataforma</li>
                  <li>Desenvolver novas funcionalidades com base no feedback</li>
                  <li>Realizar testes A/B para melhorar a experiência</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Para Comunicação</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Enviar atualizações sobre seus projetos e análises</li>
                  <li>Comunicar mudanças em nossos termos e políticas</li>
                  <li>Oferecer suporte e responder suas dúvidas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Proteção de Dados</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Medidas de Segurança</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Criptografia SSL/TLS para todas as transmissões</li>
                  <li>Armazenamento seguro em servidores certificados</li>
                  <li>Acesso restrito a informações pessoais</li>
                  <li>Monitoramento constante de segurança</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Seus Direitos</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Acessar suas informações pessoais</li>
                  <li>Corrigir dados imprecisos ou incompletos</li>
                  <li>Excluir suas informações pessoais</li>
                  <li>Portabilidade de dados para outros serviços</li>
                  <li>Limitar o processamento de seus dados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Cookies e Tecnologias Similares</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Usamos cookies e tecnologias similares para melhorar sua experiência em nosso site:
              </p>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tipos de Cookies</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Essenciais:</strong> Necessários para o funcionamento do site</li>
                  <li><strong>Performance:</strong> Coletam informações sobre uso do site</li>
                  <li><strong>Funcionalidade:</strong> Lembram suas preferências</li>
                  <li><strong>Marketing:</strong> Usados para personalizar anúncios</li>
                </ul>
              </div>
              <p>
                Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-xl border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Entre em Contato</h2>
            <p className="text-muted-foreground mb-4">
              Se você tiver dúvidas sobre esta política de privacidade ou como seus dados são usados, entre em contato:
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
            Sua Privacidade é Nossa Prioridade
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Estamos comprometidos em proteger suas informações enquanto fornecemos o melhor serviço possível.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/dashboard')}>
            Começar com Segurança
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
