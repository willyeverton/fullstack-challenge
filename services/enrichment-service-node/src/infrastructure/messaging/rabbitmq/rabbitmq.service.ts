import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const amqp = require('amqplib');
// import { connect, Connection, Channel } from 'amqplib';
import { IMessageHandler, UserCreatedEvent } from '../../../domain/ports/message-handler.interface';

@Injectable()
export class RabbitMQService implements IMessageHandler, OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly retryDelay: number;
  private readonly maxRetries: number;

  constructor(private readonly configService: ConfigService) {
    this.retryDelay = this.configService.get<number>('app.rabbitmq.retryDelay') || 1000;
    this.maxRetries = this.configService.get<number>('app.rabbitmq.retryAttempts') || 3;
  }

  async onModuleInit() {
    await this.initialize();

    // Iniciar reconexão periódica se não conseguiu conectar inicialmente
    if (!this.connection) {
      this.startPeriodicReconnection();
    }
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  private async initialize() {
    const uri = this.configService.get<string>('app.rabbitmq.uri');
    const queue = this.configService.get<string>('app.rabbitmq.queue');
    const dlx = this.configService.get<string>('app.rabbitmq.dlx');
    const dlq = this.configService.get<string>('app.rabbitmq.dlq');

    let attempt = 0;
    const maxAttempts = 30; // Aumentar tentativas para dar tempo do RabbitMQ inicializar
    const baseDelay = 2000; // Delay base de 2 segundos

    while (attempt < maxAttempts) {
      try {
        console.log(`🔄 Connecting to RabbitMQ: ${uri} (attempt ${attempt + 1}/${maxAttempts})`);
        this.connection = await amqp.connect(uri);
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(queue, { durable: true });
        console.log(`✅ RabbitMQ initialized successfully. Queue: ${queue}`);

        // Configurar DLX e DLQ se especificados
        if (dlx && dlq) {
          await this.channel.assertExchange(dlx, 'direct', { durable: true });
          await this.channel.assertQueue(dlq, { durable: true });
          await this.channel.bindQueue(dlq, dlx, 'dead');
          console.log(`✅ Dead Letter Exchange and Queue configured`);
        }

        // Configurar consumer - REMOVIDO para evitar duplicação
        // await this.setupConsumer();

        return;
      } catch (err) {
        attempt++;
        const delay = baseDelay * Math.pow(1.5, attempt - 1); // Exponential backoff
        console.error(`❌ RabbitMQ connection failed (attempt ${attempt}/${maxAttempts}):`, err.message);
        console.log(`⏳ Retrying in ${Math.round(delay / 1000)} seconds...`);

        if (attempt >= maxAttempts) {
          console.error('❌ Max RabbitMQ connection attempts reached. Service will continue without RabbitMQ.');
          console.error('⚠️  Messages will not be processed until connection is established.');
          // Não fazer throw para não parar o serviço
          return;
        }

        await new Promise(res => setTimeout(res, delay));
      }
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

  private startPeriodicReconnection() {
    console.log('🔄 Starting periodic reconnection attempts...');
    setInterval(async () => {
      if (!this.connection) {
        console.log('🔄 Attempting to reconnect to RabbitMQ...');
        try {
          await this.initialize();
          if (this.connection) {
            console.log('✅ Successfully reconnected to RabbitMQ!');
            // Configurar consumer após reconexão
            await this.setupConsumer();
          }
        } catch (error) {
          console.log('❌ Reconnection attempt failed:', error.message);
        }
      }
    }, 30000); // Tentar reconectar a cada 30 segundos
  }

  private async setupConsumer() {
    if (!this.channel) return;

    const queue = this.configService.get<string>('app.rabbitmq.queue');
    console.log(`🎧 Setting up consumer for queue: ${queue}`);

    try {
      await this.channel.consume(queue, async (msg: any) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log('📨 Processing message:', content);

            // Aqui você processaria a mensagem
            // await this.processUserCreated(content);

            this.channel.ack(msg);
            console.log('✅ Message processed successfully');
          } catch (error) {
            console.error('❌ Error processing message:', error);
            this.channel.nack(msg, false, false); // Rejeitar mensagem
          }
        }
      });
      console.log('✅ Consumer setup completed');
    } catch (error) {
      console.error('❌ Error setting up consumer:', error);
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
