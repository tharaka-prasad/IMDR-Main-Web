<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'login' => 'required|string|max:160',
            'password' => 'required|string',
        ]);

        $field = filter_var($data['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (! Auth::attempt([$field => trim($data['login']), 'password' => $data['password']], $request->boolean('remember'))) {
            throw ValidationException::withMessages(['login' => 'Username or password is incorrect.']);
        }

        if (Auth::user()->status === 'suspended') {
            Auth::logout();
            throw ValidationException::withMessages(['login' => 'This account is suspended. Please contact the institute office.']);
        }

        $request->session()->regenerate();
        AuditLog::record('auth.login', Auth::user(), 'Signed in');

        return redirect()->intended('/portal');
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
