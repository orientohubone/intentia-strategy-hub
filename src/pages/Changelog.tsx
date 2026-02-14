import { useState } from "react";
import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import {
  ChevronLeft,
  ChevronRight,
  Hammer,
  Lightbulb,
  Trophy,
  Tag,
} from "lucide-react";
import { changelogEntries, type ChangelogEntry, type ChangelogSlide } from "@/lib/changelogData";

function SlideIndicator({ total, current, onChange }: { total: number; current: number; onChange: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
          }`}
        />
      ))}
    </div>
  );
}

function SlideTypeIcon({ type }: { type: ChangelogSlide["type"] }) {
  switch (type) {
    case "context":
      return <Lightbulb className="h-4 w-4" />;
    case "build":
      return <Hammer className="h-4 w-4" />;
    case "result":
      return <Trophy className="h-4 w-4" />;
  }
}

function SlideTypeLabel({ type }: { type: ChangelogSlide["type"] }) {
  switch (type) {
    case "context":
      return "Contexto";
    case "build":
      return "Build";
    case "result":
      return "Resultado";
  }
}

function SlideTypeColor({ type }: { type: ChangelogSlide["type"] }) {
  switch (type) {
    case "context":
      return "text-amber-500 bg-amber-500/10";
    case "build":
      return "text-primary bg-primary/10";
    case "result":
      return "text-emerald-500 bg-emerald-500/10";
  }
}

function DeckCard({ entry }: { entry: ChangelogEntry }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = entry.slides[currentSlide];
  const Icon = entry.icon;
  const slideColor = SlideTypeColor({ type: slide.type });

  const prev = () => setCurrentSlide((s) => Math.max(0, s - 1));
  const next = () => setCurrentSlide((s) => Math.min(entry.slides.length - 1, s + 1));

  return (
    <div className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-border">
        <div className={`p-2.5 rounded-xl ${entry.bgColor}`}>
          <Icon className={`h-5 w-5 ${entry.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              v{entry.version}
            </span>
            <span className="text-xs text-muted-foreground">{entry.date}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground truncate mt-0.5">
            {entry.title}
          </h3>
        </div>
      </div>

      {/* Slide Content */}
      <div className="p-4 sm:p-5 min-h-[220px] sm:min-h-[240px] flex flex-col">
        {/* Slide type badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${slideColor}`}>
            <SlideTypeIcon type={slide.type} />
            <SlideTypeLabel type={slide.type} />
          </span>
          <span className="text-xs text-muted-foreground">
            {currentSlide + 1}/{entry.slides.length}
          </span>
        </div>

        {/* Slide title */}
        <h4 className="text-sm font-bold text-foreground mb-2">{slide.title}</h4>

        {/* Slide body */}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {slide.content}
        </p>

        {/* Highlights */}
        {slide.highlights && (
          <ul className="mt-3 space-y-1.5">
            {slide.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="mt-1 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: Navigation + Tags */}
      <div className="flex items-center justify-between p-4 sm:p-5 pt-0">
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={currentSlide === 0}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <SlideIndicator
            total={entry.slides.length}
            current={currentSlide}
            onChange={setCurrentSlide}
          />
          <button
            onClick={next}
            disabled={currentSlide === entry.slides.length - 1}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Changelog() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Changelog"
        path="/changelog"
        description="Acompanhe a evolução da Intentia. Cada versão conta uma história: o problema, o que construímos e o resultado. Build in Public."
        keywords="changelog intentia, build in public, atualizações, roadmap, versões"
        jsonLd={buildBreadcrumb([{ name: "Changelog", path: "/changelog" }])}
      />
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Hammer className="h-4 w-4" />
            Build in Public
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Changelog{" "}
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              Intentia
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Cada versão conta uma história. O problema que encontramos, o que construímos e o resultado que entregamos.
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-2xl mx-auto">
            Transparência total na evolução do produto. Navegue pelos slides de cada versão para ver o começo, meio e fim de cada iniciativa.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Version grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {changelogEntries.map((entry) => (
              <DeckCard key={entry.version} entry={entry} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl bg-card border border-border">
              <p className="text-lg font-bold text-foreground">
                Acompanhe a evolução
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                A Intentia é construída em público. Cada feature nasce de um problema real de empresas B2B que investem em mídia sem estratégia.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {changelogEntries.length} versões publicadas
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
      <BackToHomeButton />
    </div>
  );
}
