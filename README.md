# 🏭 Fullstack Microservices Challenge

Um sistema distribuído completo com frontend React, backend PHP (User Service), backend Node.js (Enrichment Service) e comunicação assíncrona via RabbitMQ.

## 🏗️ Arquitetura

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

## 🚀 Tecnologias

### Frontend
- **React** com TypeScript
- **Vite** para build e desenvolvimento
- **Axios** para requisições HTTP
- **Vitest** para testes

### User Service (PHP/Lumen)
- **Lumen Framework** (micro-framework Laravel)
- **PostgreSQL** como banco relacional
- **UUID v4** para identificadores únicos
- **RabbitMQ** para publicação de mensagens

### Enrichment Service (Node.js/NestJS)
- **NestJS** com TypeScript
- **MongoDB** como banco não-relacional
- **RabbitMQ** para consumo de mensagens
- **Circuit Breaker** com opossum
- **Retry Strategy** com exponential backoff

### Infraestrutura
- **Docker** e **Docker Compose**
- **Health Checks** para todos os serviços
- **Graceful Degradation** implementado

## 🏭 Funcionalidades de Produção

### Resilience Patterns
- ✅ **Circuit Breaker**: Proteção contra falhas em cascata
- ✅ **Retry com Exponential Backoff**: Reconexão inteligente
- ✅ **Health Checks**: Monitoramento de saúde dos serviços
- ✅ **Graceful Degradation**: Sistema continua funcionando mesmo com falhas
- ✅ **Dead Letter Queue**: Tratamento de mensagens com falha

### Observability
- ✅ **Health Endpoints**: `/health` em todos os serviços
- ✅ **Circuit Breaker Stats**: `/health/circuit-breakers`
- ✅ **Structured Logging**: Logs organizados e informativos
- ✅ **Error Handling**: Tratamento robusto de erros

## 🚀 Setup Rápido

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- PHP 8.1+ (para desenvolvimento local)

### Iniciar o Sistema
```bash
# Clone o repositório
git clone <repository-url>
cd fullstack-challenge

# Iniciar todos os serviços
docker-compose up -d

# Aguardar inicialização (2-3 minutos)
sleep 180

# Testar o sistema
./test-system.sh
```

### URLs dos Serviços
- **Frontend**: http://localhost:8000
- **User Service API**: http://localhost:8080/api/users
- **Enrichment Service API**: http://localhost:3000/users/enriched/{uuid}
- **Health Checks**:
  - http://localhost:8080/health
  - http://localhost:3000/health
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📋 API Endpoints

### User Service (PHP/Lumen)

#### POST /api/users
Cria um novo usuário e publica mensagem no RabbitMQ.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com"
}
```

**Response (201):**
```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### GET /api/users
Lista todos os usuários.

**Response (200):**
```json
[
  {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com"
  }
]
```

#### GET /api/users/{id}
Retorna um usuário específico.

**Response (200):**
```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com"
}
```

### Enrichment Service (Node.js/NestJS)

#### GET /users/enriched/{uuid}
Retorna dados enriquecidos do usuário.

**Response (200):**
```json
{
  "linkedin": "linkedin.com/in/joao-silva",
  "github": "github.com/joao-silva"
}
```

#### GET /health
Health check do serviço.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

#### GET /health/circuit-breakers
Estatísticas dos circuit breakers.

**Response (200):**
```json
{
  "rabbitmq-connection": {
    "name": "rabbitmq-connection",
    "state": "CLOSED",
    "stats": {
      "successes": 10,
      "failures": 0,
      "fallbacks": 0,
      "timeouts": 0,
      "rejects": 0
    }
  }
}
```

## 🧪 Testes

### Teste Automatizado
```bash
# Executar teste completo do sistema
./test-system.sh
```

### Testes Manuais
```bash
# Testar criação de usuário
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Listar usuários
curl http://localhost:8080/api/users

# Testar enriquecimento (substitua {uuid} pelo UUID real)
curl http://localhost:3000/users/enriched/{uuid}
```

