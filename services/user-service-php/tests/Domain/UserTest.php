<?php

namespace Tests\Domain;

use PHPUnit\Framework\TestCase;
use App\Domain\User;

class UserTest extends TestCase
{
    public function testCreateUserWithoutId()
    {
        $name = 'John Doe';
        $email = 'john@example.com';
        
        $user = new User(null, $name, $email);
        
        $this->assertNull($user->getId());
        $this->assertNotEmpty($user->getUuid());
        $this->assertEquals($name, $user->getName());
        $this->assertEquals($email, $user->getEmail());
    }

    public function testCreateUserWithExistingData()
    {
        $id = '1';
        $uuid = '123e4567-e89b-12d3-a456-426614174000';
        $name = 'Jane Doe';
        $email = 'jane@example.com';
        
        $user = new User($id, $name, $email, $uuid);
        
        $this->assertEquals($id, $user->getId());
        $this->assertEquals($uuid, $user->getUuid());
        $this->assertEquals($name, $user->getName());
        $this->assertEquals($email, $user->getEmail());
    }

    public function testJsonSerialization()
    {
        $id = '1';
        $uuid = '123e4567-e89b-12d3-a456-426614174000';
        $name = 'John Doe';
        $email = 'john@example.com';
        
        $user = new User($id, $name, $email, $uuid);
        $json = $user->jsonSerialize();
        
        $this->assertEquals([
            'id' => $id,
            'uuid' => $uuid,
            'name' => $name,
            'email' => $email
        ], $json);
    }
} 