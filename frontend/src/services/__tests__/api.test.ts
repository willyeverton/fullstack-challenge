import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

// Mock do axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    }))
  }
}));

// Importa o módulo api para que o código seja executado
import '../api';

describe('API Service', () => {
  it('should configure axios correctly', () => {
    // Verificamos que o axios.create foi chamado
    expect(axios.create).toHaveBeenCalled();
  });
}); 