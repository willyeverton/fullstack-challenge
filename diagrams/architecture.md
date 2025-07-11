# Diagrama de Arquitetura do Sistema

Este diagrama mostra a arquitetura básica do sistema, incluindo os componentes principais e suas interações.

```mermaid
graph TD
    A[Cliente Web] --> B[Frontend React]
    B --> C[API Gateway/Nginx]
    C --> D[User Service PHP/Lumen]
    C --> E[Enrichment Service Node.js/NestJS]
    D --> F[PostgreSQL]
    D --> G[RabbitMQ]
    G --> E
    E --> H[MongoDB]
    
    subgraph "Frontend"
        B
    end
    
    subgraph "API Layer"
        C
    end
    
    subgraph "Microservices"
        D
        E
    end
    
    subgraph "Data Storage"
        F
        H
    end
    
    subgraph "Message Queue"
        G
    end
    
    classDef frontend fill:#f9f,stroke:#333,stroke-width:2px
    classDef api fill:#bbf,stroke:#333,stroke-width:2px
    classDef services fill:#bfb,stroke:#333,stroke-width:2px
    classDef storage fill:#fbb,stroke:#333,stroke-width:2px
    classDef queue fill:#fbf,stroke:#333,stroke-width:2px
    
    class B frontend
    class C api
    class D,E services
    class F,H storage
    class G queue
```

## Descrição dos Componentes

1. **Cliente Web**: Navegador do usuário final
2. **Frontend React**: Aplicação React que fornece a interface de usuário
3. **API Gateway/Nginx**: Proxy reverso que roteia requisições para os serviços apropriados
4. **User Service (PHP/Lumen)**: Serviço responsável pelo gerenciamento de usuários
5. **Enrichment Service (Node.js/NestJS)**: Serviço responsável pelo enriquecimento de dados de usuário
6. **PostgreSQL**: Banco de dados relacional para armazenamento de dados de usuário
7. **RabbitMQ**: Sistema de mensageria para comunicação assíncrona entre serviços
8. **MongoDB**: Banco de dados NoSQL para armazenamento de dados enriquecidos 