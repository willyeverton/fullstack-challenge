<?php
namespace App;

use Slim\App;
use App\Presentation\Controllers\UserController;
use App\Infrastructure\Persistence\EloquentUserRepository;
use App\Infrastructure\Messaging\RabbitMQPublisher;
use App\Application\Services\CreateUserService;
use App\Application\Services\ListUsersService;
use App\Application\Services\GetUserService;

class Routes
{
    public static function register(App $app): void
    {
        // Instantiate infrastructure and services
        $repository = new EloquentUserRepository();
        $publisher  = new RabbitMQPublisher();

        $controller = new UserController(
            new CreateUserService($repository, $publisher),
            new ListUsersService($repository),
            new GetUserService($repository)
        );

        // Health check
        $app->get('/health', function ($req, $res) {
            $res->getBody()->write('OK');
            return $res;
        });

        // User routes
        $app->post('/users',  [$controller, 'create']);
        $app->get('/users',   [$controller, 'list']);
        $app->get('/users/{id}', [$controller, 'get']);
    }
}
