import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPanel from '../pages/AdminPanel';

// Mock do Supabase (utilizado em AdminStatusTab e outros componentes)
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      update: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      limit: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  }
}));

// Mock do useAdminAuth
vi.mock('@/hooks/useAdminAuth', () => ({
  useAdminAuth: () => ({
    admin: {
      id: 'test-admin-id',
      email: 'admin@test.com',
      role: 'founder',
      cnpj: '12345678901234'
    },
    logout: vi.fn()
  })
}));

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock das funções de admin
vi.mock('@/lib/admin', () => ({
  adminListFeatures: () => Promise.resolve({
    data: [
      {
        id: '1',
        feature_key: 'reports_feature',
        feature_name: 'Relatórios Estratégicos',
        description: 'Acesso à tela de relatórios',
        category: 'general',
        status: 'development',
        message: 'Em desenvolvimento',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        id: '2',
        feature_key: 'ai_analysis',
        feature_name: 'Análise por IA',
        description: 'Análise aprofundada com IA',
        category: 'ai',
        status: 'active',
        message: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ]
  }),
  adminListPlanFeatures: () => Promise.resolve({
    data: [
      {
        id: '1',
        feature_key: 'reports_feature',
        plan: 'starter',
        is_enabled: false,
        usage_limit: null,
        limit_period: null
      },
      {
        id: '2',
        feature_key: 'reports_feature',
        plan: 'professional',
        is_enabled: false,
        usage_limit: null,
        limit_period: null
      },
      {
        id: '3',
        feature_key: 'reports_feature',
        plan: 'enterprise',
        is_enabled: false,
        usage_limit: null,
        limit_period: null
      },
      {
        id: '4',
        feature_key: 'ai_analysis',
        plan: 'professional',
        is_enabled: true,
        usage_limit: 10,
        limit_period: 'monthly'
      }
    ]
  }),
  adminListUsers: () => Promise.resolve({
    data: []
  }),
  adminListOverrides: () => Promise.resolve({
    data: []
  })
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe('AdminPanel - Feature Flags Tab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a tab Feature Flags', async () => {
    render(<AdminPanel />);
    
    // Espera o componente carregar
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });
  });

  it('deve mostrar a tab Relatórios', async () => {
    render(<AdminPanel />);
    
    // Espera o componente carregar
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });
    
    // Clica na tab de relatórios
    const reportsTab = screen.getByText('Relatórios');
    fireEvent.click(reportsTab);
    
    // Verifica se o conteúdo da tab de relatórios aparece
    await waitFor(() => {
      expect(screen.getByText('Gerencie o acesso à tela de relatórios')).toBeInTheDocument();
    });
  });
});

describe('AdminPanel - Reports Tab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a tab de relatórios', async () => {
    render(<AdminPanel />);
    
    // Espera o componente carregar
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });
    
    // Clica na tab de relatórios
    const reportsTab = screen.getByText('Relatórios');
    fireEvent.click(reportsTab);
    
    // Verifica se o conteúdo da tab de relatórios aparece
    await waitFor(() => {
      expect(screen.getByText('Gerencie o acesso à tela de relatórios')).toBeInTheDocument();
    });
  });

  it('deve exibir informações da feature flag de relatórios', async () => {
    render(<AdminPanel />);
    
    // Espera o componente carregar
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });
    
    // Clica na tab de relatórios
    const reportsTab = screen.getByText('Relatórios');
    fireEvent.click(reportsTab);
    
    // Verifica se o conteúdo da tab de relatórios aparece
    await waitFor(() => {
      expect(screen.getByText('Gerencie o acesso à tela de relatórios')).toBeInTheDocument();
    });
  });

  it('deve mostrar o status por plano', async () => {
    render(<AdminPanel />);
    
    // Clica na tab de relatórios
    const reportsTab = screen.getByText('Relatórios');
    fireEvent.click(reportsTab);
    
    // Verifica se o status por plano aparece
    await waitFor(() => {
      expect(screen.getByText('Status por plano:')).toBeInTheDocument();
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
  });

  it('deve exibir informações da arquitetura', async () => {
    render(<AdminPanel />);
    
    // Clica na tab de relatórios
    const reportsTab = screen.getByText('Relatórios');
    fireEvent.click(reportsTab);
    
    // Verifica se as informações da arquitetura aparecem
    await waitFor(() => {
      expect(screen.getByText('Arquitetura da Feature')).toBeInTheDocument();
      expect(screen.getByText('Reports.tsx - Página principal de relatórios')).toBeInTheDocument();
      expect(screen.getByText('Feature Flag: reports_feature')).toBeInTheDocument();
      expect(screen.getByText('Categoria: general')).toBeInTheDocument();
    });
  });

  it('deve mostrar o fluxo correto', async () => {
    render(<AdminPanel />);
    
    // Clica na tab de relatórios
    const reportsTab = screen.getByText('Relatórios');
    fireEvent.click(reportsTab);
    
    // Verifica se o fluxo aparece
    await waitFor(() => {
      expect(screen.getByText(/Fluxo:/)).toBeInTheDocument();
      expect(screen.getByText('Admin Panel → Feature Flags → Relatórios → reports_feature')).toBeInTheDocument();
    });
  });

  it('deve alternar entre as tabs corretamente', async () => {
    render(<AdminPanel />);
    
    // Espera o componente carregar
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });
    
    // Clica na tab de relatórios
    const reportsTab = screen.getByText('Relatórios');
    fireEvent.click(reportsTab);
    
    // Verifica se o conteúdo de relatórios aparece
    await waitFor(() => {
      expect(screen.getByText('Gerencie o acesso à tela de relatórios')).toBeInTheDocument();
    });
    
    // Clica na tab de planos
    const plansTab = screen.getAllByText('Planos')[0];
    fireEvent.click(plansTab);
    
    // Verifica se o conteúdo de planos aparece
    await waitFor(() => {
      expect(screen.getByText('Starter')).toBeInTheDocument();
    });
    
    // Volta para a tab de relatórios
    fireEvent.click(reportsTab);
    
    // Verifica se o conteúdo de relatórios aparece novamente
    await waitFor(() => {
      expect(screen.getByText('Gerencie o acesso à tela de relatórios')).toBeInTheDocument();
    });
  });
});
