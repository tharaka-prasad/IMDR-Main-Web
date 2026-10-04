<?php

use App\Http\Controllers\ApplyController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LmsContentController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnlinePaymentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentDocumentController;
use App\Http\Controllers\StudentFinanceController;
use App\Http\Controllers\StudentPortalController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\WhatsAppController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public website
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('/about', [PublicController::class, 'about']);
Route::get('/courses', [PublicController::class, 'courses']);
Route::get('/courses/{slug}', [PublicController::class, 'course']);

foreach (['news' => 'news', 'events' => 'event', 'research' => 'research', 'media' => 'media'] as $path => $type) {
    Route::get("/{$path}", [PublicController::class, 'posts'])->defaults('type', $type);
}
Route::get('/posts/{slug}', [PublicController::class, 'post']);

Route::get('/contact', [PublicController::class, 'contact']);
Route::post('/contact', [PublicController::class, 'sendContact'])->middleware('throttle:5,1');

Route::get('/apply', [ApplyController::class, 'create']);
Route::post('/apply', [ApplyController::class, 'store'])->middleware('throttle:10,1');

Route::get('/verify/{number?}', [PublicController::class, 'verify']);

// Receipt link sent on WhatsApp: needs a valid signature, expires after 90 days.
Route::get('/r/{payment}', [ReceiptController::class, 'publicShow'])->name('receipt.public')->middleware('signed');

// The payment gateway calls this itself (CSRF-exempt, protected by the signature check).
Route::post('/payments/payhere/notify', [OnlinePaymentController::class, 'payhereNotify']);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:10,1');
});
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

