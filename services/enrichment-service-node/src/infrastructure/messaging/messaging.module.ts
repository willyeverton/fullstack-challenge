import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { UserCreatedConsumer } from './rabbitmq/user-created.consumer';
import { INJECTION_TOKENS } from '../../domain/constants/injection-tokens';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER,
      useClass: RabbitMQService,
    },
    UserCreatedConsumer,
  ],
  exports: [INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER],
})
export class MessagingModule {} 