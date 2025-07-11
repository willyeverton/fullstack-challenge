import api from './api';
import type { User, CreateUserRequest, CreateUserResponse } from '../types/user';
import { handleApiError } from '../utils/errorHandler';
import { cacheService } from '../utils/cache';

const USER_ENDPOINT = '/users';
const CACHE_TTL = 60; // 1 minuto de cache para dados de usuário

export const userService = {
  /**
   * Lista todos os usuários
   */
  getUsers: async (): Promise<User[]> => {
    try {
      // Verifica se há dados em cache
      const cacheKey = 'users_list';
      const cachedData = cacheService.get<User[]>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // Se não há cache, busca da API
      const response = await api.get<User[]>(USER_ENDPOINT);
      
      // Armazena no cache
      cacheService.set(cacheKey, response.data, CACHE_TTL);
      
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Error fetching users:', apiError);
      throw apiError;
    }
  },

  /**
   * Obtém um usuário específico pelo UUID
   */
  getUserByUuid: async (uuid: string): Promise<User> => {
    try {
      // Verifica se há dados em cache
      const cacheKey = `user_${uuid}`;
      const cachedData = cacheService.get<User>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // Se não há cache, busca da API
      const response = await api.get<User>(`${USER_ENDPOINT}/${uuid}`);
      
      // Armazena no cache
      cacheService.set(cacheKey, response.data, CACHE_TTL);
      
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`Error fetching user ${uuid}:`, apiError);
      throw apiError;
    }
  },

  /**
   * Cria um novo usuário
   */
  createUser: async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
    try {
      const response = await api.post<CreateUserResponse>(USER_ENDPOINT, userData);
      
      // Invalida o cache de lista de usuários
      cacheService.delete('users_list');
      
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Error creating user:', apiError);
      throw apiError;
    }
  }
};

export default userService; 