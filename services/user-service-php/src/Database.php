<?php
namespace App;

use Illuminate\Database\Capsule\Manager as Capsule;

class Database
{
    public static function connect(): void
    {
        $capsule = new Capsule();
        $capsule->addConnection([
            'driver'   => 'pgsql',
            'host'     => getenv('DB_HOST') ?: 'localhost',
            'port'     => getenv('DB_PORT') ?: 5432,
            'database' => getenv('DB_DATABASE') ?: 'users',
            'username' => getenv('DB_USERNAME') ?: 'user',
            'password' => getenv('DB_PASSWORD') ?: 'password',
            'charset'  => 'utf8',
            'prefix'   => '',
            'schema'   => 'public',
        ]);
        $capsule->setAsGlobal();
        $capsule->bootEloquent();
    }
}
