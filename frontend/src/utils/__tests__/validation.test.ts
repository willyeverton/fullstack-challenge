import { describe, it, expect } from 'vitest';
import { validateUserInput } from '../validation';

describe('validation', () => {
  describe('validateUserInput', () => {
    it('should validate valid user input', () => {
      const validInput = {
        name: 'John Doe',
        email: 'john.doe@example.com'
      };
      
      const result = validateUserInput(validInput);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });
    
    it('should reject empty name', () => {
      const invalidInput = {
        name: '',
        email: 'john.doe@example.com'
      };
      
      const result = validateUserInput(invalidInput);
      
      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toHaveProperty('name');
      }
    });
    
    it('should reject name with less than 3 characters', () => {
      const invalidInput = {
        name: 'Jo',
        email: 'john.doe@example.com'
      };
      
      const result = validateUserInput(invalidInput);
      
      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toHaveProperty('name');
        expect(result.errors.name).toContain('pelo menos 3 caracteres');
      }
    });
    
    it('should reject invalid email format', () => {
      const invalidInput = {
        name: 'John Doe',
        email: 'invalid-email'
      };
      
      const result = validateUserInput(invalidInput);
      
      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toHaveProperty('email');
      }
    });
    
    it('should reject input with both invalid name and email', () => {
      const invalidInput = {
        name: 'Jo',
        email: 'invalid-email'
      };
      
      const result = validateUserInput(invalidInput);
      
      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        // Deve ter erros para nome e email
        expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(2);
        expect(result.errors).toHaveProperty('name');
        expect(result.errors).toHaveProperty('email');
      }
    });
  });
}); 