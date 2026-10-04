<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StudentService
{
    /**
     * Creates the login (username + password) and the student profile with a student ID (IMDR-2026-0001).
     * If no password is given one is generated; if no username is given it is built from the student ID.
     *
     * @return array{0: Student, 1: User, 2: string} student, user, plain password (show it once, it is not stored in plain text)
     */
    public function create(array $account, array $profile, string $status = 'active'): array
    {
        return DB::transaction(function () use ($account, $profile, $status) {
            $password = ! empty($account['password']) ? $account['password'] : Str::random(8);

            $user = User::create([
                'name' => $account['name'],
                'username' => ! empty($account['username']) ? $account['username'] : 'tmp-'.Str::lower(Str::random(14)),
                'email' => $account['email'] ?? null,
                'phone' => $account['phone'] ?? null,
                'password' => $password,
                'role' => 'student',
                'status' => $status,
            ]);

            $student = Student::create(['user_id' => $user->id] + $profile);
            $student->update(['student_no' => 'IMDR-'.date('Y').'-'.str_pad((string) $student->id, 4, '0', STR_PAD_LEFT)]);

            if (empty($account['username'])) {
                $user->update(['username' => strtolower(str_replace('-', '', $student->student_no))]);
            }

            return [$student->fresh(), $user->fresh(), $password];
        });
    }
}
