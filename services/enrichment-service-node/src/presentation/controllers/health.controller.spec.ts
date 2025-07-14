import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { CircuitBreakerService } from '../../infrastructure/resilience/circuit-breaker.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: CircuitBreakerService,
          useValue: {
            getAllCircuitBreakerStats: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('check should return health status', () => {
    const result = controller.check();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('service', 'enrichment-service');
    expect(result).toHaveProperty('version', '1.0.0');
    expect(result).toHaveProperty('timestamp');
  });

  it('detailedCheck should return detailed health status', () => {
    const result = controller.detailedCheck();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('service', 'enrichment-service');
    expect(result).toHaveProperty('version', '1.0.0');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('circuitBreakers');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('memory');
    expect(result).toHaveProperty('environment');
  });
});
