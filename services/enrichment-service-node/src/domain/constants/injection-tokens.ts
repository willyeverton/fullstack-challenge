export const INJECTION_TOKENS = {
  REPOSITORIES: {
    ENRICHED_USER: 'IEnrichedUserRepository' as const,
  },
  SERVICES: {
    ENRICHMENT: 'IEnrichmentService' as const,
    MESSAGE_HANDLER: 'IMessageHandler' as const,
  },
} as const; 