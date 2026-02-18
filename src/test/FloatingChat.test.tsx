import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FloatingChat } from '../components/FloatingChat';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  from: vi.fn(),
}));

// Mock do useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' }
  })
}));

// Mock do useTenantData
vi.mock('@/hooks/useTenantData', () => ({
  useTenantData: () => ({
    tenantSettings: { plan: 'professional' }
  })
}));

// Mock do useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('FloatingChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o botão do chat', () => {
    render(<FloatingChat />);
    
    // Verifica se o botão está presente
    const chatButton = screen.getByRole('button');
    expect(chatButton).toBeInTheDocument();
    expect(chatButton).toHaveClass('fixed');
  });

  it('deve abrir o chat ao clicar no botão', async () => {
    render(<FloatingChat />);
    
    const chatButton = screen.getByRole('button');
    
    // Clica no botão
    fireEvent.click(chatButton);
    
    // Espera o chat aparecer
    await waitFor(() => {
      expect(screen.getByText('Chat ao Vivo')).toBeInTheDocument();
    });
  });

  it('deve fechar o chat ao clicar no botão novamente', async () => {
    render(<FloatingChat />);
    
    const chatButton = screen.getByRole('button');
    
    // Abre o chat
    fireEvent.click(chatButton);
    await waitFor(() => {
      expect(screen.getByText('Chat ao Vivo')).toBeInTheDocument();
    });
    
    // Fecha o chat
    fireEvent.click(chatButton);
    
    // Espera o chat desaparecer
    await waitFor(() => {
      expect(screen.queryByText('Chat ao Vivo')).not.toBeInTheDocument();
    });
  });

  it('deve mostrar o botão X quando o chat está aberto', async () => {
    render(<FloatingChat />);
    
    const chatButton = screen.getByRole('button');
    
    // Abre o chat
    fireEvent.click(chatButton);
    await waitFor(() => {
      expect(screen.getByText('Chat ao Vivo')).toBeInTheDocument();
    });
    
    // Verifica se há múltiplos botões (botão principal + botões do chat)
    const allButtons = screen.getAllByRole('button');
    expect(allButtons.length).toBeGreaterThan(1);
  });
});
