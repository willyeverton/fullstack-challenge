# 🏭 ESTRATÉGIAS DE PRODUÇÃO PARA MICROSERVIÇOS

## 🔍 **PROBLEMA RAIZ: POR QUE ACONTECE?**

### **1. Ordem de Inicialização dos Containers**
```yaml
# PROBLEMA: Containers iniciam em paralelo
services:
  app:
    depends_on:
      - rabbitmq
      - postgres
      - mongodb
  # Mas mesmo com depends_on, o serviço pode não estar "pronto"
```

### **2. Diferença entre "Running" e "Ready"**
- **Running**: Container iniciou
- **Ready**: Serviço está aceitando conexões e funcionando

### **3. Tempo de Warm-up dos Serviços**
| Serviço | Tempo de Warm-up | Por que demora? |
|---------|------------------|------------------|
| **RabbitMQ** | 10-30s | Inicialização de plugins, criação de exchanges/queues |
| **PostgreSQL** | 5-15s | Recuperação de WAL, inicialização de conexões |
| **MongoDB** | 3-10s | Recuperação de journal, inicialização de índices |
| **Redis** | 1-5s | Carregamento de RDB/AOF |
| **Kafka** | 15-45s | Inicialização de brokers, eleição de líder |

## 🎯 **ESTRATÉGIAS PROFISSIONAIS DE PRODUÇÃO**

### **1. HEALTH CHECKS ROBUSTOS**

#### **Docker Compose com Health Checks:**
```yaml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3-management
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  postgres:
    image: postgres:13
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  app:
    depends_on:
      rabbitmq:
        condition: service_healthy
      postgres:
        condition: service_healthy
```

#### **Health Check Customizado para RabbitMQ:**
```bash
#!/bin/bash
# health-check-rabbitmq.sh
curl -f -u guest:guest http://localhost:15672/api/overview || exit 1
```

### **2. PATTERN: CIRCUIT BREAKER**

#### **Implementação com NestJS:**
```typescript
import { Injectable } from '@nestjs/common';
import { CircuitBreaker } from 'opossum';

@Injectable()
export class RabbitMQService {
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker(this.connectToRabbitMQ, {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    });

    this.circuitBreaker.on('open', () => {
      console.log('🔴 Circuit Breaker: OPEN - RabbitMQ não disponível');
    });

    this.circuitBreaker.on('halfOpen', () => {
      console.log('🟡 Circuit Breaker: HALF-OPEN - Testando reconexão');
    });

    this.circuitBreaker.on('close', () => {
      console.log('🟢 Circuit Breaker: CLOSE - RabbitMQ disponível');
    });
  }

  async connect(): Promise<void> {
    return this.circuitBreaker.fire();
  }
}
```

### **3. PATTERN: RETRY WITH EXPONENTIAL BACKOFF**

#### **Implementação Profissional:**
```typescript
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

class RetryStrategy {
  private config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = config;
  }

  async execute<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.config.maxAttempts) {
          throw new Error(`${context} failed after ${attempt} attempts: ${error.message}`);
        }

        const delay = this.calculateDelay(attempt);
        console.log(`⏳ ${context} failed (attempt ${attempt}/${this.config.maxAttempts}), retrying in ${Math.round(delay/1000)}s...`);

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number): number {
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);

    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5); // ±50% jitter
    }

    return Math.min(delay, this.config.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### **4. PATTERN: SIDECAR PROXY**

#### **Implementação com Envoy Proxy:**
```yaml
# docker-compose.yml
services:
  app:
    image: my-app
    depends_on:
      - app-sidecar

  app-sidecar:
    image: envoyproxy/envoy
    volumes:
      - ./envoy.yaml:/etc/envoy/envoy.yaml
    ports:
      - "8080:8080"
```

```yaml
# envoy.yaml
static_resources:
  listeners:
  - name: listener_0
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 8080
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: ingress_http
          route_config:
            name: local_route
            virtual_hosts:
            - name: local_service
              domains: ["*"]
              routes:
              - match:
                  prefix: "/"
                route:
                  cluster: app_service
                  retry_policy:
                    retry_on: connect-failure,refused-stream,unavailable
                    num_retries: 3
                    per_try_timeout: 5s
                    retry_back_off:
                      base_interval: 1s
                      max_interval: 10s
```

### **5. PATTERN: SERVICE MESH (ISTIO)**

#### **Implementação com Istio:**
```yaml
# virtual-service.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: rabbitmq-vs
spec:
  hosts:
  - rabbitmq
  http:
  - route:
    - destination:
        host: rabbitmq
        port:
          number: 5672
    retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: connect-failure,refused-stream,unavailable
```

### **6. PATTERN: SAGAS PARA RESILIÊNCIA**

#### **Implementação de Saga Pattern:**
```typescript
interface SagaStep {
  name: string;
  execute: () => Promise<void>;
  compensate: () => Promise<void>;
}

