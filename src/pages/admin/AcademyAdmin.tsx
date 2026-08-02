import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Edit,
  BookOpen,
  HelpCircle,
  Eye,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  ShoppingBag,
  Gift,
  Check,
  X,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CourseBuilder from '@/components/academy/CourseBuilder';
import LessonEditor from '@/components/academy/LessonEditor';
import QuizBuilder from '@/components/academy/QuizBuilder';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  required_role?: string;
  target_roles?: string[];
  points_reward: number;
  status: 'active' | 'draft' | 'archived';
  course_type?: 'platform' | 'custom';
  duration_mins?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_informative?: boolean;
  image_url?: string;
  thumbnail_url?: string;
  created_at?: string;
}

interface RewardItem {
  id: string;
  name: string;
  description?: string;
  points_cost: number;
  image_url?: string;
  stock?: number;
  status?: string;
  created_at?: string;
}

interface RedemptionItem {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'delivered' | 'rejected';
  created_at: string;
  profiles?: { full_name?: string; email?: string };
  rewards_catalog?: { name?: string; points_cost?: number; image_url?: string };
}

interface QuizItem {
  id: string;
  module_id: string;
  title: string;
  passing_score: number;
  max_attempts: number;
  time_limit_mins: number;
  training_modules?: { title?: string };
  question_count?: number;
}

