<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\StudentDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentAdminTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Storage::fake('local');
    }

    public function test_admin_registers_a_student_with_login_details_and_documents(): void
    {
        $batch = $this->makeBatch();
        $admin = $this->makeStaff('admin', 'office');

        $response = $this->actingAs($admin)->post('/portal/students', [
            'name' => 'Nadeesha Perera', 'username' => 'nadeesha', 'password' => 'pass12345', 'phone' => '0771234567',
            'whatsapp_number' => '0771234567', 'nic' => '200512345678', 'date_of_birth' => '2005-01-02', 'batch_id' => $batch->id, 'approve_now' => true,
            'birth_certificate' => UploadedFile::fake()->create('birth.pdf', 100, 'application/pdf'),
            'result_sheet' => UploadedFile::fake()->create('results.pdf', 100, 'application/pdf'),
        ]);

        $student = Student::firstOrFail();
        $response->assertRedirect("/portal/students/{$student->id}");

        $this->assertMatchesRegularExpression('/^IMDR-\d{4}-0001$/', $student->student_no);
        $this->assertTrue(User::where('username', 'nadeesha')->exists());
        $this->assertEqualsCanonicalizing(['birth_certificate', 'result_sheet'], StudentDocument::pluck('type')->all());
        $this->assertSame('approved', $student->enrollments()->first()->status);
        $this->assertGreaterThan(0, $student->invoices()->count());
    }

    public function test_student_can_log_in_with_the_username_the_admin_created(): void
    {
        $batch = $this->makeBatch();
        $this->makeStudent($batch, 'kasun');

        $this->post('/login', ['login' => 'kasun', 'password' => 'secret123'])->assertRedirect('/portal');
        $this->assertAuthenticated();
    }

    public function test_wrong_password_is_rejected_and_suspended_accounts_cannot_sign_in(): void
    {
        [, $user] = $this->makeStudent($this->makeBatch(), 'kasun');

        $this->post('/login', ['login' => 'kasun', 'password' => 'nope'])->assertSessionHasErrors('login');

        $user->update(['status' => 'suspended']);
        $this->post('/login', ['login' => 'kasun', 'password' => 'secret123'])->assertSessionHasErrors('login');
        $this->assertGuest();
    }

    public function test_student_search_finds_by_name_id_nic_and_phone(): void
    {
        $batch = $this->makeBatch();
        [$student] = $this->makeStudent($batch, 'kasun', '0771234567');
        $student->update(['nic' => '200512345678']);
        $this->makeStudent($batch, 'other', '0700000000', true, 'Other Person');
        $admin = $this->makeStaff('admin', 'office');

        foreach (['Kasun', $student->student_no, '200512345678', '0771234567'] as $term) {
            $this->actingAs($admin)->get('/portal/students?search='.urlencode($term))
                ->assertInertia(fn (Assert $page) => $page->component('Students/Index')->has('students.data', 1, fn ($row) => $row->where('username', 'kasun')->etc())->etc());
        }
    }

    public function test_documents_are_private_only_staff_and_the_owner_can_download(): void
    {
        $batch = $this->makeBatch();
        [$student, $owner] = $this->makeStudent($batch, 'kasun');
        [, $stranger] = $this->makeStudent($batch, 'other', '0700000000', true, 'Other Person');
        $admin = $this->makeStaff('admin', 'office');

        $this->actingAs($admin)->post("/portal/students/{$student->id}/documents", [
            'type' => 'birth_certificate', 'file' => UploadedFile::fake()->create('birth.pdf', 50, 'application/pdf'),
        ])->assertRedirect();

        $doc = StudentDocument::firstOrFail();

        $this->actingAs($admin)->get("/portal/documents/{$doc->id}/download")->assertOk();
        $this->actingAs($owner)->get("/portal/documents/{$doc->id}/download")->assertOk();
        $this->actingAs($stranger)->get("/portal/documents/{$doc->id}/download")->assertForbidden();
    }

    public function test_students_cannot_open_admin_pages(): void
    {
        [, $user] = $this->makeStudent($this->makeBatch());

        $this->actingAs($user)->get('/portal/students')->assertForbidden();
        $this->actingAs($user)->get('/portal/payments')->assertForbidden();
        $this->actingAs($user)->get('/portal/manage/users')->assertForbidden();
    }
}
