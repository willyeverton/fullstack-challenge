// Simplified configuration without zod for now
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  RABBITMQ_URI: string;
  RABBITMQ_QUEUE: string;
  RABBITMQ_DLX: string;
  RABBITMQ_DLQ: string;
  RABBITMQ_RETRY_DELAY: number;
  RABBITMQ_RETRY_ATTEMPTS: number;
}

export function validate(config: Record<string, unknown>) {
  // Simple validation - just return the config with defaults
  return {
    NODE_ENV: config.NODE_ENV || 'development',
    PORT: Number(config.PORT) || 3000,
    MONGODB_URI: config.MONGODB_URI || 'mongodb://mongodb:27017/enrichment',
    RABBITMQ_URI: config.RABBITMQ_URI || 'amqp://guest:guest@rabbitmq:5672',
    RABBITMQ_QUEUE: config.RABBITMQ_QUEUE || 'user.created',
    RABBITMQ_DLX: config.RABBITMQ_DLX || 'user.created.dlx',
    RABBITMQ_DLQ: config.RABBITMQ_DLQ || 'user.created.dlq',
    RABBITMQ_RETRY_DELAY: Number(config.RABBITMQ_RETRY_DELAY) || 1000,
    RABBITMQ_RETRY_ATTEMPTS: Number(config.RABBITMQ_RETRY_ATTEMPTS) || 3,
  };
}

export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    rabbitmq: {
      uri: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
      queue: process.env.RABBITMQ_QUEUE || 'user.created',
      dlx: process.env.RABBITMQ_DLX || 'user.created.dlx',
      dlq: process.env.RABBITMQ_DLQ || 'user.created.dlq',
      retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || '3', 10),
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/enrichment',
    },
    resilience: {
      circuitBreaker: {
        timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000', 10),
        errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD || '50', 10),
        resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000', 10),
        volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10', 10),
      },
      retry: {
        maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '5', 10),
        baseDelay: parseInt(process.env.RETRY_BASE_DELAY || '1000', 10),
        maxDelay: parseInt(process.env.RETRY_MAX_DELAY || '30000', 10),
        backoffMultiplier: parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),
        jitter: process.env.RETRY_JITTER !== 'false',
      },
    },
  },
});
