import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminArchitectureTab from '@/components/admin-architecture';

describe('AdminArchitectureTab', () => {
  it('renders overview section by default', () => {
    render(<AdminArchitectureTab />);
    expect(screen.getByText('Arquitetura de Alto Nivel')).toBeInTheDocument();
    expect(screen.getByText('Camada Cliente')).toBeInTheDocument();
  });

  it('switches to Frontend section', () => {
    render(<AdminArchitectureTab />);
    const frontendTab = screen.getByText('Frontend');
    fireEvent.click(frontendTab);
    expect(screen.getByText('Mapa de Rotas')).toBeInTheDocument();
    expect(screen.getByText('Rotas Publicas')).toBeInTheDocument();
  });

  it('switches to Database section', () => {
    render(<AdminArchitectureTab />);
    const dbTab = screen.getByText('Banco de Dados');
    fireEvent.click(dbTab);
    expect(screen.getByText('Modelo de Entidades')).toBeInTheDocument();
    expect(screen.getByText('Tabelas Core')).toBeInTheDocument();
  });
});
