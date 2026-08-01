import { useState, useEffect } from "react";
import { GraduationCap, Award, BookOpen, Star, PlayCircle, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  image_url: string;
}

export default function University() {
  const { user } = useAuth();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch modules — try with status filter, fallback to all if column doesn't exist
      let modData: any[] | null = null;
      const { data: filteredMods, error: filterError } = await supabase
        .from('training_modules')
        .select('*')
        .eq('status', 'active');

      if (filterError) {
        // 'status' column may not exist — fetch all modules
        console.warn('[University] status filter failed, fetching all modules:', filterError.message);
        const { data: allMods } = await supabase
          .from('training_modules')
          .select('*');
        modData = allMods;
      } else {
        modData = filteredMods;
      }
      
      if (modData) setModules(modData);


      // Fetch user points (try profiles first) — use maybeSingle() to avoid 406 when row is absent
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile && profile.total_points) {
        setTotalPoints(profile.total_points);
      }


    } catch (error) {
      console.error("Error loading university data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            Universidad Biofarco
          </h1>
          <p className="text-muted-foreground mt-2">Capacítate, aprueba exámenes y gana puntos para canjear por premios exclusivos.</p>
        </div>
        
        {/* Points Badge */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="bg-white/20 p-2 rounded-xl">
            <Star className="h-6 w-6 text-yellow-100 fill-yellow-100" />
          </div>
          <div className="text-right md:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-100">Mis Puntos</p>
            <p className="text-2xl font-black leading-none">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar Top */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
           <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-full flex-shrink-0">
               <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
             </div>
             <div>
               <p className="text-sm font-bold text-foreground">Tu Progreso</p>
               <p className="text-xs text-muted-foreground">Nivel Actual: <span className="font-semibold text-foreground">Novato</span></p>
             </div>
           </div>
           <div className="flex-1 w-full">
               <div className="flex justify-between text-xs mb-1.5">
                 <span className="text-muted-foreground font-medium">Te faltan 400 pts para el Nivel 2</span>
                 <span className="font-bold text-emerald-600 dark:text-emerald-400">Nivel 2</span>
               </div>
               <Progress value={33} className="h-2.5 bg-muted [&>div]:bg-emerald-500" />
           </div>
        </CardContent>
      </Card>

      {/* Courses list */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Cursos Disponibles</h2>
          <Badge variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-500/10">
            {modules.length} Módulos
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Card key={mod.id} className="overflow-hidden hover:shadow-lg transition-all border-border bg-card group cursor-pointer flex flex-col">
              <div className="h-36 bg-muted relative overflow-hidden flex-shrink-0">
                {mod.image_url ? (
                  <img src={mod.image_url} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  +{mod.points_reward} pts
                </div>
              </div>
              <CardContent className="p-5 flex flex-col flex-1">
                <Badge className="mb-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 uppercase text-[9px] font-black tracking-widest w-fit">{mod.category}</Badge>
                <h3 className="font-bold text-foreground leading-tight mb-2 line-clamp-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{mod.description}</p>
                
                <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <PlayCircle className="h-4 w-4" /> 3 Lecciones
                  </span>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm">Comenzar</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {modules.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center bg-card rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1">No hay módulos disponibles</h3>
              <p className="text-sm text-muted-foreground">Pronto se publicarán nuevos cursos de capacitación.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
