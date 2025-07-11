import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserListPage from '../UserListPage';
import userService from '../../services/userService';
import { BrowserRouter } from 'react-router-dom';

// Mock do serviço de usuário
vi.mock('../../services/userService', () => ({
  default: {
    getUsers: vi.fn()
  }
}));

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn()
}));

describe('UserListPage', () => {
  const mockUsers = [
    { id: 1, uuid: 'uuid-1', name: 'User 1', email: 'user1@example.com' },
    { id: 2, uuid: 'uuid-2', name: 'User 2', email: 'user2@example.com' },
    { id: 3, uuid: 'uuid-3', name: 'User 3', email: 'user3@example.com' }
  ];
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should display loading state initially', () => {
    (userService.getUsers as any).mockResolvedValue(mockUsers);
    
    render(
      <BrowserRouter>
        <UserListPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/carregando usuários/i)).toBeInTheDocument();
  });
  
  it('should display list of users when loaded', async () => {
    (userService.getUsers as any).mockResolvedValue(mockUsers);
    
    render(
      <BrowserRouter>
        <UserListPage />
      </BrowserRouter>
    );
    
    // Verifica se os usuários são exibidos
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('User 3')).toBeInTheDocument();
      
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('user3@example.com')).toBeInTheDocument();
    });
  });
  
  it('should display message when no users are found', async () => {
    (userService.getUsers as any).mockResolvedValue([]);
    
    render(
      <BrowserRouter>
        <UserListPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument();
    });
  });
  
  it('should handle error when loading users', async () => {
    (userService.getUsers as any).mockRejectedValue(new Error('Failed to load users'));
    
    render(
      <BrowserRouter>
        <UserListPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/falha ao carregar/i)).toBeInTheDocument();
      expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument();
    });
  });
  
  it('should navigate to user detail page when clicking on a user', async () => {
    const navigateMock = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => navigateMock
    }));
    
    (userService.getUsers as any).mockResolvedValue(mockUsers);
    
    render(
      <BrowserRouter>
        <UserListPage />
      </BrowserRouter>
    );
    
    // Espera os usuários serem carregados
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });
    
    // Clica no primeiro usuário
    const userCard = screen.getByText('User 1').closest('.user-card');
    if (userCard) {
      fireEvent.click(userCard);
    }
    
    // Verifica se a navegação foi chamada corretamente
    expect(navigateMock).toHaveBeenCalledWith('/users/uuid-1');
  });
}); 