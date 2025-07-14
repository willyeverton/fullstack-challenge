import axios from 'axios';
import { MongoClient } from 'mongodb';
import * as amqp from 'amqplib';

// Configuração dos serviços
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://nginx-user-test:80/api';
const ENRICHMENT_SERVICE_URL = process.env.ENRICHMENT_SERVICE_URL || 'http://enrichment-service-test:3001';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq-test:5672';
const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE || 'user.created.test';

// Timeout mais longo para os testes de integração
jest.setTimeout(30000);

describe('User Enrichment Flow Integration Tests', () => {
  let mongoClient: MongoClient;
  let connection: any;
  let channel: amqp.Channel;

  // Conectar ao MongoDB e RabbitMQ antes dos testes
  beforeAll(async () => {
    // Conectar ao MongoDB
    mongoClient = new MongoClient('mongodb://mongodb-test:27017');
    await mongoClient.connect();

    // Conectar ao RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });
  });

  // Fechar conexões após os testes
  afterAll(async () => {
    if (mongoClient) await mongoClient.close();
    if (channel) await channel.close();
    if (connection) await connection.close();
  });

  it('should create a user and verify enrichment data', async () => {
    // 1. Criar um novo usuário via User Service
    const uniqueEmail = `test+${Date.now()}@example.com`;
    const userData = {
      name: 'Test User',
      email: uniqueEmail
    };

    const createResponse = await axios.post(`${USER_SERVICE_URL}/users`, userData);
    expect(createResponse.status).toBe(201);
    expect(createResponse.data).toHaveProperty('uuid');
    expect(createResponse.data.name).toBe(userData.name);
    expect(createResponse.data.email).toBe(userData.email);

    const userUuid = createResponse.data.uuid;
    console.log(`User created with UUID: ${userUuid}`);

    // 2. Esperar pelo processamento assíncrono (pode levar alguns segundos)
    const waitForEnrichment = async (retries = 10, delay = 1000): Promise<any> => {
      if (retries <= 0) {
        throw new Error('Enrichment data not available after maximum retries');
      }

      try {
        const enrichmentResponse = await axios.get(`${ENRICHMENT_SERVICE_URL}/users/enriched/${userUuid}`);
        return enrichmentResponse.data;
      } catch (error) {
        console.log(`Waiting for enrichment data... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return waitForEnrichment(retries - 1, delay);
      }
    };

    // 3. Verificar se os dados de enriquecimento foram criados
    const enrichedData = await waitForEnrichment();
    expect(enrichedData).toBeDefined();
    expect(enrichedData).toHaveProperty('linkedin');
    expect(enrichedData).toHaveProperty('github');
    expect(enrichedData.linkedin).toContain('linkedin.com/in/');
    expect(enrichedData.github).toContain('github.com/');

    // 4. Verificar se os dados foram armazenados no MongoDB
    const db = mongoClient.db('enrichment_test');
    const collection = db.collection('enriched_users');
    const storedData = await collection.findOne({ uuid: userUuid });

    expect(storedData).toBeDefined();
    expect(storedData?.uuid).toBe(userUuid);
    expect(storedData?.linkedin).toBe(enrichedData.linkedin);
    expect(storedData?.github).toBe(enrichedData.github);

    // 5. Verificar se o usuário pode ser recuperado pelo User Service
    const getUserResponse = await axios.get(`${USER_SERVICE_URL}/users/${userUuid}`);
    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.data.uuid).toBe(userUuid);
  });

  it('should handle invalid user creation data', async () => {
    // Teste de validação - nome muito curto
    const invalidUserData = {
      name: 'Te',  // Nome muito curto (mínimo é 3 caracteres)
      email: 'test@example.com'
    };

    try {
      await axios.post(`${USER_SERVICE_URL}/users`, invalidUserData);
      fail('Should have thrown an error for invalid data');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }

    // Teste de validação - email inválido
    const invalidEmailData = {
      name: 'Test User',
      email: 'invalid-email'  // Email inválido
    };

    try {
      await axios.post(`${USER_SERVICE_URL}/users`, invalidEmailData);
      fail('Should have thrown an error for invalid email');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should return 404 for non-existent user', async () => {
    const nonExistentUuid = '00000000-0000-0000-0000-000000000000';

    try {
      await axios.get(`${USER_SERVICE_URL}/users/${nonExistentUuid}`);
      fail('Should have thrown an error for non-existent user');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }

    try {
      await axios.get(`${ENRICHMENT_SERVICE_URL}/users/enriched/${nonExistentUuid}`);
      fail('Should have thrown an error for non-existent enriched data');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
