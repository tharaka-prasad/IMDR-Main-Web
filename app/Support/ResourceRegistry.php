<?php

namespace App\Support;

use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\Classroom;
use App\Models\ContactMessage;
use App\Models\Course;
use App\Models\CourseType;
use App\Models\Enrollment;
use App\Models\ExpenseCategory;
use App\Models\Lecturer;
use App\Models\Post;
use App\Models\Result;
use App\Models\SalaryRule;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Models\User;
use App\Exceptions\BusinessException;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Definitions for the simple list / add / edit / delete screens (one generic React page renders them all).
 * Each entry says: who may read/write, which columns to show, which form fields to offer, and how to validate.
 */
class ResourceRegistry
{
    private static function choices(array $map): array
    {
        return collect($map)->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values()->all();
    }

    private static function options(string $model, string|\Closure $label = 'name', array $with = [], ?\Closure $scope = null): \Closure
    {
        return function () use ($model, $label, $with, $scope) {
            $q = $model::query()->with($with);
            if ($scope) {
                $scope($q);
            }

            return $q->limit(1000)->get()->map(fn ($m) => [
                'value' => $m->getKey(),
                'label' => is_string($label) ? data_get($m, $label) : $label($m),
            ])->values()->all();
        };
    }

    private static function f(string $name, string $label, string $type = 'text', array $extra = []): array
    {
        return ['name' => $name, 'label' => $label, 'type' => $type] + $extra;
    }

    private static function c(string $key, string $label, string $type = 'text'): array
    {
        return ['key' => $key, 'label' => $label, 'type' => $type];
    }

