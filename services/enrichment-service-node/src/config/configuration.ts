import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string(),
  RABBITMQ_URI: z.string(),
  RABBITMQ_QUEUE: z.string(),
  RABBITMQ_DLX: z.string(),
  RABBITMQ_DLQ: z.string(),
  RABBITMQ_RETRY_DELAY: z.coerce.number().default(1000),
  RABBITMQ_RETRY_ATTEMPTS: z.coerce.number().default(3),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  return envSchema.parse(config);
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