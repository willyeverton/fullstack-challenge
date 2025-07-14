# Frontend React - Fullstack Microservices Challenge

Interface de usuário para o sistema de microserviços, desenvolvida com React, TypeScript e Vite. Permite criar, listar e visualizar detalhes de usuários com dados enriquecidos.

## 🚀 Tecnologias

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Zod** para validação de formulários
- **Vitest** para testes unitários
- **React Testing Library** para testes de componentes

## 📋 Funcionalidades

- ✅ **Listagem de Usuários**: Exibe todos os usuários cadastrados
- ✅ **Criação de Usuário**: Formulário com validação (nome mínimo 3 chars, email válido)
- ✅ **Detalhes do Usuário**: Exibe dados básicos e enriquecidos (LinkedIn, GitHub)
- ✅ **Feedback de UX**: Loading states, mensagens de erro/sucesso
- ✅ **Tratamento de Estados**: "Data processing" quando enriquecimento ainda não está pronto
- ✅ **Cache Inteligente**: Cache de dados com TTL configurável
- ✅ **Graceful Degradation**: Fallback para dados mock quando APIs estão indisponíveis
- ✅ **Validação Robusta**: Validação client-side com Zod

## 🏗️ Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── services/      # Serviços de API
├── types/         # Tipos TypeScript
├── utils/         # Utilitários (cache, validação, erro)
└── test/          # Configuração de testes
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# API URLs
VITE_API_BASE_URL=/api
VITE_ENRICHMENT_API_URL=/enrichment

# Ambiente
VITE_NODE_ENV=development
```

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup Local

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Docker

```bash
# Build da imagem
docker build -t frontend-react .

# Executar container
docker run -p 8000:80 frontend-react
```

## 📡 Integração com APIs

### User Service (PHP/Lumen)
- **Base URL**: `/api`
- **Endpoints**:
  - `GET /users` - Lista usuários
  - `POST /users` - Cria usuário
  - `GET /users/{uuid}` - Busca usuário por UUID

### Enrichment Service (Node.js/NestJS)
- **Base URL**: `/enrichment`
- **Endpoints**:
  - `GET /users/enriched/{uuid}` - Dados enriquecidos

## 🧪 Testes

```bash
# Executar testes unitários
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes específicos
npm test -- UserCreatePage.test.tsx
```

### Cobertura de Testes
- ✅ Páginas: UserList, UserCreate, UserDetail
- ✅ Componentes: ErrorMessage, SuccessMessage, LoadingSpinner, Layout
- ✅ Serviços: userService, enrichmentService, api
- ✅ Utilitários: validation, cache, errorHandler

## 🎨 Componentes

### Páginas
- **UserListPage**: Lista todos os usuários com navegação para detalhes
- **UserCreatePage**: Formulário de criação com validação e feedback
- **UserDetailPage**: Exibe dados básicos e enriquecidos com retry

### Componentes
- **ErrorMessage**: Exibe mensagens de erro de forma consistente
- **SuccessMessage**: Exibe mensagens de sucesso
- **LoadingSpinner**: Indicador de carregamento
- **Layout**: Layout base da aplicação

## 🔧 Utilitários

### Cache Service
- Cache em memória com TTL configurável
- Invalidação automática e manual
- Suporte a diferentes tipos de dados

### Validation
- Validação com Zod
- Mensagens de erro em português
- Validação de nome (min 3 chars) e email

### Error Handler
- Tratamento centralizado de erros de API
- Conversão de erros HTTP para formato amigável
- Suporte a erros de validação

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
```bash
# Verificar se as APIs estão rodando
curl http://localhost:8080/api/users
curl http://localhost:3000/users/enriched/test-uuid
```

#### 2. Erro de build
```bash
# Limpar cache
npm run clean

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### 3. Testes falhando
```bash
# Limpar cache de testes
npm test -- --clearCache

# Executar testes com debug
npm test -- --verbose
```

## 📊 Performance

### Otimizações Implementadas
- **Code Splitting**: Carregamento lazy de páginas
- **Cache Inteligente**: Reduz requisições desnecessárias
- **Bundle Optimization**: Vite otimiza automaticamente
- **Tree Shaking**: Remove código não utilizado

### Métricas
- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2s

## 🔒 Segurança

- Validação de entrada em todos os formulários
- Sanitização de dados antes de exibição
- Não exposição de informações sensíveis em logs
- Headers de segurança configurados

## 📈 Melhorias Futuras

- [ ] Implementar autenticação JWT
- [ ] Adicionar PWA capabilities
- [ ] Implementar cache offline
- [ ] Adicionar testes E2E com Playwright
- [ ] Implementar lazy loading de imagens
- [ ] Adicionar tema escuro/claro
- [ ] Implementar internacionalização (i18n)
- [ ] Adicionar métricas de performance

## 📄 Licença

Este projeto é parte de um desafio técnico e está disponível para fins educacionais.
