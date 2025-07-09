<?php

namespace App\Application\Contracts;

use App\Domain\User;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findAll(): array;
    public function save(User $user): User;
} 