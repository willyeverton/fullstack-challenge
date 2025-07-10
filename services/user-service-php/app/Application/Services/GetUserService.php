<?php

namespace App\Application\Services;

use App\Application\Contracts\UserRepositoryInterface;
use App\Domain\User;

class GetUserService
{
    private $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function execute(string $uuid): ?User
    {
        return $this->userRepository->findByUuid($uuid);
    }
} 