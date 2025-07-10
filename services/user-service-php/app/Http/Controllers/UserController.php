<?php

namespace App\Http\Controllers;

use App\Application\Services\CreateUserService;
use App\Application\Services\GetUserService;
use App\Application\Services\ListUsersService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Laravel\Lumen\Routing\Controller as BaseController;

class UserController extends BaseController
{
    private $createUserService;
    private $getUserService;
    private $listUsersService;

    public function __construct(
        CreateUserService $createUserService,
        GetUserService $getUserService,
        ListUsersService $listUsersService
    ) {
        $this->createUserService = $createUserService;
        $this->getUserService = $getUserService;
        $this->listUsersService = $listUsersService;
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $user = $this->createUserService->execute(
                $request->input('name'),
                $request->input('email')
            );

            return new JsonResponse($user, 201);
        } catch (InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    public function index(): JsonResponse
    {
        $users = $this->listUsersService->execute();
        return new JsonResponse($users);
    }

    public function show(string $uuid): JsonResponse
    {
        $user = $this->getUserService->execute($uuid);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        return new JsonResponse($user);
    }
} 