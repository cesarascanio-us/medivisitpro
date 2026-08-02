import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Award,
  Clock,
  Trophy,
  Sparkles,
  Share2,
  Download,
  Flame,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import QuizPlayer from './QuizPlayer';
import { RichLessonRenderer } from './RichLessonRenderer';
import { COMPLETE_LMS_COURSES } from '@/utils/lmsSeedData';

interface Lesson {
  id: string;
  section_id: string;
  title: string;
  content_type: 'text' | 'video' | 'quiz';
  content_body?: string;
  video_url?: string;
  duration_mins: number;
  points_reward: number;
  is_required: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CoursePlayerProps {
  module: {
    id: string;
    title: string;
    description: string;
    category: string;
    points_reward: number;
    duration_mins?: number;
    instructor_name?: string;
    is_informative?: boolean;
  };
  onBack: () => void;
  onCourseCompleted?: () => void;
}

export default function CoursePlayer({ module, onBack, onCourseCompleted }: CoursePlayerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    loadCourseContent();
  }, [module.id]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      // 1. Fetch sections
      const { data: sData } = await supabase
        .from('course_sections')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index', { ascending: true });

      // 2. Fetch lessons
      const { data: lData } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index', { ascending: true });

      if (sData && sData.length > 0 && lData && lData.length > 0) {
        const assembled: Section[] = sData.map((s) => ({
          id: s.id,
          title: s.title,
          lessons: lData
            .filter((l) => l.section_id === s.id)
            .map((l) => ({
              id: l.id,
              section_id: l.section_id,
              title: l.title,
              content_type: l.content_type || 'text',
              content_body: l.content_body || '',
              video_url: l.video_url || '',
              duration_mins: l.duration_mins || 10,
              points_reward: l.points_reward || 10,
              is_required: l.is_required ?? true
            }))
        }));

        setSections(assembled);
        setExpandedSections(new Set(assembled.map((s) => s.id)));

        // Set first lesson active
        if (assembled[0]?.lessons[0]) {
          setActiveLessonId(assembled[0].lessons[0].id);
        }
      } else {
        // Fallback default rich Moodle-style curriculum for this module
        loadDefaultCurriculum();
      }

