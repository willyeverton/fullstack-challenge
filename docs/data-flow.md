# Fluxo de Dados Assíncrono - Fullstack Microservices Challenge

Este documento descreve o fluxo completo de dados através do sistema de microserviços, desde a criação de um usuário até o enriquecimento de seus dados.

## 🏗️ Arquitetura do Fluxo

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │ User Service│    │Enrichment   │
│   (React)   │◄──►│   (PHP)     │───►│ Service     │
│             │    │             │    │ (Node.js)   │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ PostgreSQL  │    │   MongoDB   │
                   │             │    │             │
                   └─────────────┘    └─────────────┘
                          │                   │
                          └───────┬───────────┘
                                  ▼
                          ┌─────────────┐
                          │  RabbitMQ   │
                          │             │
                          └─────────────┘
```

## 🔄 Fluxo Detalhado

### 1. Criação de Usuário

#### 1.1 Frontend → User Service
```
POST /api/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com"
}
```

#### 1.2 Validação no User Service
- **Nome**: Mínimo 3 caracteres, obrigatório
- **Email**: Formato válido, obrigatório
- **Status**: 400 se inválido, 201 se válido

#### 1.3 Persistência no PostgreSQL
```sql
INSERT INTO users (uuid, name, email, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'João Silva',
  'joao@example.com',
  NOW(),
  NOW()
);
```

#### 1.4 Publicação na Fila RabbitMQ
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Fila**: `user.created`
**Configuração**: Durable, não exclusiva, não auto-delete

### 2. Processamento Assíncrono

#### 2.1 Consumo da Mensagem
O Enrichment Service consome mensagens da fila `user.created` continuamente.

#### 2.2 Estratégia de Retry
- **Tentativas**: 3 tentativas por padrão
- **Delay**: Exponencial backoff (1s, 2s, 4s)
- **Dead Letter Queue**: Mensagens que falham após todas as tentativas

#### 2.3 Enriquecimento de Dados
```javascript
// Normalização do nome
const normalize = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '');

const username = normalize('João Silva'); // 'joao silva'

