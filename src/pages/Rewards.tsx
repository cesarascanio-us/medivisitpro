import React, { useState, useEffect } from 'react';
import {
  Gift,
  Star,
  ShoppingBag,
  CheckCircle2,
  Lock,
  Plus,
  Edit,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Award,
  Check,
  X,
  History,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  image_url: string;
  stock: number;
  status: string;
  created_at?: string;
}

interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'delivered' | 'rejected';
  created_at: string;
  rewards_catalog?: { name?: string; points_cost?: number; image_url?: string };
  profiles?: { full_name?: string; email?: string };
}

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<Redemption[]>([]);
  const [teamRedemptions, setTeamRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const isAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'gerente';

  // CRUD Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_cost: 200,
    image_url: '',
    stock: 10,
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch rewards catalog
      let query = supabase.from('rewards_catalog').select('*').order('created_at', { ascending: false });
      if (!isAdmin) {
        query = query.eq('status', 'active');
      }

      const { data: rewardData } = await query;
      if (rewardData && rewardData.length > 0) {
        setRewards(rewardData as any);
      } else {
        setRewards([
          { id: '1', name: 'Bono Combustible $50', description: 'Tarjeta electrónica para visitas de campo', points_cost: 500, stock: 15, image_url: '', status: 'active' },
          { id: '2', name: 'Almuerzo Ejecutivo VIP', description: 'Voucher para restaurante seleccionado', points_cost: 800, stock: 10, image_url: '', status: 'active' },
          { id: '3', name: 'Día Libre Remunerado', description: 'Permiso compensatorio remunerado', points_cost: 1500, stock: 5, image_url: '', status: 'active' }
        ]);
      }

      // 2. Fetch real user points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && profile.total_points !== undefined) {
        setTotalPoints(profile.total_points);
      }

      // 3. Fetch user's own redemptions
      try {
        const { data: myRedData } = await supabase
          .from('user_reward_redemptions')
          .select('*, rewards_catalog(name, points_cost, image_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (myRedData) setMyRedemptions(myRedData as any);
      } catch (e) {
        console.warn('My redemptions error:', e);
      }

      // 4. Fetch team redemptions if admin
      if (isAdmin) {
        try {
          const { data: teamRedData } = await supabase
            .from('user_reward_redemptions')
            .select('*, profiles(full_name, email), rewards_catalog(name, points_cost, image_url)')
            .order('created_at', { ascending: false })
            .limit(30);

          if (teamRedData) setTeamRedemptions(teamRedData as any);
        } catch (e) {
          console.warn('Team redemptions error:', e);
        }
      }
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (totalPoints < reward.points_cost) {
      toast({
        title: 'Puntos insuficientes',
        description: `Necesitas ${reward.points_cost} pts y tienes ${totalPoints}. ¡Completa cursos en la Academia para ganar más!`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setRedeemingId(reward.id);

      // 1. Insert redemption
      const { error: insertError } = await supabase
        .from('user_reward_redemptions')
        .insert({
          user_id: user?.id,
          reward_id: reward.id,
          points_spent: reward.points_cost,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // 2. Deduct points from profile
      const newPoints = totalPoints - reward.points_cost;
      setTotalPoints(newPoints);
      await supabase.from('profiles').update({ total_points: newPoints }).eq('id', user?.id);

      toast({
        title: '¡Canje Solicitado con Éxito! 🎉',
        description: `Has canjeado "${reward.name}". Tu gerente o RRHH revisará la entrega.`,
        variant: 'default'
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error al procesar el canje',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setRedeemingId(null);
    }
  };

  const handleOpenCreateReward = () => {
    setEditingRewardId(null);
    setFormData({
      name: '',
      description: '',
      points_cost: 200,
      image_url: '',
      stock: 10,
      status: 'active'
    });
    setDialogOpen(true);
  };

  const handleOpenEditReward = (reward: Reward) => {
    setEditingRewardId(reward.id);
    setFormData({
      name: reward.name || '',
      description: reward.description || '',
      points_cost: reward.points_cost || 200,
      image_url: reward.image_url || '',
      stock: reward.stock || 0,
      status: reward.status || 'active'
    });
    setDialogOpen(true);
  };

  const handleSaveReward = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'El nombre del premio es obligatorio', variant: 'destructive' });
      return;
    }

    try {
      if (editingRewardId) {
        const { error } = await supabase.from('rewards_catalog').update(formData).eq('id', editingRewardId);
        if (error) throw error;
        toast({ title: 'Premio actualizado exitosamente' });
      } else {
        const { error } = await supabase.from('rewards_catalog').insert([formData]);
        if (error) throw error;
        toast({ title: 'Premio añadido al catálogo' });
      }

      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error al guardar premio', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este premio del catálogo?')) return;
    try {
      const { error } = await supabase.from('rewards_catalog').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Premio eliminado' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
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
      toast({ title: `Canje actualizado a: ${newStatus.toUpperCase()}` });
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error al actualizar canje', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <Gift className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                Catálogo de Premios e Incentivos
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Canjea los puntos acumulados por aprobar cursos y exámenes en la Academia MediVisit Pro.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Real Points Badge */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-4 flex-1 md:flex-initial justify-between">
            <div className="bg-white/20 p-2 rounded-xl">
              <Star className="h-7 w-7 text-yellow-100 fill-yellow-100" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-100">Saldo Disponible</p>
              <p className="text-3xl font-black leading-none">{totalPoints} <span className="text-xs font-normal">pts</span></p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/university')}
            variant="outline"
            className="rounded-2xl border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 font-bold h-14 px-4 flex items-center gap-2"
          >
            <GraduationCap className="h-5 w-5" />
            <span className="hidden sm:inline">Ir a la Academia</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-2xl h-12 inline-flex border border-border">
          <TabsTrigger value="catalog" className="rounded-xl px-5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ShoppingBag className="h-4 w-4 mr-2" /> Premios Disponibles ({rewards.length})
          </TabsTrigger>
          <TabsTrigger value="my_redemptions" className="rounded-xl px-5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="h-4 w-4 mr-2" /> Mis Canjes ({myRedemptions.length})
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="team_redemptions" className="rounded-xl px-5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ShieldAlert className="h-4 w-4 mr-2" /> Solicitudes del Equipo ({teamRedemptions.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: REWARDS CATALOG */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="catalog" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Premios Listos para Canjear</h2>
              <p className="text-xs text-muted-foreground">
                Selecciona tu recompensa. Al solicitarla, se descontarán los puntos de tu saldo.
              </p>
            </div>

            {isAdmin && (
              <Button
                onClick={handleOpenCreateReward}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Nuevo Premio
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canAfford = totalPoints >= reward.points_cost;
              const isRedeemingThis = redeemingId === reward.id;

              return (
                <Card
                  key={reward.id}
                  className="rounded-3xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="h-44 bg-muted relative overflow-hidden flex-shrink-0">
                    {reward.image_url ? (
                      <img
                        src={reward.image_url}
                        alt={reward.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-teal-900 flex items-center justify-center p-6">
                        <Gift className="h-14 w-14 text-white/40 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}

                    {/* Cost Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-yellow-300/30 flex items-center gap-1.5 text-white">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-black text-sm">{reward.points_cost} pts</span>
                    </div>

                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleOpenEditReward(reward)}
                          className="h-8 w-8 rounded-full shadow-md bg-white/90 dark:bg-black/80 hover:bg-white"
                        >
                          <Edit className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteReward(reward.id)}
                          className="h-8 w-8 rounded-full shadow-md"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-snug">{reward.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
                        {reward.description || 'Premio institucional canjeable con puntos de formación.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Stock disponible: <strong>{reward.stock ?? 'Ilimitado'}</strong></span>
                        <span className={canAfford ? 'text-emerald-600 font-bold' : 'text-rose-500 font-semibold'}>
                          {canAfford ? '¡Puntos suficientes!' : `Faltan ${reward.points_cost - totalPoints} pts`}
                        </span>
                      </div>

                      <Button
                        disabled={!canAfford || isRedeemingThis}
                        onClick={() => handleRedeem(reward)}
                        className={`w-full rounded-xl font-bold text-xs h-10 ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        {isRedeemingThis ? (
                          'Procesando Canje...'
                        ) : canAfford ? (
                          <>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Solicitar Canje Ahora
                          </>
                        ) : (
                          'Puntos Insuficientes'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {rewards.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-3xl bg-card">
                <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-bold text-foreground text-base">No hay premios activos en este momento</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Pronto se agregarán nuevos reconocimientos e incentivos.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: MY REDEMPTIONS */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="my_redemptions" className="space-y-6 mt-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Historial de Mis Canjes</h2>
            <p className="text-xs text-muted-foreground">
              Revisa el estado de entrega de los premios que has solicitado.
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Premio</th>
                    <th className="p-4">Puntos Canjeados</th>
                    <th className="p-4">Fecha de Solicitud</th>
                    <th className="p-4">Estado del Canje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myRedemptions.map((red) => (
                    <tr key={red.id} className="hover:bg-muted/20 transition-colors">
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
                          {red.status === 'delivered'
                            ? 'Entregado'
                            : red.status === 'approved'
                            ? 'Aprobado para Entrega'
                            : red.status === 'rejected'
                            ? 'Rechazado'
                            : 'Pendiente de Aprobación'}
                        </Badge>
                      </td>
                    </tr>
                  ))}

                  {myRedemptions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        Aún no has realizado canjes. ¡Acumula puntos aprobando cursos en la Academia!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: TEAM REDEMPTIONS (ADMIN ONLY) */}
        {/* ------------------------------------------------------------- */}
        {isAdmin && (
          <TabsContent value="team_redemptions" className="space-y-6 mt-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Panel de Aprobación de Canjes del Equipo</h2>
              <p className="text-xs text-muted-foreground">
                Audita y gestiona las solicitudes enviadas por los visitadores y miembros de tu organización.
              </p>
            </div>

            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Colaborador</th>
                      <th className="p-4">Premio</th>
                      <th className="p-4">Puntos</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Estatus</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {teamRedemptions.map((red) => (
                      <tr key={red.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-semibold text-foreground">
                          {red.profiles?.full_name || red.profiles?.email || 'Usuario'}
                        </td>
                        <td className="p-4 font-bold text-foreground">
                          {red.rewards_catalog?.name || 'Premio'}
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
                                className="h-7 text-[11px] rounded-lg text-rose-600 hover:bg-rose-50 font-bold"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {teamRedemptions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No hay solicitudes pendientes del equipo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* ------------------------------------------------------------- */}
      {/* DIALOG: CREATE / EDIT REWARD */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border border-border rounded-3xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">
              {editingRewardId ? 'Editar Premio' : 'Nuevo Premio para el Catálogo'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define los puntos necesarios, stock y descripción para los colaboradores.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Nombre del Premio *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Bono Combustible $50"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Términos y condiciones para el canje..."
                className="rounded-xl min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Costo en Puntos *</Label>
                <Input
                  type="number"
                  min={10}
                  value={formData.points_cost}
                  onChange={(e) => setFormData({ ...formData, points_cost: Number(e.target.value) })}
                  className="rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Stock Disponible</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">URL Imagen (Opcional)</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Estatus</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium"
              >
                <option value="active">Activo (Visible)</option>
                <option value="inactive">Inactivo (Oculto)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button onClick={handleSaveReward} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
              {editingRewardId ? 'Guardar Cambios' : 'Crear Premio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
