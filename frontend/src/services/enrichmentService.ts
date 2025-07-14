import axios from 'axios';
import type { EnrichedUserData } from '../types/user';
import { handleApiError } from '../utils/errorHandler';
import { cacheService } from '../utils/cache';

// Criamos uma instância separada do Axios para o serviço de enriquecimento
const enrichmentApi = axios.create({
  // Utiliza a variável de ambiente corretamente para o Vite
  baseURL: (import.meta as any).env?.VITE_ENRICHMENT_API_URL || '/enrichment',
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

// Tempo de cache menor para dados de enriquecimento, pois podem mudar com frequência
const CACHE_TTL = 30; // 30 segundos

export const enrichmentService = {
  /**
   * Obtém os dados enriquecidos de um usuário pelo UUID
   */
  getEnrichedUserData: async (uuid: string): Promise<EnrichedUserData> => {
    try {
      // Verifica se há dados em cache
      const cacheKey = `enriched_${uuid}`;
      const cachedData = cacheService.get<EnrichedUserData>(cacheKey);

      if (cachedData) {
        return mapEnrichmentResponse(cachedData);
      }

      // Se não há cache, busca da API
      const response = await enrichmentApi.get<EnrichedUserData>(`users/enriched/${uuid}`);

      // Armazena no cache
      cacheService.set(cacheKey, response.data, CACHE_TTL);

      return mapEnrichmentResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Dados ainda não processados ou usuário não encontrado
        const apiError = handleApiError(error);
        apiError.message = 'Dados de enriquecimento ainda não disponíveis';
        throw apiError;
      }
      throw handleApiError(error);
    }
  },

  /**
   * Força uma atualização dos dados enriquecidos, ignorando o cache
   */
  refreshEnrichedUserData: async (uuid: string): Promise<EnrichedUserData> => {
    try {
      // Remove dados do cache, se existirem
      const cacheKey = `enriched_${uuid}`;
      cacheService.delete(cacheKey);

      // Busca dados atualizados
      const response = await enrichmentApi.get<EnrichedUserData>(`users/enriched/${uuid}`);

      // Armazena no cache
      cacheService.set(cacheKey, response.data, CACHE_TTL);

      return mapEnrichmentResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const apiError = handleApiError(error);
        apiError.message = 'Dados de enriquecimento ainda não disponíveis';
        throw apiError;
      }
      throw handleApiError(error);
    }
  }
};

// Função utilitária para mapear o formato do backend para o frontend
function mapEnrichmentResponse(data: any): EnrichedUserData {
  if (data.enrichmentData) {
    return {
      linkedin: data.enrichmentData.linkedin,
      github: data.enrichmentData.github
    };
  }
  return {
    linkedin: data.linkedin,
    github: data.github
  };
}

export default enrichmentService;
