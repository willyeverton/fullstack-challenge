<?php

namespace App\Application\Contracts;

use App\Domain\User;

interface UserRepositoryInterface
{
    public function save(User $user): User;
    public function findAll(): array;
    public function findByUuid(string $uuid): ?User;
} 