// Geração de perfis sociais
const enrichmentData = {
  linkedin: `linkedin.com/in/${username}`,
  github: `github.com/${username}`,
  emailDomain: 'example.com',
  nameLength: 10,
  timestamp: new Date().toISOString()
};
```

#### 2.4 Persistência no MongoDB
```javascript
{
  _id: ObjectId("..."),
  uuid: "550e8400-e29b-41d4-a716-446655440000",
  name: "João Silva",
  email: "joao@example.com",
  enrichmentData: {
    linkedin: "linkedin.com/in/joao silva",
    github: "github.com/joao silva",
    emailDomain: "example.com",
    nameLength: 10,
    timestamp: "2024-01-15T10:30:00Z"
  },
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

### 3. Consulta de Dados Enriquecidos

#### 3.1 Frontend → Enrichment Service
```
GET /users/enriched/550e8400-e29b-41d4-a716-446655440000
```

#### 3.2 Resposta de Sucesso (200)
```json
{
  "linkedin": "linkedin.com/in/joao silva",
  "github": "github.com/joao silva"
}
```

#### 3.3 Resposta de Processamento (404)
```json
{
  "statusCode": 404,
  "message": "User with UUID 550e8400-e29b-41d4-a716-446655440000 not found or not yet enriched",
  "error": "Not Found"
}
```

## ⚡ Padrões de Resiliência

### Circuit Breaker
- **Timeout**: 3 segundos
- **Error Threshold**: 50%
- **Reset Timeout**: 30 segundos
- **Estado**: CLOSED → OPEN → HALF_OPEN → CLOSED

### Retry Strategy
- **Máximo de Tentativas**: 5
- **Delay Base**: 1 segundo
- **Delay Máximo**: 30 segundos
- **Multiplicador**: 2 (exponencial)
- **Jitter**: Habilitado (evita thundering herd)

### Dead Letter Queue
- **Fila Principal**: `user.created`
- **Fila de Retry**: `user.created.retry`
- **Dead Letter Queue**: `user.created.dlq`
- **Exchange**: `user.created.dlx`

## 🔍 Monitoramento

### Health Checks
- **User Service**: `GET /health`
- **Enrichment Service**: `GET /health`
- **Circuit Breaker Stats**: `GET /health/circuit-breakers`

### Logs Estruturados
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "user-service",
  "action": "user.created",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "message": "User created and event published"
}
```

### Métricas
- **Throughput**: Mensagens processadas por segundo
- **Latency**: Tempo de processamento
- **Error Rate**: Taxa de erro
- **Queue Depth**: Tamanho das filas

## 🚨 Tratamento de Erros

### Cenários de Falha

#### 1. User Service Indisponível
- Frontend exibe erro de conexão
- Usuário pode tentar novamente
- Dados não são perdidos (formulário mantém estado)

#### 2. RabbitMQ Indisponível
- User Service falha ao publicar evento
- Transação é revertida (rollback)
- Usuário recebe erro 500
- Logs indicam falha de publicação

#### 3. Enrichment Service Indisponível
- Mensagens ficam na fila
- Retry automático quando serviço volta
- Frontend mostra "Data processing"
- Usuário pode verificar novamente

#### 4. MongoDB Indisponível
- Enrichment Service falha ao persistir
- Mensagem vai para DLQ
- Logs indicam falha de persistência
- Administrador pode reprocessar manualmente

### Estratégias de Recuperação

#### Graceful Degradation
- Frontend funciona mesmo com APIs indisponíveis
- Cache local para dados básicos
- Fallback para dados mock quando necessário

#### Retry com Backoff
- Tentativas automáticas com delay crescente
- Evita sobrecarga em serviços em recuperação
- Jitter para distribuir carga

#### Dead Letter Queue
- Mensagens problemáticas são isoladas
- Permite análise manual de falhas
- Possibilidade de reprocessamento

## 📊 Performance

### Latências Esperadas
- **Criação de Usuário**: < 500ms
- **Listagem de Usuários**: < 200ms
- **Enriquecimento**: 2-5 segundos (assíncrono)
- **Consulta de Dados Enriquecidos**: < 100ms

### Throughput
- **User Service**: 1000 req/s
- **Enrichment Service**: 500 msg/s
- **RabbitMQ**: 10.000 msg/s

### Capacidade
- **PostgreSQL**: 1M usuários
- **MongoDB**: 1M documentos enriquecidos
- **RabbitMQ**: 100K mensagens em fila

## 🔧 Configuração

### Variáveis de Ambiente Críticas

#### User Service
```env
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
DB_CONNECTION=pgsql
DB_DATABASE=user_service
```

#### Enrichment Service
```env
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
MONGODB_URI=mongodb://mongodb:27017/enrichment
RABBITMQ_RETRY_ATTEMPTS=3
```

### Configuração de Filas
```javascript
// Declaração da fila principal
await channel.assertQueue('user.created', {
  durable: true,
  exclusive: false,
  autoDelete: false
});

// Declaração da DLQ
await channel.assertQueue('user.created.dlq', {
  durable: true,
  exclusive: false,
  autoDelete: false
});

// Configuração do exchange para DLQ
await channel.assertExchange('user.created.dlx', 'direct', {
  durable: true
});
```

## 📈 Melhorias Futuras

### Observabilidade
- [ ] Distributed tracing com Jaeger
- [ ] Métricas com Prometheus
- [ ] Alertas com Grafana
- [ ] Log aggregation com ELK Stack

### Resiliência
- [ ] Bulkhead pattern para isolamento
- [ ] Timeout pattern para operações longas
- [ ] Cache-aside pattern para dados frequentes
- [ ] Saga pattern para transações distribuídas

### Performance
- [ ] Connection pooling otimizado
- [ ] Índices de banco de dados
- [ ] Cache Redis para dados quentes
- [ ] Compressão de mensagens

### Segurança
- [ ] Autenticação JWT
- [ ] Rate limiting
- [ ] Input sanitization avançada
- [ ] Audit logging