export default function AcademyAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Course Management State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrainingModule | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'app_onboarding',
    points_reward: 100,
    duration_mins: 30,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    is_informative: false,
    status: 'active' as 'active' | 'draft' | 'archived',
    course_type: 'platform' as 'platform' | 'custom',
    target_roles: ['representative'],
    image_url: ''
  });

  // Builder views
  const [managingStructureModuleId, setManagingStructureModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [managingQuizModuleId, setManagingQuizModuleId] = useState<string | null>(null);

  // Rewards CRUD State
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    points_cost: 200,
    image_url: '',
    stock: 10,
    status: 'active'
  });

  // Quiz Modal (Create / Edit Metadata)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState({
    module_id: '',
    title: 'Examen de Certificación Oficial',
    passing_score: 70,
    max_attempts: 3,
    time_limit_mins: 15
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch courses
      const { data: coursesData, error: cErr } = await supabase
        .from('training_modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesData && coursesData.length > 0) {
        setModules(coursesData as any);
      } else {
        setModules(getDefaultSystemModules());
      }

      // 2. Fetch quizzes with module title
      try {
        const { data: qData } = await supabase
          .from('course_quizzes')
          .select('*, training_modules(title)')
          .order('created_at', { ascending: false });

        if (qData) {
          setQuizzes(qData as any);
        }
      } catch (e) {
        console.warn('Quizzes fetch:', e);
      }

      // 3. Fetch rewards catalog
      const { data: rData } = await supabase
        .from('rewards_catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (rData && rData.length > 0) {
        setRewards(rData as any);
      } else {
        setRewards([
          { id: '1', name: 'Bono Combustible $50', description: 'Tarjeta electrónica para visitas de campo', points_cost: 500, stock: 15, status: 'active' },
          { id: '2', name: 'Almuerzo Ejecutivo VIP', description: 'Voucher para restaurante seleccionado', points_cost: 800, stock: 10, status: 'active' },
          { id: '3', name: 'Día Libre Remunerado', description: 'Permiso compensatorio remunerado', points_cost: 1500, stock: 5, status: 'active' }
        ]);
      }

      // 4. Fetch redemptions with profiles and rewards
      try {
        const { data: redData } = await supabase
          .from('user_reward_redemptions')
          .select('*, profiles(full_name, email), rewards_catalog(name, points_cost, image_url)')
          .order('created_at', { ascending: false })
          .limit(20);

        if (redData) {
          setRedemptions(redData as any);
        }
      } catch (e) {
        console.warn('Redemptions fetch:', e);
      }
    } catch (error) {
      console.error('Error fetching Academy data:', error);
      setModules(getDefaultSystemModules());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSystemModules = (): TrainingModule[] => [
    {
      id: 'sys_course_rep',
      title: 'Mastery de Campo: Ejecución de Visita Médica y Muestras',
      description: 'Capacitación obligatoria para Representantes: ruteo inteligente, registro presencial con Geo-Tagging, control de muestras y compromisos de prescripción.',
      category: 'app_onboarding',
      points_reward: 150,
      duration_mins: 35,
      difficulty: 'beginner',
      status: 'active',
      is_informative: false,
      target_roles: ['representative'],
      course_type: 'platform'
    },
    {
      id: 'sys_course_mgr',
      title: 'Supervisión Gerencial: Ciclos, Cobertura y Tablero de Control',
      description: 'Capacitación obligatoria para Gerentes: ciclos promocionales, asignación de baremos, auditoría de rutas y detección de fugas de ventas en farmacias.',
      category: 'management',
      points_reward: 200,
      duration_mins: 45,
      difficulty: 'intermediate',
      status: 'active',
      is_informative: false,
      target_roles: ['manager', 'gerente', 'admin'],
      course_type: 'platform'
    },
    {
      id: 'sys_course_admin',
      title: 'Administración SaaS: Sentinel, Roles y Facturación',
      description: 'Guía completa de configuración para Administradores: planes de suscripción, asignación de permisos organizacionales y auditoría global.',
      category: 'compliance',
      points_reward: 100,
      duration_mins: 25,
      difficulty: 'advanced',
      status: 'active',
      is_informative: true,
      target_roles: ['admin', 'master'],
      course_type: 'platform'
    }
  ];

  // -------------------------------------------------------------
  // COURSE CRUD
  // -------------------------------------------------------------
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      category: 'app_onboarding',
      points_reward: 100,
      duration_mins: 30,
      difficulty: 'beginner',
      is_informative: false,
      status: 'active',
      course_type: 'custom',
      target_roles: ['representative'],
      image_url: ''
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (mod: TrainingModule) => {
    setEditingCourse(mod);
    setCourseForm({
      title: mod.title || '',
      description: mod.description || '',
      category: mod.category || 'app_onboarding',
      points_reward: mod.points_reward || 100,
      duration_mins: mod.duration_mins || 30,
      difficulty: mod.difficulty || 'beginner',
      is_informative: !!mod.is_informative,
      status: (mod.status as any) || 'active',
      course_type: mod.course_type || 'custom',
      target_roles: mod.target_roles || ['representative'],
      image_url: mod.image_url || ''
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) {
      toast({ title: 'El título del curso es obligatorio', variant: 'destructive' });
      return;
    }

    if (courseForm.duration_mins > 60) {
      toast({
        title: 'Duración no permitida',
        description: 'La duración máxima por política no puede exceder los 60 minutos (1 hora).',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingCourse) {
        const { error } = await supabase
          .from('training_modules')
          .update({
            title: courseForm.title,
            description: courseForm.description,
            category: courseForm.category,
            points_reward: courseForm.points_reward,
            duration_mins: courseForm.duration_mins,
            difficulty: courseForm.difficulty,
            is_informative: courseForm.is_informative,
            status: courseForm.status,
            course_type: courseForm.course_type,
            target_roles: courseForm.target_roles,
            image_url: courseForm.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast({ title: 'Curso actualizado con éxito' });
      } else {
        const { error } = await supabase.from('training_modules').insert([
          {
            title: courseForm.title,
            description: courseForm.description,
            category: courseForm.category,
            points_reward: courseForm.points_reward,
            duration_mins: courseForm.duration_mins,
            difficulty: courseForm.difficulty,
            is_informative: courseForm.is_informative,
            status: courseForm.status,
            course_type: courseForm.course_type,
            target_roles: courseForm.target_roles,
            image_url: courseForm.image_url
          }
        ]);

        if (error) throw error;
        toast({ title: 'Curso creado con éxito' });
      }

      setIsCourseModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast({ title: 'Error al guardar curso', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('¿Seguro de que deseas eliminar este curso y todos sus contenidos?')) return;
    try {
      const { error } = await supabase.from('training_modules').delete().eq('id', courseId);
      if (error) throw error;
      toast({ title: 'Curso eliminado' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
    }
  };

  const handleSeedSystemCourses = async () => {
    try {
      setLoading(true);
      const defaults = getDefaultSystemModules();
      for (const c of defaults) {
        await supabase.from('training_modules').upsert({
          title: c.title,
          description: c.description,
          category: c.category,
          points_reward: c.points_reward,
          duration_mins: c.duration_mins,
          difficulty: c.difficulty,
          status: 'active',
          is_informative: c.is_informative,
          course_type: 'platform',
          target_roles: c.target_roles
        });
      }
      toast({ title: 'Cursos base sembrados exitosamente' });
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error al sembrar cursos', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // REWARDS CRUD
  // -------------------------------------------------------------
  const handleOpenCreateReward = () => {
    setEditingRewardId(null);
    setRewardForm({
      name: '',
      description: '',
      points_cost: 200,
      image_url: '',
      stock: 10,
      status: 'active'
    });
    setIsRewardModalOpen(true);
  };

  const handleOpenEditReward = (reward: RewardItem) => {
    setEditingRewardId(reward.id);
    setRewardForm({
      name: reward.name || '',
      description: reward.description || '',
      points_cost: reward.points_cost || 200,
      image_url: reward.image_url || '',
      stock: reward.stock || 0,
      status: reward.status || 'active'
    });
    setIsRewardModalOpen(true);
  };

  const handleSaveReward = async () => {
    if (!rewardForm.name.trim()) {
      toast({ title: 'El nombre del premio es obligatorio', variant: 'destructive' });
      return;
    }

    try {
      if (editingRewardId) {
        const { error } = await supabase
          .from('rewards_catalog')
          .update({
            name: rewardForm.name,
            description: rewardForm.description,
            points_cost: rewardForm.points_cost,
            image_url: rewardForm.image_url,
            stock: rewardForm.stock,
            status: rewardForm.status
          })
          .eq('id', editingRewardId);

        if (error) throw error;
        toast({ title: 'Premio actualizado exitosamente' });
      } else {
        const { error } = await supabase.from('rewards_catalog').insert([rewardForm]);
        if (error) throw error;
        toast({ title: 'Premio añadido al catálogo' });
      }

      setIsRewardModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error al guardar premio', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!window.confirm('¿Seguro de que deseas eliminar este premio del catálogo?')) return;
    try {
      const { error } = await supabase.from('rewards_catalog').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Premio eliminado' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error al eliminar premio', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateRedemptionStatus = async (redemptionId: string, newStatus: 'approved' | 'delivered' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_reward_redemptions')
        .update({
          status: newStatus,
          delivered_at: newStatus === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', redemptionId);

      if (error) throw error;
      toast({ title: `Solicitud actualizada a: ${newStatus.toUpperCase()}` });
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error al actualizar canje', description: e.message, variant: 'destructive' });
    }
  };

  // -------------------------------------------------------------
  // QUIZ CRUD
  // -------------------------------------------------------------
  const handleOpenCreateQuiz = () => {
    setEditingQuizId(null);
    setQuizForm({
      module_id: modules[0]?.id || '',
      title: 'Examen de Certificación Oficial',
      passing_score: 70,
      max_attempts: 3,
      time_limit_mins: 15
    });
    setIsQuizModalOpen(true);
  };

  const handleOpenEditQuizMeta = (quiz: QuizItem) => {
    setEditingQuizId(quiz.id);
    setQuizForm({
      module_id: quiz.module_id || '',
      title: quiz.title || 'Examen de Certificación',
      passing_score: quiz.passing_score || 70,
      max_attempts: quiz.max_attempts || 3,
      time_limit_mins: quiz.time_limit_mins || 15
    });
    setIsQuizModalOpen(true);
  };

  const handleSaveQuizMeta = async () => {
    if (!quizForm.title.trim() || !quizForm.module_id) {
      toast({ title: 'Selecciona un curso y escribe el título', variant: 'destructive' });
      return;
    }

    try {
      if (editingQuizId) {
        const { error } = await supabase
          .from('course_quizzes')
          .update({
            title: quizForm.title,
            passing_score: quizForm.passing_score,
            max_attempts: quizForm.max_attempts,
            time_limit_mins: quizForm.time_limit_mins
          })
          .eq('id', editingQuizId);

        if (error) throw error;
        toast({ title: 'Parámetros del examen actualizados' });
      } else {
        const { error } = await supabase.from('course_quizzes').insert([
          {
            module_id: quizForm.module_id,
            title: quizForm.title,
            passing_score: quizForm.passing_score,
            max_attempts: quizForm.max_attempts,
            time_limit_mins: quizForm.time_limit_mins
          }
        ]);

        if (error) throw error;
        toast({ title: 'Examen creado. Ahora puedes añadir preguntas.' });
      }

      setIsQuizModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error al guardar examen', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('¿Seguro de que deseas eliminar este examen y todas sus preguntas?')) return;
    try {
      const { error } = await supabase.from('course_quizzes').delete().eq('id', quizId);
      if (error) throw error;
      toast({ title: 'Examen eliminado' });
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error al eliminar examen', description: e.message, variant: 'destructive' });
    }
  };

  // -------------------------------------------------------------
  // RENDER BUILDER OR MAIN PANEL
  // -------------------------------------------------------------
  const activeStructureModule = modules.find((m) => m.id === managingStructureModuleId);
  const activeQuizModule = modules.find((m) => m.id === managingQuizModuleId);

  if (editingLessonId && managingStructureModuleId) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <LessonEditor
          lessonId={editingLessonId}
          moduleId={managingStructureModuleId}
          onBack={() => setEditingLessonId(null)}
          onSaved={() => {
            toast({ title: 'Lección guardada exitosamente' });
          }}
        />
      </div>
    );
  }

  if (managingStructureModuleId && activeStructureModule) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <CourseBuilder
          moduleId={activeStructureModule.id}
          courseTitle={activeStructureModule.title}
          onBack={() => setManagingStructureModuleId(null)}
          onEditLesson={(lessonId) => setEditingLessonId(lessonId)}
        />
      </div>
    );
  }

  // Filter modules for display
  const filteredModules = modules.filter((mod) => {
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || mod.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              Gestión de Academia & Premios LMS
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Administración centralizada de cursos Moodle, banco de preguntas para exámenes y catálogo de canje de premios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={handleSeedSystemCourses}
            className="rounded-2xl text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex-1 md:flex-initial"
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" /> Sembrar Cursos Base
          </Button>

          <Button
            onClick={handleOpenCreateCourse}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 flex-1 md:flex-initial flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Nuevo Curso
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-2xl h-12 inline-flex border border-border">
          <TabsTrigger value="courses" className="rounded-xl px-5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BookOpen className="h-4 w-4 mr-2" /> 1. Cursos & Lecciones ({modules.length})
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="rounded-xl px-5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <HelpCircle className="h-4 w-4 mr-2" /> 2. Exámenes & Evaluaciones ({quizzes.length || modules.length})
          </TabsTrigger>
          <TabsTrigger value="rewards" className="rounded-xl px-5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Gift className="h-4 w-4 mr-2" /> 3. Catálogo de Premios ({rewards.length})
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="rounded-xl px-5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <UserCheck className="h-4 w-4 mr-2" /> 4. Solicitudes de Canje ({redemptions.length})
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: COURSES & LESSONS */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="courses" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Categoría:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs border border-border rounded-xl px-3 bg-background text-foreground font-medium"
              >
                <option value="all">Todas las categorías</option>
                <option value="app_onboarding">Uso de la App (Tutoriales)</option>
                <option value="ventas">Ventas y Cierre</option>
                <option value="management">Gestión Gerencial</option>
                <option value="compliance">Compliance & Auditoría</option>
                <option value="producto">Actualización Médica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((mod) => {
              const isSystemCourse = mod.course_type === 'platform';

              return (
                <Card
                  key={mod.id}
                  className="border-border bg-card shadow-sm hover:shadow-lg transition-all rounded-3xl overflow-hidden flex flex-col group"
                >
                  <div className="p-5 pb-3 border-b border-border/60 bg-muted/20 flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 text-[10px] uppercase font-bold tracking-wider">
                          {mod.category}
                        </Badge>
                        {isSystemCourse && (
                          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 text-[10px] uppercase font-black">
                            ★ Oficial App
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 mt-1">
                        {mod.title}
                      </h3>
                    </div>

                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-sm flex items-center gap-1 flex-shrink-0">
                      <Award className="h-3.5 w-3.5 fill-white" />
                      +{mod.points_reward} pts
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col flex-1 space-y-4">
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                      {mod.description || 'Sin descripción configurada.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-muted-foreground pt-3 border-t border-border/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{mod.duration_mins || 30} min max</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{mod.is_informative ? 'Informativo' : 'Obligatorio'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">Dirigido a:</span>
                      {(mod.target_roles || ['representative']).map((r) => (
                        <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground">
                          {r === 'representative' ? 'Visitadores' : r === 'manager' ? 'Gerentes' : r}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setManagingStructureModuleId(mod.id)}
                        className="h-8 text-xs rounded-xl flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex-1"
                      >
                        <Layers className="h-3.5 w-3.5" /> Lecciones
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setManagingQuizModuleId(mod.id)}
                        className="h-8 text-xs rounded-xl flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 px-2.5"
                      >
                        <HelpCircle className="h-3.5 w-3.5" /> Examen
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditCourse(mod)}
                        className="h-8 w-8 p-0 rounded-xl"
                      >
                        <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCourse(mod.id)}
                        className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: QUIZZES MANAGEMENT (CRUD & QUESTION BANK) */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="quizzes" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Exámenes y Evaluaciones de Certificación</h2>
              <p className="text-xs text-muted-foreground">
                Configura los cuestionarios obligatorios, nota mínima para aprobar y preguntas de validación.
              </p>
            </div>

            <Button
              onClick={handleOpenCreateQuiz}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Nuevo Examen
            </Button>
          </div>

          {managingQuizModuleId && activeQuizModule && (
            <div className="border border-amber-500/30 rounded-3xl p-6 bg-card shadow-lg animate-in slide-in-from-top-4 duration-300">
              <QuizBuilder
                moduleId={activeQuizModule.id}
                courseTitle={activeQuizModule.title}
                onClose={() => setManagingQuizModuleId(null)}
                onSaved={() => {
                  toast({ title: 'Examen guardado correctamente' });
                  fetchData();
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const assignedQuiz = quizzes.find((q) => q.module_id === mod.id);

              return (
                <Card key={mod.id} className="border-border bg-card rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
                  <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                        {assignedQuiz ? 'Examen Configurado' : 'Examen Pendiente'}
                      </Badge>
                      <span className="text-xs font-black text-amber-600">+{mod.points_reward} pts</span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground mt-1 line-clamp-2">
                      {assignedQuiz ? assignedQuiz.title : `Examen: ${mod.title}`}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Curso: <strong>{mod.title}</strong>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-2xl">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Nota Mínima</p>
                        <p className="font-bold text-foreground">{assignedQuiz?.passing_score || 70}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Límite Tiempo</p>
                        <p className="font-bold text-foreground">{assignedQuiz?.time_limit_mins || 15} min</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button
                        onClick={() => setManagingQuizModuleId(mod.id)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <HelpCircle className="h-4 w-4" /> Editar Preguntas
                      </Button>

                      {assignedQuiz && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEditQuizMeta(assignedQuiz)}
                          className="h-9 w-9 rounded-xl"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      )}

                      {assignedQuiz && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteQuiz(assignedQuiz.id)}
                          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: REWARDS CATALOG (CRUD & STOCK) */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="rewards" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Catálogo de Premios e Incentivos</h2>
              <p className="text-xs text-muted-foreground">
                Crea y edita los premios que los representantes pueden canjear con sus puntos acumulados.
              </p>
            </div>

            <Button
              onClick={handleOpenCreateReward}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Nuevo Premio
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border-border bg-card rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between group">
                <div className="h-40 bg-muted relative overflow-hidden flex-shrink-0">
                  {reward.image_url ? (
                    <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center">
                      <Gift className="h-12 w-12 text-white/50" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-md">
                    <Award className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {reward.points_cost} pts
                  </div>

                  <Badge className={`absolute top-3 left-3 text-[10px] font-bold ${reward.status === 'active' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {reward.status === 'active' ? 'Activo' : 'Oculto'}
                  </Badge>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-foreground leading-snug">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{reward.description || 'Sin descripción.'}</p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Stock: <strong>{reward.stock ?? 'Ilimitado'}</strong></span>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditReward(reward)}
                        className="h-8 rounded-xl font-bold text-xs"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteReward(reward.id)}
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: REDEMPTIONS MANAGEMENT (APROBACIÓN DE CANJES) */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="redemptions" className="space-y-6 mt-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Solicitudes de Canje Realizadas por Usuarios</h2>
            <p className="text-xs text-muted-foreground">
              Audita y aprueba las entregas de premios solicitadas por los miembros del equipo.
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Premio Solicitado</th>
                    <th className="p-4">Puntos Gastados</th>
                    <th className="p-4">Fecha Solicitud</th>
                    <th className="p-4">Estatus</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {redemptions.map((red) => (
                    <tr key={red.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-semibold text-foreground">
                        {red.profiles?.full_name || red.profiles?.email || 'Usuario de Campo'}
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {red.rewards_catalog?.name || 'Premio de Catálogo'}
                      </td>
                      <td className="p-4 font-black text-amber-600">
                        {red.points_spent} pts
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(red.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`text-[10px] font-bold ${
                            red.status === 'delivered'
                              ? 'bg-emerald-600 text-white'
                              : red.status === 'approved'
                              ? 'bg-indigo-600 text-white'
                              : red.status === 'rejected'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {red.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {red.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateRedemptionStatus(red.id, 'approved')}
                              className="h-7 text-[11px] rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                              Aprobar
                            </Button>
                          )}
                          {red.status !== 'delivered' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateRedemptionStatus(red.id, 'delivered')}
                              className="h-7 text-[11px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              <Check className="h-3 w-3 mr-1" /> Entregar
                            </Button>
                          )}
                          {red.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateRedemptionStatus(red.id, 'rejected')}
                              className="h-7 text-[11px] rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 font-bold"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {redemptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No hay solicitudes de canje pendientes por procesar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: CREATE / EDIT COURSE */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border border-border rounded-3xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">
              {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso Moodle'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configura los parámetros, duración máxima (60 min) y roles requeridos para este curso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Título del Curso *</Label>
              <Input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Ej: Técnicas de Negociación y Cierre en Farmacias"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Descripción y Objetivos</Label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Explica qué aprenderá el colaborador en este curso..."
                className="rounded-xl min-h-[90px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Categoría</Label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium"
                >
                  <option value="app_onboarding">Uso de la App (Tutoriales)</option>
                  <option value="ventas">Ventas y Cierre</option>
                  <option value="management">Gestión Gerencial</option>
                  <option value="compliance">Compliance & Auditoría</option>
                  <option value="producto">Actualización Médica</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Puntos de Recompensa (Premios)</Label>
                <Input
                  type="number"
                  min={10}
                  step={10}
                  value={courseForm.points_reward}
                  onChange={(e) => setCourseForm({ ...courseForm, points_reward: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Duración Estimada (Minutos, máx 60)</Label>
                <Input
                  type="number"
                  min={5}
                  max={60}
                  value={courseForm.duration_mins}
                  onChange={(e) => setCourseForm({ ...courseForm, duration_mins: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Nivel de Dificultad</Label>
                <select
                  value={courseForm.difficulty}
                  onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium"
                >
                  <option value="beginner">Principiante / Básico</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">URL Imagen Portada (Opcional)</Label>
              <Input
                value={courseForm.image_url}
                onChange={(e) => setCourseForm({ ...courseForm, image_url: e.target.value })}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Tipo de Curso</p>
                  <p className="text-[11px] text-muted-foreground">
                    {courseForm.is_informative
                      ? 'Informativo: no requiere aprobar examen para completar.'
                      : 'Obligatorio: requiere completar lecciones y aprobar examen.'}
                  </p>
                </div>
                <Switch
                  checked={courseForm.is_informative}
                  onCheckedChange={(c) => setCourseForm({ ...courseForm, is_informative: c })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCourseModalOpen(false)} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button onClick={handleSaveCourse} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
              {editingCourse ? 'Guardar Cambios' : 'Crear Curso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: CREATE / EDIT REWARD */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isRewardModalOpen} onOpenChange={setIsRewardModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border border-border rounded-3xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">
              {editingRewardId ? 'Editar Premio' : 'Nuevo Premio para el Catálogo'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configura el nombre, costo en puntos y stock disponible para el canje.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Nombre del Premio *</Label>
              <Input
                value={rewardForm.name}
                onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                placeholder="Ej: Bono Combustible $50"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Descripción / Términos</Label>
              <Textarea
                value={rewardForm.description}
                onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                placeholder="Instrucciones para la entrega..."
                className="rounded-xl min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Costo en Puntos *</Label>
                <Input
                  type="number"
                  min={10}
                  value={rewardForm.points_cost}
                  onChange={(e) => setRewardForm({ ...rewardForm, points_cost: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Stock Disponible</Label>
                <Input
                  type="number"
                  min={0}
                  value={rewardForm.stock}
                  onChange={(e) => setRewardForm({ ...rewardForm, stock: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">URL Imagen (Opcional)</Label>
              <Input
                value={rewardForm.image_url}
                onChange={(e) => setRewardForm({ ...rewardForm, image_url: e.target.value })}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Estatus</Label>
              <select
                value={rewardForm.status}
                onChange={(e) => setRewardForm({ ...rewardForm, status: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium"
              >
                <option value="active">Activo (Visible para canjear)</option>
                <option value="inactive">Inactivo (Oculto)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRewardModalOpen(false)} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button onClick={handleSaveReward} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
              {editingRewardId ? 'Guardar Cambios' : 'Añadir al Catálogo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: CREATE / EDIT QUIZ METADATA */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isQuizModalOpen} onOpenChange={setIsQuizModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border border-border rounded-3xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">
              {editingQuizId ? 'Editar Parámetros de Examen' : 'Crear Nuevo Examen Oficial'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Asigna el examen a un curso y define nota mínima e intentos permitidos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Curso Asignado *</Label>
              <select
                value={quizForm.module_id}
                disabled={!!editingQuizId}
                onChange={(e) => setQuizForm({ ...quizForm, module_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Título del Examen *</Label>
              <Input
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                placeholder="Ej: Examen de Certificación: Uso de la App"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Nota Mínima Aprobatoria (%)</Label>
                <Input
                  type="number"
                  min={50}
                  max={100}
                  value={quizForm.passing_score}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_score: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Límite de Tiempo (Minutos)</Label>
                <Input
                  type="number"
                  min={5}
                  max={60}
                  value={quizForm.time_limit_mins}
                  onChange={(e) => setQuizForm({ ...quizForm, time_limit_mins: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Intentos Máximos Permitidos</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={quizForm.max_attempts}
                onChange={(e) => setQuizForm({ ...quizForm, max_attempts: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsQuizModalOpen(false)} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button onClick={handleSaveQuizMeta} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold">
              {editingQuizId ? 'Guardar Parámetros' : 'Crear Examen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
