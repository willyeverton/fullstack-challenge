import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const amqp = require('amqplib');
// import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';
import { IMessageHandler, UserCreatedEvent } from '../../../domain/ports/message-handler.interface';
import { IEnrichmentService } from '../../../domain/ports/enrichment-service.interface';
import { INJECTION_TOKENS } from '../../../domain/constants/injection-tokens';

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
    const retryDelay = this.configService.get<number>('app.rabbitmq.retryDelay') || 1000;
    const maxRetries = this.configService.get<number>('app.rabbitmq.retryAttempts') || 3;

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        console.log(`[UserCreatedConsumer] Connecting to RabbitMQ: ${uri} (attempt ${attempt + 1}/${maxRetries})`);
        this.connection = await amqp.connect(uri);
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });
        await this.channel.prefetch(1); // Processa uma mensagem por vez
        await this.channel.consume(queue, (msg: any) => {
          try {
            console.log('[UserCreatedConsumer] [CONSUME CALLBACK] Mensagem RAW recebida:', msg ? msg.content.toString() : 'no message');
            if (!msg) {
              console.warn('[UserCreatedConsumer] [CONSUME CALLBACK] Mensagem nula recebida!');
              return;
            }
            this.handleMessage(msg).catch(err => {
              console.error('[UserCreatedConsumer] [CONSUME CALLBACK] Erro ao processar handleMessage:', err);
            });
          } catch (err) {
            console.error('[UserCreatedConsumer] [CONSUME CALLBACK] Erro inesperado no callback:', err);
          }
        });
        console.log('[UserCreatedConsumer] Consumer initialized successfully');
        return;
      } catch (err) {
        attempt++;
        console.error(`[UserCreatedConsumer] RabbitMQ connection failed (attempt ${attempt}):`, err.message);
        if (attempt >= maxRetries) {
          console.error('[UserCreatedConsumer] Max RabbitMQ connection attempts reached. Exiting.');
          throw err;
        }
        await new Promise(res => setTimeout(res, retryDelay));
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

  private async handleMessage(msg: any) {
    console.log('[UserCreatedConsumer] 🔥 HOT RELOAD TEST - handleMessage called with:', msg ? 'message received' : 'no message');
    console.log('[UserCreatedConsumer] handleMessage called with:', msg ? 'message received' : 'no message');

    if (!msg) return;

    try {
      const content = msg.content.toString();
      console.log('[UserCreatedConsumer] Mensagem recebida:', content);
      const data = JSON.parse(content) as UserCreatedEvent;
      const retryCount = (msg.properties.headers?.retryCount as number) || 0;

      try {
        // Tenta enriquecer o usuário
        await this.enrichmentService.enrichUser(data.uuid, {
          name: data.name,
        });
        console.log('[UserCreatedConsumer] Usuário enriquecido com sucesso:', data.uuid);
        // Confirma o processamento da mensagem
        this.channel.ack(msg);
      } catch (error) {
        console.error('[UserCreatedConsumer] Erro ao enriquecer usuário:', error);
        // Se falhar, tenta retry ou envia para DLQ
        this.channel.nack(msg, false, false);
        await this.messageHandler.retryMessage(data, retryCount);
      }
    } catch (error) {
      console.error('[UserCreatedConsumer] Erro crítico ao processar mensagem:', error);
      // Em caso de erro no parsing ou erro crítico, envia direto para DLQ
      this.channel.nack(msg, false, false);
      const data = JSON.parse(msg.content.toString());
      await this.messageHandler.sendToDLQ(data, error as Error);
    }
  }
}
