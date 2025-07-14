import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UserDetailPage from '../UserDetailPage';
import userService from '../../services/userService';
import enrichmentService from '../../services/enrichmentService';

// Mock dos serviços
vi.mock('../../services/userService', () => ({
  default: {
    getUserByUuid: vi.fn()
  }
}));

vi.mock('../../services/enrichmentService', () => ({
  default: {
    getEnrichedUserData: vi.fn()
  }
}));

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ uuid: 'test-uuid' }),
    BrowserRouter: actual.BrowserRouter,
    Routes: actual.Routes,
    Route: actual.Route
  };
});

describe('UserDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderWithRouter = () => {
    const { BrowserRouter } = require('react-router-dom');
    return render(
      <BrowserRouter>
        <UserDetailPage />
      </BrowserRouter>
    );
  };

  it('should render user details and enriched data', async () => {
    const mockUser = {
      id: 1,
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com'
    };

    const mockEnrichedData = {
      linkedin: 'linkedin.com/in/testuser',
      github: 'github.com/testuser'
    };

    (userService.getUserByUuid as any).mockResolvedValue(mockUser);
    (enrichmentService.getEnrichedUserData as any).mockResolvedValue(mockEnrichedData);

    renderWithRouter();

    // Verifica se os dados do usuário são exibidos
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    // Verifica se os dados enriquecidos são exibidos
    await waitFor(() => {
      expect(screen.getByText('linkedin.com/in/testuser')).toBeInTheDocument();
      expect(screen.getByText('github.com/testuser')).toBeInTheDocument();
    });
  });

  it('should handle user not found', async () => {
    (userService.getUserByUuid as any).mockRejectedValue(new Error('User not found'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar os dados do usuário/i)).toBeInTheDocument();
    });
  });

  it('should handle enrichment data not found', async () => {
    const mockUser = {
      id: 1,
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com'
    };

    (userService.getUserByUuid as any).mockResolvedValue(mockUser);
    (enrichmentService.getEnrichedUserData as any).mockRejectedValue(new Error('Not found'));

    renderWithRouter();

    // Verifica se os dados do usuário são exibidos
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Verifica se a mensagem de processamento é exibida
    await waitFor(() => {
      expect(screen.getByText(/dados ainda em processamento/i)).toBeInTheDocument();
    });
  });
});
