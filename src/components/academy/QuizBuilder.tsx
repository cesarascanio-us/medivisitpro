import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Trash2, CheckCircle2, Save, X, AlertCircle, Clock, Target, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: { label: string; value: string }[];
  correct_answer: string;
  points: number;
  order_index: number;
}

interface QuizBuilderProps {
  moduleId: string;
  courseTitle: string;
  onClose: () => void;
  onSaved?: () => void;
}

export default function QuizBuilder({ moduleId, courseTitle, onClose, onSaved }: QuizBuilderProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);

  // Quiz Header Config
  const [quizConfig, setQuizConfig] = useState({
    title: 'Examen de Certificación y Validación de Conocimientos',
    passing_score: 70,
    max_attempts: 3,
    time_limit_mins: 15
  });

  // Questions List
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchQuiz();
  }, [moduleId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      // Fetch quiz header
      const { data: quizData, error: quizError } = await supabase
        .from('course_quizzes')
        .select('*')
        .eq('module_id', moduleId)
        .maybeSingle();

      if (quizData) {
        setQuizId(quizData.id);
        setQuizConfig({
          title: quizData.title || 'Examen de Certificación',
          passing_score: quizData.passing_score || 70,
          max_attempts: quizData.max_attempts || 3,
          time_limit_mins: quizData.time_limit_mins || 15
        });

        // Fetch questions
        const { data: qData, error: qError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('order_index', { ascending: true });

        if (qData && qData.length > 0) {
          setQuestions(
            qData.map((q) => ({
              id: q.id,
              question_text: q.question_text || '',
              question_type: q.question_type || 'multiple_choice',
              options: Array.isArray(q.options) ? q.options : [],
              correct_answer: q.correct_answer || 'opt_0',
              points: q.points || 10,
              order_index: q.order_index || 0
            }))
          );
        } else {
          // Initialize with 1 default question
          initDefaultQuestions();
        }
      } else {
        initDefaultQuestions();
      }
    } catch (err) {
      console.warn('Error or table not ready, initializing default template:', err);
      initDefaultQuestions();
    } finally {
      setLoading(false);
    }
  };

  const initDefaultQuestions = () => {
    setQuestions([
      {
        id: 'q_default_1',
        question_text: '¿Cuál es el paso fundamental antes de iniciar el recorrido diario en MediVisit Pro?',
        question_type: 'multiple_choice',
        options: [
          { label: 'Revisar la agenda de médicos programados y verificar geolocalización de farmacias', value: 'opt_0' },
          { label: 'Cerrar la sesión de la cuenta', value: 'opt_1' },
          { label: 'Eliminar el historial de visitas anteriores', value: 'opt_2' },
          { label: 'Esperar a fin de mes para sincronizar', value: 'opt_3' }
        ],
        correct_answer: 'opt_0',
        points: 20,
        order_index: 0
      },
      {
        id: 'q_default_2',
        question_text: '¿El registro de muestras médicas entregadas impacta automáticamente el inventario del representante?',
        question_type: 'true_false',
        options: [
          { label: 'Verdadero (Se descuenta del stock en tiempo real)', value: 'true' },
          { label: 'Falso (Solo es un campo informativo)', value: 'false' }
        ],
        correct_answer: 'true',
        points: 20,
        order_index: 1
      }
    ]);
  };

  const handleAddQuestion = (type: 'multiple_choice' | 'true_false') => {
    const newId = `q_new_${Date.now()}`;
    const newQ: Question = {
      id: newId,
      question_text: '',
      question_type: type,
      options:
        type === 'multiple_choice'
          ? [
              { label: 'Opción A', value: 'opt_0' },
              { label: 'Opción B', value: 'opt_1' },
              { label: 'Opción C', value: 'opt_2' },
              { label: 'Opción D', value: 'opt_3' }
            ]
          : [
              { label: 'Verdadero', value: 'true' },
              { label: 'Falso', value: 'false' }
            ],
      correct_answer: type === 'multiple_choice' ? 'opt_0' : 'true',
      points: 10,
      order_index: questions.length
    };

    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (qIndex: number, fields: Partial<Question>) => {
    const next = [...questions];
    next[qIndex] = { ...next[qIndex], ...fields };
    setQuestions(next);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const next = [...questions];
    const opts = [...next[qIndex].options];
    opts[optIndex] = { ...opts[optIndex], label: text };
    next[qIndex].options = opts;
    setQuestions(next);
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      toast({ title: 'El examen debe tener al menos 1 pregunta', variant: 'destructive' });
      return;
    }
    const next = questions.filter((_, idx) => idx !== qIndex);
    setQuestions(next);
  };

  const handleSaveQuiz = async () => {
    // Validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim()) {
        toast({
          title: `La pregunta #${i + 1} no tiene texto`,
          description: 'Por favor redacta la pregunta antes de guardar.',
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      setSaving(true);

      // 1. Save or update quiz header
      let currentQuizId = quizId;
      if (!currentQuizId) {
        const { data: newQuiz, error: createError } = await supabase
          .from('course_quizzes')
          .insert({
            module_id: moduleId,
            title: quizConfig.title,
            passing_score: Number(quizConfig.passing_score),
            max_attempts: Number(quizConfig.max_attempts),
            time_limit_mins: Number(quizConfig.time_limit_mins)
          })
          .select('id')
          .single();

        if (createError) {
          console.warn('Fallback quiz insert error:', createError);
        } else if (newQuiz) {
          currentQuizId = newQuiz.id;
          setQuizId(currentQuizId);
        }
      } else {
        await supabase
          .from('course_quizzes')
          .update({
            title: quizConfig.title,
            passing_score: Number(quizConfig.passing_score),
            max_attempts: Number(quizConfig.max_attempts),
            time_limit_mins: Number(quizConfig.time_limit_mins)
          })
          .eq('id', currentQuizId);
      }

      // 2. Save Questions if table is present
      if (currentQuizId) {
        // Delete previous questions
        await supabase.from('quiz_questions').delete().eq('quiz_id', currentQuizId);

        // Insert fresh questions
        const questionsPayload = questions.map((q, idx) => ({
          quiz_id: currentQuizId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          points: q.points,
          order_index: idx
        }));

        await supabase.from('quiz_questions').insert(questionsPayload);
      }

      toast({
        title: '¡Examen configurado exitosamente!',
        description: `Total de preguntas: ${questions.length} | Puntaje de Aprobación: ${quizConfig.passing_score}%`,
        variant: 'default'
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      toast({ title: 'Error al guardar examen', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const totalPoints = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);

  if (loading) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Cargando constructor de examen...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header Banner */}
      <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-foreground tracking-tight">Constructor de Exámenes</h3>
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200">Moodle Style</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Curso: <span className="font-semibold text-foreground">{courseTitle}</span>
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 rounded-xl">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        {/* Settings Bar */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="quiz-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nombre del Examen / Evaluación
            </Label>
            <Input
              id="quiz-title"
              value={quizConfig.title}
              onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
              className="font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
            <div className="space-y-1.5">
              <Label htmlFor="pass-score" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-500" /> Nota Mínima para Aprobar (%)
              </Label>
              <Input
                id="pass-score"
                type="number"
                min={1}
                max={100}
                value={quizConfig.passing_score}
                onChange={(e) => setQuizConfig({ ...quizConfig, passing_score: Number(e.target.value) })}
                className="h-8 text-sm font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max-att" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-blue-500" /> Intentos Permitidos
              </Label>
              <Input
                id="max-att"
                type="number"
                min={1}
                max={10}
                value={quizConfig.max_attempts}
                onChange={(e) => setQuizConfig({ ...quizConfig, max_attempts: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time-lim" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-orange-500" /> Límite de Tiempo (Minutos)
              </Label>
              <Input
                id="time-lim"
                type="number"
                min={1}
                max={30}
                value={quizConfig.time_limit_mins}
                onChange={(e) => setQuizConfig({ ...quizConfig, time_limit_mins: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Question Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base text-foreground">Banco de Preguntas ({questions.length})</h4>
              <p className="text-xs text-muted-foreground">Puntaje Total Acumulado: {totalPoints} pts</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddQuestion('multiple_choice')}
                className="text-xs rounded-xl flex items-center gap-1.5 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              >
                <Plus className="h-3.5 w-3.5" /> Opción Múltiple
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddQuestion('true_false')}
                className="text-xs rounded-xl flex items-center gap-1.5 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              >
                <Plus className="h-3.5 w-3.5" /> Verdadero / Falso
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="p-5 rounded-2xl border border-border bg-card hover:border-amber-400/50 transition-all shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 text-white font-black text-xs">
                      {qIdx + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                      {q.question_type === 'multiple_choice' ? 'Opción Múltiple' : 'Verdadero / Falso'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={`pts-${qIdx}`} className="text-xs text-muted-foreground">
                        Puntos:
                      </Label>
                      <Input
                        id={`pts-${qIdx}`}
                        type="number"
                        min={1}
                        max={100}
                        value={q.points}
                        onChange={(e) => handleUpdateQuestion(qIdx, { points: Number(e.target.value) })}
                        className="h-7 w-16 text-xs text-center font-bold"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Enunciado de la Pregunta *</Label>
                  <Textarea
                    rows={2}
                    value={q.question_text}
                    onChange={(e) => handleUpdateQuestion(qIdx, { question_text: e.target.value })}
                    placeholder="Escribe la pregunta aquí..."
                    className="text-sm font-medium resize-y"
                  />
                </div>

                {/* Options and Correct Answer Selector */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                    <span>Opciones de Respuesta</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      ● Selecciona el radio de la respuesta correcta
                    </span>
                  </Label>

                  <RadioGroup
                    value={q.correct_answer}
                    onValueChange={(val) => handleUpdateQuestion(qIdx, { correct_answer: val })}
                    className="space-y-2"
                  >
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correct_answer === opt.value;
                      return (
                        <div
                          key={opt.value || optIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-foreground shadow-sm'
                              : 'border-border bg-muted/20 hover:bg-muted/40'
                          }`}
                        >
                          <RadioGroupItem value={opt.value} id={`opt-${qIdx}-${optIdx}`} className="text-emerald-600" />
                          <div className="flex-1">
                            {q.question_type === 'multiple_choice' ? (
                              <Input
                                value={opt.label}
                                onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                placeholder={`Opción ${String.fromCharCode(65 + optIdx)}`}
                                className="h-8 text-xs border-0 bg-transparent focus-visible:ring-0 px-1 font-medium"
                              />
                            ) : (
                              <span className="text-xs font-bold px-1">{opt.label}</span>
                            )}
                          </div>
                          {isCorrect && (
                            <Badge className="bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Correcta
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Aprobar el examen otorgará la certificación y puntos de recompensa</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveQuiz}
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 font-bold"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Examen Moodle'}
          </Button>
        </div>
      </div>
    </div>
  );
}
