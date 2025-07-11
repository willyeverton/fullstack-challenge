import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import Layout from '../Layout';

// Mock do React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet-content">Outlet Content</div>,
  };
});

describe('Layout', () => {
  it('should render header with navigation links', () => {
    render(<Layout />);
    
    // Verifica se o cabeçalho está presente
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Usuários')).toBeInTheDocument();
    
    // Verifica se os links de navegação estão presentes
    expect(screen.getByText('Lista de Usuários')).toBeInTheDocument();
    expect(screen.getByText('Criar Usuário')).toBeInTheDocument();
  });

  it('should render outlet content', () => {
    render(<Layout />);
    
    // Verifica se o conteúdo do Outlet está sendo renderizado
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(<Layout />);
    
    // Verifica se o rodapé está presente
    expect(screen.getByText('Fullstack Challenge - Microsserviços')).toBeInTheDocument();
  });
}); 