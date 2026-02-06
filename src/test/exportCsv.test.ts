import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture raw string content passed to Blob
let capturedContent: string | null = null;
let capturedFilename: string | null = null;

beforeEach(() => {
  capturedContent = null;
  capturedFilename = null;

  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  });

  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "a") {
      const el: any = {
        href: "",
        download: "",
        click: vi.fn(() => { capturedFilename = el.download; }),
        style: {},
      };
      return el;
    }
    return document.createElement(tag);
  });

  vi.spyOn(document.body, "appendChild").mockImplementation((node: any) => node);
  vi.spyOn(document.body, "removeChild").mockImplementation((node: any) => node);

  const OriginalBlob = globalThis.Blob;
  vi.stubGlobal("Blob", class MockBlob extends OriginalBlob {
    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options);
      if (parts && parts.length > 0 && typeof parts[0] === "string") {
        capturedContent = parts[0] as string;
      }
    }
  });
});

describe("exportCsv", () => {
  it("exportProjectsCsv generates valid CSV with BOM and semicolons", async () => {
    const { exportProjectsCsv } = await import("@/lib/exportCsv");

    exportProjectsCsv([
      { name: "Projeto A", niche: "SaaS", url: "https://a.com", score: 75, status: "completed", created_at: "2026-01-15T10:00:00Z" },
      { name: "Projeto B", niche: "E-commerce", url: "https://b.com", score: 42, status: "pending" },
    ]);

    expect(capturedContent).not.toBeNull();
    const text = capturedContent!;
    
    // Should start with BOM
    expect(text.charCodeAt(0)).toBe(0xFEFF);
    
    // Should have header row
    expect(text).toContain("Nome;Nicho;URL;Score;Status;Criado em;Atualizado em");
    
    // Should have data rows
    expect(text).toContain("Projeto A;SaaS;https://a.com;75;completed");
    expect(text).toContain("Projeto B;E-commerce;https://b.com;42;pending");
  });

  it("exportInsightsCsv translates types to Portuguese labels", async () => {
    const { exportInsightsCsv } = await import("@/lib/exportCsv");

    exportInsightsCsv([
      { type: "warning", title: "Risco SEO", description: "Meta tags ausentes", project_name: "Proj1" },
      { type: "opportunity", title: "CTA forte", description: "Boa conversão" },
      { type: "improvement", title: "Velocidade", description: "Otimizar imagens" },
    ]);

    expect(capturedContent).not.toBeNull();
    const text = capturedContent!;
    
    expect(text).toContain("Alerta;Risco SEO");
    expect(text).toContain("Oportunidade;CTA forte");
    expect(text).toContain("Melhoria;Velocidade");
  });

  it("exportBenchmarksCsv includes all score columns", async () => {
    const { exportBenchmarksCsv } = await import("@/lib/exportCsv");

    exportBenchmarksCsv([
      {
        competitor_name: "Rival Inc",
        competitor_url: "https://rival.com",
        competitor_niche: "SaaS",
        overall_score: 68,
        score_gap: -7,
        value_proposition_score: 72,
        offer_clarity_score: 60,
        user_journey_score: 55,
        project_name: "Meu Projeto",
        created_at: "2026-02-01T00:00:00Z",
      },
    ]);

    expect(capturedContent).not.toBeNull();
    const text = capturedContent!;
    
    expect(text).toContain("Concorrente;URL;Nicho;Score Geral;Gap;Proposta de Valor;Clareza;Jornada;Projeto;Data");
    expect(text).toContain("Rival Inc;https://rival.com;SaaS;68;-7;72;60;55;Meu Projeto");
  });

  it("exportAudiencesCsv handles keywords array", async () => {
    const { exportAudiencesCsv } = await import("@/lib/exportCsv");

    exportAudiencesCsv([
      {
        name: "CTOs B2B",
        description: "Decisores técnicos",
        industry: "Tecnologia",
        company_size: "enterprise",
        location: "Brasil",
        keywords: ["CTO", "VP Engineering", "DevOps"],
        project_name: "Proj X",
      },
    ]);

    expect(capturedContent).not.toBeNull();
    const text = capturedContent!;
    
    expect(text).toContain("CTOs B2B");
    expect(text).toContain("Tecnologia");
    // Keywords joined with comma
    expect(text).toMatch(/CTO.*VP Engineering.*DevOps/);
  });

  it("escapes CSV values with commas and quotes", async () => {
    const { exportProjectsCsv } = await import("@/lib/exportCsv");

    exportProjectsCsv([
      { name: 'Projeto "Especial"', niche: "SaaS, B2B", url: "https://x.com", score: 50, status: "pending" },
    ]);

    expect(capturedContent).not.toBeNull();
    const text = capturedContent!;
    
    // Values with commas or quotes should be escaped
    expect(text).toContain('"Projeto ""Especial"""');
    expect(text).toContain('"SaaS, B2B"');
  });

  it("exportChannelScoresCsv maps channel names", async () => {
    const { exportChannelScoresCsv } = await import("@/lib/exportCsv");

    exportChannelScoresCsv([
      { project_name: "Proj", channel: "google", score: 80, objective: "Awareness", is_recommended: true, risks: ["CPC alto"] },
      { project_name: "Proj", channel: "meta", score: 60, is_recommended: false, risks: [] },
    ]);

    expect(capturedContent).not.toBeNull();
    const text = capturedContent!;
    
    expect(text).toContain("Google Ads");
    expect(text).toContain("Meta Ads");
    expect(text).toContain("Sim");
    expect(text).toContain("Não");
    expect(text).toContain("CPC alto");
  });
});
