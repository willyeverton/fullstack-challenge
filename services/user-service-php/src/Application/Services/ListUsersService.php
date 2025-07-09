<?php
namespace App\Application\Services;

use App\Application\Contracts\UserRepositoryInterface;

class ListUsersService
{
    public function __construct(private UserRepositoryInterface $userRepository) {}

    public function execute(): array
    {
        return $this->userRepository->findAll();
    }
} 