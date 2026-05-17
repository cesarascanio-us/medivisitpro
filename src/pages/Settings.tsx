/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { SystemSeeders } from "@/components/admin/SystemSeeders";
import { cn } from "@/lib/utils";
import {
  User, Bell, Palette, Settings2, Save, RotateCcw,
  Mail, Smartphone, Clock, AlertTriangle, Sun, Moon,
  Languages, Type, LayoutGrid, Wifi, WifiOff, BarChart3,
  Camera, Check, MapPin, Trash2, Building2, ShieldAlert,
  Loader2
} from "lucide-react";
import { EliteHeader } from "@/components/layout/DesignSystem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

// Available territories
const AVAILABLE_TERRITORIES = [
  { id: 'zona-norte', label: 'Zona Norte' },
  { id: 'zona-sur', label: 'Zona Sur' },
  { id: 'zona-este', label: 'Zona Este' },
  { id: 'zona-oeste', label: 'Zona Oeste' },
  { id: 'zona-centro', label: 'Zona Centro' },
  { id: 'zona-metropolitana', label: 'Zona Metropolitana' },
  { id: 'zona-costera', label: 'Zona Costera' },
  { id: 'zona-interior', label: 'Zona Interior' },
];

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  territories: string[]; // Changed from territory: string
  bio: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  visit_reminders: boolean;
  objective_alerts: boolean;
  expense_approvals: boolean;
  system_updates: boolean;
  reminder_time: string;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  font_size: 'small' | 'medium' | 'large';
  compact_mode: boolean;
}

interface SystemSettings {
  auto_save: boolean;
  offline_mode: boolean;
  sync_frequency: string;
  analytics_enabled: boolean;
  data_usage: string;
}

const defaultNotifications: NotificationSettings = {
  email_notifications: true,
  push_notifications: true,
  visit_reminders: true,
  objective_alerts: true,
  expense_approvals: true,
  system_updates: false,
  reminder_time: '30'
};

const defaultAppearance: AppearanceSettings = {
  theme: 'light',
  language: 'es',
  font_size: 'medium',
  compact_mode: false
};

const defaultSystem: SystemSettings = {
  auto_save: true,
  offline_mode: false,
  sync_frequency: '5',
  analytics_enabled: true,
  data_usage: 'normal'
};

