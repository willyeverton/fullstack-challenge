import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UserCreatedConsumer } from './user-created.consumer';
import { IMessageHandler } from '../../../domain/ports/message-handler.interface';
import { IEnrichmentService } from '../../../domain/ports/enrichment-service.interface';
import { INJECTION_TOKENS } from '../../../domain/constants/injection-tokens';
import { Channel, Connection, ConsumeMessage } from 'amqplib';

jest.mock('amqplib', () => ({
  connect: jest.fn(),
}));

describe('UserCreatedConsumer', () => {
  let consumer: UserCreatedConsumer;
  let mockMessageHandler: jest.Mocked<IMessageHandler>;
  let mockEnrichmentService: jest.Mocked<IEnrichmentService>;
  let mockChannel: Partial<Channel>;
  let mockConnection: Partial<Connection>;

  const mockConfig = {
    'app.rabbitmq.uri': 'amqp://localhost:5672',
    'app.rabbitmq.queue': 'test.queue',
  };

  const createMockMessage = (data: any, retryCount = 0): ConsumeMessage => ({
    content: Buffer.from(JSON.stringify(data)),
    fields: {
      deliveryTag: 1,
      redelivered: false,
      exchange: '',
      routingKey: '',
    },
    properties: {
      headers: { retryCount },
    },
  } as ConsumeMessage);

  beforeEach(async () => {
    mockMessageHandler = {
      handleUserCreated: jest.fn(),
      retryMessage: jest.fn(),
      sendToDLQ: jest.fn(),
    };

    mockEnrichmentService = {
      enrichUser: jest.fn(),
    };

    mockChannel = {
      prefetch: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockImplementation((queue, callback) => {
        // Armazena o callback para uso nos testes
        (mockChannel as any).messageCallback = callback;
        return Promise.resolve();
      }),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (require('amqplib').connect as jest.Mock).mockResolvedValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCreatedConsumer,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
        {
          provide: INJECTION_TOKENS.SERVICES.MESSAGE_HANDLER,
          useValue: mockMessageHandler,
        },
        {
          provide: INJECTION_TOKENS.SERVICES.ENRICHMENT,
          useValue: mockEnrichmentService,
        },
      ],
    }).compile();

    consumer = module.get<UserCreatedConsumer>(UserCreatedConsumer);
    await consumer.onModuleInit();
  });

  afterEach(async () => {
    await consumer.onModuleDestroy();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should initialize RabbitMQ connection and setup consumer', async () => {
    expect(require('amqplib').connect).toHaveBeenCalledWith(mockConfig['app.rabbitmq.uri']);
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.prefetch).toHaveBeenCalledWith(1);
    expect(mockChannel.consume).toHaveBeenCalledWith(
      mockConfig['app.rabbitmq.queue'],
      expect.any(Function),
    );
  });

  it('should successfully process a valid message', async () => {
    const testData = {
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };
    const message = createMockMessage(testData);

    await (mockChannel as any).messageCallback(message);

    expect(mockEnrichmentService.enrichUser).toHaveBeenCalledWith(
      testData.uuid,
      {
        name: testData.name,
        email: testData.email,
      },
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(message);
  });

  it('should retry message on enrichment failure', async () => {
    const testData = {
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };
    const message = createMockMessage(testData, 1);
    const error = new Error('Enrichment failed');

    mockEnrichmentService.enrichUser.mockRejectedValueOnce(error);

    await (mockChannel as any).messageCallback(message);

    expect(mockChannel.nack).toHaveBeenCalledWith(message, false, false);
    expect(mockMessageHandler.retryMessage).toHaveBeenCalledWith(testData, 1);
  });

  it('should send to DLQ on invalid message format', async () => {
    const invalidMessage = createMockMessage('invalid json');

    await (mockChannel as any).messageCallback(invalidMessage);

    expect(mockChannel.nack).toHaveBeenCalledWith(invalidMessage, false, false);
    expect(mockMessageHandler.sendToDLQ).toHaveBeenCalled();
  });

  it('should handle null message gracefully', async () => {
    await (mockChannel as any).messageCallback(null);

    expect(mockChannel.ack).not.toHaveBeenCalled();
    expect(mockChannel.nack).not.toHaveBeenCalled();
    expect(mockEnrichmentService.enrichUser).not.toHaveBeenCalled();
  });
}); 