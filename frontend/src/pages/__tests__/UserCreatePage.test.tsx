import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserCreatePage from '../UserCreatePage';
import userService from '../../services/userService';
import { BrowserRouter } from 'react-router-dom';

// Mock do serviço de usuário
vi.mock('../../services/userService', () => ({
  default: {
    createUser: vi.fn()
  }
}));

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn()
}));

describe('UserCreatePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <UserCreatePage />
      </BrowserRouter>
    );
  };
  
  it('should render form fields', () => {
    renderWithRouter();
    
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
  });
  
  it('should validate form fields on submit', async () => {
    renderWithRouter();
    
    // Tenta enviar o formulário sem preencher os campos
    const submitButton = screen.getByRole('button', { name: /criar/i });
    fireEvent.click(submitButton);
    
    // Verifica se as mensagens de erro são exibidas
    await waitFor(() => {
      expect(screen.getByText(/nome.*obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/email.*obrigatório/i)).toBeInTheDocument();
    });
    
    // Verifica que o serviço não foi chamado
    expect(userService.createUser).not.toHaveBeenCalled();
  });
  
  it('should submit form with valid data', async () => {
    const mockUser = {
      id: 1,
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00.000Z'
    };
    
    (userService.createUser as any).mockResolvedValue(mockUser);
    
    renderWithRouter();
    
    // Preenche o formulário
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Test User' }
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    // Envia o formulário
    const submitButton = screen.getByRole('button', { name: /criar/i });
    fireEvent.click(submitButton);
    
    // Verifica se o serviço foi chamado com os dados corretos
    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com'
      });
    });
    
    // Verifica se a mensagem de sucesso é exibida
    await waitFor(() => {
      expect(screen.getByText(/usuário criado com sucesso/i)).toBeInTheDocument();
    });
  });
  
  it('should handle API errors', async () => {
    const apiError = new Error('API Error');
    (userService.createUser as any).mockRejectedValue(apiError);
    
    renderWithRouter();
    
    // Preenche o formulário
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Test User' }
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    // Envia o formulário
    const submitButton = screen.getByRole('button', { name: /criar/i });
    fireEvent.click(submitButton);
    
    // Verifica se a mensagem de erro é exibida
    await waitFor(() => {
      expect(screen.getByText(/erro ao criar usuário/i)).toBeInTheDocument();
    });
  });
}); 