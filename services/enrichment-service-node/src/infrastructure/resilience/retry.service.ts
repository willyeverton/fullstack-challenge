import { Injectable, Logger } from '@nestjs/common';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors?: string[];
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context: string = 'operation'
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
      jitter = true,
      retryableErrors = []
    } = config;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(`${context} - Attempt ${attempt}/${maxAttempts}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!this.isRetryableError(error as Error, retryableErrors)) {
          this.logger.warn(`${context} - Non-retryable error: ${error.message}`);
          throw error;
        }

        if (attempt === maxAttempts) {
          this.logger.error(`${context} - Failed after ${attempt} attempts: ${error.message}`);
          throw new Error(`${context} failed after ${attempt} attempts: ${error.message}`);
        }

        const delay = this.calculateDelay(attempt, baseDelay, maxDelay, backoffMultiplier, jitter);
        this.logger.warn(`${context} - Attempt ${attempt} failed, retrying in ${Math.round(delay / 1000)}s...`);

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    backoffMultiplier: number,
    jitter: boolean
  ): number {
    let delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);

    if (jitter) {
      // Add ±25% jitter to prevent thundering herd
      const jitterFactor = 0.75 + Math.random() * 0.5;
      delay = delay * jitterFactor;
    }

    return Math.min(delay, maxDelay);
  }

  private isRetryableError(error: Error, retryableErrors: string[]): boolean {
    // Default retryable errors
    const defaultRetryableErrors = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNABORTED',
      'ENETUNREACH',
      'EHOSTUNREACH',
      'EADDRNOTAVAIL'
    ];

    const allRetryableErrors = [...defaultRetryableErrors, ...retryableErrors];

    return allRetryableErrors.some(retryableError =>
      error.message.includes(retryableError) ||
      error.name.includes(retryableError)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods for common retry scenarios
  async executeWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    return this.executeWithRetry(operation, {
      maxAttempts: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true
    }, context);
  }

  async executeWithQuickRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    return this.executeWithRetry(operation, {
      maxAttempts: 3,
      baseDelay: 500,
      maxDelay: 5000,
      backoffMultiplier: 1.5,
      jitter: true
    }, context);
  }

  async executeWithPersistentRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    return this.executeWithRetry(operation, {
      maxAttempts: 10,
      baseDelay: 2000,
      maxDelay: 60000,
      backoffMultiplier: 2,
      jitter: true
    }, context);
  }
}
