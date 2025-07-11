# Fullstack Microservices Challenge

Este repositório contém uma solução completa para um sistema distribuído com registro de usuários e enriquecimento de perfil, utilizando arquitetura de microsserviços e comunicação assíncrona.

## Visão Geral da Arquitetura

O sistema é composto por três componentes principais que se comunicam de forma assíncrona:

![Arquitetura do Sistema](diagrams/architecture.md)

| Componente | Tecnologia | Descrição |
|-----------|------------|-----------|
| Frontend | React | Interface de usuário com telas de listagem, criação e detalhes de usuários |
| User Service (Serviço A) | PHP (Lumen) + PostgreSQL | Serviço responsável pelo cadastro e consulta de usuários |
| Enrichment Service (Serviço B) | Node.js (NestJS) + MongoDB | Serviço responsável pelo enriquecimento de dados de perfil |
| Mensageria | RabbitMQ com DLX/DLQ | Comunicação assíncrona entre os serviços |
| Containerização | Docker & Docker Compose | Ambiente de execução isolado e portável |

Para entender melhor o fluxo de dados entre os serviços, consulte o [diagrama de fluxo de dados](diagrams/data-flow.md).

## Início Rápido

### Pré-requisitos

- Docker e Docker Compose
- Git

### Instalação e Execução

```bash
# Clonar o repositório
git clone <repo-url>
cd fullstack-challenge

# Configurar variáveis de ambiente (opcional)
cp env.example .env   # ajuste as credenciais se necessário

# Iniciar todos os serviços
docker-compose up -d --build
```

### Acessando os Serviços

Após a inicialização, você pode acessar:

* **Frontend React**: http://localhost:8000
* **API do User Service**: http://localhost:8080/api
* **API do Enrichment Service**: http://localhost:3000/users/enriched
* **Interface do RabbitMQ**: http://localhost:15672 (usuário: guest, senha: guest)
* **Health Check do Enrichment Service**: http://localhost:3000/health

## Estrutura do Projeto

```
frontend/                     # Aplicação React
  ├── src/                    # Código fonte
  │   ├── components/         # Componentes reutilizáveis
  │   ├── pages/              # Páginas da aplicação
  │   ├── services/           # Serviços de API
  │   └── types/              # Definições de tipos TypeScript
  └── Dockerfile              # Configuração de build e deploy

services/
  ├── user-service-php/       # Serviço de Usuários (PHP/Lumen)
  │   ├── app/                
  │   │   ├── Domain/         # Entidades e regras de negócio
  │   │   ├── Application/    # Casos de uso e contratos
  │   │   │   ├── Contracts/  # Interfaces
  │   │   │   └── Services/   # Implementações de serviços
  │   │   ├── Infrastructure/ # Implementações técnicas
  │   │   │   ├── Persistence/ # Persistência de dados
  │   │   │   └── Messaging/   # Comunicação com RabbitMQ
  │   │   └── Http/          # Camada de apresentação
  │   │       └── Controllers/ # Controladores REST
  │   ├── database/          # Migrações e seeders
  │   └── tests/            # Testes unitários e de integração
  │
  └── enrichment-service-node/ # Serviço de Enriquecimento (Node.js/NestJS)
      ├── src/
      │   ├── domain/        # Entidades e portas
      │   ├── application/   # Casos de uso
      │   ├── infrastructure/ # Adaptadores (MongoDB, RabbitMQ)
      │   └── presentation/  # Controladores REST
      └── test/             # Testes unitários e E2E

tests/
  └── integration/          # Testes de integração entre serviços

docs/                      # Documentação adicional
  └── architecture.md      # Detalhes da arquitetura de produção

diagrams/                  # Diagramas da arquitetura
  ├── architecture.md      # Diagrama de arquitetura básica
  ├── data-flow.md         # Diagrama de fluxo de dados
  └── production-architecture.md # Diagrama de arquitetura de produção
```

## Arquitetura Detalhada

### Princípios Arquiteturais

Os serviços seguem os princípios SOLID e padrões de Clean Architecture:

- **Camada de Domínio**: Lógica de negócio e entidades centrais
- **Camada de Aplicação**: Casos de uso e contratos de interface
- **Camada de Infraestrutura**: Implementações técnicas (banco de dados, mensageria)
- **Camada de Apresentação**: Controladores e endpoints da API

### Fluxo de Mensagens

