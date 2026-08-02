const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const productLines = JSON.parse(
  fs.readFileSync(path.resolve('src/utils/productLinesData.json'), 'utf-8')
);

const original = execSync('git show HEAD:src/utils/lmsSeedData.ts', { encoding: 'utf-8' });

const sIdx = original.indexOf('export const COMPLETE_LMS_COURSES: FullCourse[] = [');
const eIdx = original.indexOf('\n];\n\n/**');

const header = `import { supabase } from '@/integrations/supabase/client';

export interface FullLesson {
  title: string;
  content_type: 'text' | 'video' | 'quiz';
  content_body: string;
  video_url?: string;
  duration_mins: number;
  points_reward: number;
  is_required: boolean;
  order_index: number;
}

export interface FullSection {
  title: string;
  order_index: number;
  lessons: FullLesson[];
}

export interface FullQuestion {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: { label: string; value: string }[];
  correct_answer: string;
  points: number;
  order_index: number;
}

export interface FullQuiz {
  title: string;
  passing_score: number;
  max_attempts: number;
  time_limit_mins: number;
  questions: FullQuestion[];
}

export interface FullCourse {
  slug_id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  duration_mins: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_informative: boolean;
  target_roles: string[];
  course_type: 'platform' | 'custom' | 'product_line';
  status: 'published' | 'active';
  sections: FullSection[];
  quiz: FullQuiz;
}
`;

const baseCourses = original.slice(sIdx + 'export const COMPLETE_LMS_COURSES: FullCourse[] = ['.length, eIdx).trim();

