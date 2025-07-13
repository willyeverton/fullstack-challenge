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
  ) { }

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
    // Normaliza o nome para username (minúsculo, sem acento, sem espaço)
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '');
    const username = normalize(data.name);

    const enrichmentData: Record<string, any> = {
      linkedin: `linkedin.com/in/${username}`,
      github: `github.com/${username}`,
      nameLength: data.name.length,
      timestamp: new Date().toISOString(),
    };

    if (data.email) {
      const emailParts = data.email.split('@');
      if (emailParts.length === 2) {
        enrichmentData.emailDomain = emailParts[1];
      }
    }

    return enrichmentData;
  }
}
