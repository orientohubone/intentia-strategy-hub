import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { IcpEnrichmentDialog } from '@/components/IcpEnrichmentDialog';
import type { IcpEnrichmentResult } from '@/lib/icpEnricher';

// Mock das funções de exportação
vi.mock('@/lib/exportIcp', () => ({
  exportIcpToPdf: vi.fn(),
  exportIcpToHtml: vi.fn(),
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockEnrichment: IcpEnrichmentResult = {
  refinedDescription: 'Descrição refinada do ICP',
  idealProfile: {
    industry: 'Tecnologia',
    companySize: 'Média',
    location: 'São Paulo',
    decisionMakers: ['CEO', 'CTO'],
    painPoints: ['Dor 1', 'Dor 2'],
    buyingTriggers: ['Gatilho 1', 'Gatilho 2'],
    budgetRange: 'R$ 10.000-50.000/mês',
  },
  demographicInsights: 'Dados demográficos...',
  marketContext: 'Contexto de mercado...',
  suggestedKeywords: ['keyword1', 'keyword2'],
  recommendations: ['Recomendação 1', 'Recomendação 2'],
  dataSources: [{ source: 'SEBRAE', success: true }],
  provider: 'google_gemini',
  model: 'gemini-2.0-flash',
  enrichedAt: '2024-01-01T00:00:00Z',
};

describe('IcpEnrichmentDialog', () => {
  const defaultProps = {
    audienceName: 'Público Teste',
    enrichment: mockEnrichment,
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o dialog com informações básicas', () => {
    render(<IcpEnrichmentDialog {...defaultProps} />);
    
    expect(screen.getByText('ICP Refinado — Público Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição Refinada')).toBeInTheDocument();
    expect(screen.getByText(mockEnrichment.refinedDescription)).toBeInTheDocument();
  });

  it('deve exibir botões de exportação', () => {
    render(<IcpEnrichmentDialog {...defaultProps} />);
    
    expect(screen.getByTitle('Exportar como HTML')).toBeInTheDocument();
    expect(screen.getByTitle('Exportar como PDF')).toBeInTheDocument();
  });

  it('não deve renderizar quando não há enriquecimento', () => {
    const { container } = render(
      <IcpEnrichmentDialog {...defaultProps} enrichment={null} />
    );
    
    expect(container.firstChild).toBeNull();
  });
});
