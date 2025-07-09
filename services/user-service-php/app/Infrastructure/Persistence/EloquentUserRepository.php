<?php

namespace App\Infrastructure\Persistence;

use App\Application\Contracts\UserRepositoryInterface;
use App\Domain\User;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        $model = EloquentUser::find($id);
        if (!$model) {
            return null;
        }

        return new User(
            (string) $model->id,
            $model->name,
            $model->email,
            $model->uuid
        );
    }

    public function findAll(): array
    {
        return EloquentUser::all()->map(function ($model) {
            return new User(
                (string) $model->id,
                $model->name,
                $model->email,
                $model->uuid
            );
        })->all();
    }

    public function save(User $user): User
    {
        $model = new EloquentUser();
        $model->uuid = $user->getUuid();
        $model->name = $user->getName();
        $model->email = $user->getEmail();
        $model->save();

        return new User(
            (string) $model->id,
            $model->name,
            $model->email,
            $model->uuid
        );
    }
} 