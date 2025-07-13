import { Module } from '@nestjs/common';
import { EnrichedUserController } from './controllers/enriched-user.controller';
import { HealthController } from './controllers/health.controller';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';
import { ResilienceModule } from '../infrastructure/resilience/resilience.module';

@Module({
  imports: [PersistenceModule, ResilienceModule],
  controllers: [EnrichedUserController, HealthController],
})
export class PresentationModule { }