const newFileContent = `${header}
export const COMPLETE_LMS_COURSES: FullCourse[] = [
${baseCourses},
  // -------------------------------------------------------------
  // CURSOS MAESTROS DE PORTAFOLIO Y PRODUCTOS BIOFARCO (51 PRODUCTOS)
  // -------------------------------------------------------------
${productLines.map(c => JSON.stringify(c, null, 2)).join(',\n')}
];

/**
 * Seeds all master LMS courses, sections, lessons, quizzes and questions into Supabase
 */
export async function seedCompleteLmsDatabase() {
  try {
    let seededCount = 0;

    for (const course of COMPLETE_LMS_COURSES) {
      // 1. Check if course/module exists by title
      const { data: existingModules, error: modErr } = await supabase
        .from('training_modules')
        .select('id')
        .eq('title', course.title)
        .limit(1);

      let moduleId: string;

      if (existingModules && existingModules.length > 0) {
        moduleId = existingModules[0].id;
        // Update module details
        await supabase
          .from('training_modules')
          .update({
            description: course.description,
            category: course.category,
            points_reward: course.points_reward,
            duration_mins: course.duration_mins,
            difficulty: course.difficulty,
            status: course.status,
            is_informative: course.is_informative,
            target_roles: course.target_roles,
            course_type: course.course_type
          })
          .eq('id', moduleId);
      } else {
        const { data: newModule, error: insErr } = await supabase
          .from('training_modules')
          .insert({
            title: course.title,
            description: course.description,
            category: course.category,
            points_reward: course.points_reward,
            duration_mins: course.duration_mins,
            difficulty: course.difficulty,
            status: course.status,
            is_informative: course.is_informative,
            target_roles: course.target_roles,
            course_type: course.course_type
          })
          .select('id')
          .single();

        if (insErr || !newModule) {
          console.warn('Could not insert module:', course.title, insErr);
          continue;
        }
        moduleId = newModule.id;
      }

      // 2. Process Sections & Lessons
      for (const section of course.sections) {
        const { data: existingSections } = await supabase
          .from('course_sections')
          .select('id')
          .eq('module_id', moduleId)
          .eq('title', section.title)
          .limit(1);

        let sectionId: string;

        if (existingSections && existingSections.length > 0) {
          sectionId = existingSections[0].id;
        } else {
          const { data: newSection, error: secErr } = await supabase
            .from('course_sections')
            .insert({
              module_id: moduleId,
              title: section.title,
              order_index: section.order_index
            })
            .select('id')
            .single();

          if (secErr || !newSection) continue;
          sectionId = newSection.id;
        }

        // Insert Lessons
        for (const lesson of section.lessons) {
          const { data: existingLessons } = await supabase
            .from('course_lessons')
            .select('id')
            .eq('section_id', sectionId)
            .eq('title', lesson.title)
            .limit(1);

          if (existingLessons && existingLessons.length > 0) {
            await supabase
              .from('course_lessons')
              .update({
                content_body: lesson.content_body,
                duration_mins: lesson.duration_mins,
                points_reward: lesson.points_reward
              })
              .eq('id', existingLessons[0].id);
          } else {
            await supabase.from('course_lessons').insert({
              section_id: sectionId,
              title: lesson.title,
              content_type: lesson.content_type,
              content_body: lesson.content_body,
              video_url: lesson.video_url || null,
              duration_mins: lesson.duration_mins,
              points_reward: lesson.points_reward,
              is_required: lesson.is_required,
              order_index: lesson.order_index
            });
          }
        }
      }

      // 3. Process Course Quiz
      if (course.quiz) {
        const { data: existingQuizzes } = await supabase
          .from('course_quizzes')
          .select('id')
          .eq('module_id', moduleId)
          .limit(1);

        let quizId: string;

        if (existingQuizzes && existingQuizzes.length > 0) {
          quizId = existingQuizzes[0].id;
          await supabase
            .from('course_quizzes')
            .update({
              title: course.quiz.title,
              passing_score: course.quiz.passing_score,
              max_attempts: course.quiz.max_attempts,
              time_limit_mins: course.quiz.time_limit_mins
            })
            .eq('id', quizId);
        } else {
          const { data: newQuiz, error: qErr } = await supabase
            .from('course_quizzes')
            .insert({
              module_id: moduleId,
              title: course.quiz.title,
              passing_score: course.quiz.passing_score,
              max_attempts: course.quiz.max_attempts,
              time_limit_mins: course.quiz.time_limit_mins
            })
            .select('id')
            .single();

          if (qErr || !newQuiz) continue;
          quizId = newQuiz.id;
        }

        // Insert Quiz Questions
        for (const question of course.quiz.questions) {
          const { data: existingQs } = await supabase
            .from('quiz_questions')
            .select('id')
            .eq('quiz_id', quizId)
            .eq('question_text', question.question_text)
            .limit(1);

          if (!existingQs || existingQs.length === 0) {
            await supabase.from('quiz_questions').insert({
              quiz_id: quizId,
              question_text: question.question_text,
              question_type: question.question_type,
              options: question.options,
              correct_answer: question.correct_answer,
              points: question.points,
              order_index: question.order_index
            });
          }
        }
      }

      seededCount++;
    }

    // 4. Seed Rewards Catalog
    const defaultRewards = [
      { name: 'Bono Combustible $50', description: 'Tarjeta electrónica recargable para cobertura de visitas en campo', points_cost: 500, stock: 20, status: 'active' },
      { name: 'Almuerzo Ejecutivo VIP', description: 'Voucher gastronómico para restaurante de alta gama', points_cost: 800, stock: 15, status: 'active' },
      { name: 'Día Libre Remunerado', description: 'Permiso compensatorio remunerado de jornada completa', points_cost: 1500, stock: 5, status: 'active' },
      { name: 'Gift Card Tecnológica $100', description: 'Bono canjeable para accesorios y gadgets de productividad', points_cost: 1200, stock: 10, status: 'active' }
    ];

    for (const rew of defaultRewards) {
      const { data: existingR } = await supabase
        .from('rewards_catalog')
        .select('id')
        .eq('name', rew.name)
        .limit(1);

      if (!existingR || existingR.length === 0) {
        await supabase.from('rewards_catalog').insert(rew);
      }
    }

    return {
      success: true,
      message: \`Se sembraron y sincronizaron \${seededCount} cursos maestros completos (Uso de la App + Portafolios Terapéuticos) con lecciones y exámenes en Supabase.\`,
      count: seededCount
    };
  } catch (error: any) {
    console.error('Error seeding LMS database:', error);
    return {
      success: false,
      message: error.message || 'Error al sembrar cursos en la base de datos.',
      count: 0
    };
  }
}
`;

fs.writeFileSync(path.resolve('src/utils/lmsSeedData.ts'), newFileContent, 'utf-8');
console.log('Clean merge complete: src/utils/lmsSeedData.ts written!');
