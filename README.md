# Fullstack Integration Challenge

This repository contains the solution for the TOTVS **Especialista em Desenvolvimento Fullstack** technical test.

## Stack Overview

| Component | Technology |
|-----------|------------|
| Front-end | React |
| User Service (Serviço A) | PHP (Lumen) + PostgreSQL |
| Enrichment Service (Serviço B) | Node.js (framework TBD) + MongoDB |
| Messaging | RabbitMQ with DLX/DLQ |
| Containerisation | Docker & Docker Compose |

## Quick Start

```bash
git clone <repo-url>
cd fullstack-challenge
cp env.example .env   # adjust credentials if needed
docker-compose up -d --build
```

Then access:

* React front-end: http://localhost:3000
* User Service API: http://localhost:8080
* Enrichment Service API: http://localhost:8081
* RabbitMQ UI: http://localhost:15672 (guest/guest)

## Project Structure

```
services/
  user-service-php/        # User Service (Lumen)
    ├── app/              
    │   ├── Domain/       # Domain entities and business rules
    │   ├── Application/  # Use cases and contracts
    │   │   ├── Contracts/
    │   │   └── Services/
    │   ├── Infrastructure/ # Technical implementations
    │   │   ├── Persistence/
    │   │   └── Messaging/
    │   └── Http/        # User interface layer
    │       └── Controllers/
    ├── database/        # Migrations and seeders
    └── tests/          # Unit and integration tests
  enrichment-service-node/ # Enrichment Service
frontend/                  # React app
```

## Architecture

The services follow SOLID principles and clean architecture patterns:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and interface contracts
- **Infrastructure Layer**: Technical implementations (database, messaging)
- **Presentation Layer**: Controllers and API endpoints

### Message Flow

1. User Service publishes events to RabbitMQ fanout exchange
2. Messages use DLX (Dead Letter Exchange) for error handling
3. Failed messages are routed to DLQ (Dead Letter Queue) for retry

Further documentation and API specs will be added as development progresses.
