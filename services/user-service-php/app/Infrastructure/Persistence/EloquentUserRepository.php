<?php

namespace App\Infrastructure\Persistence;

use App\Application\Contracts\UserRepositoryInterface;
use App\Domain\User;

class EloquentUserRepository implements UserRepositoryInterface
{
    private $model;

    public function __construct(EloquentUser $model)
    {
        $this->model = $model;
    }

    public function save(User $user): User
    {
        return \DB::transaction(function () use ($user) {
        $model = $this->model->newInstance();
        $model->uuid = $user->getUuid();
        $model->name = $user->getName();
        $model->email = $user->getEmail();
        $model->save();

        return new User(
            $model->name,
            $model->email,
            (string) $model->id,
            $model->uuid
        );
        });
    }

    public function findAll(): array
    {
        return $this->model->all()->map(function ($model) {
            return new User(
                $model->name,
                $model->email,
                (string) $model->id,
                $model->uuid
            );
        })->all();
    }

    public function findByUuid(string $uuid): ?User
    {
        $model = $this->model->where('uuid', $uuid)->first();

        if (!$model) {
            return null;
        }

        return new User(
            $model->name,
            $model->email,
            (string) $model->id,
            $model->uuid
        );
    }

    public function findByEmail(string $email): ?User
    {
        $model = $this->model->where('email', $email)->first();

        if (!$model) {
            return null;
        }

        return new User(
            $model->name,
            $model->email,
            (string) $model->id,
            $model->uuid
        );
    }

    private function toEntity(EloquentUser $model): User
    {
        return new User(
            $model->name,
            $model->email,
            $model->id,
            $model->uuid
        );
    }
}
