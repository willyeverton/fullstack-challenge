import { Controller, Get, Param, NotFoundException, Inject } from '@nestjs/common';
import { IEnrichedUserRepository } from '../../domain/ports/enriched-user.repository.interface';
import { INJECTION_TOKENS } from '../../domain/constants/injection-tokens';

@Controller('users')
export class EnrichedUserController {
  constructor(
    @Inject(INJECTION_TOKENS.REPOSITORIES.ENRICHED_USER)
    private readonly enrichedUserRepository: IEnrichedUserRepository,
  ) {}

  @Get('enriched/:uuid')
  async getEnrichedUser(@Param('uuid') uuid: string) {
    const user = await this.enrichedUserRepository.findByUuid(uuid);
    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found or not yet enriched`);
    }
    return user;
  }
} 