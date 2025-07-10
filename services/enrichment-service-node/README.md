# Enrichment Service

Microserviço responsável pelo enriquecimento de dados de usuários, implementado em Node.js com NestJS.

## Arquitetura

O serviço segue os princípios da Clean Architecture e SOLID:

- **Domain Layer**: Entidades e regras de negócio
- **Application Layer**: Casos de uso e interfaces
- **Infrastructure Layer**: Implementações concretas
- **Presentation Layer**: Controllers e DTOs

### Padrões de Projeto Utilizados

- Repository Pattern
- Factory Pattern
- Provider Pattern
- Dependency Injection
- Event-Driven Architecture

## Funcionalidades

- Consumo de eventos de criação de usuário via RabbitMQ
- Enriquecimento de dados do usuário
- Estratégia de retry com Dead Letter Queue (DLQ)
- API REST para consulta de status
- Persistência em MongoDB

## Configuração

### Variáveis de Ambiente

```env
MONGODB_URI=mongodb://localhost:27017/enrichment
RABBITMQ_URI=amqp://localhost:5672
RABBITMQ_QUEUE=user.created
RABBITMQ_DLX=user.created.dlx
RABBITMQ_DLQ=user.created.dlq
RETRY_ATTEMPTS=3
RETRY_DELAY=1000
PORT=3000
```

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run start:dev
```

### Produção

```bash
npm run build
npm run start:prod
```

### Testes

```bash
npm run test        # unit tests
npm run test:e2e    # end-to-end tests
npm run test:cov    # test coverage
```

## API Endpoints

- `GET /api/users/enriched/{uuid}` - Busca usuário enriquecido por UUID
- `GET /api/users/enriched` - Lista todos os usuários enriquecidos

## Integração com RabbitMQ

O serviço utiliza uma estratégia de retry com Dead Letter Exchange (DLX) para mensagens que falham no processamento:

1. Mensagem recebida na fila principal (`user.created`)
2. Em caso de falha, mensagem é reprocessada até `RETRY_ATTEMPTS`
3. Se todas as tentativas falharem, mensagem vai para DLQ (`user.created.dlq`)

## Monitoramento e Observabilidade

- Logs estruturados
- Métricas de processamento
- Rastreamento de erros
