import { Module } from '@nestjs/common';
import { EnrichedUserController } from './controllers/enriched-user.controller';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [EnrichedUserController],
})
export class PresentationModule {} 