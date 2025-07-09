<?php

namespace Tests\Application\Services;

use PHPUnit\Framework\TestCase;
use App\Application\Services\CreateUserService;
use App\Application\Contracts\UserRepositoryInterface;
use App\Application\Contracts\EventPublisherInterface;
use App\Domain\User;
use InvalidArgumentException;
use Mockery;

class CreateUserServiceTest extends TestCase
{
    private $userRepository;
    private $eventPublisher;
    private $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = Mockery::mock(UserRepositoryInterface::class);
        $this->eventPublisher = Mockery::mock(EventPublisherInterface::class);
        $this->service = new CreateUserService($this->userRepository, $this->eventPublisher);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testCreateUserSuccessfully()
    {
        $name = 'John Doe';
        $email = 'john@example.com';
        
        $savedUser = new User('1', $name, $email, 'test-uuid');
        
        $this->userRepository
            ->shouldReceive('save')
            ->once()
            ->andReturn($savedUser);
            
        $this->eventPublisher
            ->shouldReceive('publishUserCreated')
            ->once()
            ->with($savedUser->getUuid(), $savedUser->getName());
        
        $result = $this->service->execute($name, $email);
        
        $this->assertEquals($savedUser, $result);
    }

    public function testCreateUserWithInvalidNameThrowsException()
    {
        $this->expectException(InvalidArgumentException::class);
        
        $this->service->execute('Jo', 'john@example.com');
    }

    public function testCreateUserWithInvalidEmailThrowsException()
    {
        $this->expectException(InvalidArgumentException::class);
        
        $this->service->execute('John Doe', 'invalid-email');
    }
} 