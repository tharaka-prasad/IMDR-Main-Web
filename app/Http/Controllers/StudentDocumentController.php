<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Student;
use App\Models\StudentDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentDocumentController extends Controller
{
    public function store(Request $request, Student $student)
    {
        $data = $request->validate([
            'type' => 'required|in:'.implode(',', array_keys(StudentDocument::TYPES)),
            'title' => 'nullable|string|max:120',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,webp,doc,docx',
        ]);

        [$path, $name, $mime, $size] = Concerns::storeUpload($request->file('file'), 'students/'.$student->id);

        $doc = StudentDocument::create([
            'student_id' => $student->id, 'type' => $data['type'], 'title' => $data['title'] ?? null, 'file_path' => $path,
            'file_name' => $name, 'mime' => $mime, 'size' => $size, 'uploaded_by' => $request->user()->id,
        ]);

        AuditLog::record('document.uploaded', $doc, "{$data['type']} uploaded for {$student->student_no}");

        return back()->with('success', 'Document uploaded.');
    }

    /** Staff (admin / super admin) or the student the document belongs to. */
    public function download(Request $request, StudentDocument $document)
    {
        $user = $request->user();

        $allowed = in_array($user->role, ['super_admin', 'admin'], true)
            || ($user->role === 'student' && $user->student && $user->student->id === $document->student_id);

        abort_unless($allowed, 403, 'You cannot open this document.');
        abort_unless(Storage::disk('local')->exists($document->file_path), 404, 'The file is missing from storage.');

        AuditLog::record('document.opened', $document, "Document {$document->id} opened");

        return response()->download(Storage::disk('local')->path($document->file_path), $document->file_name);
    }

    public function destroy(StudentDocument $document)
    {
        Storage::disk('local')->delete($document->file_path);
        AuditLog::record('document.deleted', $document, "Document {$document->file_name} deleted");
        $document->delete();

        return back()->with('success', 'Document deleted.');
    }
}
