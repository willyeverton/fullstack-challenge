import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UserDetailPage from '../UserDetailPage';
import userService from '../../services/userService';
import enrichmentService from '../../services/enrichmentService';
import { BrowserRouter } from 'react-router-dom';

// Mock dos serviços
vi.mock('../../services/userService', () => ({
  default: {
    getUserByUuid: vi.fn()
  }
}));

vi.mock('../../services/enrichmentService', () => ({
  default: {
    getEnrichedUserData: vi.fn(),
    refreshEnrichedUserData: vi.fn()
  }
}));

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: () => ({ uuid: 'test-uuid' }),
  useNavigate: () => vi.fn()
}));

describe('UserDetailPage', () => {
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
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should display loading state initially', () => {
    (userService.getUserByUuid as any).mockResolvedValue(mockUser);
    (enrichmentService.getEnrichedUserData as any).mockResolvedValue(mockEnrichedData);
    
    render(
      <BrowserRouter>
        <UserDetailPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/carregando dados/i)).toBeInTheDocument();
  });
  
  it('should display user data and enriched data when loaded', async () => {
    (userService.getUserByUuid as any).mockResolvedValue(mockUser);
    (enrichmentService.getEnrichedUserData as any).mockResolvedValue(mockEnrichedData);
    
    render(
      <BrowserRouter>
        <UserDetailPage />
      </BrowserRouter>
    );
    
    // Verifica se os dados do usuário são exibidos
    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockUser.uuid)).toBeInTheDocument();
    });
    
    // Verifica se os dados enriquecidos são exibidos
    await waitFor(() => {
      expect(screen.getByText(mockEnrichedData.linkedin)).toBeInTheDocument();
      expect(screen.getByText(mockEnrichedData.github)).toBeInTheDocument();
    });
  });
  
  it('should handle error when loading user data', async () => {
    (userService.getUserByUuid as any).mockRejectedValue(new Error('Failed to load user'));
    
    render(
      <BrowserRouter>
        <UserDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument();
    });
  });
  
  it('should show processing message when enrichment data is not ready', async () => {
    (userService.getUserByUuid as any).mockResolvedValue(mockUser);
    
    // Simula erro 404 para dados de enriquecimento
    const notFoundError = new Error('Not found');
    (notFoundError as any).response = { status: 404 };
    (enrichmentService.getEnrichedUserData as any).mockRejectedValue(notFoundError);
    
    render(
      <BrowserRouter>
        <UserDetailPage />
      </BrowserRouter>
    );
    
    // Verifica se os dados do usuário são exibidos
    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });
    
    // Verifica se a mensagem de processamento é exibida
    await waitFor(() => {
      expect(screen.getByText(/dados ainda em processamento/i)).toBeInTheDocument();
    });
  });
}); 