## 🏗️ Estrutura do Projeto

```
fullstack-challenge/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── services/          # Serviços de API
│   │   └── types/             # Tipos TypeScript
│   └── package.json
├── services/
│   ├── user-service-php/       # Serviço PHP/Lumen
│   │   ├── app/
│   │   │   ├── Application/   # Camada de aplicação
│   │   │   ├── Domain/        # Entidades de domínio
│   │   │   ├── Infrastructure/ # Implementações
│   │   │   └── Http/          # Controllers
│   │   └── composer.json
│   └── enrichment-service-node/ # Serviço Node.js/NestJS
│       ├── src/
│       │   ├── application/   # Casos de uso
│       │   ├── domain/        # Entidades e interfaces
│       │   ├── infrastructure/ # Implementações
│       │   │   ├── resilience/ # Circuit breaker e retry
│       │   │   └── messaging/  # RabbitMQ
│       │   └── presentation/  # Controllers
│       └── package.json
├── docker-compose.yml          # Orquestração dos serviços
├── test-system.sh             # Script de teste
└── README.md
```

## 🔧 Configuração de Produção

### Variáveis de Ambiente

#### User Service (.env)
```env
APP_DEBUG=false
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=user_service
DB_USERNAME=postgres
DB_PASSWORD=password

RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_QUEUE=user.created
```

#### Enrichment Service (.env)
```env
NODE_ENV=production
PORT=3000

RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
RABBITMQ_QUEUE=user.created
RABBITMQ_DLX=user.created.dlx
RABBITMQ_DLQ=user.created.dlq
RABBITMQ_RETRY_ATTEMPTS=3

MONGODB_URI=mongodb://mongodb:27017/enrichment

# Circuit Breaker
CIRCUIT_BREAKER_TIMEOUT=3000
CIRCUIT_BREAKER_ERROR_THRESHOLD=50
CIRCUIT_BREAKER_RESET_TIMEOUT=30000

# Retry Strategy
RETRY_MAX_ATTEMPTS=5
RETRY_BASE_DELAY=1000
RETRY_MAX_DELAY=30000
RETRY_BACKOFF_MULTIPLIER=2
RETRY_JITTER=true
```

### Health Checks
Todos os serviços incluem health checks configurados no Docker Compose:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🚀 Deploy em Produção

### 1. Preparação
```bash
# Build das imagens
docker-compose build

# Verificar configurações
docker-compose config
```

### 2. Deploy
```bash
# Deploy com health checks
docker-compose up -d

# Verificar status
docker-compose ps
```

### 3. Monitoramento
```bash
# Ver logs
docker-compose logs -f

# Verificar health checks
docker-compose ps
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. RabbitMQ não conecta
```bash
# Verificar se RabbitMQ está rodando
docker-compose ps rabbitmq

# Verificar logs
docker-compose logs rabbitmq

# O sistema implementa retry automático
```

#### 2. Enrichment Service não processa mensagens
```bash
# Verificar health check
curl http://localhost:3000/health

# Verificar circuit breaker stats
curl http://localhost:3000/health/circuit-breakers

# Verificar logs
docker-compose logs enrichment-service-node
```

#### 3. Frontend não carrega
```bash
# Verificar se frontend está rodando
docker-compose ps frontend

# Verificar logs
docker-compose logs frontend
```

## 📈 Melhorias Futuras

- [ ] Implementar autenticação JWT
- [ ] Adicionar rate limiting
- [ ] Implementar cache Redis
- [ ] Adicionar métricas Prometheus
- [ ] Implementar tracing distribuído
- [ ] Adicionar testes de integração
- [ ] Implementar CI/CD pipeline
- [ ] Adicionar documentação OpenAPI/Swagger

## 📄 Licença

Este projeto é parte de um desafio técnico e está disponível para fins educacionais.

---

**Desenvolvido com Clean Architecture, Domain-Driven Design e padrões de resiliência para produção.**
