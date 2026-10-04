<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Profile', [
            'account' => $user->only(['name', 'username', 'email', 'phone', 'role']),
            'student' => $user->student ? $user->student->only(['student_no', 'whatsapp_number']) : null,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => ['nullable', 'email', 'max:160', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:30',
            'whatsapp_number' => 'nullable|string|max:30',
        ]);

        $user->update(collect($data)->only(['name', 'email', 'phone'])->all());

        if ($user->student && array_key_exists('whatsapp_number', $data)) {
            $user->student->update(['whatsapp_number' => $data['whatsapp_number']]);
        }

        return back()->with('success', 'Profile saved.');
    }

    public function password(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($data['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages(['current_password' => 'Your current password is incorrect.']);
        }

        $request->user()->update(['password' => $data['password']]);
        AuditLog::record('auth.password_changed', $request->user(), 'Password changed');

        return back()->with('success', 'Password changed.');
    }
}
