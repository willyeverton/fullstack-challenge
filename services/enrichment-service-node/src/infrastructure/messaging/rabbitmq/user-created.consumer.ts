import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';
import { IMessageHandler, UserCreatedEvent } from '../../../domain/ports/message-handler.interface';
import { IEnrichmentService } from '../../../domain/ports/enrichment-service.interface';
import { INJECTION_TOKENS } from '../../../domain/constants/injection-tokens';

@Injectable()
export class UserCreatedConsumer implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;

  constructor(
    private readonly configService: ConfigService,
    @Inject(INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER)
    private readonly messageHandler: IMessageHandler,
    @Inject(INJECTION_TOKENS.SERVICES.ENRICHMENT)
    private readonly enrichmentService: IEnrichmentService,
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  private async initialize() {
    const uri = this.configService.get<string>('app.rabbitmq.uri');
    const queue = this.configService.get<string>('app.rabbitmq.queue');

    this.connection = await connect(uri);
    this.channel = await this.connection.createChannel();

    await this.channel.prefetch(1); // Processa uma mensagem por vez
    await this.channel.consume(queue, this.handleMessage.bind(this));
  }

  private async cleanup() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  private async handleMessage(msg: ConsumeMessage | null) {
    if (!msg) return;

    try {
      const content = msg.content.toString();
      const data = JSON.parse(content) as UserCreatedEvent;
      const retryCount = (msg.properties.headers?.retryCount as number) || 0;

      try {
        // Tenta enriquecer o usuário
        await this.enrichmentService.enrichUser(data.uuid, {
          name: data.name,
          email: data.email,
        });

        // Confirma o processamento da mensagem
        this.channel.ack(msg);
      } catch (error) {
        // Se falhar, tenta retry ou envia para DLQ
        this.channel.nack(msg, false, false);
        await this.messageHandler.retryMessage(data, retryCount);
      }
    } catch (error) {
      // Em caso de erro no parsing ou erro crítico, envia direto para DLQ
      this.channel.nack(msg, false, false);
      const data = JSON.parse(msg.content.toString());
      await this.messageHandler.sendToDLQ(data, error as Error);
    }
  }
} 