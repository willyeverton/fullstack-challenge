# Diagrama de Fluxo de Dados

Este diagrama mostra o fluxo de dados entre os diferentes componentes do sistema, incluindo a criação de usuário e o processo de enriquecimento de dados.

```mermaid
sequenceDiagram
    participant User as "Usuário"
    participant FE as "Frontend React"
    participant US as "User Service (PHP)"
    participant RMQ as "RabbitMQ"
    participant ES as "Enrichment Service (Node.js)"
    participant PG as "PostgreSQL"
    participant MDB as "MongoDB"
    
    %% Fluxo de Criação de Usuário
    User->>FE: Preenche formulário de criação
    FE->>US: POST /users {name, email}
    US->>PG: INSERT INTO users
    PG-->>US: Sucesso (ID, UUID gerado)
    US->>RMQ: Publica mensagem {uuid, name}
    US-->>FE: Resposta 201 Created
    FE-->>User: Feedback de sucesso
    
    %% Processamento Assíncrono
    RMQ->>ES: Consome mensagem
    ES->>ES: Gera dados de perfil social
    ES->>MDB: Salva dados enriquecidos
    
    %% Fluxo de Detalhes do Usuário
    User->>FE: Acessa detalhes do usuário
    FE->>US: GET /users/{uuid}
    US->>PG: SELECT * FROM users
    PG-->>US: Dados do usuário
    US-->>FE: Dados básicos do usuário
    FE->>ES: GET /users/enriched/{uuid}
    
    alt Dados Enriquecidos Disponíveis
        ES->>MDB: Busca dados por UUID
        MDB-->>ES: Dados encontrados
        ES-->>FE: Dados de perfil social
        FE-->>User: Exibe dados completos
    else Dados Ainda em Processamento
        ES-->>FE: 404 Not Found
        FE-->>User: "Dados em processamento"
    end
```

## Descrição dos Fluxos

### Fluxo de Criação de Usuário
1. O usuário preenche o formulário de criação no frontend
2. O frontend envia uma requisição POST para o User Service
3. O User Service valida os dados e insere o usuário no PostgreSQL
4. Após salvar com sucesso, o User Service publica uma mensagem no RabbitMQ
5. O frontend recebe a confirmação e mostra feedback ao usuário

### Processamento Assíncrono
1. O Enrichment Service consome a mensagem do RabbitMQ
2. O serviço gera dados de perfil social (LinkedIn, GitHub)
3. Os dados enriquecidos são salvos no MongoDB

### Fluxo de Detalhes do Usuário
1. O usuário acessa a página de detalhes de um usuário
2. O frontend solicita os dados básicos ao User Service
3. Em seguida, solicita os dados enriquecidos ao Enrichment Service
4. Se os dados enriquecidos estiverem disponíveis, são exibidos
5. Caso contrário, uma mensagem de "Dados em processamento" é mostrada 