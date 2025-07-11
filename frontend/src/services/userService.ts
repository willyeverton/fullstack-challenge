import api from './api';
import type { User, CreateUserRequest, CreateUserResponse } from '../types/user';

const USER_ENDPOINT = '/users';

export const userService = {
  /**
   * Lista todos os usuários
   */
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>(USER_ENDPOINT);
    return response.data;
  },

  /**
   * Obtém um usuário específico pelo UUID
   */
  getUserByUuid: async (uuid: string): Promise<User> => {
    const response = await api.get<User>(`${USER_ENDPOINT}/${uuid}`);
    return response.data;
  },

  /**
   * Cria um novo usuário
   */
  createUser: async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await api.post<CreateUserResponse>(USER_ENDPOINT, userData);
    return response.data;
  }
};

export default userService; 