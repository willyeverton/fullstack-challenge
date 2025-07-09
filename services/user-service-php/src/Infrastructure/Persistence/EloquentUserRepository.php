<?php
namespace App\Infrastructure\Persistence;

use App\Application\Contracts\UserRepositoryInterface;
use App\Domain\User;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        $eloquentUser = EloquentUser::find($id);
        if (!$eloquentUser) {
            return null;
        }
        return new User($eloquentUser->id, $eloquentUser->name, $eloquentUser->email, $eloquentUser->uuid);
    }

    public function findAll(): array
    {
        return EloquentUser::all()->map(function ($eloquentUser) {
            return new User($eloquentUser->id, $eloquentUser->name, $eloquentUser->email, $eloquentUser->uuid);
        })->all();
    }

    public function save(User $user): User
    {
        $eloquentUser = new EloquentUser();
        $eloquentUser->uuid = $user->uuid;
        $eloquentUser->name = $user->name;
        $eloquentUser->email = $user->email;
        $eloquentUser->save();

        return new User($eloquentUser->id, $eloquentUser->name, $eloquentUser->email, $eloquentUser->uuid);
    }
} 