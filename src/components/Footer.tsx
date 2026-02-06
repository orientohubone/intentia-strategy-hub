import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-orange-200">
      <div className="mx-auto max-w-7xl py-16 px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              intentia<span className="text-primary">.</span>
            </span>
            <p className="text-sm text-muted-foreground max-w-xs">
              Plataforma de estratégia de mídia para B2B. Ajudamos empresas a tomar decisões inteligentes sobre investimentos em marketing digital.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Produtos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Produtos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Diagnóstico de URL
                </a>
              </li>
              <li>
                <a href="/#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Benchmark Estratégico
                </a>
              </li>
              <li>
                <a href="/#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Score por Canal
                </a>
              </li>
              <li>
                <a href="/#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Alertas Estratégicos
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Planos e Preços
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="/cases" className="text-muted-foreground hover:text-primary transition-colors">
                  Cases de Sucesso
                </a>
              </li>
              <li>
                <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Carreiras
                </a>
              </li>
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contato</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">intentia@orientohub.com.br</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+55 (14) 99861-8547</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Rua Eduardo Paulo de Souza, 296
                  <br />
                  Pompeia, SP 17584-284
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-orange-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground space-y-1">
              <div>© 2026 Intentia. Estratégia antes da mídia.</div>
              <div>Uma solução do ecossistema <a href="https://orientohub.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">orientohub.com.br</a></div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2 text-sm">
              <a href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <a href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Serviço
              </a>
              <a href="/cookie-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
