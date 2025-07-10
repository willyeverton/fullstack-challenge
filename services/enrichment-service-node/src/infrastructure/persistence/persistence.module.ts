import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrichedUser, EnrichedUserSchema } from '../../domain/entities/enriched-user.entity';
import { MongoEnrichedUserRepository } from './mongodb/enriched-user.repository';
import { INJECTION_TOKENS } from '../../domain/constants/injection-tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnrichedUser.name, schema: EnrichedUserSchema },
    ]),
  ],
  providers: [
    {
      provide: INJECTION_TOKENS.REPOSITORIES.ENRICHED_USER,
      useClass: MongoEnrichedUserRepository,
    },
  ],
  exports: [INJECTION_TOKENS.REPOSITORIES.ENRICHED_USER],
})
export class PersistenceModule {} 