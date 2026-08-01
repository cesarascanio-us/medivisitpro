import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Award, Plus, Trash2, Edit, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function AcademyAdmin() {
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Data states
  const [modules, setModules] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  // Modal states
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  // Form states
  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: 'general', points_reward: 0 });
  const [rewardForm, setRewardForm] = useState({ name: '', description: '', points_cost: 0, image_url: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'courses') {
        const { data, error } = await supabase.from('training_modules').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setModules(data || []);
      } else if (activeTab === 'rewards') {
        const { data, error } = await supabase.from('rewards_catalog').select('*').order('points_cost', { ascending: true });
        if (error && error.code !== '42P01') throw error;
        setRewards(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const { data, error } = await supabase.from('training_modules').insert([{
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        points_reward: courseForm.points_reward
      }]);
      if (error) throw error;
      toast({ title: "Curso creado exitosamente", variant: "default" });
      setIsCourseModalOpen(false);
      setCourseForm({ title: '', description: '', category: 'general', points_reward: 0 });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Error al crear curso", variant: "destructive" });
    }
  };

  const handleCreateReward = async () => {
    try {
      const { data, error } = await supabase.from('rewards_catalog').insert([{
        name: rewardForm.name,
        description: rewardForm.description,
        points_cost: rewardForm.points_cost,
        image_url: rewardForm.image_url
      }]);
      if (error) throw error;
      toast({ title: "Premio creado exitosamente", variant: "default" });
      setIsRewardModalOpen(false);
      setRewardForm({ name: '', description: '', points_cost: 0, image_url: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Error al crear premio", variant: "destructive" });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if(!confirm('¿Estás seguro de eliminar este curso?')) return;
    try {
      const { error } = await supabase.from('training_modules').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Curso eliminado", variant: "default" });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleDeleteReward = async (id: string) => {
    if(!confirm('¿Estás seguro de eliminar este premio?')) return;
    try {
      const { error } = await supabase.from('rewards_catalog').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Premio eliminado", variant: "default" });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            Gestión de Academia y Premios
          </h1>
          <p className="text-muted-foreground mt-2">Administra los cursos de capacitación de tu equipo y el catálogo de incentivos.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Cursos (SOP)
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Award className="h-4 w-4" /> Catálogo de Premios
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Módulos de Entrenamiento</h2>
            
            <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Nuevo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Curso</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Input id="category" value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} placeholder="ej. ventas" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="points_reward">Puntos a otorgar</Label>
                      <Input id="points_reward" type="number" value={courseForm.points_reward} onChange={e => setCourseForm({...courseForm, points_reward: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCourseModalOpen(false)}>Cancelar</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreateCourse}>Guardar Curso</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">Cargando módulos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map(mod => (
                <Card key={mod.id} className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{mod.title}</CardTitle>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded w-fit">{mod.category}</span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{mod.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <span className="text-xs font-bold text-indigo-600">+{mod.points_reward} pts</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteCourse(mod.id)}><Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {modules.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">No has creado ningún curso aún.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Catálogo de Incentivos</h2>
            
            <Dialog open={isRewardModalOpen} onOpenChange={setIsRewardModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Nuevo Premio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Premio</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre del Premio</Label>
                    <Input id="name" value={rewardForm.name} onChange={e => setRewardForm({...rewardForm, name: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="r-description">Descripción</Label>
                    <Textarea id="r-description" value={rewardForm.description} onChange={e => setRewardForm({...rewardForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="points_cost">Costo en Puntos</Label>
                      <Input id="points_cost" type="number" value={rewardForm.points_cost} onChange={e => setRewardForm({...rewardForm, points_cost: Number(e.target.value)})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image_url">URL de Imagen</Label>
                      <Input id="image_url" placeholder="Opcional" value={rewardForm.image_url} onChange={e => setRewardForm({...rewardForm, image_url: e.target.value})} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRewardModalOpen(false)}>Cancelar</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateReward}>Guardar Premio</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">Cargando premios...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => (
                <Card key={reward.id} className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{reward.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{reward.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><Award className="h-3 w-3" /> {reward.points_cost} pts</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteReward(reward.id)}><Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {rewards.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">No has añadido ningún premio al catálogo.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
