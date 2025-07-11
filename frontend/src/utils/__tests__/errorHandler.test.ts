import { describe, it, expect } from 'vitest';
import { handleApiError } from '../errorHandler';
import axios from 'axios';

describe('errorHandler', () => {
  describe('handleApiError', () => {
    it('should handle Axios error with response data', () => {
      // Cria um erro do Axios com dados de resposta
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: {
              name: ['Name is required'],
              email: ['Email is invalid']
            }
          }
        }
      };
      
      const error = handleApiError(axiosError);
      
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual({
        name: 'Name is required',
        email: 'Email is invalid'
      });
      expect(error.status).toBe(400);
    });
    
    it('should handle Axios error with string message in data', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: 'User not found'
        }
      };
      
      const error = handleApiError(axiosError);
      
      expect(error.message).toBe('User not found');
      expect(error.errors).toBeUndefined();
      expect(error.status).toBe(404);
    });
    
    it('should handle Axios error without response data', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network Error'
      };
      
      const error = handleApiError(axiosError);
      
      expect(error.message).toBe('Network Error');
      expect(error.errors).toBeUndefined();
      expect(error.status).toBe(500);
    });
    
    it('should handle non-Axios error', () => {
      const genericError = new Error('Generic error');
      
      const error = handleApiError(genericError);
      
      expect(error.message).toBe('Generic error');
      expect(error.errors).toBeUndefined();
      expect(error.status).toBe(500);
    });
    
    it('should handle unknown error object', () => {
      const unknownError = { foo: 'bar' };
      
      const error = handleApiError(unknownError);
      
      expect(error.message).toBe('Ocorreu um erro inesperado.');
      expect(error.errors).toBeUndefined();
      expect(error.status).toBe(500);
    });
  });
}); 