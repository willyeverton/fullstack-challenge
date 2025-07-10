import { Test, TestingModule } from '@nestjs/testing';
import { EnrichmentService } from './enrichment.service';
import { IEnrichedUserRepository } from '../../domain/ports/enriched-user.repository.interface';
import { INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { EnrichedUser } from '../../domain/entities/enriched-user.entity';

describe('EnrichmentService', () => {
  let service: EnrichmentService;
  let mockRepository: jest.Mocked<IEnrichedUserRepository>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findByUuid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrichmentService,
        {
          provide: INJECTION_TOKENS.REPOSITORIES.ENRICHED_USER,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EnrichmentService>(EnrichmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enrichUser', () => {
    const testData = {
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };

    it('should enrich user data and save to repository', async () => {
      await service.enrichUser(testData.uuid, {
        name: testData.name,
        email: testData.email,
      });

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: testData.uuid,
          name: testData.name,
          email: testData.email,
          enrichmentData: expect.objectContaining({
            emailDomain: 'example.com',
            nameLength: testData.name.length,
            timestamp: expect.any(String),
          }),
        }),
      );
    });

    it('should create enriched user with correct timestamps', async () => {
      await service.enrichUser(testData.uuid, {
        name: testData.name,
        email: testData.email,
      });

      const savedUser = mockRepository.save.mock.calls[0][0] as EnrichedUser;
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle email without domain correctly', async () => {
      const invalidData = {
        uuid: 'test-uuid',
        name: 'Test User',
        email: 'invalid-email',
      };

      await service.enrichUser(invalidData.uuid, {
        name: invalidData.name,
        email: invalidData.email,
      });

      const savedUser = mockRepository.save.mock.calls[0][0] as EnrichedUser;
      expect(savedUser.enrichmentData.emailDomain).toBeUndefined();
    });
  });
}); 