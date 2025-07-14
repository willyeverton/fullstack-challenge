# User Service (PHP/Lumen)

Serviço responsável pelo gerenciamento de usuários, incluindo criação, listagem e consulta de dados básicos. Implementa comunicação assíncrona via RabbitMQ para notificar o serviço de enriquecimento.

## 🏗️ Arquitetura

O serviço segue os princípios da Clean Architecture:

```
app/
├── Application/     # Casos de uso e serviços
├── Domain/         # Entidades e regras de negócio
├── Infrastructure/ # Implementações de adaptadores
├── Http/           # Controllers e middlewares
└── Providers/      # Configuração de dependências
```

## 🚀 Tecnologias

- **PHP 8.1+**
- **Lumen Framework** (micro-framework Laravel)
- **PostgreSQL** como banco relacional
- **RabbitMQ** para mensageria
- **UUID v4** para identificadores únicos
- **Eloquent ORM** para persistência

## 📋 Funcionalidades

- ✅ Criação de usuários com validação
- ✅ Listagem de todos os usuários
- ✅ Consulta de usuário por UUID
- ✅ Geração automática de UUID v4
- ✅ Publicação de eventos na fila RabbitMQ
- ✅ Validação de entrada (nome mínimo 3 chars, email válido)
- ✅ Tratamento robusto de erros
- ✅ Health checks

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Application
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:your-app-key-here
APP_TIMEZONE=UTC
APP_LOCALE=en

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=users
DB_USERNAME=postgres
DB_PASSWORD=postgres

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_QUEUE=user.created

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

## 🚀 Instalação

### Pré-requisitos
- PHP 8.1+
- Composer
- PostgreSQL
- RabbitMQ

### Setup Local

```bash
# Instalar dependências
composer install

# Copiar arquivo de ambiente
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate

# Executar migrações
php artisan migrate

# Iniciar servidor
php -S localhost:8000 -t public
```

### Docker

```bash
# Build da imagem
docker build -t user-service-php .

# Executar container
docker run -p 8080:8000 user-service-php
```

## 📡 API Endpoints

### POST /api/users
Cria um novo usuário e publica evento na fila.

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

**Validações:**
- `name`: Obrigatório, mínimo 3 caracteres
- `email`: Obrigatório, formato válido

### GET /api/users
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

### GET /api/users/{uuid}
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

**Response (404):**
```json
{
  "error": "User not found"
}
```

### GET /health
Health check do serviço.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🧪 Testes

```bash
# Executar testes unitários
./vendor/bin/phpunit

# Executar testes com cobertura
./vendor/bin/phpunit --coverage-html coverage

# Executar testes específicos
./vendor/bin/phpunit --filter CreateUserServiceTest
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Erro de conexão com PostgreSQL
```bash
# Verificar se o banco está rodando
docker-compose ps postgres

# Verificar logs
docker-compose logs postgres

# Testar conexão
php artisan tinker
DB::connection()->getPdo();
```

#### 2. Erro de conexão com RabbitMQ
```bash
# Verificar se RabbitMQ está rodando
docker-compose ps rabbitmq

# Verificar logs
docker-compose logs rabbitmq

# Testar conexão
php artisan tinker
app('App\Application\Contracts\EventPublisherInterface')->publishUserCreated('test', 'test');
```

#### 3. Erro de migração
```bash
# Resetar migrações
php artisan migrate:reset

# Executar migrações novamente
php artisan migrate

# Verificar status
php artisan migrate:status
```

#### 4. Erro de permissão de storage
```bash
# Ajustar permissões
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

## 📊 Monitoramento

### Logs
Os logs são armazenados em `storage/logs/` e incluem:
- Criação de usuários
- Publicação de eventos
- Erros de validação
- Erros de conexão

### Health Checks
O serviço expõe endpoint `/health` para monitoramento de saúde.

## 🔒 Segurança

- Validação de entrada em todos os endpoints
- Sanitização de dados
- Logs de auditoria para operações críticas
- Tratamento seguro de erros (não expõe informações sensíveis)

## 📈 Melhorias Futuras

- [ ] Implementar autenticação JWT
- [ ] Adicionar rate limiting
- [ ] Implementar cache Redis
- [ ] Adicionar métricas Prometheus
- [ ] Implementar tracing distribuído
- [ ] Adicionar testes de integração
- [ ] Implementar soft deletes
- [ ] Adicionar paginação na listagem

## 📄 Licença

Este projeto é parte de um desafio técnico e está disponível para fins educacionais.
