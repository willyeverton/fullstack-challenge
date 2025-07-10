<?php

namespace App\Application\Services;

use App\Application\Contracts\UserRepositoryInterface;
use App\Application\Contracts\EventPublisherInterface;
use App\Domain\User;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use InvalidArgumentException;

class CreateUserService
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private EventPublisherInterface $eventPublisher,
        private ValidationFactory $validator
    ) {}

    public function execute(string $name, string $email): User
    {
        $validator = $this->validator->make(
            ['name' => $name, 'email' => $email],
            [
                'name' => 'required|min:3',
                'email' => 'required|email'
            ]
        );

        if ($validator->fails()) {
            throw new InvalidArgumentException(
                json_encode(['errors' => $validator->errors()->toArray()])
            );
        }

        $user = new User(null, $name, $email);
        $createdUser = $this->userRepository->save($user);
        $this->eventPublisher->publishUserCreated($createdUser->getUuid(), $createdUser->getName());

        return $createdUser;
    }
} 