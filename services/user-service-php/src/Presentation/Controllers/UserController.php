<?php
namespace App\Presentation\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Application\Services\CreateUserService;
use App\Application\Services\ListUsersService;
use App\Application\Services\GetUserService;
use InvalidArgumentException;

class UserController
{
    public function __construct(
        private CreateUserService $createUserService,
        private ListUsersService $listUsersService,
        private GetUserService $getUserService
    ) {}

    public function create(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        try {
            $user = $this->createUserService->execute($data['name'] ?? '', $data['email'] ?? '');
            $payload = json_encode(['id' => $user->id, 'uuid' => $user->uuid, 'name' => $user->name, 'email' => $user->email]);
            $response->getBody()->write($payload);
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (InvalidArgumentException $e) {
            $response->getBody()->write($e->getMessage());
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function list(Request $request, Response $response): Response
    {
        $users = $this->listUsersService->execute();
        $usersData = array_map(fn($user) => ['id' => $user->id, 'uuid' => $user->uuid, 'name' => $user->name, 'email' => $user->email], $users);
        $response->getBody()->write(json_encode($usersData));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function get(Request $request, Response $response, array $args): Response
    {
        $user = $this->getUserService->execute((int)$args['id']);

        if (!$user) {
            return $response->withStatus(404);
        }
        
        $payload = json_encode(['id' => $user->id, 'uuid' => $user->uuid, 'name' => $user->name, 'email' => $user->email]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json');
    }
} 