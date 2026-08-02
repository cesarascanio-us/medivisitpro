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
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

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
import CoursePlayer from '@/components/academy/CoursePlayer';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  image_url?: string;
  thumbnail_url?: string;
  duration_mins?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'draft' | 'published' | 'archived';
  is_informative?: boolean;
  target_roles?: string[];
  course_type?: 'platform' | 'custom';
  created_at?: string;
}

export default function AcademyAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Data states
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  // Active Modals & Views
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  // Deep Sub-editors
  const [managingStructureModuleId, setManagingStructureModuleId] = useState<string | null>(null);
  const [managingQuizModuleId, setManagingQuizModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [previewModule, setPreviewModule] = useState<TrainingModule | null>(null);
  const [moduleSections, setModuleSections] = useState<any[]>([]);

  // Course Form
  const [courseForm, setCourseForm] = useState<{
    title: string;
    description: string;
    category: string;
    points_reward: number;
    duration_mins: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    is_informative: boolean;
    target_roles: string[];
    status: 'draft' | 'published' | 'archived';
    course_type: 'platform' | 'custom';
  }>({
    title: '',
    description: '',
    category: 'app_onboarding',
    points_reward: 100,
    duration_mins: 30,
    difficulty: 'beginner',
    is_informative: false,
    target_roles: ['representative'],
    status: 'published',
    course_type: 'custom'
  });

  // Reward Form
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    points_cost: 200,
    image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'courses' || activeTab === 'quizzes') {
        const { data, error } = await supabase
          .from('training_modules')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Fallback courses list:', error);
          loadDefaultSystemModules();
        } else if (data && data.length > 0) {
          setModules(data);
        } else {
          loadDefaultSystemModules();
        }
      } else if (activeTab === 'rewards') {
        const { data, error } = await supabase
          .from('rewards_catalog')
          .select('*')
          .order('points_cost', { ascending: true });

        if (!error && data) {
          setRewards(data);
        } else {
          setRewards([
            { id: '1', name: 'Bono Combustible $50', description: 'Tarjeta electrónica de combustible para visitas', points_cost: 500 },
            { id: '2', name: 'Almuerzo Ejecutivo VIP', description: 'Voucher para restaurante seleccionado', points_cost: 800 },
            { id: '3', name: 'Día Libre Adicional', description: 'Permiso compensatorio remunerado', points_cost: 1500 }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      loadDefaultSystemModules();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultSystemModules = () => {
    const defaults: TrainingModule[] = [
      {
        id: 'sys_course_rep',
        title: 'Mastery de Campo: Ejecución de Visita Médica y Muestras',
        description: 'Capacitación obligatoria para Representantes. Aprende a usar el ruteo inteligente, registro presencial con Geo-Tagging, control de muestras y compromisos de prescripción.',
        category: 'app_onboarding',
        points_reward: 150,
        duration_mins: 35,
        difficulty: 'beginner',
        status: 'published',
        is_informative: false,
        target_roles: ['representative'],
        course_type: 'platform'
      },
      {
        id: 'sys_course_mgr',
        title: 'Supervisión Gerencial: Ciclos, Cobertura y Tablero de Control',
        description: 'Capacitación obligatoria para Gerentes. Creación de ciclos promocionales, asignación de baremos, auditoría de rutas y detección de fugas de ventas en farmacias.',
        category: 'management',
        points_reward: 200,
        duration_mins: 45,
        difficulty: 'intermediate',
        status: 'published',
        is_informative: false,
        target_roles: ['manager', 'gerente', 'admin'],
        course_type: 'platform'
      },
      {
        id: 'sys_course_admin',
        title: 'Administración SaaS: Sentinel, Roles y Facturación',
        description: 'Guía completa de configuración para Administradores: gestión de planes de suscripción, asignación de permisos organizacionales y auditoría.',
        category: 'compliance',
        points_reward: 100,
        duration_mins: 25,
        difficulty: 'advanced',
        status: 'published',
        is_informative: true,
        target_roles: ['admin', 'master'],
        course_type: 'platform'
      }
    ];
    setModules(defaults);
  };

  // Seed System Courses into DB if needed
  const handleSeedSystemCourses = async () => {
    try {
      const defaultCourses = [
        {
          title: 'Mastery de Campo: Ejecución de Visita Médica y Muestras',
          description: 'Capacitación obligatoria para Representantes: ruteo inteligente, registro presencial con Geo-Tagging, control de muestras y compromisos de prescripción.',
          category: 'app_onboarding',
          points_reward: 150,
          duration_mins: 35,
          difficulty: 'beginner',
          status: 'published',
          is_informative: false,
          target_roles: ['representative'],
          course_type: 'platform'
        },
        {
          title: 'Supervisión Gerencial: Ciclos, Cobertura y Tablero de Control',
          description: 'Capacitación obligatoria para Gerentes: ciclos promocionales, asignación de baremos, auditoría de rutas y detección de fugas de ventas en farmacias.',
          category: 'management',
          points_reward: 200,
          duration_mins: 45,
          difficulty: 'intermediate',
          status: 'published',
          is_informative: false,
          target_roles: ['manager', 'gerente', 'admin'],
          course_type: 'platform'
        },
        {
          title: 'Administración SaaS: Sentinel, Roles y Facturación',
          description: 'Guía de configuración para Administradores: planes de suscripción, asignación de permisos organizacionales y auditoría global.',
          category: 'compliance',
          points_reward: 100,
          duration_mins: 25,
          difficulty: 'advanced',
          status: 'published',
          is_informative: true,
          target_roles: ['admin', 'master'],
          course_type: 'platform'
        }
      ];

      for (const c of defaultCourses) {
        await supabase.from('training_modules').insert([c]);
      }

      toast({
        title: '¡Cursos Oficiales Sembrados!',
        description: 'Se han creado los 3 cursos base de uso de la app por rol.',
        variant: 'default'
      });
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error al sembrar cursos', description: e.message, variant: 'destructive' });
    }
  };

  const handleOpenCreateCourse = () => {
    setEditingModule(null);
    setCourseForm({
      title: '',
      description: '',
      category: 'app_onboarding',
      points_reward: 100,
      duration_mins: 30,
      difficulty: 'beginner',
      is_informative: false,
      target_roles: ['representative'],
      status: 'published',
      course_type: 'custom'
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (mod: TrainingModule) => {
    setEditingModule(mod);
    setCourseForm({
      title: mod.title || '',
      description: mod.description || '',
      category: mod.category || 'app_onboarding',
      points_reward: mod.points_reward || 100,
      duration_mins: mod.duration_mins || 30,
      difficulty: mod.difficulty || 'beginner',
      is_informative: mod.is_informative || false,
      target_roles: mod.target_roles || ['representative'],
      status: mod.status || 'published',
      course_type: mod.course_type || 'custom'
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) {
      toast({ title: 'El título es obligatorio', variant: 'destructive' });
      return;
    }
    if (courseForm.duration_mins > 60) {
      toast({
        title: 'Duración excedida',
        description: 'La duración máxima permitida por curso es de 60 minutos (1 hora).',
        variant: 'destructive'
      });
      return;
    }

    try {
      const payload = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        category: courseForm.category,
        points_reward: Number(courseForm.points_reward) || 0,
        duration_mins: Number(courseForm.duration_mins) || 30,
        difficulty: courseForm.difficulty,
        is_informative: courseForm.is_informative,
        target_roles: courseForm.target_roles,
        status: courseForm.status,
        course_type: courseForm.course_type
      };

      if (editingModule) {
        const { error } = await supabase.from('training_modules').update(payload).eq('id', editingModule.id);
        if (error) throw error;
        toast({ title: 'Curso actualizado correctamente' });
      } else {
        const { error } = await supabase.from('training_modules').insert([payload]);
        if (error) throw error;
        toast({ title: 'Nuevo curso creado exitosamente' });
      }

      setIsCourseModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error al guardar curso', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso y todos sus contenidos?')) return;
    try {
      const { error } = await supabase.from('training_modules').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Curso eliminado', variant: 'default' });
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
    }
  };

  // Open Moodle Structure Builder for a module
  const handleOpenStructure = async (moduleId: string) => {
    setManagingStructureModuleId(moduleId);
    loadModuleSections(moduleId);
  };

  const loadModuleSections = async (moduleId: string) => {
    try {
      const { data: sData } = await supabase
        .from('course_sections')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      const { data: lData } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (sData && sData.length > 0) {
        const assembled = sData.map((s) => ({
          ...s,
          lessons: (lData || []).filter((l) => l.section_id === s.id)
        }));
        setModuleSections(assembled);
      } else {
        setModuleSections([]);
      }
    } catch (e) {
      console.warn('Error loading sections:', e);
      setModuleSections([]);
    }
  };

  // Filtered courses
  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const activeStructureModule = modules.find((m) => m.id === managingStructureModuleId);
  const activeQuizModule = modules.find((m) => m.id === managingQuizModuleId);

  // If in Preview Mode, render the Student CoursePlayer
  if (previewModule) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> MODO VISTA PREVIA DEL ESTUDIANTE (MOODLE PLAYER)
          </span>
          <Button size="sm" variant="secondary" onClick={() => setPreviewModule(null)} className="h-7 text-xs rounded-lg font-bold">
            Salir de Vista Previa
          </Button>
        </div>
        <CoursePlayer module={previewModule} onBack={() => setPreviewModule(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Gestión de Academia Moodle
                </h1>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                  LMS v2.0
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Capacitación oficial obligatoria por roles, exámenes interactivos y canje de incentivos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedSystemCourses}
            className="rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" /> Cursos Base del Sistema
          </Button>

          <Button
            onClick={handleOpenCreateCourse}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 font-bold"
          >
            <Plus className="h-4 w-4" /> Nuevo Curso
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 max-w-lg p-1 bg-muted rounded-2xl border border-border">
          <TabsTrigger value="courses" className="flex items-center gap-2 rounded-xl text-xs font-bold">
            <BookOpen className="h-4 w-4" /> Cursos ({modules.length})
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2 rounded-xl text-xs font-bold">
            <HelpCircle className="h-4 w-4" /> Exámenes
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2 rounded-xl text-xs font-bold">
            <Award className="h-4 w-4" /> Catálogo Premios
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: COURSES */}
        <TabsContent value="courses" className="space-y-6 mt-6">
          {/* Sub-Editor Overlay: Structure / CourseBuilder */}
          {managingStructureModuleId && activeStructureModule && (
            <div className="p-6 rounded-3xl border-2 border-indigo-500/30 bg-card shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-foreground">
                      Constructor de Estructura: {activeStructureModule.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Organiza secciones, capítulos y lecciones interactivas tipo Moodle
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewModule(activeStructureModule)}
                    className="rounded-xl flex items-center gap-1.5"
                  >
                    <Eye className="h-4 w-4" /> Probar como Alumno
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setManagingStructureModuleId(null)}
                    className="rounded-xl"
                  >
                    Cerrar Constructor
                  </Button>
                </div>
              </div>

              {/* Lesson Editor Modal if active */}
              {editingLessonId ? (
                <LessonEditor
                  lessonId={editingLessonId}
                  moduleId={activeStructureModule.id}
                  onClose={() => setEditingLessonId(null)}
                  onSave={() => loadModuleSections(activeStructureModule.id)}
                />
              ) : (
                <CourseBuilder
                  moduleId={activeStructureModule.id}
                  sections={moduleSections}
                  onRefresh={() => loadModuleSections(activeStructureModule.id)}
                  onEditLesson={(lId) => setEditingLessonId(lId)}
                />
              )}
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos por título o tema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Rol / Tipo:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs border border-border rounded-xl px-3 bg-background text-foreground font-medium"
              >
                <option value="all">Todas las categorías</option>
                <option value="app_onboarding">App Onboarding (Uso de la App)</option>
                <option value="ventas">Ventas y Cierre</option>
                <option value="management">Gestión Gerencial</option>
                <option value="compliance">SOP & Compliance</option>
                <option value="producto">Actualización Médica</option>
              </select>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
              <p className="text-sm text-muted-foreground">Cargando catálogo de cursos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((mod) => {
                const isSystemCourse = mod.course_type === 'platform';

                return (
                  <Card
                    key={mod.id}
                    className="border-border bg-card shadow-sm hover:shadow-lg transition-all rounded-3xl overflow-hidden flex flex-col group"
                  >
                    {/* Card Header Tag Banner */}
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

                      {/* Course Meta Pills */}
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

                      {/* Roles Tag */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">Dirigido a:</span>
                        {(mod.target_roles || ['representative']).map((r) => (
                          <span
                            key={r}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground"
                          >
                            {r === 'representative' ? 'Visitadores' : r === 'manager' ? 'Gerentes' : r}
                          </span>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-border flex items-center justify-between gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenStructure(mod.id)}
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

              {filteredModules.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-3xl bg-card">
                  <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-bold text-foreground text-base">No se encontraron cursos</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Crea un curso nuevo o haz clic en "Cursos Base del Sistema" para sembrar los tutoriales de la app.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: QUIZZES MANAGEMENT */}
        <TabsContent value="quizzes" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Exámenes y Evaluaciones de Certificación</h2>
              <p className="text-xs text-muted-foreground">
                Configura preguntas de selección múltiple y verdadero/falso para cada curso.
              </p>
            </div>
          </div>

          {managingQuizModuleId && activeQuizModule && (
            <QuizBuilder
              moduleId={activeQuizModule.id}
              courseTitle={activeQuizModule.title}
              onClose={() => setManagingQuizModuleId(null)}
              onSaved={() => toast({ title: 'Examen guardado correctamente' })}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <Card key={mod.id} className="border-border bg-card rounded-3xl shadow-sm overflow-hidden">
                <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/60">
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] w-fit font-bold">
                    Evaluación Oficial
                  </Badge>
                  <CardTitle className="text-base font-bold text-foreground mt-1">{mod.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Recompensa por Aprobar:{' '}
                      <strong className="text-amber-600 font-bold">+{mod.points_reward} pts</strong>
                    </p>
                    <p>
                      Tipo de Evaluación:{' '}
                      <strong>{mod.is_informative ? 'Opcional / Informativo' : 'Obligatorio para Certificar'}</strong>
                    </p>
                  </div>

                  <Button
                    onClick={() => setManagingQuizModuleId(mod.id)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="h-4 w-4" /> Configurar Preguntas y Respuestas
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: REWARDS CATALOG */}
        <TabsContent value="rewards" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Catálogo de Incentivos y Premios</h2>
              <p className="text-xs text-muted-foreground">
                Los puntos que el equipo gana al aprobar cursos se pueden canjear aquí.
              </p>
            </div>

            <Dialog open={isRewardModalOpen} onOpenChange={setIsRewardModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 font-bold">
                  <Plus className="h-4 w-4" /> Nuevo Premio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] bg-card border border-border rounded-3xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black text-foreground">Añadir Premio al Catálogo</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="r-name">Nombre del Premio *</Label>
                    <Input
                      id="r-name"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                      placeholder="Ej: Bono de Combustible $50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-desc">Descripción</Label>
                    <Textarea
                      id="r-desc"
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                      placeholder="Términos y condiciones del canje..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="r-cost">Costo en Puntos *</Label>
                      <Input
                        id="r-cost"
                        type="number"
                        min={10}
                        value={rewardForm.points_cost}
                        onChange={(e) => setRewardForm({ ...rewardForm, points_cost: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="r-img">URL Imagen</Label>
                      <Input
                        id="r-img"
                        placeholder="https://..."
                        value={rewardForm.image_url}
                        onChange={(e) => setRewardForm({ ...rewardForm, image_url: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRewardModalOpen(false)} className="rounded-xl">
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!rewardForm.name.trim()) return;
                      await supabase.from('rewards_catalog').insert([rewardForm]);
                      toast({ title: 'Premio añadido' });
                      setIsRewardModalOpen(false);
                      fetchData();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                  >
                    Guardar Premio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border-border bg-card rounded-3xl shadow-sm overflow-hidden">
                <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/60 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground line-clamp-1">{reward.name}</CardTitle>
                  <Badge className="bg-amber-500 text-white font-black text-xs flex items-center gap-1">
                    <Award className="h-3 w-3" /> {reward.points_cost} pts
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {reward.description || 'Premio canjeable con puntos acumulados.'}
                  </p>

                  <div className="pt-3 border-t border-border flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!confirm('¿Eliminar este premio?')) return;
                        await supabase.from('rewards_catalog').delete().eq('id', reward.id);
                        fetchData();
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CREATE / EDIT COURSE MODAL */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="sm:max-w-[550px] bg-card border border-border rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">
              {editingModule ? 'Editar Curso de la Academia' : 'Crear Nuevo Curso Moodle'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configura los metadatos, roles destinatarios y reglas de obligatoriedad.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="c-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Título del Curso *
              </Label>
              <Input
                id="c-title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Ej: Técnicas Avanzadas de Cierre en Visita Médica"
                className="font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Descripción y Objetivos de Aprendizaje
              </Label>
              <Textarea
                id="c-desc"
                rows={3}
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Explica qué aprenderá el colaborador..."
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Categoría</Label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full h-9 text-xs border border-border rounded-xl px-3 bg-background text-foreground"
                >
                  <option value="app_onboarding">App Onboarding (Uso de la App)</option>
                  <option value="ventas">Ventas y Cierre</option>
                  <option value="management">Gestión Gerencial</option>
                  <option value="compliance">SOP & Compliance</option>
                  <option value="producto">Actualización Médica</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Dificultad</Label>
                <select
                  value={courseForm.difficulty}
                  onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value as any })}
                  className="w-full h-9 text-xs border border-border rounded-xl px-3 bg-background text-foreground"
                >
                  <option value="beginner">Principiante / Básico</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
              <div className="space-y-1.5">
                <Label htmlFor="c-dur" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" /> Duración (Máx. 60 min)
                </Label>
                <Input
                  id="c-dur"
                  type="number"
                  min={5}
                  max={60}
                  value={courseForm.duration_mins}
                  onChange={(e) => setCourseForm({ ...courseForm, duration_mins: Number(e.target.value) })}
                  className="h-8 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-pts" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-500" /> Puntos Recompensa
                </Label>
                <Input
                  id="c-pts"
                  type="number"
                  min={10}
                  value={courseForm.points_reward}
                  onChange={(e) => setCourseForm({ ...courseForm, points_reward: Number(e.target.value) })}
                  className="h-8 text-xs font-bold text-amber-600"
                />
              </div>
            </div>

            {/* Target Role & Obligatory Rules */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Curso Obligatorio</p>
                  <p className="text-[11px] text-muted-foreground">
                    {courseForm.is_informative
                      ? 'Informativo: solo lectura, no requiere examen'
                      : 'Obligatorio: debe ver lecciones y aprobar el examen'}
                  </p>
                </div>
                <Switch
                  checked={!courseForm.is_informative}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, is_informative: !checked })}
                />
              </div>

              <div className="pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Dirigido a los Roles:
                </Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'representative', label: 'Visitadores Médicos' },
                    { id: 'manager', label: 'Gerentes' },
                    { id: 'admin', label: 'Administradores' }
                  ].map((r) => {
                    const isChecked = courseForm.target_roles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          const next = isChecked
                            ? courseForm.target_roles.filter((x) => x !== r.id)
                            : [...courseForm.target_roles, r.id];
                          setCourseForm({ ...courseForm, target_roles: next });
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                          isChecked
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCourseModalOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveCourse}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
            >
              {editingModule ? 'Guardar Cambios' : 'Crear Curso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
