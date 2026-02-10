import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuCategories = [
  {
    name: "Produto",
    items: [
      { name: "Funcionalidades", href: "/#funcionalidades" },
      { name: "Como Funciona", href: "/#como-funciona" },
      { name: "Plano Tático", href: "/plano-tatico" },
      { name: "Preços", href: "/precos" },
    ]
  },
  {
    name: "Empresa",
    items: [
      { name: "Sobre Nós", href: "/sobre" },
      { name: "Cases de Uso", href: "/cases" },
      { name: "Segurança", href: "/seguranca" },
      { name: "Status", href: "/status" },
      { name: "Contato", href: "/contato" },
    ]
  },
  {
    name: "Recursos",
    items: [
      { name: "Blog", href: "/blog" },
      { name: "Política de Privacidade", href: "/politica-de-privacidade" },
      { name: "Termos de Serviço", href: "/termos-de-servico" },
    ]
  }
];

function Logo() {
  return (
    <span className="text-2xl font-extrabold tracking-tight text-foreground">
      intentia<span className="text-primary">.</span>
    </span>
  );
}

function DropdownMenu({ 
  category, 
  activeDropdown, 
  setActiveDropdown 
}: { 
  category: typeof menuCategories[0]; 
  activeDropdown: string | null; 
  setActiveDropdown: (value: string | null) => void; 
}) {
  const navigate = useNavigate();
  const isOpen = activeDropdown === category.name;
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleClick = (href: string) => {
    // Se for link interno com #, faz scroll suave
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href.includes('#')) {
      // Se for link com # e página, navega primeiro depois faz scroll
      const [pagePath, hash] = href.split('#');
      navigate(pagePath);
      setTimeout(() => {
        window.scrollTo(0, 0); // Garante que comece do topo
        setTimeout(() => {
          const element = document.querySelector(`#${hash}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }, 100);
    } else {
      // Se for link de página, vai para o topo da página
      navigate(href);
      window.scrollTo(0, 0);
    }
    setActiveDropdown(null);
  };

  const toggleDropdown = () => {
    setActiveDropdown(isOpen ? null : category.name);
  };

  const handleMouseEnter = () => {
    // Cancela qualquer timeout pendente
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setActiveDropdown(category.name);
  };

  const handleMouseLeave = () => {
    // Adiciona um pequeno delay antes de fechar
    const id = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
    setTimeoutId(id);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={toggleDropdown}
        className="text-muted-foreground hover:text-accent-foreground flex items-center gap-1 py-2 text-sm font-medium transition-colors"
      >
        {category.name}
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
          {category.items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleClick(item.href)}
              className="block w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-accent-foreground hover:bg-accent/50 transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav data-state={menuState && "active"} className="fixed z-20 w-full px-2 group">
        <div
          className={cn(
            "mx-auto mt-1 max-w-4xl px-4 transition-all duration-300 lg:px-8",
            isScrolled && "bg-background/50 max-w-3xl rounded-2xl border backdrop-blur-lg lg:px-4",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-0">
            <div className="flex w-full justify-between lg:w-auto">
              <a href="/" aria-label="home" className="flex items-center space-x-2">
                <Logo />
              </a>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-6 text-sm">
                {menuCategories.map((category, index) => (
                  <li key={index}>
                    <DropdownMenu 
                      category={category} 
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuCategories.map((category, catIndex) => (
                    <div key={catIndex}>
                      <h3 className="font-semibold text-foreground mb-3">{category.name}</h3>
                      {category.items.map((item, index) => (
                        <li key={index}>
                          <button
                            onClick={() => {
                              // Se for link interno com #, faz scroll suave
                              if (item.href.startsWith('#')) {
                                const element = document.querySelector(item.href);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              } else if (item.href.includes('#')) {
                                // Se for link com # e página, navega primeiro depois faz scroll
                                const [pagePath, hash] = item.href.split('#');
                                navigate(pagePath);
                                setTimeout(() => {
                                  window.scrollTo(0, 0); // Garante que comece do topo
                                  setTimeout(() => {
                                    const element = document.querySelector(`#${hash}`);
                                    if (element) {
                                      element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                  }, 100);
                                }, 100);
                              } else {
                                // Se for link de página, vai para o topo da página
                                navigate(item.href);
                                window.scrollTo(0, 0);
                              }
                              setMenuState(false);
                            }}
                            className="text-muted-foreground hover:text-accent-foreground block duration-150 text-left w-full"
                          >
                            <span>{item.name}</span>
                          </button>
                        </li>
                      ))}
                    </div>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button variant="outline" size="sm" className={cn(isScrolled && "lg:hidden")} onClick={() => navigate('/auth')}>
                  <span>Entrar</span>
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    isScrolled
                      ? "lg:inline-flex bg-primary hover:bg-primary/90"
                      : "hidden bg-primary hover:bg-primary/90",
                  )}
                  onClick={() => navigate('/auth')}
                >
                  <span>Começar Grátis</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
