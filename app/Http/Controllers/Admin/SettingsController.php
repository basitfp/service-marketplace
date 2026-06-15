<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->except(['_method', '_token', 'logo', 'favicon']);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('settings', 'public');
            $data['logo'] = Storage::url($path);
        }

        if ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('settings', 'public');
            $data['favicon'] = Storage::url($path);
        }

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? '1' : '0') : $value]
            );

            // Clear the cache for this specific setting
            Cache::forget("setting.{$key}");
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
