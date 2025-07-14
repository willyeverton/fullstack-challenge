import { describe, it, expect, vi, beforeEach } from 'vitest';
import userService from '../userService';

// Mock do módulo api
vi.mock('../api', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
  };

  return {
    default: mockApi,
  };
});

describe('userService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getUsers', () => {
    it('deve buscar a lista de usuários', async () => {
      const mockUsers = [
        { id: 1, uuid: 'uuid1', name: 'User 1', email: 'user1@example.com' },
        { id: 2, uuid: 'uuid2', name: 'User 2', email: 'user2@example.com' },
      ];

      const api = require('../api').default;
      api.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.getUsers();

      expect(api.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockUsers);
    });

    it('deve propagar o erro quando a API falha', async () => {
      const mockError = new Error('API Error');
      const api = require('../api').default;
      api.get.mockRejectedValue(mockError);

      await expect(userService.getUsers()).rejects.toThrow('API Error');
      expect(api.get).toHaveBeenCalledWith('/users');
    });
  });

  describe('getUserByUuid', () => {
    it('deve buscar um usuário pelo UUID', async () => {
      const mockUser = { id: 1, uuid: 'uuid1', name: 'User 1', email: 'user1@example.com' };
      const api = require('../api').default;
      api.get.mockResolvedValue({ data: mockUser });

      const result = await userService.getUserByUuid('uuid1');

      expect(api.get).toHaveBeenCalledWith('/users/uuid1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('deve criar um novo usuário', async () => {
      const userData = { name: 'New User', email: 'newuser@example.com' };
      const mockResponse = {
        id: 3,
        uuid: 'uuid3',
        name: 'New User',
        email: 'newuser@example.com',
        created_at: '2023-01-01T00:00:00.000Z',
      };

      const api = require('../api').default;
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await userService.createUser(userData);

      expect(api.post).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual(mockResponse);
    });
  });
});
