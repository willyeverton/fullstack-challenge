<?php

/** @var \Laravel\Lumen\Routing\Router $router */

// Health check endpoint
$router->get('health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => date('c'),
        'service' => 'user-service',
        'version' => '1.0.0'
    ]);
});

$router->group(['prefix' => 'api'], function () use ($router) {
    $router->get('users', ['uses' => 'UserController@index']);
    $router->post('users', ['uses' => 'UserController@store']);
    $router->get('users/{uuid}', ['uses' => 'UserController@show']);
});
