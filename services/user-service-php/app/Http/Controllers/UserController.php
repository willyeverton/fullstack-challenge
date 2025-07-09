<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Application\Services\CreateUserService;
use App\Application\Services\ListUsersService;
use App\Application\Services\GetUserService;
use InvalidArgumentException;

class UserController extends BaseController
{
    public function __construct(
        private CreateUserService $createUserService,
        private ListUsersService $listUsersService,
        private GetUserService $getUserService
    ) {}

    public function create(Request $request): JsonResponse
    {
        try {
            $user = $this->createUserService->execute(
                $request->input('name'),
                $request->input('email')
            );
            return new JsonResponse($user, 201);
        } catch (InvalidArgumentException $e) {
            return new JsonResponse(
                json_decode($e->getMessage(), true),
                400
            );
        }
    }

    public function list(): JsonResponse
    {
        $users = $this->listUsersService->execute();
        return new JsonResponse($users);
    }

    public function get(int $id): JsonResponse
    {
        $user = $this->getUserService->execute($id);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], 404);
        }
        return new JsonResponse($user);
    }
} 