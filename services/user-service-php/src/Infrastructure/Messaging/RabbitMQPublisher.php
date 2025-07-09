<?php
namespace App\Infrastructure\Messaging;

use App\Application\Contracts\EventPublisherInterface;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQPublisher implements EventPublisherInterface
{
    private function connection(): AMQPStreamConnection
    {
        $url = getenv('RABBITMQ_URL') ?: 'amqp://guest:guest@rabbitmq:5672';
        $parsed = parse_url($url);
        return new AMQPStreamConnection(
            $parsed['host'] ?? 'rabbitmq',
            $parsed['port'] ?? 5672,
            $parsed['user'] ?? 'guest',
            $parsed['pass'] ?? 'guest'
        );
    }

    public function publishUserCreated(string $uuid, string $name): void
    {
        $connection = $this->connection();
        $channel = $connection->channel();

        $exchange = 'user.created';
        $channel->exchange_declare($exchange, 'fanout', false, true, false);

        $payload = json_encode(['uuid' => $uuid, 'name' => $name]);
        $message = new AMQPMessage($payload, ['content_type' => 'application/json']);
        $channel->basic_publish($message, $exchange);

        $channel->close();
        $connection->close();
    }
} 