import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Send, MessageSquare, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    content: "contato@intentia.com.br",
    description: "Respondemos em até 24h úteis"
  },
  {
    icon: Phone,
    title: "Telefone",
    content: "+55 (11) 9999-8888",
    description: "Seg a Sex, 9h às 18h"
  },
  {
    icon: MapPin,
    title: "Endereço",
    content: "Av. Paulista, 1000 - 14º andar",
    description: "São Paulo, SP 01310-100"
  },
  {
    icon: Clock,
    title: "Horário de Atendimento",
    content: "Segunda a Sexta",
    description: "9h às 18h (horário de Brasília)"
  }
];

const faqItems = [
  {
    question: "Como funciona a análise estratégica da Intentia?",
    answer: "Nossa plataforma analisa sua URL, mercado-alvo e concorrentes para gerar scores de adequação por canal de mídia, identificando oportunidades e riscos antes de você investir."
  },
  {
    question: "Quanto tempo leva para receber os resultados?",
    answer: "Análises básicas são entregues em até 24h. Análises completas com benchmark competitivo podem levar até 48h dependendo da complexidade."
  },
  {
    question: "Quais tipos de empresas vocês atendem?",
    answer: "Focamos em empresas B2B de todos os tamanhos, desde startups até grandes corporações, especialmente em SaaS, tecnologia, serviços e consultoria."
  },
  {
    question: "Posso cancelar meu plano a qualquer momento?",
    answer: "Sim! Nossos planos são flexíveis sem compromisso de longo prazo. Você pode upgrade, downgrade ou cancelar quando quiser."
  },
  {
    question: "Vocês oferecem treinamento para a equipe?",
    answer: "Sim! Planos Professional e Enterprise incluem treinamento inicial e consultoria estratégica para garantir que sua equipe tire o máximo da plataforma."
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ name: "", email: "", company: "", phone: "", message: "" });
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Entre em <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Contato</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Tem dúvidas sobre nossa plataforma? Quer saber como podemos ajudar seu negócio? 
            Estamos aqui para conversar e encontrar a melhor solução para você.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <info.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                  <p className="text-sm text-foreground mb-1">{info.content}</p>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Envie-nos uma mensagem</h2>
              <p className="text-muted-foreground mb-8">
                Preencha o formulário abaixo e nossa equipe entrará em contato o mais rápido possível 
                para discutir como podemos ajudar sua empresa a crescer.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Nome da sua empresa"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(11) 9999-8888"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Como podemos ajudar sua empresa? Conte-nos mais sobre seus desafios e objetivos..."
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <Button type="submit" variant="hero" size="lg" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Mensagem"}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Perguntas Frequentes
                  </CardTitle>
                  <CardDescription>
                    Respostas rápidas para as dúvidas mais comuns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-b-0">
                      <h4 className="font-semibold text-foreground mb-2">{item.question}</h4>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Prefere conversar por telefone?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Agende uma demonstração gratuita com um de nossos especialistas.
                </p>
                <Button variant="outline" className="w-full">
                  Agendar Demonstração
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para transformar sua estratégia de marketing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Dê o primeiro passo hoje mesmo e descubra como a Intentia pode revolucionar seus resultados.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              Começar Análise Gratuita
            </Button>
            <Button variant="outline" size="xl">
              Ver Planos e Preços
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* Back to Top Button */}
      <BackToTop />
      {/* Back to Home Button */}
      <BackToHomeButton />
    </div>
  );
}
