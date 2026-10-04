<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings', [
            'settings' => Setting::allWithDefaults(),
            'gateway' => config('imdr.payments.gateway'),
            'whatsappDriver' => config('imdr.whatsapp.driver'),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'institute_name' => 'nullable|string|max:200',
            'institute_phone' => 'nullable|string|max:40',
            'institute_email' => 'nullable|email|max:160',
            'institute_address' => 'nullable|string|max:500',
            'registration_fee_mandatory' => 'required|in:0,1',
            'certificate_requires_clearance' => 'required|in:0,1',
            'min_attendance_percent' => 'required|numeric|between:0,100',
            'payment_grace_days' => 'required|integer|between:0,60',
            'whatsapp_receipts_enabled' => 'required|in:0,1',
        ]);

        foreach ($data as $key => $value) {
            Setting::put($key, $value ?? '');
        }

        AuditLog::record('settings.updated', null, 'System settings updated', $data);

        return back()->with('success', 'Settings saved.');
    }
}
