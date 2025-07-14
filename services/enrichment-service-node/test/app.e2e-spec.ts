import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EnrichedUserController } from '../src/presentation/controllers/enriched-user.controller';
import { IEnrichedUserRepository } from '../src/domain/ports/enriched-user.repository.interface';
import { INJECTION_TOKENS } from '../src/domain/constants/injection-tokens';
import { EnrichedUser } from '../src/domain/entities/enriched-user.entity';

describe('EnrichedUserController (e2e)', () => {
  let app: INestApplication;
  let mockRepository: jest.Mocked<IEnrichedUserRepository>;

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

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findByUuid: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EnrichedUserController],
      providers: [
        {
          provide: INJECTION_TOKENS.REPOSITORIES.ENRICHED_USER,
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/users/enriched/:uuid (GET) - success', async () => {
    mockRepository.findByUuid.mockResolvedValueOnce(mockUser);

    const response = await request(app.getHttpServer())
      .get('/users/enriched/test-uuid')
      .expect(200);

    expect(response.body).toEqual({
      uuid: mockUser.uuid,
      name: mockUser.name,
      email: mockUser.email,
      enrichmentData: mockUser.enrichmentData,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/users/enriched/:uuid (GET) - not found', async () => {
    mockRepository.findByUuid.mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer())
      .get('/users/enriched/non-existent-uuid')
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'User with UUID non-existent-uuid not found or not yet enriched',
      error: 'Not Found',
    });
  });
});
