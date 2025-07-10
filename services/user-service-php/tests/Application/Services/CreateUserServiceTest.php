<?php

namespace Tests\Application\Services;

use PHPUnit\Framework\TestCase;
use App\Application\Services\CreateUserService;
use App\Application\Contracts\UserRepositoryInterface;
use App\Application\Contracts\EventPublisherInterface;
use App\Domain\User;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Validation\Validator;
use InvalidArgumentException;
use Mockery;

class CreateUserServiceTest extends TestCase
{
    private $userRepository;
    private $eventPublisher;
    private $validator;
    private $validatorFactory;
    private $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = Mockery::mock(UserRepositoryInterface::class);
        $this->eventPublisher = Mockery::mock(EventPublisherInterface::class);
        $this->validatorFactory = Mockery::mock(ValidationFactory::class);
        $this->validator = Mockery::mock(Validator::class);
        
        $this->service = new CreateUserService(
            $this->userRepository,
            $this->eventPublisher,
            $this->validatorFactory
        );
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
        
        $this->validatorFactory
            ->shouldReceive('make')
            ->once()
            ->with(
                ['name' => $name, 'email' => $email],
                [
                    'name' => 'required|min:3',
                    'email' => 'required|email'
                ]
            )
            ->andReturn($this->validator);
            
        $this->validator
            ->shouldReceive('fails')
            ->once()
            ->andReturn(false);
        
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
        $name = 'Jo';
        $email = 'john@example.com';
        
        $this->validatorFactory
            ->shouldReceive('make')
            ->once()
            ->with(
                ['name' => $name, 'email' => $email],
                [
                    'name' => 'required|min:3',
                    'email' => 'required|email'
                ]
            )
            ->andReturn($this->validator);
            
        $this->validator
            ->shouldReceive('fails')
            ->once()
            ->andReturn(true);
            
        $this->validator
            ->shouldReceive('errors')
            ->once()
            ->andReturn(Mockery::mock(['toArray' => ['name' => ['Name is too short']]]));
        
        $this->expectException(InvalidArgumentException::class);
        
        $this->service->execute($name, $email);
    }

    public function testCreateUserWithInvalidEmailThrowsException()
    {
        $name = 'John Doe';
        $email = 'invalid-email';
        
        $this->validatorFactory
            ->shouldReceive('make')
            ->once()
            ->with(
                ['name' => $name, 'email' => $email],
                [
                    'name' => 'required|min:3',
                    'email' => 'required|email'
                ]
            )
            ->andReturn($this->validator);
            
        $this->validator
            ->shouldReceive('fails')
            ->once()
            ->andReturn(true);
            
        $this->validator
            ->shouldReceive('errors')
            ->once()
            ->andReturn(Mockery::mock(['toArray' => ['email' => ['Invalid email format']]]));
        
        $this->expectException(InvalidArgumentException::class);
        
        $this->service->execute($name, $email);
    }
} 