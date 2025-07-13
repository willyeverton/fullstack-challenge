import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { UserCreatedConsumer } from './rabbitmq/user-created.consumer';
import { INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { ApplicationModule } from '../../application/application.module';

@Module({
  imports: [ConfigModule, forwardRef(() => ApplicationModule)],
  providers: [
    {
      provide: INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER,
      useClass: RabbitMQService,
    },
    {
      provide: UserCreatedConsumer,
      useClass: UserCreatedConsumer,
    },
  ],
  exports: [INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER, UserCreatedConsumer],
})
export class MessagingModule { }
