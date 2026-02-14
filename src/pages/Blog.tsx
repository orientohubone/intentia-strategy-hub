import { useState } from "react";
import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { blogPosts, blogCategories } from "@/lib/blogData";

export default function Blog() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Todos");

  const featured = blogPosts[0];
  const FeaturedIcon = featured.icon;

  const filtered =
    activeCategory === "Todos"
      ? blogPosts.slice(1)
      : blogPosts.filter((p) => p.category === activeCategory && p.slug !== featured.slug);

  const goToPost = (slug: string) => {
    navigate(`/blog/${slug}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog"
        path="/blog"
        description="Artigos práticos sobre marketing B2B, mídia paga, benchmark competitivo, IA para marketing, gestão de campanhas e estratégia digital."
        keywords="blog marketing B2B, artigos mídia paga, estratégia digital blog, benchmark competitivo, IA marketing"
        jsonLd={buildBreadcrumb([{ name: "Blog", path: "/blog" }])}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Blog{" "}
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              Intentia
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Artigos práticos sobre estratégia de mídia B2B, benchmark competitivo, IA para marketing e gestão de campanhas.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => goToPost(featured.slug)}
            className="w-full text-left relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow group"
          >
            <div className="grid lg:grid-cols-2">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${featured.categoryColor}`}>
                    {featured.category}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{featured.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{featured.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{featured.readTime}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Ler artigo completo
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className={`relative h-48 lg:h-auto bg-gradient-to-br ${featured.gradient}`}>
                <div className="absolute inset-0">
                  <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-black/10 rounded-full blur-2xl" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FeaturedIcon className="h-20 w-20 text-white/80" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {blogCategories.map((category) => (
              <Button
                key={category}
                variant={category === activeCategory ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum artigo nesta categoria ainda.</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((post) => {
              const PostIcon = post.icon;
              return (
                <article
                  key={post.slug}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
                  onClick={() => goToPost(post.slug)}
                >
                  {/* Gradient cover */}
                  <div className={`h-36 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0">
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-black/10 rounded-full blur-xl" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PostIcon className="h-10 w-10 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${post.categoryColor}`}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Aplique o que você aprendeu
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Crie sua conta gratuita e comece a diagnosticar, comparar e planejar sua estratégia de mídia B2B.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
            Começar Análise Grátis
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
      <BackToTop />
      <BackToHomeButton />
    </div>
  );
}
