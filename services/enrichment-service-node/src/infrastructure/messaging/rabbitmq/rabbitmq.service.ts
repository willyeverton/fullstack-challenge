import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const amqp = require('amqplib');
import { IMessageHandler, UserCreatedEvent } from '../../../domain/ports/message-handler.interface';
import { CircuitBreakerService } from '../../resilience/circuit-breaker.service';
import { RetryService } from '../../resilience/retry.service';

@Injectable()
export class RabbitMQService implements IMessageHandler, OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly maxRetries: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CircuitBreakerService) private readonly circuitBreakerService: CircuitBreakerService,
    @Inject(RetryService) private readonly retryService: RetryService
  ) {
    this.maxRetries = this.configService.get<number>('app.rabbitmq.retryAttempts') || 3;
  }

  async onModuleInit() {
    await this.initialize();
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  private async initialize() {
    const uri = this.configService.get<string>('app.rabbitmq.uri');
    const queue = this.configService.get<string>('app.rabbitmq.queue');
    const dlx = this.configService.get<string>('app.rabbitmq.dlx');
    const dlq = this.configService.get<string>('app.rabbitmq.dlq');

    // Create circuit breaker for RabbitMQ connection
    const connectCircuitBreaker = this.circuitBreakerService.createCircuitBreaker(
      async () => {
        this.connection = await amqp.connect(uri);
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(queue, { durable: true });

        // Configure DLX and DLQ if specified
        if (dlx && dlq) {
          await this.channel.assertExchange(dlx, 'direct', { durable: true });
          await this.channel.assertQueue(dlq, { durable: true });
          await this.channel.bindQueue(dlq, dlx, 'dead');
        }

        return true;
      },
      {
        name: 'rabbitmq-connection',
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000
      }
    );

    // Fallback function for graceful degradation
    const fallback = async () => {
      console.log('⚠️ RabbitMQ connection failed, using fallback mode');
      console.log('⚠️ Messages will not be processed until connection is established.');
      return false;
    };

    connectCircuitBreaker.fallback(fallback);

    try {
      // Use retry service with exponential backoff
      await this.retryService.executeWithPersistentRetry(
        async () => {
          return await connectCircuitBreaker.fire();
        },
        'RabbitMQ Connection'
      );
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ after all retries:', error.message);
      // Service continues without RabbitMQ (graceful degradation)
    }
  }

  private async cleanup() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async handleUserCreated(data: UserCreatedEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const queue = this.configService.get<string>('app.rabbitmq.queue');
    await this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,
        headers: { retryCount: 0 },
      },
    );
  }

  async retryMessage(data: UserCreatedEvent, retryCount: number): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    if (retryCount >= this.maxRetries) {
      await this.sendToDLQ(data, new Error('Max retries exceeded'));
      return;
    }

    const queue = this.configService.get<string>('app.rabbitmq.queue');
    const retryQueue = `${queue}.retry.${retryCount + 1}`;

    await this.channel.sendToQueue(
      retryQueue,
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,
        headers: { retryCount: retryCount + 1 },
      },
    );
  }

  async sendToDLQ(data: UserCreatedEvent, error: Error): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const dlx = this.configService.get<string>('app.rabbitmq.dlx');

    await this.channel.publish(
      dlx,
      'dead',
      Buffer.from(JSON.stringify({
        data,
        error: {
          message: error.message,
          stack: error.stack,
        },
        timestamp: new Date().toISOString(),
      })),
      { persistent: true },
    );
  }
}
