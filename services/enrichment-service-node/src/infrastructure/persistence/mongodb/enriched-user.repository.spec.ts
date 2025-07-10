import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoEnrichedUserRepository } from './enriched-user.repository';
import { EnrichedUser, EnrichedUserDocument } from '../../../domain/entities/enriched-user.entity';

describe('MongoEnrichedUserRepository', () => {
  let repository: MongoEnrichedUserRepository;
  let model: Model<EnrichedUserDocument>;

  const mockUser: Partial<EnrichedUser> & { toJSON: () => Partial<EnrichedUser> } = {
    uuid: 'test-uuid',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'pending' as const,
    retryCount: 0,
    toJSON: () => ({
      uuid: 'test-uuid',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'pending' as const,
      retryCount: 0,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoEnrichedUserRepository,
        {
          provide: getModelToken(EnrichedUser.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            findOneAndUpdate: jest.fn(),
            prototype: {
              save: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<MongoEnrichedUserRepository>(MongoEnrichedUserRepository);
    model = module.get<Model<EnrichedUserDocument>>(getModelToken(EnrichedUser.name));
  });

  describe('findByUuid', () => {
    it('should return a user when found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await repository.findByUuid('test-uuid');
      expect(result).toBeDefined();
      expect(result?.uuid).toBe(mockUser.uuid);
    });

    it('should return null when user not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await repository.findByUuid('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save and return a new user', async () => {
      const saveSpy = jest.spyOn(model.prototype, 'save')
        .mockResolvedValue({ ...mockUser, toJSON: () => mockUser });

      const result = await repository.save(new EnrichedUser(mockUser));
      expect(result).toBeDefined();
      expect(result.uuid).toBe(mockUser.uuid);
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('findPending', () => {
    it('should return pending users', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockUser]),
      } as any);

      const result = await repository.findPending();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });
  });
}); 