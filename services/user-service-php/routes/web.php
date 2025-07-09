<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->group(['prefix' => 'api'], function () use ($router) {
    $router->get('users', 'UserController@list');
    $router->get('users/{id}', 'UserController@get');
    $router->post('users', 'UserController@create');
}); 