class SagaOrchestrator {
  private steps: SagaStep[] = [];
  private executedSteps: SagaStep[] = [];

  addStep(step: SagaStep): void {
    this.steps.push(step);
  }

  async execute(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.executedSteps.push(step);
      } catch (error) {
        console.error(`❌ Step ${step.name} failed:`, error);
        await this.compensate();
        throw error;
      }
    }
  }

  private async compensate(): Promise<void> {
    for (const step of this.executedSteps.reverse()) {
      try {
        await step.compensate();
      } catch (error) {
        console.error(`❌ Compensation for ${step.name} failed:`, error);
      }
    }
  }
}
```

## 🏗️ **ARQUITETURAS DE PRODUÇÃO**

### **1. ARQUITETURA COM SERVICE MESH**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Service Mesh  │
│   (React)       │───▶│   (Kong/Nginx)  │───▶│   (Istio/Linkerd)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐            │
                       │   Load Balancer │◀───────────┘
                       │   (HAProxy)     │
                       └─────────────────┘
                                 │
                       ┌─────────────────┐
                       │   Health Check  │
                       │   (Consul)      │
                       └─────────────────┘
```

### **2. ARQUITETURA COM EVENT SOURCING**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Command   │───▶│   Event     │───▶│   Event     │
│   Service   │    │   Store     │    │   Handlers  │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                    │
                          ▼                    ▼
                   ┌─────────────┐    ┌─────────────┐
                   │   Read      │    │   Projection│
                   │   Models    │    │   Service   │
                   └─────────────┘    └─────────────┘
```

### **3. ARQUITETURA COM CQRS**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Command   │───▶│   Event     │───▶│   Query     │
│   Side      │    │   Bus       │    │   Side      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Write     │    │   Event     │    │   Read      │
│   Database  │    │   Store     │    │   Database  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔧 **FERRAMENTAS DE PRODUÇÃO**

### **1. MONITORAMENTO E OBSERVABILIDADE**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['rabbitmq:15692']
    metrics_path: /metrics

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:9187']
    metrics_path: /metrics
```

### **2. LOGGING CENTRALIZADO**
```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0

  kibana:
    image: docker.elastic.co/kibana/kibana:7.17.0

  filebeat:
    image: docker.elastic.co/beats/filebeat:7.17.0
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
```

### **3. TRACING DISTRIBUÍDO**
```typescript
// Jaeger tracing
import { trace, context } from '@opentelemetry/api';

const tracer = trace.getTracer('enrichment-service');

async function processMessage(message: any) {
  const span = tracer.startSpan('process_message');

  try {
    await context.with(trace.setSpan(context.active(), span), async () => {
      // Processamento da mensagem
    });
  } finally {
    span.end();
  }
}
```

## 📊 **MÉTRICAS DE PRODUÇÃO**

### **1. SLI/SLO DEFINITIONS**
```yaml
# slo.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: enrichment-service
spec:
  endpoints:
  - port: metrics
    interval: 30s
  selector:
    matchLabels:
      app: enrichment-service
```

### **2. ALERTING RULES**
```yaml
# alerts.yaml
groups:
- name: enrichment-service
  rules:
  - alert: HighErrorRate
    expr: rate(enrichment_errors_total[5m]) > 0.1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High error rate in enrichment service"
```

## 🚀 **DEPLOYMENT STRATEGIES**

### **1. BLUE-GREEN DEPLOYMENT**
```yaml
# kubernetes-blue-green.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enrichment-service-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: enrichment-service
      version: blue
  template:
    metadata:
      labels:
        app: enrichment-service
        version: blue
```

### **2. CANARY DEPLOYMENT**
```yaml
# istio-canary.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: enrichment-service
spec:
  hosts:
  - enrichment-service
  http:
  - route:
    - destination:
        host: enrichment-service
        subset: stable
      weight: 90
    - destination:
        host: enrichment-service
        subset: canary
      weight: 10
```

## 🎯 **MELHORES PRÁTICAS FINAIS**

### **1. DESIGN FOR FAILURE**
- ✅ Sempre assuma que dependências podem falhar
- ✅ Implemente circuit breakers
- ✅ Use retry com exponential backoff
- ✅ Implemente graceful degradation

### **2. MONITORAMENTO COMPREENSIVO**
- ✅ Métricas de negócio (SLI/SLO)
- ✅ Métricas de infraestrutura
- ✅ Logs estruturados
- ✅ Distributed tracing

### **3. AUTOMAÇÃO DE DEPLOYMENT**
- ✅ CI/CD pipelines
- ✅ Infrastructure as Code
- ✅ Automated testing
- ✅ Rollback strategies

### **4. SEGURANÇA**
- ✅ Service-to-service authentication
- ✅ Encryption in transit and at rest
- ✅ Secrets management
- ✅ Network policies

---

*Esta documentação fornece uma base sólida para implementar microserviços resilientes em produção.*
