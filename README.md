# Fullstack Integration Challenge

This repository contains the solution for the TOTVS **Especialista em Desenvolvimento Fullstack** technical test.

## Stack Overview

| Component | Technology |
|-----------|------------|
| Front-end | React |
| User Service (Serviço A) | PHP (framework TBD) + PostgreSQL |
| Enrichment Service (Serviço B) | Node.js (framework TBD) + MongoDB |
| Messaging | RabbitMQ |
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
  user-service-php/        # Serviço A
  enrichment-service-node/ # Serviço B
frontend/                  # React app
```

Further documentation and API specs will be added as development progresses.
