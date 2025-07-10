import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';
import { IMessageHandler, UserCreatedEvent } from '../../../domain/ports/message-handler.interface';

@Injectable()
export class RabbitMQService implements IMessageHandler, OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private readonly retryDelay: number;
  private readonly maxRetries: number;

  constructor(private readonly configService: ConfigService) {
    this.retryDelay = this.configService.get<number>('app.rabbitmq.retryDelay');
    this.maxRetries = this.configService.get<number>('app.rabbitmq.retryAttempts');
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

    this.connection = await connect(uri);
    this.channel = await this.connection.createChannel();

    // Configurar Dead Letter Exchange
    await this.channel.assertExchange(dlx, 'direct', { durable: true });
    await this.channel.assertQueue(dlq, {
      durable: true,
      arguments: {
        'x-message-ttl': 1000 * 60 * 60 * 24, // 24 horas
      },
    });
    await this.channel.bindQueue(dlq, dlx, 'dead');

    // Configurar fila principal com DLX
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': dlx,
        'x-dead-letter-routing-key': 'dead',
      },
    });

    // Configurar filas de retry
    for (let i = 1; i <= this.maxRetries; i++) {
      const retryQueue = `${queue}.retry.${i}`;
      await this.channel.assertQueue(retryQueue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': queue,
          'x-message-ttl': this.retryDelay * i,
        },
      });
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