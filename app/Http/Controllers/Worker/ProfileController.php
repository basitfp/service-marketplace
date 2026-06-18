<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\WorkerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load(['workerProfile', 'skills', 'services']);

        $allSkills = Skill::all(['id', 'name']);

        return Inertia::render('Worker/Profile/Index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'profile_photo' => $user->profile_photo,
                'bio' => $user->workerProfile->bio ?? null,
                'experience' => $user->workerProfile->experience ?? null,
                'skills' => $user->skills->pluck('id'),
                'services' => $user->services->map(fn($service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                ]),
            ],
            'all_skills' => $allSkills,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:2000',
            'experience' => 'nullable|string|max:2000',
            'skill_ids' => 'nullable|array',
            'skill_ids.*' => 'exists:skills,id',
            'profile_photo' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();

        // Update user basic info
        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo) {
                Storage::delete($user->profile_photo);
            }

            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->update(['profile_photo' => $path]);
        }

        // Update or create worker profile
        WorkerProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => $request->bio,
                'experience' => $request->experience,
            ]
        );

        // Sync skills
        $user->skills()->sync($request->skill_ids ?? []);

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = auth()->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password updated.');
    }
}
