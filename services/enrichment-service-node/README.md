# Enrichment Service

Serviço responsável por enriquecer dados de usuários através de processamento assíncrono via mensageria.

## Tecnologias

- Node.js 20
- NestJS 10
- MongoDB
- RabbitMQ
- TypeScript
- Jest

## Arquitetura

O serviço segue os princípios da Clean Architecture e SOLID:

```
src/
├── domain/           # Regras de negócio e interfaces
├── application/      # Casos de uso e serviços
├── infrastructure/   # Implementações de adaptadores
└── presentation/     # Controllers e DTOs
```

## Funcionalidades

- Consumo de mensagens de usuário criado via RabbitMQ
- Enriquecimento de dados do usuário
- Estratégia de retry com Dead Letter Queue (DLQ)
- Endpoint REST para consulta de dados enriquecidos

## Configuração

### Variáveis de Ambiente

```env
# Ambiente
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/enrichment

# RabbitMQ
RABBITMQ_URI=amqp://localhost:5672
RABBITMQ_QUEUE=user.created
RABBITMQ_DLX=user.created.dlx
RABBITMQ_DLQ=user.created.dlq
RABBITMQ_RETRY_DELAY=1000
RABBITMQ_RETRY_ATTEMPTS=3
```

## Instalação

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Testes

```bash
# Testes unitários
npm test

# Cobertura
npm run test:cov

# E2E
npm run test:e2e
```

## API

### GET /users/enriched/:uuid

Retorna os dados enriquecidos de um usuário.

**Resposta de Sucesso (200)**
```json
{
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john@example.com",
  "enrichmentData": {
    "emailDomain": "example.com",
    "nameLength": 8,
    "timestamp": "2024-03-19T12:00:00.000Z"
  },
  "createdAt": "2024-03-19T12:00:00.000Z",
  "updatedAt": "2024-03-19T12:00:00.000Z"
}
```

**Resposta de Erro (404)**
```json
{
  "statusCode": 404,
  "message": "User with UUID 123e4567-e89b-12d3-a456-426614174000 not found or not yet enriched",
  "error": "Not Found"
}
```

## Estratégia de Retry e DLQ

O serviço implementa uma estratégia robusta de retry para mensagens que falham no processamento:

1. A mensagem é recebida na fila principal `user.created`
2. Em caso de falha, a mensagem é enviada para uma fila de retry com delay exponencial
3. Após o número máximo de tentativas, a mensagem é enviada para a DLQ com informações do erro
4. As mensagens na DLQ podem ser reprocessadas manualmente se necessário

## Docker

O serviço inclui um Dockerfile com multi-stage build para otimização do tamanho da imagem e segurança.

```bash
# Build da imagem
docker build -t enrichment-service .

# Executar container
docker run -p 3000:3000 enrichment-service
```
