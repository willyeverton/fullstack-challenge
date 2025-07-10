<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Application\Contracts\UserRepositoryInterface;
use App\Application\Contracts\EventPublisherInterface;
use App\Infrastructure\Persistence\EloquentUserRepository;
use App\Infrastructure\Messaging\RabbitMQPublisher;
use Illuminate\Contracts\Validation\Factory;
use Illuminate\Validation\Factory as ValidationFactory;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->singleton(EventPublisherInterface::class, RabbitMQPublisher::class);
        
        // Register validation factory if not bound
        if (!$this->app->bound(Factory::class)) {
            $this->app->singleton(Factory::class, function ($app) {
                return new ValidationFactory($app['translator'], $app);
            });
        }
    }
} 