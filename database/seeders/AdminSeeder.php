<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin->value,
                'status' => 'active',
            ]
        );

        $admin->wallet()->firstOrCreate(
            ['user_id' => $admin->id],
            ['balance' => 0]
        );
    }
}
