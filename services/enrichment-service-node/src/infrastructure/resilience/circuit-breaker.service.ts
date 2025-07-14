import { Injectable, Logger } from '@nestjs/common';
const CircuitBreaker = require('opossum');

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  volumeThreshold?: number;
  name?: string;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuitBreakers = new Map<string, any>();

  createCircuitBreaker<T>(
    operation: (...args: any[]) => Promise<T>,
    options: CircuitBreakerOptions = {}
  ): any {
    const {
      timeout = 3000,
      errorThresholdPercentage = 50,
      resetTimeout = 30000,
      volumeThreshold = 10,
      name = 'default'
    } = options;

    const circuitBreaker = new CircuitBreaker(operation, {
      timeout,
      errorThresholdPercentage,
      resetTimeout,
      volumeThreshold,
      name
    });

    // Event listeners
    circuitBreaker.on('open', () => {
      this.logger.warn(`Circuit Breaker '${name}' OPEN - Service unavailable`);
    });

    circuitBreaker.on('halfOpen', () => {
      this.logger.log(`Circuit Breaker '${name}' HALF-OPEN - Testing reconnection`);
    });

    circuitBreaker.on('close', () => {
      this.logger.log(`Circuit Breaker '${name}' CLOSE - Service available`);
    });

    circuitBreaker.on('fallback', (result: any) => {
      this.logger.warn(`Circuit Breaker '${name}' FALLBACK - Using fallback result`);
    });

    circuitBreaker.on('success', (result: any) => {
      this.logger.debug(`Circuit Breaker '${name}' SUCCESS - Operation completed`);
    });

    circuitBreaker.on('timeout', () => {
      this.logger.warn(`Circuit Breaker '${name}' TIMEOUT - Operation timed out`);
    });

    circuitBreaker.on('reject', (error: Error) => {
      this.logger.error(`Circuit Breaker '${name}' REJECT - Operation rejected: ${error.message}`);
    });

    this.circuitBreakers.set(name, circuitBreaker);
    return circuitBreaker;
  }

  getCircuitBreaker(name: string): any | undefined {
    return this.circuitBreakers.get(name);
  }

  getAllCircuitBreakers(): Map<string, any> {
    return this.circuitBreakers;
  }

  getCircuitBreakerStats(name: string) {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (!circuitBreaker) {
      return null;
    }

    return {
      name,
      state: circuitBreaker.opened ? 'OPEN' : circuitBreaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
      stats: circuitBreaker.stats,
      fallback: !!circuitBreaker.fallback,
      timeout: circuitBreaker.timeout,
      errorThresholdPercentage: circuitBreaker.errorThresholdPercentage,
      resetTimeout: circuitBreaker.resetTimeout,
      volumeThreshold: circuitBreaker.volumeThreshold
    };
  }

  getAllCircuitBreakerStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [name, circuitBreaker] of this.circuitBreakers) {
      stats[name] = this.getCircuitBreakerStats(name);
    }
    return stats;
  }
}
