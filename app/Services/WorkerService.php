<?php

namespace App\Services;

use App\Models\User;
use App\Models\WorkerProfile;
use App\Enums\UserRole;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Mail\WorkerWelcomeMail;

class WorkerService
{
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $password = $data['password'] ?? Str::random(10);
            
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($password),
                'role' => UserRole::Worker->value,
                'status' => $data['status'] ?? 'active'
            ]);

            if (isset($data['profile_photo']) && $data['profile_photo'] instanceof \Illuminate\Http\UploadedFile) {
                $user->profile_photo = $data['profile_photo']->store('profile-photos', 'public');
                $user->save();
            }

            $user->wallet()->create(['balance' => 0]);

            $user->workerProfile()->create([
                'bio' => $data['bio'] ?? null,
                'experience' => $data['experience'] ?? null,
                'status' => 'active',
                'notes' => $data['notes'] ?? null,
                'joined_date' => $data['joined_date'] ?? now()->toDateString(),
            ]);

            if (isset($data['skill_ids'])) {
                $user->skills()->sync($data['skill_ids']);
            }

            if (isset($data['service_ids'])) {
                $user->services()->sync($data['service_ids']);
            }

            try {
                Mail::to($user->email)->send(new WorkerWelcomeMail($user, $password));
            } catch (\Exception $e) {
                // Ignore mail failure locally
            }

            return $user;
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            if (isset($data['profile_photo']) && $data['profile_photo'] instanceof \Illuminate\Http\UploadedFile) {
                if ($user->profile_photo) {
                    Storage::disk('public')->delete($user->profile_photo);
                }
                $data['profile_photo'] = $data['profile_photo']->store('profile-photos', 'public');
            }

            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            if (empty($data['email']) || $data['email'] === $user->email) {
                unset($data['email']);
            }

            $user->update($data);

            if ($user->workerProfile) {
                $user->workerProfile->update([
                    'bio' => $data['bio'] ?? $user->workerProfile->bio,
                    'experience' => $data['experience'] ?? $user->workerProfile->experience,
                    'notes' => $data['notes'] ?? $user->workerProfile->notes,
                    'joined_date' => $data['joined_date'] ?? $user->workerProfile->joined_date,
                ]);
            }

            if (isset($data['skill_ids'])) {
                $user->skills()->sync($data['skill_ids']);
            }

            if (isset($data['service_ids'])) {
                $user->services()->sync($data['service_ids']);
            }

            return $user;
        });
    }

    public function toggleStatus(User $user): User
    {
        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();
        return $user;
    }
}
