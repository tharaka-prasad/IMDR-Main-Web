<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use Illuminate\Http\Request;

/** Small "who may see / manage what" helpers shared by the learning controllers. */
class Concerns
{
    /** Batch ids a student is approved in. */
    public static function studentBatchIds(Request $request): array
    {
        $student = $request->user()->student;

        return $student
            ? Enrollment::where('student_id', $student->id)->where('status', 'approved')->pluck('batch_id')->all()
            : [];
    }

    /** [batch_id => [subject_ids]] the logged-in lecturer teaches. */
    public static function lecturerScope(Request $request): array
    {
        $lecturer = $request->user()->lecturer;
        abort_unless($lecturer, 403, 'No lecturer profile is linked to this account.');

        $scope = [];
        foreach (TeachingAssignment::where('lecturer_id', $lecturer->id)->get() as $a) {
            $scope[$a->batch_id][] = $a->subject_id;
        }

        return $scope;
    }

    /** Admins may manage everything. Lecturers only the subject/batch pairs they are assigned to. */
    public static function canTeach(Request $request, int $subjectId, ?int $batchId): bool
    {
        $user = $request->user();

        if (in_array($user->role, ['super_admin', 'admin'], true)) {
            return true;
        }

        if ($user->role !== 'lecturer' || ! $user->lecturer) {
            return false;
        }

        $q = TeachingAssignment::where('lecturer_id', $user->lecturer->id)->where('subject_id', $subjectId);

        if ($batchId) {
            $q->where('batch_id', $batchId);
        }

        return $q->exists();
    }

    /** Subjects / batches offered in forms: everything for admins, only assigned pairs for lecturers. */
    public static function teachable(Request $request): array
    {
        $user = $request->user();

        if ($user->role === 'lecturer') {
            $scope = self::lecturerScope($request);
            $batchIds = array_keys($scope);
            $subjectIds = collect($scope)->flatten()->unique()->values()->all();
            $pairs = collect($scope)->flatMap(fn ($subjects, $b) => collect($subjects)->map(fn ($s) => [$b, $s]))->values()->all();
        } else {
            $batchIds = Batch::pluck('id')->all();
            $subjectIds = Subject::pluck('id')->all();
            $pairs = null;
        }

        return [
            'batches' => Batch::whereIn('id', $batchIds)->orderByDesc('start_date')->get(['id', 'name', 'course_id'])->all(),
            'subjects' => Subject::whereIn('id', $subjectIds)->orderBy('name')->get(['id', 'name', 'course_id'])->all(),
            'pairs' => $pairs, // null = any subject may go with any batch of its course
        ];
    }

    /** Store an uploaded file on the private disk. Returns [path, original name, mime, size]. */
    public static function storeUpload($file, string $folder): array
    {
        return [$file->store($folder, 'local'), $file->getClientOriginalName(), $file->getClientMimeType(), $file->getSize()];
    }
}
