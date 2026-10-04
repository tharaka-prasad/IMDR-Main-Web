<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LmsAccessTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_student_with_everything_paid_or_not_yet_due_can_open_the_lms(): void
    {
        [, $user] = $this->makeStudent($this->makeBatch());

        // Registration fee is due today (not yet overdue) and the installments fall due after the batch starts.
        $this->actingAs($user)->get('/portal/lms')->assertInertia(fn (Assert $page) => $page->component('Lms/Index'));
    }

    public function test_student_with_an_overdue_payment_sees_the_payment_delay_page_instead_of_the_lms(): void
    {
        [$student, $user] = $this->makeStudent($this->makeBatch());
        Invoice::where('student_id', $student->id)->where('type', 'registration')->update(['due_date' => now()->subDays(3)->toDateString()]);

        foreach (['/portal/lms', '/portal/assignments', '/portal/quizzes'] as $url) {
            $this->actingAs($user)->get($url)->assertInertia(fn (Assert $page) => $page
                ->component('Student/Blocked')
                ->where('access.reason', 'payment_delay')
                ->where('access.allowed', false));
        }
    }

    public function test_paying_the_overdue_invoice_restores_access(): void
    {
        [$student, $user] = $this->makeStudent($this->makeBatch());
        $invoice = $this->registrationInvoice($student);
        $invoice->update(['due_date' => now()->subDays(3)->toDateString()]);

        $this->actingAs($user)->get('/portal/lms')->assertInertia(fn (Assert $p) => $p->component('Student/Blocked'));

        $invoice->update(['paid_amount' => $invoice->total, 'status' => 'paid']);

        $this->actingAs($user)->get('/portal/lms')->assertInertia(fn (Assert $p) => $p->component('Lms/Index'));
    }

    public function test_grace_days_delay_the_lock(): void
    {
        [$student, $user] = $this->makeStudent($this->makeBatch());
        $this->registrationInvoice($student)->update(['due_date' => now()->subDays(3)->toDateString()]);
        Setting::put('payment_grace_days', 7);

        $this->actingAs($user)->get('/portal/lms')->assertInertia(fn (Assert $p) => $p->component('Lms/Index'));
    }

    public function test_admin_override_keeps_the_lms_open_until_the_chosen_date(): void
    {
        [$student, $user] = $this->makeStudent($this->makeBatch());
        $this->registrationInvoice($student)->update(['due_date' => now()->subDays(3)->toDateString()]);
        $admin = $this->makeStaff('admin', 'office');

        $this->actingAs($admin)->post("/portal/students/{$student->id}/lms-override", ['until' => now()->addDays(5)->toDateString()])->assertRedirect();

        $this->actingAs($user)->get('/portal/lms')->assertInertia(fn (Assert $p) => $p->component('Lms/Index'));
    }

    public function test_student_waiting_for_approval_is_blocked_but_can_still_open_finance(): void
    {
        [, $user] = $this->makeStudent($this->makeBatch(), 'pending1', '0771112223', false);

        $this->actingAs($user)->get('/portal/lms')->assertInertia(fn (Assert $p) => $p->component('Student/Blocked')->where('access.reason', 'pending_approval'));
        $this->actingAs($user)->get('/portal/finance')->assertInertia(fn (Assert $p) => $p->component('Student/Finance'));
    }

    public function test_staff_are_never_blocked(): void
    {
        $lecturer = $this->makeStaff('admin', 'office');

        $this->actingAs($lecturer)->get('/portal/lms')->assertInertia(fn (Assert $p) => $p->component('Lms/Index'));
    }
}
