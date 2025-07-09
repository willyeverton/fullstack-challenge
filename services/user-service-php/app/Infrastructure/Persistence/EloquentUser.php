<?php

namespace App\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Model;

class EloquentUser extends Model
{
    protected $table = 'users';
    protected $fillable = ['uuid', 'name', 'email'];
    public $timestamps = true;
} 