<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Application\Contracts\UserRepositoryInterface;
use App\Application\Contracts\EventPublisherInterface;
use App\Infrastructure\Persistence\EloquentUserRepository;
use App\Infrastructure\Messaging\RabbitMQPublisher;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->singleton(EventPublisherInterface::class, RabbitMQPublisher::class);
    }
} 