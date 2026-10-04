<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * The 18 specialised IMDR courses, and nothing else. DatabaseSeeder only calls this seeder.
 *
 * Safe to run more than once. It never touches users or posts, and it never
 * un-publishes a course or changes the slug of one that already exists.
 *
 *   php artisan db:seed --class=SpecialisedCoursesSeeder
 */
class SpecialisedCoursesSeeder extends Seeder
{
    public const MEDIA = 'Media & Journalism';
    public const CINEMA = 'Cinema & Production';
    public const TECH = 'Tech, AI & Digital Business';

    /** [code, category, levels offered, name, summary] */
    private const COURSES = [
        // Media & Journalism
        ['IMF', self::MEDIA, 'Certificate', 'Introduction to Media Fundamentals',
            'A foundational course covering communication principles, media history and the standards of modern media platforms.'],
        ['STO', self::MEDIA, 'Certificate / Advanced Certificate', 'Storytelling',
            'Master the art of narrative design, scriptwriting and concept development for films, documentaries, commercials and digital media.'],
        ['MMG', self::MEDIA, 'Diploma', 'Media Management',
            'Learn production planning, project management, media organisation structures and workflow optimisation.'],
        ['MCR', self::MEDIA, 'Certificate', 'Media Critique',
            'Analyse media messages, examine news ethics and develop critical thinking in evaluating contemporary media content.'],
        ['NJO', self::MEDIA, 'Diploma', 'News Journalism',
            'News gathering, interviewing techniques, newsroom operations, copy editing and broadcast journalism.'],
        ['INV', self::MEDIA, 'Advanced Certificate / Diploma', 'Investigative Journalism',
            'Deep-dive investigative reporting, source verification, ethical considerations and data journalism.'],
        ['MOJ', self::MEDIA, 'Short Course', 'Mobile Journalism (MoJo)',
            'Real-time news reporting, video editing and broadcast-quality production using smartphone technology.'],

        // Cinema & Production
        ['CCR', self::CINEMA, 'Short Course / Certificate', 'Content Creation',
            'Practical training in planning, shooting and editing video content optimised for YouTube, TikTok and social platforms.'],
        ['PHO', self::CINEMA, 'Certificate', 'Photography & Photo Journalism',
            'DSLR and mirrorless camera mechanics, lighting techniques, portraiture, photojournalism ethics and photo editing.'],
        ['CIN', self::CINEMA, 'Diploma', 'Camerawork & Cinematography',
            'Professional cinematography, shot composition, camera movement, studio lighting setups and colour grading.'],
        ['ACT', self::CINEMA, 'Certificate', 'Acting',
            'Screen and stage performance, voice modulation, facial expression techniques and character development.'],
        ['ADP', self::CINEMA, 'Certificate', 'Announcing, Presentation & Dubbing',
            'Radio and TV presentation, news delivery, voiceover techniques, dubbing and audio editing in professional sound booths.'],
        ['MUP', self::CINEMA, 'Short Course', 'Makeup Artistry',
            'Professional makeup for television, cinema, fashion shoots and special effects (SFX) application.'],
        ['SFP', self::CINEMA, 'Advanced Certificate / Diploma', 'Short Film Production',
            'Complete hands-on guidance from pre-production scriptwriting to production shooting and post-production film editing.'],

        // Tech, AI & Digital Business
        ['AIM', self::TECH, 'Short Course / Certificate', 'AI for Media',
            'Use cutting-edge AI tools for content creation, automated editing, graphic generation and media research.'],
        ['GDA', self::TECH, 'Certificate / Diploma', 'Graphic Design & Animation',
            'Visual branding, vector design, typography, 2D animation and layout design for digital and print media.'],
        ['SME', self::TECH, 'Short Course', 'Social Media Entrepreneurship',
            'Building personal brands, monetising social platforms, business strategy and digital revenue generation.'],
        ['DMK', self::TECH, 'Advanced Certificate / Diploma', 'Digital Marketing',
            'Search Engine Optimization (SEO), Social Media Marketing, paid ads, email campaigns, ad strategy and web analytics.'],
    ];

    public function run(): void
    {
        $types = [];
        foreach ([['Certificate', 1], ['Advanced Certificate', 2], ['Diploma', 3], ['Short Course', null]] as [$name, $level]) {
            $types[$name] = CourseType::firstOrCreate(['name' => $name], ['level' => $level, 'description' => null]);
        }

        foreach (self::COURSES as [$code, $category, $levels, $name, $summary]) {
            // Course type = the first (lowest) level it is offered at.
            $primary = trim(explode('/', $levels)[0]);

            $course = Course::firstOrNew(['code' => $code]);

            $course->fill([
                'course_type_id' => $types[$primary]->id,
                'name' => $name,
                'summary' => $summary,
                'description' => $summary,
            ]);

            if (! $course->exists) {
                $course->slug = Str::slug($name);
                $course->is_published = true;
            }

            // forceFill so this works even before category/level_label are added to $fillable.
            $course->forceFill(['category' => $category, 'level_label' => $levels])->save();
        }
    }
}