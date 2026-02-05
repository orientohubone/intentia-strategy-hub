import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Funcionalidades", href: "#features" },
    { label: "Como Funciona", href: "#how-it-works" },
    { label: "Preços", href: "#pricing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">I</span>
            </div>
            <span className="font-bold text-xl text-foreground">Intentia</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost">Entrar</Button>
            <Button variant="hero">Começar Grátis</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden border-t border-border bg-background overflow-hidden transition-all duration-300",
        mobileOpen ? "max-h-64" : "max-h-0"
      )}>
        <div className="px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button variant="ghost" className="w-full justify-center">Entrar</Button>
            <Button variant="hero" className="w-full">Começar Grátis</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
