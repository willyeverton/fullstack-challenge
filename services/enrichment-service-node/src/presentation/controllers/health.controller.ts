import { Controller, Get, Inject } from '@nestjs/common';
import { CircuitBreakerService } from '../../infrastructure/resilience/circuit-breaker.service';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(CircuitBreakerService) private readonly circuitBreakerService: CircuitBreakerService
  ) { }

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'enrichment-service',
      version: '1.0.0'
    };
  }

  @Get('detailed')
  detailedCheck() {
    const circuitBreakerStats = this.circuitBreakerService.getAllStats();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'enrichment-service',
      version: '1.0.0',
      circuitBreakers: circuitBreakerStats,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
