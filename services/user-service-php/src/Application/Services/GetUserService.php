<?php
namespace App\Application\Services;

use App\Application\Contracts\UserRepositoryInterface;
use App\Domain\User;

class GetUserService
{
    public function __construct(private UserRepositoryInterface $userRepository) {}

    public function execute(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }
} 