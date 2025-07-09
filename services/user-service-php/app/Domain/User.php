<?php

namespace App\Domain;

use Ramsey\Uuid\Uuid;
use JsonSerializable;

class User implements JsonSerializable
{
    private string $id;
    private string $uuid;
    private string $name;
    private string $email;

    public function __construct(?string $id = null, string $name, string $email, ?string $uuid = null)
    {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->uuid = $uuid ?? Uuid::uuid4()->toString();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getUuid(): string
    {
        return $this->uuid;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email
        ];
    }
} 