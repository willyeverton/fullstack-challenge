import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const amqp = require('amqplib');
import { IMessageHandler, UserCreatedEvent } from '../../../domain/ports/message-handler.interface';
import { IEnrichmentService } from '../../../domain/ports/enrichment-service.interface';
import { INJECTION_TOKENS } from '../../../domain/constants/injection-tokens';
import { RetryService } from '../../resilience/retry.service';

@Injectable()
export class UserCreatedConsumer implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;

  constructor(
    private readonly configService: ConfigService,
    @Inject(INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER)
    private readonly messageHandler: IMessageHandler,
    @Inject(INJECTION_TOKENS.SERVICES.ENRICHMENT)
    private readonly enrichmentService: IEnrichmentService,
    private readonly retryService: RetryService
  ) { }

  async onModuleInit() {
    await this.initialize();
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  private async initialize() {
    const uri = this.configService.get<string>('app.rabbitmq.uri');
    const queue = this.configService.get<string>('app.rabbitmq.queue');

    try {
      // Use RetryService for professional connection handling
      await this.retryService.executeWithExponentialBackoff(
        async () => {
          this.connection = await amqp.connect(uri);
          this.channel = await this.connection.createChannel();
          await this.channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });
          await this.channel.prefetch(1); // Process one message at a time

          await this.channel.consume(queue, (msg: any) => {
            if (!msg) return;

            this.handleMessage(msg).catch(err => {
              console.error('[UserCreatedConsumer] Error processing message:', err);
            });
          });

          return true;
        },
        'RabbitMQ Consumer Connection'
      );
    } catch (error) {
      console.error('[UserCreatedConsumer] Failed to initialize consumer:', error.message);
      throw error;
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

  private async handleMessage(msg: any) {
    if (!msg) return;

    try {
      const content = msg.content.toString();
      const data = JSON.parse(content) as UserCreatedEvent;
      const retryCount = (msg.properties.headers?.retryCount as number) || 0;

      try {
        // Enrich user data
        await this.enrichmentService.enrichUser(data.uuid, {
          name: data.name,
        });

        // Acknowledge successful processing
        this.channel.ack(msg);
      } catch (error) {
        console.error('[UserCreatedConsumer] Error enriching user:', error);
        // Reject message and handle retry
        this.channel.nack(msg, false, false);
        await this.messageHandler.retryMessage(data, retryCount);
      }
    } catch (error) {
      console.error('[UserCreatedConsumer] Critical error processing message:', error);
      // Reject message and send to DLQ for critical errors
      this.channel.nack(msg, false, false);
      const data = JSON.parse(msg.content.toString());
      await this.messageHandler.sendToDLQ(data, error as Error);
    }
  }
}
