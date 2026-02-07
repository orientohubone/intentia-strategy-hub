import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuCategories = [
  {
    name: "Produto",
    items: [
      { name: "Funcionalidades", href: "#features" },
      { name: "Como Funciona", href: "#how-it-works" },
      { name: "Preços", href: "/pricing" },
    ]
  },
  {
    name: "Empresa",
    items: [
      { name: "Sobre Nós", href: "/about" },
      { name: "Cases de Uso", href: "/cases" },

      { name: "Contato", href: "/contact" },
    ]
  },
  {
    name: "Recursos",
    items: [
      { name: "Blog", href: "/blog" },
      { name: "Política de Privacidade", href: "/privacy-policy" },
      { name: "Termos de Serviço", href: "/terms-of-service" },
    ]
  }
];

function Logo() {
  return (
    <span className="text-xl font-extrabold tracking-tight text-foreground">
      intentia<span className="text-primary">.</span>
    </span>
  );
}

function DropdownMenu({ category }: { category: typeof menuCategories[0] }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (href: string) => {
    console.log('=== DEBUG: DropdownMenu.handleClick ===');
    console.log('Clicou em:', href);
    console.log('Location atual:', location.pathname);
    
    // Se for link interno com #, faz scroll suave
    if (href.startsWith('#')) {
      console.log('É link interno, fazendo scroll');
      const element = document.querySelector(href);
      if (element) {
        console.log('Elemento encontrado:', element);
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.log('Elemento não encontrado para:', href);
      }
    } else {
      console.log('É link de página, navegando para:', href);
      // Se for link de página, usa navigate
      navigate(href);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-muted-foreground hover:text-accent-foreground flex items-center gap-1 py-2 text-sm font-medium transition-colors"
      >
        {category.name}
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
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

export function HeaderDebug() {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('=== DEBUG: Header useEffect ===');
    console.log('Location mudou para:', location.pathname);
  }, [location]);

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
                    <DropdownMenu category={category} />
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
                              console.log('=== DEBUG: Mobile menu handleClick ===');
                              console.log('Mobile clicou em:', item.href);
                              console.log('Location atual:', location.pathname);
                              
                              // Se for link interno com #, faz scroll suave
                              if (item.href.startsWith('#')) {
                                console.log('Mobile é link interno, fazendo scroll');
                                const element = document.querySelector(item.href);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              } else {
                                console.log('Mobile é link de página, navegando para:', item.href);
                                // Se for link de página, usa navigate
                                navigate(item.href);
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
