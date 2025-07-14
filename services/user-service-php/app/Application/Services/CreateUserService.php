<?php

namespace App\Application\Services;

use App\Application\Contracts\UserRepositoryInterface;
use App\Application\Contracts\EventPublisherInterface;
use App\Domain\User;
use InvalidArgumentException;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;

class CreateUserService
{
    private $userRepository;
    private $eventPublisher;
    private $validator;

    public function __construct(
        UserRepositoryInterface $userRepository,
        EventPublisherInterface $eventPublisher,
        ValidationFactory $validator
    ) {
        $this->userRepository = $userRepository;
        $this->eventPublisher = $eventPublisher;
        $this->validator = $validator;
    }

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

        $user = new User($name, $email);
        $createdUser = $this->userRepository->save($user);

        error_log("User saved successfully, publishing event for UUID: " . $createdUser->getUuid());

        try {
            $this->eventPublisher->publishUserCreated(
                $createdUser->getUuid(),
                $createdUser->getName(),
                $createdUser->getEmail()
            );
            error_log("Event published successfully");
        } catch (\Exception $e) {
            error_log("Error publishing event: " . $e->getMessage());
            throw $e;
        }

        return $createdUser;
    }
}
