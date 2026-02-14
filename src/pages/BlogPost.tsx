import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ArrowRight, ArrowLeft, Calendar, Clock, User, ChevronRight } from "lucide-react";
import { blogPosts } from "@/lib/blogData";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const post = blogPosts.find((p) => p.slug === slug);
  const postIndex = blogPosts.findIndex((p) => p.slug === slug);
  const nextPost = postIndex >= 0 && postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null;
  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">O artigo que você procura não existe ou foi removido.</p>
          <Button variant="hero" onClick={() => navigate("/blog")}>
            Voltar ao Blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = post.icon;

  // Simple markdown-like renderer
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeader: string[] = [];

    const flushTable = () => {
      if (tableHeader.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  {tableHeader.map((h, i) => (
                    <th key={i} className="text-left p-3 font-semibold text-foreground">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-3 text-muted-foreground">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      inTable = false;
      tableRows = [];
      tableHeader = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table detection
      if (line.startsWith("|") && line.endsWith("|")) {
        const cells = line.split("|").filter(Boolean);
        if (!inTable) {
          inTable = true;
          tableHeader = cells;
          continue;
        }
        // Skip separator row
        if (cells.every((c) => c.trim().match(/^[-:]+$/))) continue;
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Headings
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-2xl font-bold text-foreground mt-10 mb-4">
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-2">
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- **")) {
        const match = line.match(/^- \*\*(.+?)\*\*\s*[—–-]\s*(.+)$/);
        if (match) {
          elements.push(
            <li key={i} className="flex items-start gap-2 text-muted-foreground leading-relaxed ml-4 mb-1.5">
              <ChevronRight className="h-4 w-4 text-primary mt-1 shrink-0" />
              <span><strong className="text-foreground">{match[1]}</strong> — {match[2]}</span>
            </li>
          );
        } else {
          const boldMatch = line.match(/^- \*\*(.+?)\*\*(.*)$/);
          if (boldMatch) {
            elements.push(
              <li key={i} className="flex items-start gap-2 text-muted-foreground leading-relaxed ml-4 mb-1.5">
                <ChevronRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span><strong className="text-foreground">{boldMatch[1]}</strong>{boldMatch[2]}</span>
              </li>
            );
          }
        }
      } else if (line.startsWith("- ")) {
        elements.push(
          <li key={i} className="flex items-start gap-2 text-muted-foreground leading-relaxed ml-4 mb-1.5">
            <ChevronRight className="h-4 w-4 text-primary mt-1 shrink-0" />
            <span>{renderInline(line.replace("- ", ""))}</span>
          </li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        const text = line.replace(/^\d+\.\s/, "");
        elements.push(
          <li key={i} className="flex items-start gap-3 text-muted-foreground leading-relaxed ml-4 mb-2">
            <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              {line.match(/^(\d+)/)?.[1]}
            </span>
            <span>{renderInline(text)}</span>
          </li>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-3" />);
      } else {
        elements.push(
          <p key={i} className="text-muted-foreground leading-relaxed mb-3">
            {renderInline(line)}
          </p>
        );
      }
    }

    if (inTable) flushTable();
    return elements;
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={post.title}
        path={`/blog/${post.slug}`}
        description={post.excerpt}
        keywords={`${post.category}, marketing B2B, ${post.title.toLowerCase()}`}
        jsonLd={[
          buildBreadcrumb([
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            author: { "@type": "Organization", name: post.author },
            datePublished: post.date,
            publisher: { "@type": "Organization", name: "Intentia" },
          },
        ]}
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/blog")} className="hover:text-foreground transition-colors">Blog</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground truncate">{post.title}</span>
          </div>

          {/* Category + Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.categoryColor}`}>
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} de leitura</span>
            </div>
          </div>

          {/* Cover gradient */}
          <div className={`w-full h-48 sm:h-64 rounded-2xl bg-gradient-to-br ${post.gradient} flex items-center justify-center mb-10 relative overflow-hidden`}>
            <div className="absolute inset-0">
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-black/10 rounded-full blur-2xl" />
            </div>
            <Icon className="h-16 w-16 text-white/90 relative z-10" />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <article className="prose-custom">
            {renderContent(post.content)}
          </article>

          {/* CTA */}
          {post.cta && (
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Pronto para começar?</h3>
              <p className="text-muted-foreground mb-5">
                Aplique o que você aprendeu neste artigo diretamente na plataforma.
              </p>
              <Button variant="hero" size="lg" onClick={() => navigate(post.cta!.href)}>
                {post.cta.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPost ? (
              <button
                onClick={() => { navigate(`/blog/${prevPost.slug}`); window.scrollTo(0, 0); }}
                className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors text-left"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">Anterior</p>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{prevPost.title}</p>
                </div>
              </button>
            ) : <div />}
            {nextPost && (
              <button
                onClick={() => { navigate(`/blog/${nextPost.slug}`); window.scrollTo(0, 0); }}
                className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors text-right sm:flex-row-reverse"
              >
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-1">Próximo</p>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{nextPost.title}</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
      <BackToHomeButton />
    </div>
  );
}