1. O User Service publica eventos para o RabbitMQ após a criação de um usuário
2. O Enrichment Service consome as mensagens e processa o enriquecimento de dados
3. Os dados enriquecidos são armazenados no MongoDB
4. O Frontend consulta ambos os serviços para exibir informações completas

### Estratégia de Retry e Dead Letter Queue

O sistema implementa uma estratégia robusta para lidar com falhas:

1. **Tentativas de Processamento**: Quando o Enrichment Service falha ao processar uma mensagem, ela é rejeitada (nack)
2. **Dead Letter Exchange (DLX)**: As mensagens rejeitadas são encaminhadas para uma exchange específica
3. **Dead Letter Queue (DLQ)**: As mensagens são armazenadas em uma fila de mensagens mortas
4. **Retry com Backoff**: O serviço tenta reprocessar as mensagens com intervalos crescentes
5. **Limite de Tentativas**: Após um número configurável de tentativas, a mensagem é registrada para análise manual

## APIs

### User Service (PHP/Lumen)

#### POST /api/users
- **Descrição**: Cria um novo usuário
- **Corpo**: `{ "name": "string", "email": "string" }`
- **Resposta**: `201 Created` com dados do usuário criado incluindo UUID

#### GET /api/users
- **Descrição**: Lista todos os usuários
- **Resposta**: `200 OK` com array de usuários

#### GET /api/users/{uuid}
- **Descrição**: Obtém um usuário específico pelo UUID
- **Resposta**: `200 OK` com dados do usuário ou `404 Not Found`

### Enrichment Service (Node.js/NestJS)

#### GET /users/enriched/{uuid}
- **Descrição**: Obtém os dados enriquecidos de um usuário
- **Resposta**: `200 OK` com dados de perfil social ou `404 Not Found`

#### GET /health
- **Descrição**: Endpoint de health check
- **Resposta**: `200 OK` com status do serviço

## Documentação de API

A documentação completa das APIs está disponível nos seguintes formatos:

- **User Service API**: [OpenAPI Specification](services/user-service-php/openapi.yaml)
- **Enrichment Service API**: [OpenAPI Specification](services/enrichment-service-node/openapi.yaml)

## Testes

### Testes Unitários

Cada serviço possui testes unitários para validar componentes individuais:

```bash
# Executar testes do User Service
cd services/user-service-php
./vendor/bin/phpunit

# Executar testes do Enrichment Service
cd services/enrichment-service-node
npm test

# Executar testes do Frontend
cd frontend
npm test
```

### Testes de Integração

Os testes de integração validam o fluxo completo entre os serviços:

```bash
cd tests/integration
./run-tests.sh
```

## CI/CD Pipeline

O projeto inclui um pipeline de CI/CD configurado com GitHub Actions que automatiza:

1. **Lint e Testes**: Executa linting e testes unitários para cada serviço
2. **Testes de Integração**: Executa testes de integração entre os serviços
3. **Build de Imagens Docker**: Constrói e publica imagens Docker para cada serviço
4. **Deploy**: Prepara o ambiente para deploy em produção

O arquivo de configuração está disponível em [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml).

## Melhorias Implementadas

### Validação e Tratamento de Erros
- Validação robusta no frontend usando Zod
- Tratamento de erros centralizado
- Padronização de respostas de erro em todas as APIs

### Performance
- Estratégia de cache no frontend para reduzir requisições
- Otimização de carregamento de dados

### Documentação
- Documentação de API com OpenAPI/Swagger
- Diagramas de arquitetura e fluxo de dados

## Melhorias Futuras

### Segurança
- Implementar autenticação JWT ou OAuth 2.0
- Adicionar middleware de segurança para prevenção de ataques (CSRF, XSS)
- Implementar rate limiting nas APIs

### Observabilidade
- Adicionar ELK Stack ou Prometheus/Grafana para monitoramento
- Implementar logging estruturado em todos os serviços
- Adicionar tracing distribuído com Jaeger ou Zipkin

### Testes
- Aumentar cobertura de testes no frontend e backend
- Adicionar testes e2e com Cypress ou Playwright

### Cache Distribuído
- Adicionar Redis para cache de dados frequentemente acessados

## Arquitetura de Produção

Para detalhes sobre a arquitetura de produção recomendada, incluindo escalabilidade, alta disponibilidade, segurança e observabilidade, consulte [docs/architecture.md](docs/architecture.md) e [diagrams/production-architecture.md](diagrams/production-architecture.md).

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
