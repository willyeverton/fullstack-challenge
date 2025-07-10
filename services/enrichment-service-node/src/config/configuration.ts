import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/enrichment',
  },
  rabbitmq: {
    uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'user.created',
    dlx: process.env.RABBITMQ_DLX || 'user.created.dlx',
    dlq: process.env.RABBITMQ_DLQ || 'user.created.dlq',
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000', 10),
  },
})); 