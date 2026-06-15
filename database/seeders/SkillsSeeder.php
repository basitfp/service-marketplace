<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Skill;

class SkillsSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            'PHP', 'Laravel', 'React', 'Vue.js', 'MySQL', 
            'UI/UX Design', 'Graphic Design', 'SEO', 
            'Content Writing', 'Video Editing', 'Mobile Development',
            'Data Entry', 'Customer Support', 'AC Technician', 'Electrician'
        ];

        foreach ($skills as $skill) {
            Skill::firstOrCreate(['name' => $skill]);
        }
    }
}
