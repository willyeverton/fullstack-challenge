#!/bin/bash

# Test System Script - Fullstack Microservices Challenge
# Este script testa todo o fluxo do sistema: criação, listagem e enriquecimento

set -e

echo "🧪 Iniciando testes do sistema..."
echo "=================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "ℹ️  $1"
}

# Verificar se os serviços estão rodando
check_services() {
    log_info "Verificando se os serviços estão rodando..."

    # Verificar User Service
    if curl -f -s http://localhost:8080/health > /dev/null; then
        log_success "User Service está rodando"
    else
        log_error "User Service não está respondendo"
        exit 1
    fi

    # Verificar Enrichment Service
    if curl -f -s http://localhost:3000/health > /dev/null; then
        log_success "Enrichment Service está rodando"
    else
        log_error "Enrichment Service não está respondendo"
        exit 1
    fi

    # Verificar Frontend
    if curl -f -s http://localhost:8000 > /dev/null; then
        log_success "Frontend está rodando"
    else
        log_error "Frontend não está respondendo"
        exit 1
    fi
}

# Teste 1: Criar usuário
test_create_user() {
    log_info "Teste 1: Criando usuário..."

    local response=$(curl -s -X POST http://localhost:8080/api/users \
        -H "Content-Type: application/json" \
        -d '{"name":"João Silva","email":"joao@example.com"}' \
        -w "\n%{http_code}")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "201" ]; then
        log_success "Usuário criado com sucesso"
        echo "$body" | jq '.'

        # Extrair UUID para testes posteriores
        export USER_UUID=$(echo "$body" | jq -r '.uuid')
        log_info "UUID do usuário: $USER_UUID"
    else
        log_error "Falha ao criar usuário. HTTP Code: $http_code"
        echo "$body"
        exit 1
    fi
}

# Teste 2: Listar usuários
test_list_users() {
    log_info "Teste 2: Listando usuários..."

    local response=$(curl -s http://localhost:8080/api/users \
        -w "\n%{http_code}")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        log_success "Lista de usuários obtida com sucesso"
        local user_count=$(echo "$body" | jq 'length')
        log_info "Total de usuários: $user_count"
        echo "$body" | jq '.'
    else
        log_error "Falha ao listar usuários. HTTP Code: $http_code"
        echo "$body"
        exit 1
    fi
}

# Teste 3: Buscar usuário específico
test_get_user() {
    log_info "Teste 3: Buscando usuário específico..."

    if [ -z "$USER_UUID" ]; then
        log_error "UUID do usuário não disponível"
        exit 1
    fi

    local response=$(curl -s http://localhost:8080/api/users/$USER_UUID \
        -w "\n%{http_code}")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        log_success "Usuário encontrado com sucesso"
        echo "$body" | jq '.'
    else
        log_error "Falha ao buscar usuário. HTTP Code: $http_code"
        echo "$body"
        exit 1
    fi
}

# Teste 4: Verificar enriquecimento (com retry)
test_enrichment() {
    log_info "Teste 4: Verificando enriquecimento de dados..."

    if [ -z "$USER_UUID" ]; then
        log_error "UUID do usuário não disponível"
        exit 1
    fi

    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_info "Tentativa $attempt de $max_attempts..."

        local response=$(curl -s http://localhost:3000/users/enriched/$USER_UUID \
            -w "\n%{http_code}")

        local http_code=$(echo "$response" | tail -n1)
        local body=$(echo "$response" | head -n -1)

        if [ "$http_code" = "200" ]; then
            log_success "Dados enriquecidos obtidos com sucesso!"
            echo "$body" | jq '.'
            return 0
        elif [ "$http_code" = "404" ]; then
            log_warning "Dados ainda em processamento... (tentativa $attempt)"
            if [ $attempt -lt $max_attempts ]; then
                sleep 3
            fi
        else
            log_error "Erro inesperado. HTTP Code: $http_code"
            echo "$body"
            exit 1
        fi

        attempt=$((attempt + 1))
    done

    log_error "Timeout: Dados enriquecidos não ficaram disponíveis após $max_attempts tentativas"
    exit 1
}

# Teste 5: Validações de entrada
test_validations() {
    log_info "Teste 5: Testando validações de entrada..."

    # Teste: Nome muito curto
    local response=$(curl -s -X POST http://localhost:8080/api/users \
        -H "Content-Type: application/json" \
        -d '{"name":"Jo","email":"joao@example.com"}' \
        -w "\n%{http_code}")

    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "400" ]; then
        log_success "Validação de nome curto funcionando"
    else
        log_error "Validação de nome curto falhou. HTTP Code: $http_code"
    fi

    # Teste: Email inválido
    response=$(curl -s -X POST http://localhost:8080/api/users \
        -H "Content-Type: application/json" \
        -d '{"name":"João Silva","email":"email-invalido"}' \
        -w "\n%{http_code}")

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "400" ]; then
        log_success "Validação de email inválido funcionando"
    else
        log_error "Validação de email inválido falhou. HTTP Code: $http_code"
    fi
}

# Teste 6: Health checks
test_health_checks() {
    log_info "Teste 6: Verificando health checks..."

    # User Service Health
    local response=$(curl -s http://localhost:8080/health \
        -w "\n%{http_code}")

    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_success "User Service health check OK"
    else
        log_error "User Service health check falhou. HTTP Code: $http_code"
    fi

    # Enrichment Service Health
    response=$(curl -s http://localhost:3000/health \
        -w "\n%{http_code}")

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_success "Enrichment Service health check OK"
    else
        log_error "Enrichment Service health check falhou. HTTP Code: $http_code"
    fi
}

# Executar todos os testes
main() {
    log_info "Iniciando testes do sistema Fullstack Microservices Challenge"
    echo ""

    check_services
    echo ""

    test_create_user
    echo ""

    test_list_users
    echo ""

    test_get_user
    echo ""

    test_enrichment
    echo ""

    test_validations
    echo ""

    test_health_checks
    echo ""

    log_success "🎉 Todos os testes passaram com sucesso!"
    log_info "Sistema funcionando corretamente"
    echo ""
    log_info "URLs dos serviços:"
    log_info "- Frontend: http://localhost:8000"
    log_info "- User Service API: http://localhost:8080/api/users"
    log_info "- Enrichment Service API: http://localhost:3000/users/enriched/{uuid}"
    log_info "- RabbitMQ Management: http://localhost:15672 (guest/guest)"
}

# Verificar se jq está instalado
if ! command -v jq &> /dev/null; then
    log_error "jq não está instalado. Instale com: sudo apt-get install jq"
    exit 1
fi

# Executar testes
main "$@"
