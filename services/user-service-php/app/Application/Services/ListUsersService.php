<?php

namespace App\Application\Services;

use App\Application\Contracts\UserRepositoryInterface;

class ListUsersService
{
    private $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function execute(): array
    {
        return $this->userRepository->findAll();
    }
} 