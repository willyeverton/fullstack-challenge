import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EnrichedUserController } from './enriched-user.controller';
import { IEnrichedUserRepository } from '../../domain/ports/enriched-user.repository.interface';
import { INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { EnrichedUser } from '../../domain/entities/enriched-user.entity';

describe('EnrichedUserController', () => {
  let controller: EnrichedUserController;
  let mockRepository: jest.Mocked<IEnrichedUserRepository>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findByUuid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrichedUserController],
      providers: [
        {
          provide: INJECTION_TOKENS.REPOSITORIES.ENRICHED_USER,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<EnrichedUserController>(EnrichedUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEnrichedUser', () => {
    const mockUser = new EnrichedUser({
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
      enrichmentData: {
        emailDomain: 'example.com',
        nameLength: 9,
        timestamp: new Date().toISOString(),
      },
    });

    it('should return enriched user when found', async () => {
      mockRepository.findByUuid.mockResolvedValue(mockUser);

      const result = await controller.getEnrichedUser('test-uuid');
      expect(result).toBe(mockUser);
      expect(mockRepository.findByUuid).toHaveBeenCalledWith('test-uuid');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findByUuid.mockResolvedValue(null);

      await expect(controller.getEnrichedUser('non-existent-uuid'))
        .rejects
        .toThrow(NotFoundException);

      expect(mockRepository.findByUuid).toHaveBeenCalledWith('non-existent-uuid');
    });
  });
}); 