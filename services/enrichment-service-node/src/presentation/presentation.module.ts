import { Module } from '@nestjs/common';
import { EnrichedUserController } from './controllers/enriched-user.controller';
import { HealthController } from './controllers/health.controller';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [EnrichedUserController, HealthController],
})
export class PresentationModule {} 