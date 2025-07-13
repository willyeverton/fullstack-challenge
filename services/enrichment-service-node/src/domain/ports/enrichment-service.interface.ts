export interface EnrichmentData {
  name: string;
  email?: string;
}

export interface IEnrichmentService {
  enrichUser(uuid: string, data: EnrichmentData): Promise<void>;
}
