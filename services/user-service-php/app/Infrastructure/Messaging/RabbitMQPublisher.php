<?php

namespace App\Infrastructure\Messaging;

use App\Application\Contracts\EventPublisherInterface;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQPublisher implements EventPublisherInterface
{
    private function connection(): AMQPStreamConnection
    {
        $url = env('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672');
        $parsed = parse_url($url);
        return new AMQPStreamConnection(
            $parsed['host'] ?? 'rabbitmq',
            $parsed['port'] ?? 5672,
            $parsed['user'] ?? 'guest',
            $parsed['pass'] ?? 'guest'
        );
    }

    public function publishUserCreated(string $uuid, string $name, string $email): void
    {
        try {
            error_log("Publishing user created event: UUID=$uuid, Name=$name, Email=$email");

            $connection = $this->connection();
            $channel = $connection->channel();

            $queue = 'user.created';
            $channel->queue_declare($queue, false, true, false, false);

            $payload = json_encode([
                'uuid' => $uuid,
                'name' => $name,
                'email' => $email,
                'timestamp' => date('c')
            ]);
            $message = new AMQPMessage($payload, ['content_type' => 'application/json']);
            $channel->basic_publish($message, '', $queue);

            error_log("Message published successfully to queue: $queue");

            $channel->close();
            $connection->close();
        } catch (\Exception $e) {
            error_log("Error publishing message to RabbitMQ: " . $e->getMessage());
            throw $e;
        }
    }
}
