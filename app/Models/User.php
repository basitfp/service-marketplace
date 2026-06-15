<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'phone', 'status', 'profile_photo'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'status' => 'string',
        ];
    }

    public function wallet(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function workerProfile()
    {
        return $this->hasOne(WorkerProfile::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'user_skills');
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'service_worker');
    }

    public function clientOrders()
    {
        return $this->hasMany(Order::class, 'client_id');
    }

    public function workerOrders()
    {
        return $this->hasMany(Order::class, 'worker_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isClient(): bool
    {
        return $this->role === UserRole::Client;
    }

    public function isWorker(): bool
    {
        return $this->role === UserRole::Worker;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
