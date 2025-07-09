<?php
namespace App\Domain;

use Ramsey\Uuid\Uuid;

class User
{
    public readonly string $id;
    public readonly string $uuid;

    public function __construct(
        ?string $id,
        public string $name,
        public string $email,
        ?string $uuid = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid ?? Uuid::uuid4()->toString();
    }
} 