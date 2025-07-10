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
        $uuid = 'test-uuid-123';
        $user = new User('John Doe', 'john@example.com', '1', $uuid);
        
        $this->userRepository
            ->shouldReceive('findByUuid')
            ->once()
            ->with($uuid)
            ->andReturn($user);
        
        $result = $this->service->execute($uuid);
        
        $this->assertEquals($user, $result);
    }

    public function testGetUserReturnsNullWhenNotFound()
    {
        $uuid = 'non-existent-uuid';
        
        $this->userRepository
            ->shouldReceive('findByUuid')
            ->once()
            ->with($uuid)
            ->andReturn(null);
        
        $result = $this->service->execute($uuid);
        
        $this->assertNull($result);
    }
} 