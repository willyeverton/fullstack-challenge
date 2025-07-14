import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { UserCreatedConsumer } from './rabbitmq/user-created.consumer';
import { ResilienceModule } from '../resilience/resilience.module';
import { INJECTION_TOKENS } from '../../domain/constants/injection-tokens';

@Module({
  imports: [ConfigModule, ResilienceModule],
  providers: [
    RabbitMQService,
    UserCreatedConsumer,
    {
      provide: INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER,
      useClass: RabbitMQService,
    },
  ],
  exports: [RabbitMQService, UserCreatedConsumer, INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER],
})
export class MessagingModule { }
