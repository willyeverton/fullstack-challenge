import { Injectable, Inject } from '@nestjs/common';
import { IEnrichmentService, EnrichmentData } from '../../domain/ports/enrichment-service.interface';
import { IEnrichedUserRepository } from '../../domain/ports/enriched-user.repository.interface';
import { INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { EnrichedUser } from '../../domain/entities/enriched-user.entity';

@Injectable()
export class EnrichmentService implements IEnrichmentService {
  constructor(
    @Inject(INJECTION_TOKENS.REPOSITORIES.ENRICHED_USER)
    private readonly enrichedUserRepository: IEnrichedUserRepository,
  ) {}

  async enrichUser(uuid: string, data: EnrichmentData): Promise<void> {
    // Simula enriquecimento de dados do usuário
    const enrichmentData = await this.enrichUserData(data);

    // Cria ou atualiza o usuário enriquecido
    const enrichedUser = new EnrichedUser({
      uuid,
      name: data.name,
      email: data.email,
      enrichmentData,
    });

    await this.enrichedUserRepository.save(enrichedUser);
  }

  private async enrichUserData(data: EnrichmentData): Promise<Record<string, any>> {
    // Aqui poderia integrar com serviços externos para enriquecer os dados
    // Por exemplo: validação de email, geolocalização por IP, dados demográficos, etc.
    
    // Por enquanto, vamos simular alguns dados enriquecidos
    const enrichmentData: Record<string, any> = {
      nameLength: data.name.length,
      timestamp: new Date().toISOString(),
    };

    // Adiciona domínio do email apenas se for um email válido
    const emailParts = data.email.split('@');
    if (emailParts.length === 2) {
      enrichmentData.emailDomain = emailParts[1];
    }

    return enrichmentData;
  }
} 