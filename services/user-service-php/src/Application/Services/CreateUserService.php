<?php
namespace App\Application\Services;

use App\Application\Contracts\UserRepositoryInterface;
use App\Application\Contracts\EventPublisherInterface;
use App\Domain\User;
use Respect\Validation\Validator as v;
use InvalidArgumentException;

class CreateUserService
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private EventPublisherInterface $eventPublisher
    ) {}

    public function execute(string $name, string $email): User
    {
        $this->validate($name, $email);

        $user = new User(null, $name, $email);
        
        $createdUser = $this->userRepository->save($user);

        $this->eventPublisher->publishUserCreated($createdUser->uuid, $createdUser->name);

        return $createdUser;
    }

    private function validate(string $name, string $email): void
    {
        $errors = [];
        if (!v::stringType()->length(3)->validate($name)) {
            $errors['name'] = 'Name is required, minimum 3 characters.';
        }
        if (!v::email()->validate($email)) {
            $errors['email'] = 'Valid email is required.';
        }
        if (!empty($errors)) {
            throw new InvalidArgumentException(json_encode(['errors' => $errors]));
        }
    }
} 