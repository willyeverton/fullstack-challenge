import axios from 'axios';

/**
 * Interface para erro de API padronizado
 */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
}

/**
 * Extrai mensagem de erro de uma resposta de erro do Axios
 */
export const extractErrorMessage = (error: unknown): string => {
  // Erro do Axios
  if (axios.isAxiosError(error)) {
    // Erro com resposta da API
    if (error.response) {
      const data = error.response.data as any;
      
      // Erro com formato padronizado da API
      if (data && data.message) {
        return data.message;
      }
      
      // Erro HTTP padrão
      return `Erro ${error.response.status}: ${error.response.statusText}`;
    }
    
    // Erro de rede (sem resposta)
    if (error.request) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    // Erro na configuração da requisição
    return error.message || 'Ocorreu um erro ao processar sua requisição.';
  }
  
  // Erro não relacionado ao Axios
  if (error instanceof Error) {
    return error.message;
  }
  
  // Erro desconhecido
  return 'Ocorreu um erro inesperado.';
};

/**
 * Extrai erros de validação de uma resposta de erro do Axios
 */
export const extractValidationErrors = (error: unknown): Record<string, string> => {
  if (axios.isAxiosError(error) && error.response?.data?.errors) {
    const apiErrors = error.response.data.errors as Record<string, string[]>;
    const formattedErrors: Record<string, string> = {};
    
    // Converte o formato da API para o formato usado no frontend
    Object.keys(apiErrors).forEach(field => {
      formattedErrors[field] = apiErrors[field][0];
    });
    
    return formattedErrors;
  }
  
  return {};
};

/**
 * Manipulador de erros centralizado
 */
export const handleApiError = (error: unknown): ApiError => {
  const message = extractErrorMessage(error);
  const errors = extractValidationErrors(error);
  
  let status = 500;
  if (axios.isAxiosError(error) && error.response) {
    status = error.response.status;
  }
  
  return {
    status,
    message,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}; 