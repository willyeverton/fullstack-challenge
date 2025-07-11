import { z } from 'zod';

/**
 * Schema de validação para criação de usuário
 */
export const createUserSchema = z.object({
  name: z.string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome não pode ter mais de 100 caracteres' })
    .trim(),
  email: z.string()
    .email({ message: 'Email inválido' })
    .max(255, { message: 'O email não pode ter mais de 255 caracteres' })
    .trim()
});

/**
 * Tipo derivado do schema de criação de usuário
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Valida os dados de criação de usuário
 * @param data Dados a serem validados
 * @returns Objeto com os dados validados ou erros
 */
export const validateUserInput = (data: unknown): { 
  success: boolean; 
  data?: CreateUserInput; 
  errors?: Record<string, string> 
} => {
  try {
    const validData = createUserSchema.parse(data);
    return { success: true, data: validData };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      // Converte os erros do Zod para um formato mais amigável
      const errors: Record<string, string> = {};
      error.errors.forEach((err: z.ZodIssue) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    // Erro inesperado
    return { 
      success: false, 
      errors: { _form: 'Ocorreu um erro inesperado na validação' } 
    };
  }
}; 