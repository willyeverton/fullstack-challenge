import { EnrichedUser } from '../entities/enriched-user.entity';

export interface IEnrichedUserRepository {
  findByUuid(uuid: string): Promise<EnrichedUser | null>;
  save(user: EnrichedUser): Promise<EnrichedUser>;
  update(uuid: string, user: Partial<EnrichedUser>): Promise<EnrichedUser | null>;
  findAll(): Promise<EnrichedUser[]>;
  findPending(): Promise<EnrichedUser[]>;
} 