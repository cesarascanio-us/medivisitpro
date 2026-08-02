import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Star,
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock,
  Flame,
  Shield,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CoursePlayer from '@/components/academy/CoursePlayer';
import AcademyLeaderboard from '@/components/academy/AcademyLeaderboard';
import { COMPLETE_LMS_COURSES } from '@/utils/lmsSeedData';

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
}

export default function University() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(new Set());
  const [activeCourse, setActiveCourse] = useState<TrainingModule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mandatory' | 'platform' | 'products' | 'completed'>('all');

  // Rewards catalog redemption modal
  const [rewards, setRewards] = useState<any[]>([]);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch training modules
      let modData: any[] | null = null;
      const { data: filteredMods, error: filterError } = await supabase
        .from('training_modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (filteredMods && filteredMods.length > 0) {
        modData = filteredMods;
      } else {
        modData = getDefaultSystemModules();
      }

      if (modData) setModules(modData);

      // 2. Fetch user points from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && profile.total_points) {
        setTotalPoints(profile.total_points);
      }

      // 3. Fetch user completions if table available
      try {
        const { data: compData } = await supabase
          .from('course_completions')
          .select('module_id')
          .eq('user_id', user.id);

        if (compData) {
          setCompletedCourseIds(new Set(compData.map((c) => c.module_id)));
        }
      } catch (e) {
        console.warn('Completions table not yet populated:', e);
      }

      // 4. Fetch rewards for redemption
      const { data: rData } = await supabase.from('rewards_catalog').select('*').limit(6);
      if (rData && rData.length > 0) {
        setRewards(rData);
      } else {
        setRewards([
          { id: '1', name: 'Bono Combustible $50', description: 'Tarjeta electrónica para visitas', points_cost: 500 },
          { id: '2', name: 'Almuerzo Ejecutivo VIP', description: 'Voucher para restaurante seleccionado', points_cost: 800 },
          { id: '3', name: 'Día Libre Remunerado', description: 'Permiso compensatorio remunerado', points_cost: 1500 }
        ]);
      }
    } catch (error) {
      console.error('Error loading university data:', error);
      setModules(getDefaultSystemModules());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSystemModules = (): TrainingModule[] => {
    return COMPLETE_LMS_COURSES.map((c, idx) => ({
      id: c.slug_id || `sys_${idx}`,
      title: c.title,
      description: c.description,
      category: c.category,
      points_reward: c.points_reward,
      duration_mins: c.duration_mins,
      difficulty: c.difficulty,
      status: 'published',
      is_informative: c.is_informative,
      target_roles: c.target_roles,
      course_type: c.course_type
    }));
  };

  const handleRedeemReward = async (reward: any) => {
    if (totalPoints < reward.points_cost) {
      toast({
        title: 'Puntos insuficientes',
        description: `Necesitas ${reward.points_cost} puntos y tienes ${totalPoints}. ¡Aprueba más cursos para acumularlos!`,
        variant: 'destructive'
      });
      return;
    }

    const newPts = totalPoints - reward.points_cost;
    setTotalPoints(newPts);

    if (user?.id) {
      try {
        await supabase.from('user_reward_redemptions').insert({
          user_id: user.id,
          reward_id: reward.id,
          points_spent: reward.points_cost,
          status: 'pending'
        });
        await supabase.from('profiles').update({ total_points: newPts }).eq('id', user.id);
      } catch (e) {
        console.warn('Error recording redemption:', e);
      }
    }

    toast({
      title: '¡Canje Solicitado con Éxito! 🎉',
      description: `Has canjeado "${reward.name}". Tu solicitud ha sido enviada para entrega.`,
      variant: 'default'
    });
  };

  const handleCourseCompleted = () => {
    if (activeCourse) {
      const updated = new Set(completedCourseIds);
      updated.add(activeCourse.id);
      setCompletedCourseIds(updated);
      setTotalPoints((prev) => prev + (activeCourse.points_reward || 100));
    }
  };

  // Filter modules
  const filteredModules = modules.filter((mod) => {
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'mandatory') return !mod.is_informative;
    if (activeFilter === 'platform') return mod.category === 'app_onboarding' || mod.category === 'leadership' || mod.category === 'administration' || mod.category === 'compliance';
    if (activeFilter === 'products') return mod.course_type === 'product_line' || mod.category.includes('Pediatría') || mod.category.includes('Respiratorio') || mod.category.includes('Gastroenterología') || mod.category.includes('Dermatología') || mod.category.includes('Magistral');
    if (activeFilter === 'completed') return completedCourseIds.has(mod.id);
    return true;
  });

  // Calculate Level and Points to next level
  const userLevel = totalPoints >= 1000 ? 3 : totalPoints >= 400 ? 2 : 1;
  const levelName = userLevel === 3 ? 'Experto Certificado' : userLevel === 2 ? 'Especialista' : 'Novato';
  const nextLevelPoints = userLevel === 1 ? 400 : userLevel === 2 ? 1000 : 2500;
  const progressToNextLevel = Math.min(100, Math.round((totalPoints / nextLevelPoints) * 100));

  // IF ACTIVE COURSE PLAYER IS OPEN
  if (activeCourse) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <CoursePlayer
          module={activeCourse}
          onBack={() => setActiveCourse(null)}
          onCourseCompleted={handleCourseCompleted}
        />
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
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                Academia MediVisit Pro
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Aprende a dominar las funciones de la app según tu rol, aprueba exámenes obligatorios y canjea premios.
              </p>
            </div>
          </div>
        </div>

        {/* Points Badge & Redeem Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-3 flex-1 md:flex-initial justify-between">
            <div className="bg-white/20 p-2 rounded-xl">
              <Star className="h-6 w-6 text-yellow-100 fill-yellow-100" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-100">Mis Puntos</p>
              <p className="text-2xl font-black leading-none">{totalPoints}</p>
            </div>
          </div>

          <Button
            onClick={() => setIsRewardsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 h-14 px-4 flex items-center gap-2"
          >
            <Gift className="h-5 w-5" />
            <span className="hidden sm:inline">Canjear Premios</span>
          </Button>
        </div>
      </div>

      {/* Progress & Level Card */}
      <Card className="border-border bg-card shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl flex-shrink-0">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Rango Académico</p>
              <p className="text-xs text-muted-foreground">
                Nivel Actual: <span className="font-bold text-emerald-600 dark:text-emerald-400">{levelName}</span>
              </p>
            </div>
          </div>

          <div className="flex-1 w-full space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                {totalPoints >= nextLevelPoints
                  ? '¡Nivel Máximo Alcanzado!'
                  : `Te faltan ${nextLevelPoints - totalPoints} pts para el Nivel ${userLevel + 1}`}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Nivel {userLevel}</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2.5 bg-muted [&>div]:bg-emerald-500" />
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Left Courses, Right Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Courses Catalog */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'products', label: '🌿 Líneas de Productos' },
                { id: 'platform', label: '📱 Uso de la App' },
                { id: 'mandatory', label: '⚠️ Obligatorios' },
                { id: 'completed', label: '✅ Aprobados' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredModules.map((mod) => {
              const isCompleted = completedCourseIds.has(mod.id);
              const isOfficialApp = mod.course_type === 'platform' || mod.category === 'app_onboarding';

              return (
                <Card
                  key={mod.id}
                  className={`rounded-3xl border overflow-hidden hover:shadow-xl transition-all group flex flex-col ${
                    isCompleted
                      ? 'border-emerald-500/30 bg-card'
                      : 'border-border bg-card'
                  }`}
                >
                  {/* Card Thumbnail / Header */}
                  <div className="h-40 bg-muted relative overflow-hidden flex-shrink-0">
                    {mod.image_url ? (
                      <img
                        src={mod.image_url}
                        alt={mod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 flex items-center justify-center p-6 text-center">
                        <BookOpen className="h-14 w-14 text-white/40 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}

                    {/* Points Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-md">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      +{mod.points_reward} pts
                    </div>

                    {/* Completed Overlay Badge */}
                    {isCompleted && (
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Aprobado
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 flex flex-col flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[9px] uppercase font-black">
                        {mod.category}
                      </Badge>
                      {isOfficialApp && (
                        <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[9px] uppercase font-black">
                          ★ Tutorial App
                        </Badge>
                      )}
                      {!mod.is_informative && (
                        <Badge variant="outline" className="text-[9px] uppercase font-bold text-rose-600 border-rose-200">
                          Obligatorio
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                      {mod.description}
                    </p>

                    {/* Meta Bar */}
                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        {mod.duration_mins || 30} min (máx. 1 hr)
                      </span>

                      <Button
                        size="sm"
                        onClick={() => setActiveCourse(mod)}
                        className={`rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        {isCompleted ? 'Repasar Curso' : 'Iniciar Curso'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredModules.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center bg-card rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center p-6">
                <Lock className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="font-bold text-foreground text-base">No hay cursos en esta sección</h3>
                <p className="text-xs text-muted-foreground mt-1">Pronto se habilitarán nuevos contenidos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Leaderboard */}
        <div className="lg:col-span-4 space-y-6">
          <AcademyLeaderboard />
        </div>
      </div>

      {/* REWARDS REDEMPTION MODAL */}
      <Dialog open={isRewardsModalOpen} onOpenChange={setIsRewardsModalOpen}>
        <DialogContent className="sm:max-w-[650px] bg-card border border-border rounded-3xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
              <Gift className="h-6 w-6 text-emerald-600" />
              Canjear Premios por Cursos Aprobados
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tienes <strong className="text-amber-600 font-bold">{totalPoints} puntos</strong> disponibles para canjear.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {rewards.map((reward) => {
              const canAfford = totalPoints >= reward.points_cost;

              return (
                <div
                  key={reward.id}
                  className="p-4 rounded-2xl border border-border bg-muted/20 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm text-foreground">{reward.name}</h4>
                      <Badge className="bg-amber-500 text-white font-black text-xs">
                        {reward.points_cost} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{reward.description}</p>
                  </div>

                  <Button
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => handleRedeemReward(reward)}
                    className={`w-full rounded-xl font-bold text-xs ${
                      canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {canAfford ? 'Solicitar Canje' : `Faltan ${reward.points_cost - totalPoints} pts`}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