/*
|--------------------------------------------------------------------------
| Fake payment page (only when PAYMENT_GATEWAY=sandbox and not in production)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/payment/sandbox/{order}', [OnlinePaymentController::class, 'sandboxShow']);
    Route::post('/payment/sandbox/{order}', [OnlinePaymentController::class, 'sandboxComplete']);
});

/*
|--------------------------------------------------------------------------
| Secure portal
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'active'])->prefix('portal')->group(function () {
    // Everyone
    Route::get('/', DashboardController::class);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'read']);
    Route::get('/profile', [ProfileController::class, 'edit']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'password']);
    Route::get('/announcements', [StudentPortalController::class, 'announcements']);
    Route::get('/timetable', [TimetableController::class, 'index']);
    Route::get('/receipts/{payment}', [ReceiptController::class, 'show']);
    Route::get('/payment/return', [OnlinePaymentController::class, 'return']);
    Route::get('/certificates/{certificate}', [CertificateController::class, 'show'])->whereNumber('certificate');
    Route::get('/documents/{document}/download', [StudentDocumentController::class, 'download']);
    Route::get('/submissions/{submission}/download', [AssignmentController::class, 'downloadSubmission']);

    // Student only (the payment screen always works, even when the LMS is paused)
    Route::middleware('role:student')->group(function () {
        Route::get('/finance', [StudentFinanceController::class, 'index']);
        Route::post('/finance/invoices/{invoice}/pay', [StudentFinanceController::class, 'pay']);
        Route::get('/my/courses', [StudentPortalController::class, 'courses']);
        Route::get('/my/records', [StudentPortalController::class, 'records']);
        Route::get('/my/certificates', [CertificateController::class, 'mine']);
    });

    // Learning: students with a delayed payment (or without an approved registration) see the "payment delayed" page instead.
    Route::middleware('lms')->group(function () {
        Route::get('/lms', [LmsContentController::class, 'index']);
        Route::get('/lms/{id}/download', [LmsContentController::class, 'download'])->whereNumber('id');
        Route::get('/assignments', [AssignmentController::class, 'index']);
        Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->whereNumber('assignment');
        Route::get('/quizzes', [QuizController::class, 'index']);

        Route::middleware('role:student')->group(function () {
            Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit']);
            Route::post('/quizzes/{quiz}/attempt', [QuizController::class, 'attempt']);
        });

        Route::middleware('role:super_admin,admin,lecturer')->group(function () {
            Route::post('/lms', [LmsContentController::class, 'store']);
            Route::put('/lms/{content}', [LmsContentController::class, 'update']);
            Route::delete('/lms/{content}', [LmsContentController::class, 'destroy']);
            Route::post('/assignments', [AssignmentController::class, 'store']);
            Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy']);
            Route::put('/submissions/{submission}/mark', [AssignmentController::class, 'mark']);
            Route::get('/quizzes/create', [QuizController::class, 'create']);
            Route::post('/quizzes', [QuizController::class, 'store']);
            Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
            Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
        });

        Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->whereNumber('quiz');
    });

    // Teaching staff: class registers
    Route::middleware('role:super_admin,admin,lecturer')->group(function () {
        Route::get('/attendance', [AttendanceController::class, 'index']);
        Route::get('/attendance/{entry}', [AttendanceController::class, 'show'])->whereNumber('entry');
        Route::post('/attendance/{entry}', [AttendanceController::class, 'store']);
    });

    // Simple list / add / edit / delete screens (permissions are defined per screen in ResourceRegistry)
    Route::get('/manage/{resource}', [ResourceController::class, 'index']);
    Route::post('/manage/{resource}', [ResourceController::class, 'store']);
    Route::put('/manage/{resource}/{id}', [ResourceController::class, 'update'])->whereNumber('id');
    Route::delete('/manage/{resource}/{id}', [ResourceController::class, 'destroy'])->whereNumber('id');

    // Admin and super admin: academic office
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::get('/courses', [CourseController::class, 'index']);
        Route::get('/courses/create', [CourseController::class, 'create']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::get('/courses/{course}/edit', [CourseController::class, 'edit']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/create', [StudentController::class, 'create']);
        Route::post('/students', [StudentController::class, 'store']);
        Route::get('/students/{student}', [StudentController::class, 'show'])->whereNumber('student');
        Route::put('/students/{student}', [StudentController::class, 'update']);
        Route::post('/students/{student}/reset-password', [StudentController::class, 'resetPassword']);
        Route::post('/students/{student}/lms-override', [StudentController::class, 'lmsOverride']);
        Route::post('/students/{student}/enroll', [StudentController::class, 'enroll']);
        Route::post('/students/{student}/documents', [StudentDocumentController::class, 'store']);
        Route::delete('/documents/{document}', [StudentDocumentController::class, 'destroy']);

        Route::get('/registrations', [EnrollmentController::class, 'index']);
        Route::post('/registrations/{enrollment}/approve', [EnrollmentController::class, 'approve']);
        Route::post('/registrations/{enrollment}/reject', [EnrollmentController::class, 'reject']);

        Route::post('/timetable', [TimetableController::class, 'store']);
        Route::put('/timetable/{entry}', [TimetableController::class, 'update']);
        Route::post('/timetable/{entry}/status', [TimetableController::class, 'status']);
        Route::delete('/timetable/{entry}', [TimetableController::class, 'destroy']);

        Route::get('/attendance-report', [AttendanceController::class, 'report']);

        Route::get('/certificates', [CertificateController::class, 'index']);
        Route::post('/certificates', [CertificateController::class, 'store']);
        Route::post('/certificates/{certificate}/revoke', [CertificateController::class, 'revoke']);
    });

    // Accountant and super admin: money
    Route::middleware('role:super_admin,accountant')->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::post('/invoices/{invoice}/cancel', [InvoiceController::class, 'cancel']);

        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::post('/payments/{payment}/refund', [PaymentController::class, 'refund']);
        Route::get('/transactions', [PaymentController::class, 'transactions']);

        Route::get('/whatsapp', [WhatsAppController::class, 'index']);
        Route::post('/whatsapp/{message}/resend', [WhatsAppController::class, 'resend']);

        Route::get('/expenses', [ExpenseController::class, 'index']);
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
        Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);
        Route::get('/expenses/{expense}/download', [ExpenseController::class, 'download']);

        Route::get('/payroll', [PayrollController::class, 'index']);
        Route::post('/payroll/generate', [PayrollController::class, 'generate']);
        Route::get('/payroll/{period}', [PayrollController::class, 'show'])->whereNumber('period');
        Route::post('/payroll/{period}/approve', [PayrollController::class, 'approve']);
        Route::delete('/payroll/{period}', [PayrollController::class, 'destroy']);
        Route::post('/payroll/items/{item}/pay', [PayrollController::class, 'pay']);
    });

    Route::get('/reports', [ReportController::class, 'finance'])->middleware('role:super_admin,admin,accountant');

    Route::middleware('role:super_admin')->group(function () {
        Route::get('/settings', [SettingController::class, 'index']);
        Route::put('/settings', [SettingController::class, 'update']);
    });
});
