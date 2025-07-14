import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UserListPage from '../UserListPage';
import userService from '../../services/userService';

// Mock do serviço de usuário
vi.mock('../../services/userService', () => ({
  default: {
    getUsers: vi.fn()
  }
}));

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    BrowserRouter: actual.BrowserRouter,
    Routes: actual.Routes,
    Route: actual.Route
  };
});

describe('UserListPage', () => {
  const mockUsers = [
    { id: 1, uuid: 'uuid-1', name: 'User 1', email: 'user1@example.com' },
    { id: 2, uuid: 'uuid-2', name: 'User 2', email: 'user2@example.com' }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderWithRouter = () => {
    const { BrowserRouter } = require('react-router-dom');
    return render(
      <BrowserRouter>
        <UserListPage />
      </BrowserRouter>
    );
  };

  it('should render user list', async () => {
    (userService.getUsers as any).mockResolvedValue(mockUsers);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  it('should handle empty user list', async () => {
    (userService.getUsers as any).mockResolvedValue([]);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    (userService.getUsers as any).mockRejectedValue(new Error('API Error'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/falha ao carregar a lista de usuários/i)).toBeInTheDocument();
    });
  });
});
