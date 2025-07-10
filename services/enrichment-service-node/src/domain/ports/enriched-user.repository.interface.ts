import { EnrichedUser } from '../entities/enriched-user.entity';

export interface IEnrichedUserRepository {
  save(user: EnrichedUser): Promise<void>;
  findByUuid(uuid: string): Promise<EnrichedUser | null>;
} 