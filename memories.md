MICROSERVICES PROJECT CONTEXT:
- This is a technical test for Full Stack Microservices integration
- Architecture: React Frontend → PHP Lumen (Service A) → Queue → Node.js NestJS (Service B)
- Database: PostgreSQL/MySQL (Service A) + MongoDB (Service B)
- Queue: RabbitMQ/Kafka/Redis Streams for async communication
- Infrastructure: Docker + Docker Compose for complete setup

ESTABLISHED PATTERNS AND DECISIONS:
- UUID v4 generation pattern for user identification
- Queue message format: JSON with uuid and name fields
- API response format standards across services
- Error handling strategy for distributed systems
- Database schema design decisions
- Docker container naming conventions
- Environment variable naming patterns

CRITICAL REMINDERS:
- ALWAYS check existing implementations before creating new ones
- Service A must publish to queue ONLY after successful database save
- Service B enrichment generates: linkedin.com/in/[username] and github.com/[username]
- Frontend must handle "Data processing" state for enrichment
- All services must be containerized and work with docker-compose up -d
- Maintain consistency between PHP Lumen and Node.js NestJS patterns

ARCHITECTURAL DECISIONS MADE:
- Queue publishing happens after successful database persistence
- Frontend makes sequential calls: Service A first, then Service B
- Error handling includes retry mechanisms and dead-letter queue
- Database migrations approach chosen for Service A
- MongoDB document structure for Service B enrichment data

TECHNICAL CONSTRAINTS TO REMEMBER:
- Name validation: minimum 3 characters
- Email validation: valid format required
- HTTP status codes: 201 for creation, 404 for not found, 400 for validation errors
- Queue message reliability and error handling requirements
- Single command setup requirement: docker-compose up -d

IMPORTANT DECISIONS:
- Chose RabbitMQ over Kafka for simplicity
- Using Eloquent ORM for Service A database operations
- Implemented UUID as separate column, not primary key
- Queue message format: {"uuid": "...", "name": "...", "timestamp": "..."}