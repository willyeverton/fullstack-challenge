import axios from 'axios';
import type { EnrichedUserData } from '../types/user';

// Criamos uma instância separada do Axios para o serviço de enriquecimento
const enrichmentApi = axios.create({
  baseURL: import.meta.env.VITE_ENRICHMENT_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
enrichmentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Enrichment API Error:', error);
    return Promise.reject(error);
  }
);

export const enrichmentService = {
  /**
   * Obtém os dados enriquecidos de um usuário pelo UUID
   */
  getEnrichedUserData: async (uuid: string): Promise<EnrichedUserData> => {
    try {
      const response = await enrichmentApi.get<EnrichedUserData>(`/users/enriched/${uuid}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Dados ainda não processados ou usuário não encontrado
        throw new Error('Dados de enriquecimento ainda não disponíveis');
      }
      throw error;
    }
  }
};

export default enrichmentService; 