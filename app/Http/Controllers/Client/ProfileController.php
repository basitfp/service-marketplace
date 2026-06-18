<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user()->load('wallet');

        return Inertia::render('Client/Profile/Index', [
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'profile_photo' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();

        // Update basic fields
        $user->name = $validated['name'];
        $user->phone = $validated['phone'] ?? null;

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            // Store new photo
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo = $path;
        }

        $user->save();

        return redirect()->back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $user = auth()->user();
        $user->password = Hash::make($validated['password']);
        $user->save();

        return redirect()->back()->with('success', 'Password updated.');
    }
}
