import { useState, useEffect } from "react";
import { Gift, Star, ShoppingBag, CheckCircle2, Lock, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RewardFormDialog } from "@/components/rewards/RewardFormDialog";

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  image_url: string;
  stock: number;
}

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const isAdmin = user?.role === 'manager' || user?.role === 'admin';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    points_cost: 0,
    image_url: "",
    stock: 0,
    status: "active"
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch rewards
      let query = supabase.from('rewards_catalog').select('*').order('created_at', { ascending: false });
      
      // If not admin, only show active rewards
      if (!isAdmin) {
        query = query.eq('status', 'active');
      }

      const { data: rewardData } = await query;
      
      if (rewardData) setRewards(rewardData);

      // Fetch user points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile && profile.total_points) {
        setTotalPoints(profile.total_points);
      }
    } catch (error) {
      console.error("Error loading rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (totalPoints < reward.points_cost) {
      toast({
        title: "Puntos insuficientes",
        description: `Necesitas ${reward.points_cost - totalPoints} puntos más para canjear este premio.`,
        variant: "destructive"
      });
      return;
    }

    try {
      setRedeeming(reward.id);
      
      // In a real scenario, this would be a single RPC or transaction
      const { error: insertError } = await supabase
        .from('user_reward_redemptions')
        .insert({
          user_id: user?.id,
          reward_id: reward.id,
          points_spent: reward.points_cost
        });

      if (insertError) throw insertError;

      // Update local state and toast
      setTotalPoints(prev => prev - reward.points_cost);
      toast({
        title: "¡Canje Exitoso!",
        description: `Has canjeado "${reward.name}". Recursos Humanos se pondrá en contacto pronto.`,
      });
    } catch (error) {
      toast({
        title: "Error al canjear",
        description: "Inténtalo de nuevo más tarde.",
        variant: "destructive"
      });
    } finally {
      setRedeeming(null);
    }
  };

  const handleSaveReward = async () => {
    try {
      if (editingRewardId) {
        const { error } = await supabase.from('rewards_catalog').update(formData).eq('id', editingRewardId);
        if (error) throw error;
        toast({ title: "Premio actualizado exitosamente" });
      } else {
        const { error } = await supabase.from('rewards_catalog').insert([formData]);
        if (error) throw error;
        toast({ title: "Premio creado exitosamente" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este premio?")) return;
    try {
      const { error } = await supabase.from('rewards_catalog').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Premio eliminado" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl text-white shadow-2xl">
        <div className="max-w-2xl">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 mb-4 px-4 py-1 text-xs tracking-widest uppercase">
            Tienda Exclusiva
          </Badge>
          <h1 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3">
            <Gift className="h-10 w-10 text-yellow-400" />
            Catálogo de Premios
          </h1>
          <p className="text-indigo-100 text-lg opacity-90">
            Canjea los puntos que has ganado en la Universidad Biofarco por premios increíbles. ¡Tu esfuerzo tiene recompensas!
          </p>
        </div>
        
        {/* Points Display */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-6 rounded-2xl flex flex-col items-center min-w-[200px]">
          <p className="text-sm font-bold uppercase tracking-wider text-indigo-200 mb-2">Tu Saldo Actual</p>
          <div className="flex items-center gap-3">
            <Star className="h-10 w-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <p className="text-5xl font-black">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            Premios Disponibles
          </h2>
          {isAdmin && (
            <Button onClick={() => {
              setEditingRewardId(null);
              setFormData({ name: "", description: "", points_cost: 0, image_url: "", stock: 10, status: "active" });
              setDialogOpen(true);
            }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 px-6">
              <Plus className="mr-2 h-5 w-5" /> Nuevo Premio
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <Card key={reward.id} className="overflow-hidden hover:shadow-xl transition-all border-slate-200 flex flex-col group">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {reward.image_url ? (
                  <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <Gift className="h-16 w-16 text-slate-400" />
                  </div>
                )}
                {/* Cost Badge overlay */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-yellow-200 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-black text-slate-900">{reward.points_cost} pts</span>
                </div>
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-indigo-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRewardId(reward.id);
                        setFormData({
                          name: reward.name || "",
                          description: reward.description || "",
                          points_cost: reward.points_cost || 0,
                          image_url: reward.image_url || "",
                          stock: reward.stock || 0,
                          status: (reward as any).status || "active"
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 text-indigo-600" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReward(reward.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {(reward as any).status === 'inactive' && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">
                    Inactivo
                  </div>
                )}
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">{reward.name}</h3>
                <p className="text-sm text-slate-600 flex-1">{reward.description}</p>
                
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button 
                    className="w-full font-bold uppercase tracking-widest text-[10px]"
                    variant={totalPoints >= reward.points_cost ? 'default' : 'secondary'}
                    disabled={totalPoints < reward.points_cost || redeeming === reward.id}
                    onClick={() => handleRedeem(reward)}
                  >
                    {redeeming === reward.id ? (
                      "Procesando..."
                    ) : totalPoints >= reward.points_cost ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Canjear Premio
                      </>
                    ) : (
                      "Puntos Insuficientes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {rewards.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Lock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600">Catálogo en Construcción</h3>
              <p className="text-slate-400 mt-2 max-w-sm mx-auto">Pronto agregaremos premios increíbles por los que podrás canjear tus puntos de estudio.</p>
            </div>
          )}
        </div>
      </div>

      <RewardFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSaveReward}
        isEditing={!!editingRewardId}
      />
    </div>
  );
}
