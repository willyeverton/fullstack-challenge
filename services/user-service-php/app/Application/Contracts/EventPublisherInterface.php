<?php

namespace App\Application\Contracts;

interface EventPublisherInterface
{
    public function publishUserCreated(string $uuid, string $name): void;
} 