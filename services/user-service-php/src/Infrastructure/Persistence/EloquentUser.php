<?php
namespace App\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Model;

class EloquentUser extends Model
{
    protected $table = 'users';
    public $timestamps = true;
    protected $fillable = ['uuid', 'name', 'email'];
} 