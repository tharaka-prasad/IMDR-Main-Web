<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\ExpenseCategory;
use App\Models\Lecturer;
use App\Models\Post;
use App\Models\SalaryRule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Real institute content (expense categories, website posts) comes from the IMDR business plan.
 * All courses live in SpecialisedCoursesSeeder.
 * Demo staff and classrooms are only created when the app is NOT in production.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => env('ADMIN_USERNAME', 'admin')],
            ['name' => 'Super Admin', 'email' => env('ADMIN_EMAIL', 'admin@imdr.lk'), 'password' => env('ADMIN_PASSWORD', 'ChangeMe@123'), 'role' => 'super_admin', 'status' => 'active']
        );

        $this->expenseCategories();
        $this->call(SpecialisedCoursesSeeder::class);
        $this->call(DepartmentSeeder::class);
        $this->posts();

        if (! app()->isProduction()) {
            $this->demo();
        }
    }

    private function expenseCategories(): void
    {
        foreach (['Rent', 'Electricity', 'Water', 'Internet', 'Marketing', 'Software', 'Equipment', 'Maintenance', 'Transport', 'Events', 'Printing', 'Stationery', 'Salaries', 'Other'] as $name) {
            ExpenseCategory::firstOrCreate(['name' => $name]);
        }
    }

    private function posts(): void
    {
        $items = [
            ['news', 'IMDR opens registration for the first intake', 'Applications are now open for IMDR\'s 18 specialised courses in media, cinema, technology and digital business.', 'IMDR is opening its doors with a focus on media literacy, digital skills and research. Programmes start next month. Submit the online Application Form or visit the institute to apply.'],
            ['news', 'Think Before You Share: free media literacy series', 'A free short-video series on spotting misleading content.', 'Free educational content is how IMDR builds trust before you enrol. Follow the series on Facebook and YouTube.'],
            ['news', 'Academic Advisory Board being formed', 'University academics, media specialists, ICT professionals and experienced teachers will guide the programmes.', 'The board will advise on curriculum, research, quality assurance, industry relevance and international collaboration.'],
            ['event', 'Open day and free workshop: Digital skills for everyone', 'Meet the lecturers, see the classrooms and join a free hands-on workshop.', 'A relaxed morning for students, parents and teachers. Bring your questions about our 18 specialised courses.'],
            ['event', 'Photography and smartphone video basics (free workshop)', 'Learn framing, light and sound with the phone in your pocket.', 'Hands-on session led by IMDR media production staff.'],
            ['research', 'Youth and digital media: how young people verify what they see', 'IMDR Research Centre study plan on misinformation and online behaviour.', 'Research areas include media consumption, social media behaviour, digital literacy, misinformation and disinformation, AI and media, and online safety. Outputs will include research reports, policy briefs and public awareness material.'],
            ['research', 'Media literacy in Sri Lankan schools: teacher survey', 'A planned survey to guide teacher development programmes.', 'Findings will feed the Community Development Division school programmes.'],
            ['media', 'IMDR Student Corner', 'Student-made photo stories, short videos and podcasts.', 'The Media Production Unit turns coursework into real projects: learn, practise, create, earn.'],
            ['media', 'Media Explained', 'Short explainers on how newsrooms, social platforms and algorithms work.', 'A regular series produced with IMDR lecturers and students.'],
        ];

        foreach ($items as $i => [$type, $title, $excerpt, $body]) {
            Post::firstOrCreate(['slug' => Str::slug($title)], [
                'type' => $type, 'title' => $title, 'excerpt' => $excerpt, 'body' => $body, 'is_published' => true,
                'published_at' => now()->subDays($i), 'event_date' => $type === 'event' ? now()->addDays(10 + $i * 4) : null,
                'location' => $type === 'event' ? 'IMDR learning centre' : null,
            ]);
        }
    }

    private function demo(): void
    {
        $password = 'Demo@12345';

        User::updateOrCreate(['username' => 'office'], ['name' => 'Office Admin', 'email' => 'office@imdr.lk', 'password' => $password, 'role' => 'admin', 'status' => 'active']);
        $accountant = User::updateOrCreate(['username' => 'accounts'], ['name' => 'Accounts Officer', 'email' => 'accounts@imdr.lk', 'password' => $password, 'role' => 'accountant', 'status' => 'active']);
        SalaryRule::firstOrCreate(['user_id' => $accountant->id], ['pay_type' => 'monthly', 'basic_salary' => 65000, 'allowances' => 5000]);

        $lecturerUser = User::updateOrCreate(['username' => 'lecturer1'], ['name' => 'Nimali Perera', 'email' => 'nimali@imdr.lk', 'phone' => '0712345678', 'password' => $password, 'role' => 'lecturer', 'status' => 'active']);
        $lecturer = Lecturer::firstOrCreate(['user_id' => $lecturerUser->id], ['qualification' => 'MA in Mass Communication', 'specialization' => 'Media studies and digital journalism']);
        SalaryRule::firstOrCreate(['user_id' => $lecturerUser->id], ['pay_type' => 'hourly', 'hourly_rate' => 2000]);

        Classroom::firstOrCreate(['name' => 'Classroom 1'], ['capacity' => 40, 'location' => 'Ground floor']);
        Classroom::firstOrCreate(['name' => 'Computer lab'], ['capacity' => 30, 'location' => 'First floor']);
    }
}