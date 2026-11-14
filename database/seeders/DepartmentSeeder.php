<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

/**
 * Starter departments. Names are placeholders: rename them in the admin panel (Departments page).
 * Each course is put in the department that matches its website category. Safe to run again.
 */
class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['MJ', 'Media & Journalism Department', 'Media & Journalism'],
            ['CP', 'Cinema & Production Department', 'Cinema & Production'],
            ['TAD', 'Tech, AI & Digital Business Department', 'Tech, AI & Digital Business'],
        ];

        foreach ($departments as [$code, $name, $category]) {
            $department = Department::firstOrCreate(['code' => $code], ['name' => $name, 'is_active' => true]);

            if (Schema::hasColumn('courses', 'category') && Schema::hasColumn('courses', 'department_id')) {
                Course::where('category', $category)->whereNull('department_id')->update(['department_id' => $department->id]);
            }
        }
    }
}