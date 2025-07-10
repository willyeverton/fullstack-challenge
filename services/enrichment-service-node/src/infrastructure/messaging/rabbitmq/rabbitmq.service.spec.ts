import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { Channel, Connection } from 'amqplib';

jest.mock('amqplib', () => ({
  connect: jest.fn(),
}));

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let configService: ConfigService;
  let mockChannel: Partial<Channel>;
  let mockConnection: Partial<Connection>;

  const mockConfig = {
    'app.rabbitmq.uri': 'amqp://localhost:5672',
    'app.rabbitmq.queue': 'test.queue',
    'app.rabbitmq.dlx': 'test.dlx',
    'app.rabbitmq.dlq': 'test.dlq',
    'app.rabbitmq.retryDelay': 1000,
    'app.rabbitmq.retryAttempts': 3,
  };

  beforeEach(async () => {
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue(undefined),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      sendToQueue: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (require('amqplib').connect as jest.Mock).mockResolvedValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    service = module.get<RabbitMQService>(RabbitMQService);
    configService = module.get<ConfigService>(ConfigService);

    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize RabbitMQ connection and setup queues', async () => {
    expect(require('amqplib').connect).toHaveBeenCalledWith(mockConfig['app.rabbitmq.uri']);
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(mockConfig['app.rabbitmq.dlx'], 'direct', { durable: true });
    expect(mockChannel.assertQueue).toHaveBeenCalledWith(mockConfig['app.rabbitmq.dlq'], expect.any(Object));
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(mockConfig['app.rabbitmq.dlq'], mockConfig['app.rabbitmq.dlx'], 'dead');
  });

  it('should handle user created event', async () => {
    const testData = {
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };

    await service.handleUserCreated(testData);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      mockConfig['app.rabbitmq.queue'],
      Buffer.from(JSON.stringify(testData)),
      expect.objectContaining({
        persistent: true,
        headers: { retryCount: 0 },
      }),
    );
  });

  it('should retry message with incremented retry count', async () => {
    const testData = {
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };
    const retryCount = 1;

    await service.retryMessage(testData, retryCount);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      `${mockConfig['app.rabbitmq.queue']}.retry.2`,
      Buffer.from(JSON.stringify(testData)),
      expect.objectContaining({
        persistent: true,
        headers: { retryCount: 2 },
      }),
    );
  });

  it('should send message to DLQ when max retries exceeded', async () => {
    const testData = {
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };
    const retryCount = 3;

    await service.retryMessage(testData, retryCount);

    expect(mockChannel.publish).toHaveBeenCalledWith(
      mockConfig['app.rabbitmq.dlx'],
      'dead',
      expect.any(Buffer),
      expect.objectContaining({
        persistent: true,
      }),
    );
  });

  it('should send message to DLQ with error details', async () => {
    const testData = {
      uuid: 'test-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };
    const testError = new Error('Test error');

    await service.sendToDLQ(testData, testError);

    expect(mockChannel.publish).toHaveBeenCalledWith(
      mockConfig['app.rabbitmq.dlx'],
      'dead',
      expect.any(Buffer),
      expect.objectContaining({
        persistent: true,
      }),
    );

    const publishedData = JSON.parse(mockChannel.publish.mock.calls[0][2].toString());
    expect(publishedData).toEqual(expect.objectContaining({
      data: testData,
      error: {
        message: testError.message,
        stack: testError.stack,
      },
      timestamp: expect.any(String),
    }));
  });
}); 