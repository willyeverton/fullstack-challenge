<?php
require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use App\Routes;
use App\Database;

$app = AppFactory::create();

// Add middleware for JSON parsing, error handling etc.
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

Database::connect();

Routes::register($app);

$app->run();
