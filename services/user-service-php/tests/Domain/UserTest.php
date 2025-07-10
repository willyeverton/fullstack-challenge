<?php

namespace Tests\Domain;

use App\Domain\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testCreateUserWithoutIdGeneratesUuid()
    {
        $name = 'John Doe';
        $email = 'john@example.com';
        $user = new User($name, $email);

        $this->assertNull($user->getId());
        $this->assertNotEmpty($user->getUuid());
        $this->assertEquals($name, $user->getName());
        $this->assertEquals($email, $user->getEmail());
    }

    public function testCreateUserWithAllParameters()
    {
        $id = '1';
        $name = 'John Doe';
        $email = 'john@example.com';
        $uuid = 'test-uuid';
        $user = new User($name, $email, $id, $uuid);

        $this->assertEquals($id, $user->getId());
        $this->assertEquals($uuid, $user->getUuid());
        $this->assertEquals($name, $user->getName());
        $this->assertEquals($email, $user->getEmail());
    }

    public function testJsonSerialize()
    {
        $id = '1';
        $name = 'John Doe';
        $email = 'john@example.com';
        $uuid = 'test-uuid';
        $user = new User($name, $email, $id, $uuid);

        $expected = [
            'id' => $id,
            'uuid' => $uuid,
            'name' => $name,
            'email' => $email
        ];

        $this->assertEquals($expected, $user->jsonSerialize());
    }
} 