      // 3. Fetch user progress if available
      if (user?.id) {
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('module_id', module.id)
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (progressData) {
          setCompletedLessonIds(new Set(progressData.map((p) => p.lesson_id)));
        }
      }
    } catch (e) {
      console.warn('Loading fallback curriculum:', e);
      loadDefaultCurriculum();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultCurriculum = () => {
    const foundCourse = COMPLETE_LMS_COURSES.find(
      (c) =>
        c.slug_id === module.id ||
        c.title.toLowerCase().includes(module.title.toLowerCase()) ||
        module.title.toLowerCase().includes(c.title.toLowerCase())
    ) || COMPLETE_LMS_COURSES[0];

    const defaultSections: Section[] = foundCourse.sections.map((sec, sIdx) => ({
      id: `sec_${sIdx}`,
      title: sec.title,
      lessons: sec.lessons.map((les, lIdx) => ({
        id: `les_${sIdx}_${lIdx}`,
        section_id: `sec_${sIdx}`,
        title: les.title,
        content_type: les.content_type,
        content_body: les.content_body,
        video_url: les.video_url,
        duration_mins: les.duration_mins,
        points_reward: les.points_reward,
        is_required: les.is_required
      }))
    }));

    if (foundCourse.quiz) {
      defaultSections.push({
        id: `sec_quiz`,
        title: 'Evaluación y Certificación Oficial',
        lessons: [
          {
            id: `les_quiz_final`,
            section_id: `sec_quiz`,
            title: foundCourse.quiz.title,
            content_type: 'quiz',
            duration_mins: foundCourse.quiz.time_limit_mins,
            points_reward: module.points_reward || 100,
            is_required: true
          }
        ]
      });
    }

    setSections(defaultSections);
    setExpandedSections(new Set(defaultSections.map((s) => s.id)));
    if (defaultSections[0]?.lessons[0]) {
      setActiveLessonId(defaultSections[0].lessons[0].id);
    }
  };

  // Flattened list of all lessons in order
  const allLessons = sections.flatMap((s) => s.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === activeLessonId);
  const activeLesson = allLessons[currentLessonIndex] || allLessons[0];

  // Calculate Course Progress
  const totalLessonsCount = allLessons.length;
  const completedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const progressPercentage = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  const toggleSection = (sId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sId)) next.delete(sId);
      else next.add(sId);
      return next;
    });
  };

  const handleMarkCompleted = async (lessonId: string) => {
    const updated = new Set(completedLessonIds);
    updated.add(lessonId);
    setCompletedLessonIds(updated);

    // Save to DB
    if (user?.id) {
      try {
        await supabase.from('lesson_progress').upsert({
          user_id: user.id,
          lesson_id: lessonId,
          module_id: module.id,
          status: 'completed',
          completed_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Saved local progress fallback:', e);
      }
    }

    toast({
      title: '¡Lección completada! ✓',
      description: 'Progreso actualizado.',
      variant: 'default'
    });

    // Check if course 100% completed
    if (updated.size >= totalLessonsCount) {
      setShowCertificateModal(true);
      if (onCourseCompleted) onCourseCompleted();
    } else if (currentLessonIndex < allLessons.length - 1) {
      // Auto advance to next
      setActiveLessonId(allLessons[currentLessonIndex + 1].id);
    }
  };

  const handleQuizPassed = (pts: number) => {
    if (activeLesson) {
      handleMarkCompleted(activeLesson.id);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4" />
        <p className="font-bold text-foreground">Cargando contenido de la Academia...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver a Cursos
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-foreground tracking-tight">{module.title}</h1>
              <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase font-bold">
                {module.category || 'General'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{module.description}</p>
          </div>
        </div>

        {/* Global Progress & Points Tracker */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Progreso ({completedCount}/{totalLessonsCount})
            </p>
            <div className="flex items-center gap-2">
              <Progress value={progressPercentage} className="w-28 h-2 bg-muted [&>div]:bg-emerald-500" />
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{progressPercentage}%</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3.5 py-1.5 rounded-xl shadow flex items-center gap-2 font-black text-xs">
            <Award className="h-4 w-4 fill-white" />
            <span>+{module.points_reward} pts</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Syllabus, Right Player Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Moodle Curriculum Tree */}
        <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>Estructura del Curso</span>
              <span className="text-xs font-normal text-muted-foreground">{totalLessonsCount} Lecciones</span>
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sections.map((sec, secIdx) => {
                const isExpanded = expandedSections.has(sec.id);
                const secLessons = sec.lessons;
                const secCompleted = secLessons.filter((l) => completedLessonIds.has(l.id)).length;

                return (
                  <div key={sec.id} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                    <button
                      onClick={() => toggleSection(sec.id)}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 pr-2">
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                        <span className="text-xs font-bold text-foreground leading-snug line-clamp-1">{sec.title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                        {secCompleted}/{secLessons.length}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="divide-y divide-border bg-card">
                        {secLessons.map((les) => {
                          const isActive = les.id === activeLessonId;
                          const isDone = completedLessonIds.has(les.id);

                          return (
                            <button
                              key={les.id}
                              onClick={() => setActiveLessonId(les.id)}
                              className={`w-full p-3 text-left flex items-start gap-2.5 transition-all ${
                                isActive
                                  ? 'bg-indigo-500/10 border-l-4 border-l-indigo-600 text-foreground font-semibold'
                                  : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <div className="pt-0.5 flex-shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                                ) : les.content_type === 'video' ? (
                                  <Video className="h-4 w-4 text-rose-500" />
                                ) : les.content_type === 'quiz' ? (
                                  <HelpCircle className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <FileText className="h-4 w-4 text-blue-500" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-snug truncate ${isActive ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}`}>
                                  {les.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                  <span>{les.duration_mins} min</span>
                                  {les.points_reward > 0 && <span>• +{les.points_reward} pts</span>}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Stage: Content Player */}
        <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
          {activeLesson ? (
            <div className="space-y-4">
              {/* QUIZ TYPE */}
              {activeLesson.content_type === 'quiz' ? (
                <QuizPlayer
                  moduleId={module.id}
                  courseTitle={module.title}
                  pointsReward={activeLesson.points_reward || module.points_reward || 100}
                  onPassed={handleQuizPassed}
                />
              ) : (
                /* REGULAR TEXT OR VIDEO LESSON */
                <Card className="border-border bg-card shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        {activeLesson.content_type === 'video' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        {activeLesson.content_type === 'video' ? 'Video Tutorial' : 'Guía de Capacitación'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {activeLesson.duration_mins} minutos
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-foreground">{activeLesson.title}</h2>
                  </div>

                  <CardContent className="p-6 md:p-8 space-y-6">
                    {/* Embedded Video if Video Type */}
                    {activeLesson.content_type === 'video' && activeLesson.video_url && (
                      <div className="aspect-video rounded-2xl overflow-hidden bg-black/90 shadow-2xl border border-border">
                        <iframe
                          src={getEmbedUrl(activeLesson.video_url)}
                          title={activeLesson.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Rich Reading Body */}
                    {activeLesson.content_body && (
                      <div className="text-foreground text-sm leading-relaxed">
                        <RichLessonRenderer content={activeLesson.content_body} />
                      </div>
                    )}

                    {/* Bottom Action Navigator */}
                    <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <Button
                        variant="outline"
                        disabled={currentLessonIndex === 0}
                        onClick={() => setActiveLessonId(allLessons[currentLessonIndex - 1].id)}
                        className="rounded-xl flex items-center gap-1.5 w-full sm:w-auto"
                      >
                        <ArrowLeft className="h-4 w-4" /> Lección Anterior
                      </Button>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          onClick={() => handleMarkCompleted(activeLesson.id)}
                          className={`${
                            completedLessonIds.has(activeLesson.id)
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          } text-white font-bold rounded-xl shadow-lg flex items-center gap-2 w-full sm:w-auto`}
                        >
                          <Check className="h-4 w-4" />
                          {completedLessonIds.has(activeLesson.id) ? 'Completada ✓' : 'Marcar como Completada'}
                        </Button>

                        {currentLessonIndex < allLessons.length - 1 && (
                          <Button
                            variant="secondary"
                            onClick={() => setActiveLessonId(allLessons[currentLessonIndex + 1].id)}
                            className="rounded-xl flex items-center gap-1.5 w-full sm:w-auto"
                          >
                            Siguiente <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-2xl border border-border">
              <p className="text-muted-foreground">Selecciona una lección para comenzar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Celebration Modal */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="sm:max-w-[500px] text-center p-8 bg-card border border-border rounded-3xl shadow-2xl">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto w-fit mb-4">
            <Trophy className="h-16 w-16 animate-bounce" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">
              ¡Curso Oficial Aprobado con Éxito!
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground mt-2">
            Has completado satisfactoriamente todas las lecciones del curso <strong className="text-foreground">{module.title}</strong>.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 flex items-center justify-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recompensa Otorgada</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">+{module.points_reward} Puntos para Premios</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowCertificateModal(false)} className="rounded-xl">
              Cerrar
            </Button>
            <Button
              onClick={() => {
                setShowCertificateModal(false);
                onBack();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
            >
              Explorar Más Cursos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
