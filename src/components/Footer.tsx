import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

type FooterLink = { label: string; href: string };
type FooterGroup = { title: string; links: FooterLink[] };

const footerGroups: FooterGroup[] = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "/#funcionalidades" },
      { label: "Como Funciona", href: "/#como-funciona" },
      { label: "Monitoramento SEO Inteligente", href: "/monitoramento-seo-inteligente" },
      { label: "Plano Tatico", href: "/plano-tatico" },
      { label: "Relatorios", href: "/relatorios" },
      { label: "Comparar", href: "/comparar" },
      { label: "Tia — Assistente IA", href: "/tia" },
      { label: "Precos", href: "/precos" },
    ],
  },
  {
    title: "Solucoes",
    links: [
      { label: "Diagnostico de URL", href: "/diagnostico-url" },
      { label: "Analise IA", href: "/analise-ia" },
      { label: "Benchmark Competitivo", href: "/benchmark-competitivo" },
      { label: "Gestao de Campanhas", href: "/gestao-campanhas" },
      { label: "Gestao de Budget", href: "/gestao-budget" },
      { label: "Score por Canal", href: "/score-canal" },
      { label: "Alertas e Insights", href: "/alertas-insights" },
      { label: "Dados Estruturados", href: "/dados-estruturados" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre Nos", href: "/sobre" },
      { label: "Cases de Uso", href: "/cases" },
      { label: "Blog", href: "/blog" },
      { label: "Contato", href: "/contato" },
      { label: "Seguranca", href: "/seguranca" },
      { label: "Status", href: "/status" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { label: "Politica de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos de Servico", href: "/termos-de-servico" },
  { label: "Politica de Cookies", href: "/politica-de-cookies" },
  { label: "Exclusao de Dados", href: "/exclusao-de-dados" },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-orange-200">
      <div className="mx-auto max-w-7xl py-16 px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="space-y-4 lg:col-span-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              intentia<span className="text-primary">.</span>
            </span>
            <p className="text-sm text-muted-foreground max-w-sm">
              Plataforma de estrategia de midia para B2B. Ajudamos empresas a tomar decisoes inteligentes sobre investimentos em marketing digital.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Github">
                <Github className="h-5 w-5" />
              </a>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground pt-2">
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

          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              <ul className="space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-orange-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground space-y-1">
              <div>© 2026 Intentia. Estrategia antes da midia.</div>
              <div className="text-xs">CNPJ: 64.999.887/0001-56</div>
              <div>
                Uma solucao do ecossistema{" "}
                <a href="https://orientohub.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  orientohub.com.br
                </a>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2 text-sm">
              {legalLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </a>
              ))}
              <a href="/status" className="text-muted-foreground hover:text-primary transition-colors">
                Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
