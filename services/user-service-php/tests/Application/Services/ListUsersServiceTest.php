<?php

namespace Tests\Application\Services;

use PHPUnit\Framework\TestCase;
use App\Application\Services\ListUsersService;
use App\Application\Contracts\UserRepositoryInterface;
use App\Domain\User;
use Mockery;

class ListUsersServiceTest extends TestCase
{
    private $userRepository;
    private $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = Mockery::mock(UserRepositoryInterface::class);
        $this->service = new ListUsersService($this->userRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testListUsersReturnsAllUsers()
    {
        $users = [
            new User('John Doe', 'john@example.com', '1', 'uuid-1'),
            new User('Jane Doe', 'jane@example.com', '2', 'uuid-2')
        ];
        
        $this->userRepository
            ->shouldReceive('findAll')
            ->once()
            ->andReturn($users);
        
        $result = $this->service->execute();
        
        $this->assertEquals($users, $result);
    }

    public function testListUsersReturnsEmptyArrayWhenNoUsers()
    {
        $this->userRepository
            ->shouldReceive('findAll')
            ->once()
            ->andReturn([]);
        
        $result = $this->service->execute();
        
        $this->assertEquals([], $result);
    }
} 