<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkerRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $this->route('worker')->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'status' => 'required|in:active,inactive',
            'profile_photo' => 'nullable|image|max:2048',
            'bio' => 'nullable|string',
            'experience' => 'nullable|string',
            'notes' => 'nullable|string',
            'joined_date' => 'nullable|date',
            'skill_ids' => 'nullable|array',
            'skill_ids.*' => 'exists:skills,id',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
        ];
    }
}
