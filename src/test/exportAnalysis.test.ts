import { describe, it, expect, vi, beforeEach } from "vitest";

let downloadedContent: string | null = null;
let downloadedFilename: string | null = null;

beforeEach(() => {
  downloadedContent = null;
  downloadedFilename = null;

  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  });

  const OriginalBlob = globalThis.Blob;
  vi.stubGlobal("Blob", class MockBlob extends OriginalBlob {
    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options);
      if (parts && parts.length > 0) {
        downloadedContent = parts[0] as string;
      }
    }
  });

  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "a") {
      const el: any = {
        href: "",
        download: "",
        click: vi.fn(() => { downloadedFilename = el.download; }),
        style: {},
      };
      return el;
    }
    return document.createElement(tag);
  });

  vi.spyOn(document.body, "appendChild").mockImplementation((node: any) => node);
  vi.spyOn(document.body, "removeChild").mockImplementation((node: any) => node);
});

const mockHeuristic = {
  overallScore: 65,
  scores: {
    valueProposition: 70,
    offerClarity: 60,
    userJourney: 55,
    seoReadiness: 72,
    conversionOptimization: 50,
    contentQuality: 68,
  },
  technical: {
    hasHttps: true,
    hasViewport: true,
    hasAnalytics: false,
    hasPixel: false,
    hasStructuredData: true,
  },
  content: {
    wordCount: 1200,
    ctaCount: 3,
    formCount: 1,
    imageCount: 8,
    imagesWithAlt: 5,
    hasVideo: false,
    hasSocialProof: true,
    hasFAQ: false,
  },
  insights: [
    { type: "warning" as const, title: "SEO fraco", description: "Falta meta description", action: "Adicionar meta tags" },
    { type: "opportunity" as const, title: "CTA forte", description: "Boa taxa de conversão" },
  ],
};

const mockAi = {
  provider: "google_gemini" as const,
  model: "gemini-2.0-flash",
  analyzedAt: "2026-02-06T10:00:00Z",
  summary: "Projeto com boa base mas precisa melhorar SEO.",
  investmentReadiness: { score: 62, level: "medium" as const, justification: "Precisa de ajustes" },
  strengths: ["Proposta clara", "Design moderno"],
  weaknesses: ["SEO fraco", "Sem analytics"],
  opportunities: ["Mercado em crescimento"],
  channelRecommendations: [
    { channel: "Google Ads", verdict: "caution" as const, suggestedBudgetAllocation: "30%", reasoning: "SEO precisa melhorar" },
  ],
  recommendations: [
    { title: "Melhorar SEO", priority: "high" as const, category: "SEO", description: "Adicionar meta tags", expectedImpact: "Aumento de tráfego orgânico" },
  ],
  competitivePosition: "Posição intermediária no mercado",
};