export default function Settings() {
  const { user, role, isMaster, signOut, organizationId, organizationName } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { setTheme } = useTheme();

  // Danger Zone States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: user?.email || '',
    phone: '',
    position: '',
    territories: [], // Changed from territory
    bio: ''
  });

  // Settings states
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);
  const [system, setSystem] = useState<SystemSettings>(defaultSystem);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadSettings();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      // Parse territories from stored string (comma-separated)
      const profileData = data as any;
      const storedTerritories = profileData.territory ? profileData.territory.split(',').map((t: string) => t.trim()) : [];
      setProfile({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: user?.email || '',
        phone: profileData.phone || '',
        position: profileData.position || '',
        territories: storedTerritories,
        bio: profileData.bio || ''
      });
    }
  };

  const loadSettings = () => {
    // Load from localStorage
    const savedNotifications = localStorage.getItem('notification_settings');
    const savedAppearance = localStorage.getItem('appearance_settings');
    const savedSystem = localStorage.getItem('system_settings');

    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedAppearance) setAppearance(JSON.parse(savedAppearance));
    if (savedSystem) setSystem(JSON.parse(savedSystem));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          position: profile.position,
          territory: profile.territories.join(', '), // Save as comma-separated string
          bio: profile.bio
        } as any, { onConflict: 'user_id' });

      if (error) throw error;
      toast({ title: "Perfil guardado", description: "Tu información ha sido actualizada." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el perfil.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = () => {
    localStorage.setItem('notification_settings', JSON.stringify(notifications));
    toast({ title: "Configuración guardada", description: "Ajustes de notificaciones actualizados." });
  };

  const saveAppearance = () => {
    localStorage.setItem('appearance_settings', JSON.stringify(appearance));
    // Apply theme
    document.documentElement.classList.remove('light', 'dark');
    if (appearance.theme !== 'system') {
      document.documentElement.classList.add(appearance.theme);
    }
    toast({ title: "Apariencia guardada", description: "Cambios de apariencia aplicados." });
  };

  const saveSystem = () => {
    localStorage.setItem('system_settings', JSON.stringify(system));
    toast({ title: "Sistema configurado", description: "Ajustes del sistema guardados." });
  };

  const resetToDefaults = (section: string) => {
    switch (section) {
      case 'notifications':
        setNotifications(defaultNotifications);
        localStorage.removeItem('notification_settings');
        break;
      case 'appearance':
        setAppearance(defaultAppearance);
        localStorage.removeItem('appearance_settings');
        break;
      case 'system':
        setSystem(defaultSystem);
        localStorage.removeItem('system_settings');
        break;
    }
    toast({ title: "Restablecido", description: "Configuración restaurada a valores por defecto." });
  };

  // Territory handlers
  const toggleTerritory = (territoryId: string) => {
    setProfile(prev => ({
      ...prev,
      territories: prev.territories.includes(territoryId)
        ? prev.territories.filter(t => t !== territoryId)
        : [...prev.territories, territoryId]
    }));
  };

  const selectAllTerritories = () => {
    setProfile(prev => ({
      ...prev,
      territories: AVAILABLE_TERRITORIES.map(t => t.id)
    }));
  };

  const clearAllTerritories = () => {
    setProfile(prev => ({ ...prev, territories: [] }));
  };

  const userInitials = `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}`;

  const handleDeleteOrganization = async () => {
    if (confirmName !== organizationName) {
      toast({ title: "Error", description: "El nombre de la organización no coincide.", variant: "destructive" });
      return;
    }

    setIsDeleting(true);
    try {
      // Execute the RPC (Assuming it will be created by the user)
      const { error } = await supabase.rpc('delete_organization_safely', {
        target_org_id: organizationId,
        migration_target_id: null // User can specify later if needed
      });

      if (error) throw error;

      toast({ title: "Organización eliminada", description: "La empresa y todos sus datos han sido borrados." });

      // Forced logout and redirect
      await signOut();
      navigate('/login');
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast({
        title: "Error crítico",
        description: error.message || "No se pudo eliminar la organización.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700">
      <EliteHeader 
        title="Centro de Control"
        subtitle={`CONFIGURACIÓN DEL SISTEMA • ${organizationName || 'GLOBAL'}`}
        icon={Settings2}
        badgeText="PREFERENCIAS V.Elite"
        statusText={`USUARIO: ${profile.first_name} ${profile.last_name}`}
        statusColor="bg-primary"
        rightContent={
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Última Sincronización</span>
              <span className="text-sm font-black text-foreground tracking-tight uppercase mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="h-12 w-[1px] bg-slate-100 mx-2 text-slate-900" />
            <Avatar className="h-14 w-14 rounded-2xl shadow-premium-sm border-2 border-white">
              <AvatarFallback className="text-sm font-black bg-primary text-white uppercase tracking-tighter">{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="flex items-center gap-2 bg-muted/20 p-2 rounded-2xl w-fit border border-border shadow-inner">
          <TabsTrigger value="profile" className="flex items-center gap-3 px-6 h-11 rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-premium-md transition-all font-black uppercase text-[10px] tracking-widest ">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-3 px-6 h-11 rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-premium-md transition-all font-black uppercase text-[10px] tracking-widest">
            <Bell className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-3 px-6 h-11 rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-premium-md transition-all font-black uppercase text-[10px] tracking-widest">
            <Palette className="h-4 w-4" />
            Personalizado
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-3 px-6 h-11 rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-premium-md transition-all font-black uppercase text-[10px] tracking-widest">
            <Settings2 className="h-4 w-4" />
            Infraestructura
          </TabsTrigger>
          {isMaster && (
            <TabsTrigger value="organization" className="flex items-center gap-3 px-6 h-11 rounded-xl data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-premium-md transition-all font-black uppercase text-[10px] tracking-widest">
              <Building2 className="h-4 w-4" />
              Corporativo
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="animate-in slide-in-from-left-4 duration-500">
          <Card className="border-border shadow-premium-lg bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border p-8">
              <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase font-display">Identidad del Colaborador</CardTitle>
              <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Sincronización de credenciales y datos de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-10">
              {/* Avatar Section */}
              <div className="flex items-center gap-10">
                <div className="relative group">
                  <Avatar className="h-28 w-28 rounded-3xl shadow-premium-md border-4 border-white transition-transform group-hover:scale-105 duration-500">
                    <AvatarFallback className="text-3xl font-black bg-primary text-white uppercase tracking-tighter">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 rounded-full border-4 border-white shadow-glow"></div>
                </div>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="h-10 rounded-xl border-border/40 font-black uppercase text-[10px] tracking-widest hover:bg-muted/10 transition-all text-foreground">
                    <Camera className="h-4 w-4 mr-3 text-foreground" />
                    Actualizar Imagen
                  </Button>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Formatos admitidos: ISO-standard (JPG / PNG)</p>
                </div>
              </div>
              <Separator className="bg-border" />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de Pila</Label>
                  <Input
                    id="firstName"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="h-14 bg-muted/20 border-none focus-visible:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground"
                    placeholder="INTRODUZCA NOMBRE..."
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellido Corporativo</Label>
                  <Input
                    id="lastName"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="h-14 bg-muted/20 border-none focus-visible:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground"
                    placeholder="INTRODUZCA APELLIDO..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico (Solo Lectura)</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input id="email" value={profile.email} disabled className="h-14 pl-12 bg-slate-100 border-none rounded-xl font-black text-slate-500 uppercase text-xs tracking-tight cursor-not-allowed opacity-70" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Móvil</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="h-14 pl-12 bg-muted/20 border-none focus-visible:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground"
                      placeholder="+58 412..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="position" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo / Designación</Label>
                <Input
                  id="position"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="h-14 bg-muted/20 border-none focus-visible:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground"
                  placeholder="EJ. COMERCIAL ELITE..."
                />
              </div>

              {/* Territories Multi-Select */}
              <div className="space-y-4 bg-muted/10 pt-8 pb-8 px-8 rounded-3xl border border-border shadow-inner">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <div className="p-2 bg-card rounded-lg shadow-sm">
                      <MapPin className="h-4 w-4 text-foreground" />
                    </div>
                    Cobertura Geográfica Operativa
                  </Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={selectAllTerritories} className="text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 text-foreground">
                      Marcar Todo
                    </Button>
                    <Separator orientation="vertical" className="h-4 bg-slate-200 text-slate-900" />
                    <Button type="button" variant="ghost" size="sm" onClick={clearAllTerritories} className="text-[9px] font-black uppercase tracking-widest hover:bg-red-50 text-red-400">
                      Limpiar
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {AVAILABLE_TERRITORIES.map((territory) => (
                    <div key={territory.id} className="flex items-center space-x-3 bg-card p-4 rounded-xl border border-border shadow-sm group hover:border-border transition-all cursor-pointer" onClick={() => toggleTerritory(territory.id)}>
                      <Checkbox
                        id={territory.id}
                        checked={profile.territories.includes(territory.id)}
                        onCheckedChange={() => toggleTerritory(territory.id)}
                        className="data-[state=checked]:bg-slate-900 border-border rounded-md"
                      />
                      <label
                        htmlFor={territory.id}
                        className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none cursor-pointer group-hover:text-slate-900 transition-colors"
                      >
                        {territory.label}
                      </label>
                    </div>
                  ))}
                </div>
                {profile.territories.length > 0 && (
                  <p className="text-[9px] text-foreground font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse text-white" />
                    {profile.territories.length} Zonas asignadas al radar de usuario
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="bio" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referencia Profesional / Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="bg-muted/20 border-none focus-visible:ring-primary rounded-xl font-bold text-muted-foreground shadow-inner min-h-[120px] p-6 text-sm"
                  placeholder="DESCRIPCIÓN DE OBJETIVOS Y PERFIL..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={saveProfile} disabled={loading} className="h-14 bg-primary hover:bg-primary/90 text-white shadow-premium-md transition-all rounded-xl px-10 font-black uppercase text-[10px] tracking-widest active:scale-95">
                  <Save className="h-4 w-4 mr-3" />
                  {loading ? 'Sincronizando...' : 'Consolidar Perfil de Élite'}
                </Button>
              </div>
              <div className="pt-8 mt-8 border-t border-border">
                <SystemSeeders />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="animate-in slide-in-from-left-4 duration-500">
          <Card className="border-border shadow-premium-lg bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border p-8">
              <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase font-display">Alertas & Comunicaciones</CardTitle>
              <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Configuración del radar de notificaciones en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-10">
              <div className="space-y-6">
                {[
                  { id: 'email', icon: Mail, label: 'Notificaciones por Email', desc: 'Resúmenes operativos diarios', checked: notifications.email_notifications, key: 'email_notifications' },
                  { id: 'push', icon: Smartphone, label: 'Notificaciones Push', desc: 'Alertas tácticas instantáneas', checked: notifications.push_notifications, key: 'push_notifications' },
                  { id: 'reminders', icon: Clock, label: 'Recordatorios de Visitas', desc: 'Sincronización pre-operativa', checked: notifications.visit_reminders, key: 'visit_reminders' },
                  { id: 'alerts', icon: AlertTriangle, label: 'Alertas de Objetivos', desc: 'Control de cuotas y desviaciones', checked: notifications.objective_alerts, key: 'objective_alerts' },
                ].map((item) => (
                  <div key={item.id} className="group transition-all">
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/10 border border-transparent hover:border-border transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-card rounded-xl shadow-soft group-hover:shadow-md transition-all">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-foreground uppercase tracking-widest">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={item.checked}
                        onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                ))}

                <Separator className="bg-border" />

                <div className="space-y-4">
                  <Label htmlFor="reminder-time" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Umbral de Pre-Aviso Operativo</Label>
                  <Select
                    value={notifications.reminder_time}
                    onValueChange={(v) => setNotifications({ ...notifications, reminder_time: v })}
                  >
                    <SelectTrigger id="reminder-time" className="h-14 bg-muted/20 border-none focus:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner w-full md:w-72 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border font-black uppercase text-[10px] tracking-widest">
                      <SelectItem value="15">15 minutos antes</SelectItem>
                      <SelectItem value="30">30 minutos antes</SelectItem>
                      <SelectItem value="60">1 hora antes</SelectItem>
                      <SelectItem value="120">2 horas antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-border">
                <Button variant="ghost" onClick={() => resetToDefaults('notifications')} className="text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 text-rose-400 px-6 h-12 rounded-xl">
                  <RotateCcw className="h-4 w-4 mr-3" />
                  Restaurar Bóveda
                </Button>
                <Button onClick={saveNotifications} className="h-12 bg-primary hover:bg-primary/90 text-white shadow-premium-md transition-all rounded-xl px-10 font-black uppercase text-[10px] tracking-widest active:scale-95">
                  <Save className="h-4 w-4 mr-3" />
                  Consolidar Alertas
                </Button>
              </div>
              <div className="pt-8 mt-8 border-t border-border">
                <SystemSeeders />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="animate-in slide-in-from-left-4 duration-500">
          <Card className="border-border shadow-premium-lg bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border p-8">
              <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase font-display">Identidad de Marca CA</CardTitle>
              <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Soberanía visual y refinamiento de interfaz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 p-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Espectro de Color (Modo Activo)</Label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: 'light', label: 'Light Master', icon: Sun },
                      { value: 'dark', label: 'Dark Elite', icon: Moon },
                      { value: 'system', label: 'Dinámico', icon: Settings2 }
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={appearance.theme === value ? 'default' : 'outline'}
                        className={cn(
                          "flex-1 h-20 rounded-2xl flex flex-col items-center justify-center gap-2 border-slate-200 transition-all font-black uppercase text-[10px] tracking-widest px-6",
                          appearance.theme === value ? "bg-primary text-white border-primary shadow-premium-md" : "hover:bg-slate-50"
                        )}
                        onClick={() => {
                          setAppearance({ ...appearance, theme: value as any });
                          setTheme(value);
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="language" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-3">
                      <Languages className="h-4 w-4 text-primary" />
                      Protocolo de Lenguaje
                    </Label>
                    <Select
                      value={appearance.language}
                      onValueChange={(v) => setAppearance({ ...appearance, language: v })}
                    >
                      <SelectTrigger className="h-14 bg-muted/20 border-none focus:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border font-black uppercase text-[10px] tracking-widest">
                        <SelectItem value="es">Español Corporativo</SelectItem>
                        <SelectItem value="en">English (Global)</SelectItem>
                        <SelectItem value="pt">Português (Região)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="font-size" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-3">
                      <Type className="h-4 w-4 text-primary" />
                      Legibilidad Tipográfica
                    </Label>
                    <Select
                      value={appearance.font_size}
                      onValueChange={(v) => setAppearance({ ...appearance, font_size: v as any })}
                    >
                      <SelectTrigger className="h-14 bg-muted/20 border-none focus:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border font-black uppercase text-[10px] tracking-widest">
                        <SelectItem value="small">ISO Small</SelectItem>
                        <SelectItem value="medium">ISO Standard</SelectItem>
                        <SelectItem value="large">ISO Display</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between bg-muted/10 p-6 rounded-2xl border border-border">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-card rounded-xl shadow-soft">
                      <LayoutGrid className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Modo Compacto de Alta Densidad</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Maximiza el espacio operativo útil</p>
                    </div>
                  </div>
                  <Switch
                    checked={appearance.compact_mode}
                    onCheckedChange={(v) => setAppearance({ ...appearance, compact_mode: v })}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-border">
                <Button variant="ghost" onClick={() => resetToDefaults('appearance')} className="text-[10px] font-black uppercase tracking-widest hover:bg-muted/10 text-muted-foreground px-6 h-12 rounded-xl">
                  <RotateCcw className="h-4 w-4 mr-3" />
                  Reset Visual
                </Button>
                <Button onClick={saveAppearance} className="h-12 bg-primary hover:bg-primary/90 text-white shadow-premium-md transition-all rounded-xl px-12 font-black uppercase text-[10px] tracking-widest active:scale-95">
                  <Save className="h-4 w-4 mr-3" />
                  Aplicar Estética
                </Button>
              </div>
              <div className="pt-8 mt-8 border-t border-border">
                <SystemSeeders />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="animate-in slide-in-from-left-4 duration-500">
          <Card className="border-border shadow-premium-lg bg-card rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-border p-8">
              <CardTitle className="text-xl font-black text-foreground tracking-tighter uppercase font-display">Arquitectura de Infraestructura</CardTitle>
              <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Ajustes avanzados de sincronización y datos</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="space-y-6">
                {[
                  { id: 'autosave', icon: Save, label: 'Auto-Consolidación de Datos', desc: 'Sincronización en caliente y persistencia continua', checked: system.auto_save, key: 'auto_save' },
                  { id: 'offline', icon: WifiOff, label: 'Radar Offline / Caché Local', desc: 'Capacidad operativa sin conexión activa', checked: system.offline_mode, key: 'offline_mode' },
                  { id: 'analytics', icon: BarChart3, label: 'Telemetría de Rendimiento', desc: 'Recolección de métricas de uso anónimas', checked: system.analytics_enabled, key: 'analytics_enabled' },
                ].map((item) => (
                  <div key={item.id} className="group">
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-border transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-card rounded-xl shadow-soft">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-foreground uppercase tracking-widest">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={item.checked}
                        onCheckedChange={(v) => setSystem({ ...system, [item.key]: v })}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                ))}

                <Separator className="bg-border" />

                <div className="space-y-4">
                  <Label htmlFor="sync-frequency" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-3">
                    <Wifi className="h-4 w-4 text-primary" />
                    Frecuencia de Sincronización Global
                  </Label>
                  <Select
                    value={system.sync_frequency}
                    onValueChange={(v) => setSystem({ ...system, sync_frequency: v })}
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-none focus:ring-primary rounded-xl font-black uppercase text-xs tracking-tight shadow-inner w-full md:w-72 text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border font-black uppercase text-[10px] tracking-widest">
                      <SelectItem value="1">Ciclo de 1 Minuto</SelectItem>
                      <SelectItem value="5">Ciclo de 5 Minutos</SelectItem>
                      <SelectItem value="15">Ciclo de 15 Minutos</SelectItem>
                      <SelectItem value="30">Ciclo de 30 Minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-border">
                <Button variant="ghost" onClick={() => resetToDefaults('system')} className="text-[10px] font-black uppercase tracking-widest hover:bg-muted/10 text-muted-foreground px-6 h-12 rounded-xl">
                  <RotateCcw className="h-4 w-4 mr-3" />
                  Restaurar Core
                </Button>
                <Button onClick={saveSystem} className="h-12 bg-primary hover:bg-primary/90 text-white shadow-premium-md transition-all rounded-xl px-12 font-black uppercase text-[10px] tracking-widest active:scale-95">
                  <Save className="h-4 w-4 mr-3" />
                  Sincronizar Core
                </Button>
              </div>
              <div className="pt-8 mt-8 border-t border-border">
                <SystemSeeders />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization / Danger Zone Tab */}
        {isMaster && (
          <TabsContent value="organization" className="animate-in slide-in-from-left-4 duration-500">
            <div className="space-y-8">
              <Card className="border-red-100 shadow-premium-lg bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-red-50/50 border-b border-red-100 p-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-card rounded-2xl shadow-soft">
                      <ShieldAlert className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-red-900 tracking-tighter uppercase font-display">Bóveda de Seguridad Crítica</CardTitle>
                      <CardDescription className="text-red-400 font-bold text-[10px] uppercase tracking-widest mt-1">Acciones de destrucción y migración corporativa</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-6 text-center md:text-left">
                  <div className="p-8 rounded-3xl bg-red-50/20 border border-red-100/50 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-3 max-w-xl">
                      <h4 className="text-sm font-black text-red-900 uppercase tracking-widest">Procedimiento de Exterminio de Organización</h4>
                      <p className="text-xs text-red-700/70 font-bold leading-relaxed uppercase tracking-tight">
                        ADVERTENCIA: Esta acción destruirá permanentemente todos los datos de <span className="underline underline-offset-4 decoration-red-300"> {organizationName} </span>,
                        incluyendo productos, trazabilidad operativa, perfiles de usuario y logística.
                        Este proceso es IRREVERSIBLE según protocolo ISO-Elite.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="h-14 px-10 bg-red-500 hover:bg-red-600 text-white shadow-premium-md rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] animate-pulse hover:animate-none active:scale-95 transition-all"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Ejecutar Purga
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[500px] bg-card rounded-[2.5rem] border-none shadow-premium-2xl p-0 overflow-hidden font-display">
          <div className="p-10 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-red-100">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Validación de Destrucción</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Para confirmar la eliminación permanente de la infraestructura de <br/>
                  <span className="text-red-900">"{organizationName}"</span>, escriba el nombre a continuación.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="ESCRIBA NOMBRE DE LA EMPRESA..."
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className="h-16 bg-slate-50 border-none focus-visible:ring-red-500 rounded-2xl text-center font-black uppercase text-xs tracking-widest shadow-inner placeholder:text-slate-500 text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="destructive"
                className="h-16 w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-premium-md transition-all active:scale-95 flex items-center justify-center gap-3"
                disabled={confirmName !== organizationName || isDeleting}
                onClick={handleDeleteOrganization}
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShieldAlert className="h-5 w-5" />
                    CONFIRMAR PURGA TOTAL
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                className="h-16 w-full text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancelar Operación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

