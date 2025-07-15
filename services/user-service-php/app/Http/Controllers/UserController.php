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
            $errorData = json_decode($e->getMessage(), true);

            // Se a mensagem contém erros de validação estruturados
            if (is_array($errorData) && isset($errorData['errors'])) {
                // Verificar se é erro de e-mail duplicado
                if (isset($errorData['errors']['email']) &&
                    in_array('The email has already been taken.', $errorData['errors']['email'])) {
                    return new JsonResponse($errorData, 422);
                }
                return new JsonResponse($errorData, 400);
            }

            // Fallback para mensagens simples
            return new JsonResponse(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            // Log do erro para debugging
            error_log("Unexpected error in UserController::store: " . $e->getMessage());
            return new JsonResponse(['error' => 'Internal server error'], 500);
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
