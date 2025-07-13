import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { UserCreatedConsumer } from './rabbitmq/user-created.consumer';
import { ResilienceModule } from '../resilience/resilience.module';

@Module({
  imports: [ConfigModule, ResilienceModule],
  providers: [RabbitMQService, UserCreatedConsumer],
  exports: [RabbitMQService, UserCreatedConsumer],
})
export class MessagingModule { }
