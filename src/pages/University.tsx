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
      // Fetch modules
      const { data: modData } = await supabase
        .from('training_modules')
        .select('*')
        .eq('status', 'active');
      
      if (modData) setModules(modData);

      // Fetch user points (try profiles first)
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .single();
      
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            Universidad Biofarco
          </h1>
          <p className="text-muted-foreground mt-2">Capacítate, aprueba exámenes y gana puntos para canjear por premios exclusivos.</p>
        </div>
        
        {/* Points Badge */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Star className="h-6 w-6 text-yellow-100 fill-yellow-100" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-100">Mis Puntos</p>
            <p className="text-2xl font-black leading-none">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Courses list */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Cursos Disponibles</h2>
            <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
              {modules.length} Módulos
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <Card key={mod.id} className="overflow-hidden hover:shadow-lg transition-all border-slate-200 group cursor-pointer">
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  {mod.image_url ? (
                    <img src={mod.image_url} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    +{mod.points_reward} pts
                  </div>
                </div>
                <CardContent className="p-5">
                  <Badge className="mb-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 uppercase text-[9px] font-black tracking-widest">{mod.category}</Badge>
                  <h3 className="font-bold text-slate-900 leading-tight mb-2 line-clamp-2">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{mod.description}</p>
                  
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" /> 3 Lecciones
                    </span>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">Comenzar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {modules.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Lock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-500">No hay módulos disponibles</h3>
                <p className="text-sm text-slate-400">Pronto se publicarán nuevos cursos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Leaderboard / Progress */}
        <div className="space-y-6">
          <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50 to-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                <Award className="h-5 w-5" /> Tu Progreso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Nivel Actual: Novato</span>
                  <span className="font-bold text-emerald-700">Nivel 2</span>
                </div>
                <Progress value={33} className="h-2 bg-emerald-100" />
                <p className="text-xs text-muted-foreground mt-2 text-center">Te faltan 400 pts para el Nivel 2</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
