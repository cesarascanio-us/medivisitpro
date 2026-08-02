import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, CheckCircle2, XCircle, Award, RotateCcw, AlertTriangle, ArrowRight, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COMPLETE_LMS_COURSES } from '@/utils/lmsSeedData';

interface QuizPlayerProps {
  moduleId: string;
  courseTitle: string;
  pointsReward: number;
  onPassed: (pointsEarned: number) => void;
  onClose?: () => void;
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: { label: string; value: string }[];
  correct_answer: string;
  points: number;
}

export default function QuizPlayer({
  moduleId,
  courseTitle,
  pointsReward,
  onPassed,
  onClose
}: QuizPlayerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 mins default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [moduleId]);

  // Timer countdown
  useEffect(() => {
    if (loading || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isSubmitted, timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const { data: qz } = await supabase
        .from('course_quizzes')
        .select('*')
        .eq('module_id', moduleId)
        .maybeSingle();

      if (qz) {
        setQuizData(qz);
        setTimeLeft((qz.time_limit_mins || 15) * 60);

        const { data: qs } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', qz.id)
          .order('order_index', { ascending: true });

        if (qs && qs.length > 0) {
          setQuestions(
            qs.map((q) => ({
              id: q.id,
              question_text: q.question_text,
              question_type: q.question_type,
              options: Array.isArray(q.options) ? q.options : [],
              correct_answer: q.correct_answer,
              points: q.points || 10
            }))
          );
        } else {
          loadFallbackQuestions();
        }
      } else {
        loadFallbackQuestions();
      }
    } catch (err) {
      console.warn('Fallback quiz loaded:', err);
      loadFallbackQuestions();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackQuestions = () => {
    // Find matching course by slug_id or title
    const foundCourse = COMPLETE_LMS_COURSES.find(
      (c) =>
        c.slug_id === moduleId ||
        c.title.toLowerCase().includes(courseTitle.toLowerCase()) ||
        courseTitle.toLowerCase().includes(c.title.toLowerCase())
    ) || COMPLETE_LMS_COURSES[0];

    const targetQuiz = foundCourse.quiz;

    setQuizData({
      title: targetQuiz.title,
      passing_score: targetQuiz.passing_score || 80,
      max_attempts: targetQuiz.max_attempts || 3,
      time_limit_mins: targetQuiz.time_limit_mins || 15
    });
    setTimeLeft((targetQuiz.time_limit_mins || 15) * 60);

    setQuestions(
      targetQuiz.questions.map((q, idx) => ({
        id: `q_${idx}`,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points
      }))
    );
  };

  const handleSelectAnswer = (qId: string, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmitQuiz = async () => {
    let totalPts = 0;
    let earnedPts = 0;

    questions.forEach((q) => {
      totalPts += q.points;
      if (userAnswers[q.id] === q.correct_answer) {
        earnedPts += q.points;
      }
    });

    const percentage = totalPts > 0 ? Math.round((earnedPts / totalPts) * 100) : 100;
    const passingRequired = quizData?.passing_score || 70;
    const passed = percentage >= passingRequired;

    setScoreResult({
      totalPoints: totalPts,
      earnedPoints: earnedPts,
      percentage,
      passed
    });
    setIsSubmitted(true);

    if (passed) {
      // Award points to profile
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('total_points')
            .eq('id', user.id)
            .maybeSingle();

          const currentPts = profile?.total_points || 0;
          const newPts = currentPts + pointsReward;

          await supabase
            .from('profiles')
            .update({ total_points: newPts })
            .eq('id', user.id);
        } catch (e) {
          console.warn('Could not update profile points in DB:', e);
        }
      }

      onPassed(pointsReward);
      toast({
        title: '¡Felicidades! Examen Aprobado 🎉',
        description: `Has obtenido ${percentage}% y ganado +${pointsReward} puntos para premios.`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Examen no superado',
        description: `Obtuviste ${percentage}%. Necesitas al menos ${passingRequired}% para certificar.`,
        variant: 'destructive'
      });
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setScoreResult(null);
    setTimeLeft((quizData?.time_limit_mins || 10) * 60);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Preparando examen interactivo...</p>
      </div>
    );
  }

  // RESULT SCREEN
  if (isSubmitted && scoreResult) {
    return (
      <Card className="border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div
          className={`p-8 text-center text-white ${
            scoreResult.passed
              ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-700'
              : 'bg-gradient-to-br from-rose-500 via-red-600 to-orange-700'
          }`}
        >
          <div className="inline-flex p-4 rounded-full bg-white/20 backdrop-blur-md mb-4 shadow-xl">
            {scoreResult.passed ? <Trophy className="h-14 w-14 text-yellow-300 animate-bounce" /> : <AlertTriangle className="h-14 w-14 text-white" />}
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-1">
            {scoreResult.passed ? '¡Felicitaciones! Certificado Aprobado' : 'Examen No Aprobado'}
          </h2>
          <p className="text-sm opacity-90 max-w-md mx-auto">
            {scoreResult.passed
              ? `Has dominado los conceptos clave de este módulo de MediVisit Pro.`
              : `Necesitas un mínimo de ${quizData?.passing_score || 70}% para aprobar y reclamar los puntos.`}
          </p>

          {/* Big Score Counter */}
          <div className="mt-6 inline-flex items-baseline gap-2 bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-inner">
            <span className="text-5xl font-black">{scoreResult.percentage}%</span>
            <span className="text-xs uppercase font-bold tracking-widest opacity-80">Calificación Final</span>
          </div>

          {scoreResult.passed && (
            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-200 font-black text-sm">
              <Sparkles className="h-4 w-4" />
              <span>+{pointsReward} Puntos Sumados a tu Billetera de Premios</span>
            </div>
          )}
        </div>

        {/* Detailed Question Review */}
        <CardContent className="p-6 space-y-6">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <span>Revisión de Respuestas ({questions.length} preguntas)</span>
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correct_answer;
              const correctOpt = q.options.find((o) => o.value === q.correct_answer);
              const userOpt = q.options.find((o) => o.value === userAns);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-xs text-muted-foreground">Pregunta {idx + 1}</span>
                    <Badge
                      className={
                        isCorrect
                          ? 'bg-emerald-500 text-white text-[10px]'
                          : 'bg-rose-500 text-white text-[10px]'
                      }
                    >
                      {isCorrect ? 'Correcta (+ ' + q.points + ' pts)' : 'Incorrecta (0 pts)'}
                    </Badge>
                  </div>

                  <p className="text-sm font-semibold text-foreground mb-3">{q.question_text}</p>

                  <div className="text-xs space-y-1">
                    <p className="text-muted-foreground">
                      Tu respuesta:{' '}
                      <span className={isCorrect ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'font-bold text-rose-600 dark:text-rose-400'}>
                        {userOpt?.label || 'Sin responder'}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Respuesta correcta: {correctOpt?.label}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            {!scoreResult.passed ? (
              <Button onClick={handleRetry} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> Reintentar Examen
              </Button>
            ) : (
              <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Finalizar y Volver
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ACTIVE EXAM SCREEN
  const currentQ = questions[currentIndex];
  const progressPct = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <Card className="border-border bg-card shadow-2xl overflow-hidden">
      {/* Top Status Bar */}
      <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{quizData?.title || 'Examen de Certificación'}</h3>
            <p className="text-xs text-muted-foreground">
              Pregunta {currentIndex + 1} de {questions.length} • {answeredCount} respondidas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border shadow-sm">
            <Clock className={`h-4 w-4 ${timeLeft < 120 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
            <span className={`font-mono font-black text-xs ${timeLeft < 120 ? 'text-rose-500 font-bold' : 'text-foreground'}`}>
              {formatTimer(timeLeft)}
            </span>
          </div>

          <Badge className="bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> +{pointsReward} pts
          </Badge>
        </div>
      </div>

      <Progress value={progressPct} className="h-1 rounded-none bg-muted [&>div]:bg-amber-500" />

      {/* Main Question Body */}
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {currentQ.question_type === 'multiple_choice' ? 'Selección Múltiple' : 'Verdadero o Falso'} ({currentQ.points} pts)
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug">
            {currentQ.question_text}
          </h2>
        </div>

        {/* Options */}
        <RadioGroup
          value={userAnswers[currentQ.id] || ''}
          onValueChange={(val) => handleSelectAnswer(currentQ.id, val)}
          className="space-y-3 pt-2"
        >
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = userAnswers[currentQ.id] === opt.value;
            return (
              <label
                key={opt.value || optIdx}
                htmlFor={`ans-${currentQ.id}-${optIdx}`}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-md text-foreground ring-2 ring-amber-500/20'
                    : 'border-border bg-card hover:bg-muted/40 text-foreground'
                }`}
              >
                <RadioGroupItem value={opt.value} id={`ans-${currentQ.id}-${optIdx}`} className="text-amber-600" />
                <span className="text-sm font-medium leading-normal flex-1">{opt.label}</span>
              </label>
            );
          })}
        </RadioGroup>

        {/* Navigation Matrix & Actions */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Question Dots */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {questions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-white shadow'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="rounded-xl flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Anterior
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1"
              >
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmitQuiz}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Entregar Examen
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
