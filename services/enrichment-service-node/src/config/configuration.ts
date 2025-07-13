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

export default () => {
  const config = validate(process.env);
  
  return {
    app: {
      env: config.NODE_ENV,
      port: config.PORT,
      mongodb: {
        uri: config.MONGODB_URI,
      },
      rabbitmq: {
        uri: config.RABBITMQ_URI,
        queue: config.RABBITMQ_QUEUE,
        dlx: config.RABBITMQ_DLX,
        dlq: config.RABBITMQ_DLQ,
        retryDelay: config.RABBITMQ_RETRY_DELAY,
        retryAttempts: config.RABBITMQ_RETRY_ATTEMPTS,
      },
    },
  };
}; 