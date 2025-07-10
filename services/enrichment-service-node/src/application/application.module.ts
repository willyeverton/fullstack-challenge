import { Module } from '@nestjs/common';
import { EnrichmentService } from './services/enrichment.service';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';
import { INJECTION_TOKENS } from '../domain/constants/injection-tokens';

@Module({
  imports: [PersistenceModule],
  providers: [
    {
      provide: INJECTION_TOKENS.SERVICES.ENRICHMENT,
      useClass: EnrichmentService,
    },
  ],
  exports: [INJECTION_TOKENS.SERVICES.ENRICHMENT],
})
export class ApplicationModule {} 