    public static function all(): array
    {
        $staff = ['super_admin', 'admin', 'accountant', 'lecturer'];
        $acad = ['super_admin', 'admin'];
        $teach = ['super_admin', 'admin', 'lecturer'];
        $fin = ['super_admin', 'accountant'];
        $roles = self::choices(['super_admin' => 'Super admin', 'admin' => 'Admin', 'accountant' => 'Accountant', 'lecturer' => 'Lecturer', 'student' => 'Student']);
        $userStatus = self::choices(['active' => 'Active', 'pending' => 'Pending', 'suspended' => 'Suspended']);

        return [
            'course-types' => [
                'title' => 'Course types', 'singular' => 'Course type',
                'model' => CourseType::class,
                'read' => $staff, 'write' => $acad,
                'search' => ['name'],
                'order' => ['level', 'asc'],
                'columns' => [self::c('name', 'Name'), self::c('level', 'Pathway level'), self::c('description', 'Description', 'limit')],
                'fields' => [
                    self::f('name', 'Name', 'text', ['required' => true, 'placeholder' => 'Diploma']),
                    self::f('level', 'Pathway level', 'number', ['help' => '1 = Certificate, 2 = Advanced Certificate, 3 = Diploma, 4 = Higher Diploma']),
                    self::f('description', 'Description', 'textarea'),
                ],
                'rules' => fn ($id, $m) => [
                    'name' => 'required|string|max:120',
                    'level' => 'nullable|integer|between:0,9',
                    'description' => 'nullable|string',
                ],
            ],

            'subjects' => [
                'title' => 'Subjects', 'singular' => 'Subject',
                'model' => Subject::class,
                'read' => $staff, 'write' => $acad,
                'with' => ['course:id,name'],
                'display' => ['course_name' => 'course.name'],
                'search' => ['name', 'code'],
                'filters' => ['course_id'],
                'columns' => [self::c('code', 'Code'), self::c('name', 'Subject'), self::c('course_name', 'Course')],
                'fields' => [
                    self::f('course_id', 'Course', 'select', ['required' => true, 'options' => self::options(Course::class)]),
                    self::f('code', 'Code', 'text', ['required' => true]),
                    self::f('name', 'Subject name', 'text', ['required' => true]),
                    self::f('description', 'Description', 'textarea'),
                ],
                'rules' => fn ($id, $m) => [
                    'course_id' => 'required|exists:courses,id',
                    'code' => 'required|string|max:30',
                    'name' => 'required|string|max:160',
                    'description' => 'nullable|string',
                ],
            ],

            'batches' => [
                'title' => 'Batches', 'singular' => 'Batch',
                'model' => Batch::class,
                'read' => $staff, 'write' => $acad,
                'with' => ['course:id,name,code'],
                'count' => ['enrollments'],
                'display' => ['course_name' => 'course.name'],
                'search' => ['name', 'code'],
                'filters' => ['course_id', 'status'],
                'columns' => [
                    self::c('code', 'Code'), self::c('name', 'Batch'), self::c('course_name', 'Course'),
                    self::c('start_date', 'Starts', 'date'), self::c('end_date', 'Ends', 'date'),
                    self::c('capacity', 'Seats'), self::c('enrollments_count', 'Registered'), self::c('status', 'Status', 'badge'),
                ],
                'fields' => [
                    self::f('course_id', 'Course', 'select', ['required' => true, 'options' => self::options(Course::class)]),
                    self::f('name', 'Batch name', 'text', ['required' => true, 'placeholder' => '2026 September intake']),
                    self::f('code', 'Batch code', 'text', ['required' => true, 'placeholder' => 'DDM-2026-09']),
                    self::f('start_date', 'Start date', 'date', ['required' => true]),
                    self::f('end_date', 'End date', 'date'),
                    self::f('schedule_text', 'Class schedule', 'text', ['placeholder' => 'Saturdays 9.00 am - 1.00 pm']),
                    self::f('capacity', 'Seats', 'number', ['required' => true]),
                    self::f('status', 'Status', 'select', ['required' => true, 'options' => self::choices(['open' => 'Open for registration', 'running' => 'Running', 'completed' => 'Completed', 'closed' => 'Closed'])]),
                ],
                'rules' => fn ($id, $m) => [
                    'course_id' => 'required|exists:courses,id',
                    'name' => 'required|string|max:160',
                    'code' => ['required', 'string', 'max:30', Rule::unique('batches', 'code')->ignore($id)],
                    'start_date' => 'required|date',
                    'end_date' => 'nullable|date|after_or_equal:start_date',
                    'schedule_text' => 'nullable|string|max:255',
                    'capacity' => 'required|integer|min:1',
                    'status' => 'required|in:open,running,completed,closed',
                ],
            ],

            'classrooms' => [
                'title' => 'Classrooms', 'singular' => 'Classroom',
                'model' => Classroom::class,
                'read' => $staff, 'write' => $acad,
                'search' => ['name'],
                'columns' => [self::c('name', 'Name'), self::c('capacity', 'Capacity'), self::c('location', 'Location')],
                'fields' => [
                    self::f('name', 'Name', 'text', ['required' => true]),
                    self::f('capacity', 'Capacity', 'number'),
                    self::f('location', 'Location', 'text'),
                ],
                'rules' => fn ($id, $m) => [
                    'name' => 'required|string|max:120',
                    'capacity' => 'nullable|integer|min:1',
                    'location' => 'nullable|string|max:255',
                ],
            ],

            'announcements' => [
                'title' => 'Announcements', 'singular' => 'Announcement',
                'model' => Announcement::class,
                'read' => $staff, 'write' => $teach,
                'with' => ['creator:id,name', 'batch:id,name'],
                'display' => ['batch_name' => 'batch.name', 'author' => 'creator.name'],
                'search' => ['title'],
                'columns' => [self::c('title', 'Title'), self::c('audience', 'Audience', 'badge'), self::c('batch_name', 'Batch'), self::c('author', 'Posted by'), self::c('created_at', 'Posted', 'datetime')],
                'fields' => [
                    self::f('title', 'Title', 'text', ['required' => true]),
                    self::f('body', 'Message', 'textarea', ['required' => true]),
                    self::f('audience', 'Send to', 'select', ['required' => true, 'options' => self::choices(['all' => 'Everyone', 'students' => 'All students', 'lecturers' => 'All lecturers', 'batch' => 'One batch'])]),
                    self::f('batch_id', 'Batch', 'select', ['options' => self::options(Batch::class), 'help' => 'Only used when sending to one batch.']),
                ],
                'rules' => fn ($id, $m) => [
                    'title' => 'required|string|max:200',
                    'body' => 'required|string',
                    'audience' => 'required|in:all,students,lecturers,batch',
                    'batch_id' => 'nullable|required_if:audience,batch|exists:batches,id',
                ],
                'before' => function (array $data, Request $r, $existing) {
                    if (! $existing) {
                        $data['created_by'] = $r->user()->id;
                    }
                    if (($data['audience'] ?? null) !== 'batch') {
                        $data['batch_id'] = null;
                    }

                    return $data;
                },
                'after' => function ($item, Request $r) {
                    $ids = match ($item->audience) {
                        'students' => User::where('role', 'student')->where('status', 'active')->pluck('id'),
                        'lecturers' => User::where('role', 'lecturer')->pluck('id'),
                        'batch' => Student::whereIn('id', Enrollment::where('batch_id', $item->batch_id)->where('status', 'approved')->pluck('student_id'))->pluck('user_id'),
                        default => User::where('status', '!=', 'suspended')->pluck('id'),
                    };
                    NotificationService::send($ids, $item->title, Str::limit(strip_tags($item->body), 140), 'announcement', '/portal/announcements');
                },
            ],

            'posts' => [
                'title' => 'Website content', 'singular' => 'Post',
                'help' => 'News, events, research and media items shown on the public website.',
                'model' => Post::class,
                'read' => $acad, 'write' => $acad,
                'search' => ['title'],
                'filters' => ['type'],
                'columns' => [self::c('type', 'Type', 'badge'), self::c('title', 'Title'), self::c('is_published', 'Published', 'bool'), self::c('published_at', 'Date', 'datetime')],
                'fields' => [
                    self::f('type', 'Type', 'select', ['required' => true, 'options' => self::choices(['news' => 'News', 'event' => 'Event', 'announcement' => 'Announcement', 'research' => 'Research', 'media' => 'Media'])]),
                    self::f('title', 'Title', 'text', ['required' => true]),
                    self::f('excerpt', 'Short summary', 'textarea'),
                    self::f('body', 'Full text', 'textarea'),
                    self::f('image_url', 'Image link', 'url', ['help' => 'Optional. A full https:// link to an image.']),
                    self::f('event_date', 'Event date and time', 'datetime', ['help' => 'Only for events.']),
                    self::f('location', 'Location', 'text'),
                    self::f('is_published', 'Show on the website', 'checkbox'),
                ],
                'rules' => fn ($id, $m) => [
                    'type' => 'required|in:news,event,announcement,research,media',
                    'title' => 'required|string|max:200',
                    'excerpt' => 'nullable|string|max:500',
                    'body' => 'nullable|string',
                    'image_url' => 'nullable|url|max:500',
                    'event_date' => 'nullable|date',
                    'location' => 'nullable|string|max:255',
                    'is_published' => 'boolean',
                ],
                'before' => function (array $data, Request $r, $existing) {
                    if (! $existing) {
                        $data['slug'] = Str::slug($data['title']).'-'.Str::lower(Str::random(4));
                        $data['published_at'] = now();
                    }

                    return $data;
                },
            ],

            'expense-categories' => [
                'title' => 'Expense categories', 'singular' => 'Category',
                'model' => ExpenseCategory::class,
                'read' => ['super_admin', 'admin', 'accountant'], 'write' => $fin,
                'search' => ['name'],
                'order' => ['name', 'asc'],
                'columns' => [self::c('name', 'Category')],
                'fields' => [self::f('name', 'Category name', 'text', ['required' => true])],
                'rules' => fn ($id, $m) => [
                    'name' => ['required', 'string', 'max:120', Rule::unique('expense_categories', 'name')->ignore($id)],
                ],
            ],

            'results' => [
                'title' => 'Results', 'singular' => 'Result',
                'help' => 'Only results marked as published are visible to the student.',
                'model' => Result::class,
                'read' => $teach, 'write' => $teach,
                'with' => ['student.user:id,name', 'subject:id,name', 'batch:id,name'],
                'display' => ['student_name' => 'student.user.name', 'student_no' => 'student.student_no', 'subject_name' => 'subject.name', 'batch_name' => 'batch.name'],
                'filters' => ['batch_id', 'subject_id', 'student_id'],
                'columns' => [
                    self::c('student_name', 'Student'), self::c('subject_name', 'Subject'), self::c('batch_name', 'Batch'),
                    self::c('assessment', 'Assessment'), self::c('marks', 'Marks'), self::c('max_marks', 'Out of'),
                    self::c('grade', 'Grade', 'badge'), self::c('published', 'Published', 'bool'),
                ],
                'fields' => [
                    self::f('student_id', 'Student', 'select', ['required' => true, 'options' => self::options(Student::class, fn ($s) => $s->user->name.' ('.$s->student_no.')', ['user:id,name'])]),
                    self::f('subject_id', 'Subject', 'select', ['required' => true, 'options' => self::options(Subject::class)]),
                    self::f('batch_id', 'Batch', 'select', ['required' => true, 'options' => self::options(Batch::class)]),
                    self::f('assessment', 'Assessment', 'text', ['required' => true, 'placeholder' => 'Mid-term exam']),
                    self::f('marks', 'Marks', 'number', ['required' => true, 'step' => '0.01']),
                    self::f('max_marks', 'Out of', 'number', ['required' => true, 'step' => '0.01']),
                    self::f('grade', 'Grade', 'text', ['help' => 'Leave empty to calculate: A 75+, B 65+, C 55+, S 40+, F below 40.']),
                    self::f('remarks', 'Remarks', 'textarea'),
                    self::f('published', 'Visible to the student', 'checkbox'),
                ],
                'rules' => fn ($id, $m) => [
                    'student_id' => 'required|exists:students,id',
                    'subject_id' => 'required|exists:subjects,id',
                    'batch_id' => 'required|exists:batches,id',
                    'assessment' => 'required|string|max:150',
                    'marks' => 'required|numeric|min:0',
                    'max_marks' => 'required|numeric|min:1',
                    'grade' => 'nullable|string|max:5',
                    'remarks' => 'nullable|string',
                    'published' => 'boolean',
                ],
                'before' => function (array $data, Request $r, $existing) {
                    if (empty($data['grade'])) {
                        $pct = $data['max_marks'] > 0 ? $data['marks'] / $data['max_marks'] * 100 : 0;
                        $data['grade'] = $pct >= 75 ? 'A' : ($pct >= 65 ? 'B' : ($pct >= 55 ? 'C' : ($pct >= 40 ? 'S' : 'F')));
                    }

                    return $data;
                },
            ],

            'teaching-assignments' => [
                'title' => 'Teaching assignments', 'singular' => 'Assignment',
                'help' => 'Lecturers can only upload content, mark attendance and set assignments for the subjects and batches listed here.',
                'model' => TeachingAssignment::class,
                'read' => $staff, 'write' => $acad,
                'with' => ['batch:id,name', 'subject:id,name', 'lecturer.user:id,name'],
                'display' => ['batch_name' => 'batch.name', 'subject_name' => 'subject.name', 'lecturer_name' => 'lecturer.user.name'],
                'filters' => ['batch_id', 'lecturer_id'],
                'columns' => [self::c('lecturer_name', 'Lecturer'), self::c('subject_name', 'Subject'), self::c('batch_name', 'Batch')],
                'fields' => [
                    self::f('lecturer_id', 'Lecturer', 'select', ['required' => true, 'options' => self::options(Lecturer::class, 'user.name', ['user:id,name'])]),
                    self::f('batch_id', 'Batch', 'select', ['required' => true, 'options' => self::options(Batch::class)]),
                    self::f('subject_id', 'Subject', 'select', ['required' => true, 'options' => self::options(Subject::class)]),
                ],
                'rules' => fn ($id, $m) => [
                    'batch_id' => 'required|exists:batches,id',
                    'subject_id' => 'required|exists:subjects,id',
                    'lecturer_id' => 'required|exists:lecturers,id',
                ],
            ],

            'salary-rules' => [
                'title' => 'Salary rules', 'singular' => 'Salary rule',
                'help' => 'Monthly = basic salary. Hourly = hours of held classes x rate. Per session = number of held classes x rate.',
                'model' => SalaryRule::class,
                'read' => $fin, 'write' => $fin,
                'with' => ['user:id,name,role'],
                'display' => ['user_name' => 'user.name', 'user_role' => 'user.role'],
                'columns' => [
                    self::c('user_name', 'Person'), self::c('user_role', 'Role', 'badge'), self::c('pay_type', 'Pay type', 'badge'),
                    self::c('basic_salary', 'Basic', 'money'), self::c('hourly_rate', 'Hourly', 'money'), self::c('session_rate', 'Per session', 'money'),
                    self::c('allowances', 'Allowances', 'money'), self::c('deductions', 'Deductions', 'money'),
                ],
                'fields' => [
                    self::f('user_id', 'Person', 'select', ['required' => true, 'options' => self::options(User::class, fn ($u) => $u->name.' ('.$u->role.')', [], fn ($q) => $q->whereIn('role', ['lecturer', 'admin', 'accountant'])->orderBy('name'))]),
                    self::f('pay_type', 'Pay type', 'select', ['required' => true, 'options' => self::choices(['monthly' => 'Monthly', 'hourly' => 'Per hour', 'session' => 'Per session'])]),
                    self::f('basic_salary', 'Basic salary', 'number', ['step' => '0.01']),
                    self::f('hourly_rate', 'Hourly rate', 'number', ['step' => '0.01']),
                    self::f('session_rate', 'Rate per session', 'number', ['step' => '0.01']),
                    self::f('allowances', 'Allowances', 'number', ['step' => '0.01']),
                    self::f('deductions', 'Deductions', 'number', ['step' => '0.01']),
                ],
                'rules' => fn ($id, $m) => [
                    'user_id' => ['required', 'exists:users,id', Rule::unique('salary_rules', 'user_id')->ignore($id)],
                    'pay_type' => 'required|in:monthly,hourly,session',
                    'basic_salary' => 'nullable|numeric|min:0',
                    'hourly_rate' => 'nullable|numeric|min:0',
                    'session_rate' => 'nullable|numeric|min:0',
                    'allowances' => 'nullable|numeric|min:0',
                    'deductions' => 'nullable|numeric|min:0',
                ],
                'before' => function (array $data, Request $r, $existing) {
                    foreach (['basic_salary', 'hourly_rate', 'session_rate', 'allowances', 'deductions'] as $k) {
                        $data[$k] = $data[$k] ?? 0;
                    }

                    return $data;
                },
            ],

            'contact-messages' => [
                'title' => 'Website messages', 'singular' => 'Message',
                'model' => ContactMessage::class,
                'read' => $acad, 'write' => $acad,
                'create' => false,
                'search' => ['name', 'email', 'subject'],
                'columns' => [self::c('name', 'From'), self::c('email', 'Email'), self::c('phone', 'Phone'), self::c('subject', 'Subject'), self::c('message', 'Message'), self::c('is_read', 'Read', 'bool'), self::c('created_at', 'Received', 'datetime')],
                'fields' => [self::f('is_read', 'Mark as read', 'checkbox')],
                'rules' => fn ($id, $m) => ['is_read' => 'boolean'],
            ],

            'audit-logs' => [
                'title' => 'Audit log', 'singular' => 'Entry',
                'help' => 'Every sensitive action (sign-ins, payments, approvals, deletions) is recorded here and cannot be edited.',
                'model' => AuditLog::class,
                'read' => ['super_admin'], 'write' => [],
                'create' => false,
                'with' => ['user:id,name'],
                'display' => ['user_name' => 'user.name'],
                'search' => ['action', 'description'],
                'per_page' => 30,
                'columns' => [self::c('created_at', 'When', 'datetime'), self::c('user_name', 'Who'), self::c('action', 'Action', 'badge'), self::c('description', 'Details'), self::c('ip', 'IP')],
                'fields' => [],
                'rules' => fn ($id, $m) => [],
            ],

            'users' => [
                'title' => 'Staff accounts', 'singular' => 'Account',
                'help' => 'Create logins for admins and accountants. Lecturers and students are created from their own screens.',
                'model' => User::class,
                'read' => ['super_admin'], 'write' => ['super_admin'],
                'search' => ['name', 'username', 'email'],
                'filters' => ['role', 'status'],
                'per_page' => 20,
                'columns' => [self::c('name', 'Name'), self::c('username', 'Username'), self::c('email', 'Email'), self::c('role', 'Role', 'badge'), self::c('status', 'Status', 'badge')],
                'fields' => [
                    self::f('name', 'Full name', 'text', ['required' => true]),
                    self::f('username', 'Username', 'text', ['required' => true, 'help' => 'Letters, numbers, dash and underscore.']),
                    self::f('email', 'Email', 'email'),
                    self::f('phone', 'Phone', 'text'),
                    self::f('role', 'Role', 'select', ['required' => true, 'options' => $roles]),
                    self::f('status', 'Status', 'select', ['required' => true, 'options' => $userStatus]),
                    self::f('password', 'Password', 'password', ['help' => 'Minimum 8 characters. When editing, leave empty to keep the current password.']),
                ],
                'rules' => fn ($id, $m) => [
                    'name' => 'required|string|max:120',
                    'username' => ['required', 'alpha_dash', 'max:60', Rule::unique('users', 'username')->ignore($id)],
                    'email' => ['nullable', 'email', 'max:160', Rule::unique('users', 'email')->ignore($id)],
                    'phone' => 'nullable|string|max:30',
                    'role' => $id ? 'required|in:super_admin,admin,accountant,lecturer,student' : 'required|in:super_admin,admin,accountant',
                    'status' => 'required|in:active,pending,suspended',
                    'password' => $id ? 'nullable|string|min:8' : 'required|string|min:8',
                ],
                'before' => function (array $data, Request $r, $existing) {
                    if (empty($data['password'])) {
                        unset($data['password']);
                    }
                    // Never let someone lock themselves out by editing their own role / status.
                    if ($existing && $existing->id === $r->user()->id) {
                        unset($data['role'], $data['status']);
                    }

                    return $data;
                },
                'protect_self' => true,
            ],

            'lecturers' => [
                'title' => 'Lecturers', 'singular' => 'Lecturer',
                'help' => 'Each lecturer gets a login (username and password) set here.',
                'model' => Lecturer::class,
                'read' => $acad, 'write' => $acad,
                'with' => ['user:id,name,username,email,phone,status'],
                'display' => ['name' => 'user.name', 'username' => 'user.username', 'email' => 'user.email', 'phone' => 'user.phone', 'user_status' => 'user.status'],
                'search_relation' => ['user' => ['name', 'username', 'email', 'phone']],
                'columns' => [self::c('name', 'Name'), self::c('username', 'Username'), self::c('phone', 'Phone'), self::c('qualification', 'Qualification'), self::c('specialization', 'Specialisation'), self::c('user_status', 'Account', 'badge')],
                'fields' => [
                    self::f('name', 'Full name', 'text', ['required' => true]),
                    self::f('username', 'Username', 'text', ['required' => true, 'help' => 'Letters, numbers, dash and underscore.']),
                    self::f('password', 'Password', 'password', ['help' => 'Minimum 8 characters. When editing, leave empty to keep the current password.']),
                    self::f('email', 'Email', 'email'),
                    self::f('phone', 'Phone', 'text'),
                    self::f('qualification', 'Qualification', 'text'),
                    self::f('specialization', 'Specialisation', 'text'),
                    self::f('bio', 'About', 'textarea'),
                    self::f('user_status', 'Account status', 'select', ['options' => $userStatus]),
                ],
                'rules' => fn ($id, $m) => [
                    'name' => 'required|string|max:120',
                    'username' => ['required', 'alpha_dash', 'max:60', Rule::unique('users', 'username')->ignore($m?->user_id)],
                    'email' => ['nullable', 'email', 'max:160', Rule::unique('users', 'email')->ignore($m?->user_id)],
                    'phone' => 'nullable|string|max:30',
                    'password' => $m ? 'nullable|string|min:8' : 'required|string|min:8',
                    'qualification' => 'nullable|string|max:255',
                    'specialization' => 'nullable|string|max:255',
                    'bio' => 'nullable|string',
                    'user_status' => 'nullable|in:active,pending,suspended',
                ],
                'save' => function (array $data, ?Lecturer $lecturer, Request $r) {
                    return DB::transaction(function () use ($data, $lecturer) {
                        $account = collect($data)->only(['name', 'username', 'email', 'phone'])->all();
                        if (! empty($data['user_status'])) {
                            $account['status'] = $data['user_status'];
                        }
                        if (! empty($data['password'])) {
                            $account['password'] = $data['password'];
                        }

                        if ($lecturer) {
                            $lecturer->user->update($account);
                        } else {
                            $user = User::create(array_merge(['status' => 'active'], $account, ['role' => 'lecturer']));
                            SalaryRule::create(['user_id' => $user->id, 'pay_type' => 'hourly']);
                            $lecturer = new Lecturer(['user_id' => $user->id]);
                        }

                        $lecturer->fill(collect($data)->only(['qualification', 'specialization', 'bio'])->all())->save();

                        return $lecturer;
                    });
                },
                'destroy' => function (Lecturer $lecturer) {
                    if ($lecturer->assignments()->exists() || \App\Models\TimetableEntry::where('lecturer_id', $lecturer->id)->exists()) {
                        throw new BusinessException('This lecturer has teaching assignments or timetable history. Suspend the account instead of deleting it.');
                    }
                    $lecturer->user->delete();
                },
            ],
        ];
    }
}