describe("exportAnalysis", () => {
  it("exportAsJson generates valid JSON with project data", async () => {
    const { exportAsJson } = await import("@/lib/exportAnalysis");

    exportAsJson({
      projectName: "Meu Projeto",
      projectUrl: "https://meu.com",
      projectNiche: "SaaS",
      heuristic: mockHeuristic as any,
      ai: mockAi as any,
    });

    expect(downloadedContent).not.toBeNull();
    const parsed = JSON.parse(downloadedContent!);
    expect(parsed.projeto.nome).toBe("Meu Projeto");
    expect(parsed.projeto.url).toBe("https://meu.com");
    expect(parsed.analise_heuristica).toBeDefined();
    expect(parsed.analise_ia).toBeDefined();
    expect(parsed.exportado_em).toBeDefined();
  });

  it("exportAsMarkdown generates markdown with headers and tables", async () => {
    const { exportAsMarkdown } = await import("@/lib/exportAnalysis");

    exportAsMarkdown({
      projectName: "Meu Projeto",
      projectUrl: "https://meu.com",
      projectNiche: "SaaS",
      heuristic: mockHeuristic as any,
      ai: mockAi as any,
    });

    expect(downloadedContent).not.toBeNull();
    expect(downloadedContent).toContain("# Análise Estratégica — Meu Projeto");
    expect(downloadedContent).toContain("## Análise Heurística");
    expect(downloadedContent).toContain("## Análise por IA");
    expect(downloadedContent).toContain("| Proposta de Valor | 70 |");
    expect(downloadedContent).toContain("### Resumo Executivo");
    expect(downloadedContent).toContain("### Pontos Fortes");
  });

  it("exportAsMarkdown works with heuristic only (no AI)", async () => {
    const { exportAsMarkdown } = await import("@/lib/exportAnalysis");

    exportAsMarkdown({
      projectName: "Projeto Simples",
      projectUrl: "https://simples.com",
      projectNiche: "E-commerce",
      heuristic: mockHeuristic as any,
    });

    expect(downloadedContent).not.toBeNull();
    expect(downloadedContent).toContain("## Análise Heurística");
    expect(downloadedContent).not.toContain("## Análise por IA");
  });

  it("exportBenchmarkAsJson generates valid benchmark JSON", async () => {
    const { exportBenchmarkAsJson } = await import("@/lib/exportAnalysis");

    const benchmarkAi = {
      provider: "google_gemini",
      model: "gemini-2.0-flash",
      analyzedAt: "2026-02-06T10:00:00Z",
      executiveSummary: "Concorrente forte em SEO",
      competitiveAdvantages: ["SEO superior"],
      competitiveDisadvantages: ["UX inferior"],
      strategicGaps: [{ area: "SEO", gap: "Meta tags", recommendation: "Implementar" }],
      marketPositioning: "Líder em nicho",
      differentiationOpportunities: ["Design inovador"],
      threatAssessment: [{ threat: "Preço baixo", severity: "high", mitigation: "Agregar valor" }],
      actionPlan: [{ action: "Melhorar SEO", priority: "high", expectedOutcome: "Mais tráfego", timeframe: "30 dias" }],
      overallVerdict: { competitorThreatLevel: 72, summary: "Ameaça significativa" },
    };

    exportBenchmarkAsJson({
      competitorName: "Rival Corp",
      competitorUrl: "https://rival.com",
      competitorNiche: "SaaS",
      projectName: "Meu Projeto",
      overallScore: 68,
      scoreGap: -7,
      ai: benchmarkAi as any,
    });

    expect(downloadedContent).not.toBeNull();
    const parsed = JSON.parse(downloadedContent!);
    expect(parsed.benchmark.concorrente).toBe("Rival Corp");
    expect(parsed.benchmark.score).toBe(68);
    expect(parsed.benchmark.gap).toBe(-7);
    expect(parsed.analise_ia.executiveSummary).toBe("Concorrente forte em SEO");
  });

  it("exportBenchmarkAsMarkdown generates markdown with all sections", async () => {
    const { exportBenchmarkAsMarkdown } = await import("@/lib/exportAnalysis");

    const benchmarkAi = {
      provider: "google_gemini",
      model: "gemini-2.0-flash",
      analyzedAt: "2026-02-06T10:00:00Z",
      executiveSummary: "Análise competitiva detalhada",
      competitiveAdvantages: ["Marca forte"],
      competitiveDisadvantages: ["Preço alto"],
      strategicGaps: [{ area: "Preço", gap: "30% mais caro", recommendation: "Revisar pricing" }],
      marketPositioning: "Premium",
      differentiationOpportunities: ["Suporte 24h"],
      threatAssessment: [{ threat: "Novo entrante", severity: "medium", mitigation: "Inovar" }],
      actionPlan: [{ action: "Lançar feature X", priority: "high", expectedOutcome: "Diferenciação", timeframe: "60 dias" }],
      overallVerdict: { competitorThreatLevel: 55, summary: "Ameaça moderada" },
    };

    exportBenchmarkAsMarkdown({
      competitorName: "Rival Corp",
      competitorUrl: "https://rival.com",
      competitorNiche: "SaaS",
      projectName: "Meu Projeto",
      overallScore: 68,
      scoreGap: -7,
      ai: benchmarkAi as any,
    });

    expect(downloadedContent).not.toBeNull();
    expect(downloadedContent).toContain("# Benchmark IA — Rival Corp vs Meu Projeto");
    expect(downloadedContent).toContain("## Resumo Executivo");
    expect(downloadedContent).toContain("## Nível de Ameaça");
    expect(downloadedContent).toContain("## Vantagens Competitivas");
    expect(downloadedContent).toContain("## Gaps Estratégicos");
    expect(downloadedContent).toContain("## Plano de Ação");
    expect(downloadedContent).toContain("| Preço | 30% mais caro | Revisar pricing |");
  });
});
