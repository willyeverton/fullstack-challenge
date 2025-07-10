<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->group(['prefix' => 'api'], function () use ($router) {
    $router->get('users', ['uses' => 'UserController@index']);
    $router->post('users', ['uses' => 'UserController@store']);
    $router->get('users/{uuid}', ['uses' => 'UserController@show']);
}); 