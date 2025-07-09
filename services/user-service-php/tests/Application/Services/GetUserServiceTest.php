<?php

namespace Tests\Application\Services;

use PHPUnit\Framework\TestCase;
use App\Application\Services\GetUserService;
use App\Application\Contracts\UserRepositoryInterface;
use App\Domain\User;
use Mockery;

class GetUserServiceTest extends TestCase
{
    private $userRepository;
    private $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = Mockery::mock(UserRepositoryInterface::class);
        $this->service = new GetUserService($this->userRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testGetUserReturnsUserWhenFound()
    {
        $id = 1;
        $user = new User('1', 'John Doe', 'john@example.com', 'test-uuid');
        
        $this->userRepository
            ->shouldReceive('findById')
            ->once()
            ->with($id)
            ->andReturn($user);
        
        $result = $this->service->execute($id);
        
        $this->assertEquals($user, $result);
    }

    public function testGetUserReturnsNullWhenNotFound()
    {
        $id = 999;
        
        $this->userRepository
            ->shouldReceive('findById')
            ->once()
            ->with($id)
            ->andReturn(null);
        
        $result = $this->service->execute($id);
        
        $this->assertNull($result);
    }
} 