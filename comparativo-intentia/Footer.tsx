const Footer = () => {
  return (
    <footer className="py-10 border-t border-border/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">I</span>
            </div>
            <span className="font-display font-bold text-foreground">Intentia</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Intentia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
