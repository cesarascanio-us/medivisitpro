import { useState, useEffect } from "react";
import {
  User, Bell, Palette, Settings2, Save, RotateCcw,
  Mail, Smartphone, Clock, AlertTriangle, Sun, Moon,
  Languages, Type, LayoutGrid, Wifi, WifiOff, BarChart3,
  Camera, Check, MapPin, Trash2, Building2, ShieldAlert
} from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil y preferencias de la aplicación</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          {isMaster && (
            <TabsTrigger value="organization" className="flex items-center gap-2 text-rose-600 data-[state=active]:bg-rose-50">
              <Building2 className="h-4 w-4" />
              Organización
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información de perfil y datos de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Cambiar Foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG o PNG. Máx 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  placeholder="Visitador Médico"
                />
              </div>

              {/* Territories Multi-Select */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Territorios Asignados
                  </Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={selectAllTerritories}>
                      Seleccionar Todos
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={clearAllTerritories}>
                      Limpiar
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-muted/30">
                  {AVAILABLE_TERRITORIES.map((territory) => (
                    <div key={territory.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={territory.id}
                        checked={profile.territories.includes(territory.id)}
                        onCheckedChange={() => toggleTerritory(territory.id)}
                      />
                      <label
                        htmlFor={territory.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {territory.label}
                      </label>
                    </div>
                  ))}
                </div>
                {profile.territories.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {profile.territories.length} territorio(s) seleccionado(s)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Biografía</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Perfil'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Controla cómo y cuándo recibes notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Notificaciones por Email</p>
                      <p className="text-sm text-muted-foreground">Recibe resúmenes diarios por correo</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(v) => setNotifications({ ...notifications, email_notifications: v })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Notificaciones Push</p>
                      <p className="text-sm text-muted-foreground">Alertas en tiempo real</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(v) => setNotifications({ ...notifications, push_notifications: v })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Recordatorios de Visitas</p>
                      <p className="text-sm text-muted-foreground">Antes de cada visita programada</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.visit_reminders}
                    onCheckedChange={(v) => setNotifications({ ...notifications, visit_reminders: v })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Alertas de Objetivos</p>
                      <p className="text-sm text-muted-foreground">Cuando estés cerca del límite</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.objective_alerts}
                    onCheckedChange={(v) => setNotifications({ ...notifications, objective_alerts: v })}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Tiempo de recordatorio</Label>
                  <Select
                    value={notifications.reminder_time}
                    onValueChange={(v) => setNotifications({ ...notifications, reminder_time: v })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos antes</SelectItem>
                      <SelectItem value="30">30 minutos antes</SelectItem>
                      <SelectItem value="60">1 hora antes</SelectItem>
                      <SelectItem value="120">2 horas antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => resetToDefaults('notifications')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer
                </Button>
                <Button onClick={saveNotifications}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza la interfaz de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Claro', icon: Sun },
                      { value: 'dark', label: 'Oscuro', icon: Moon },
                      { value: 'system', label: 'Sistema', icon: Settings2 }
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={appearance.theme === value ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setAppearance({ ...appearance, theme: value as any })}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Idioma
                    </Label>
                    <Select
                      value={appearance.language}
                      onValueChange={(v) => setAppearance({ ...appearance, language: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Tamaño de Fuente
                    </Label>
                    <Select
                      value={appearance.font_size}
                      onValueChange={(v) => setAppearance({ ...appearance, font_size: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeño</SelectItem>
                        <SelectItem value="medium">Normal</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Modo Compacto</p>
                      <p className="text-sm text-muted-foreground">Reduce el espaciado de la interfaz</p>
                    </div>
                  </div>
                  <Switch
                    checked={appearance.compact_mode}
                    onCheckedChange={(v) => setAppearance({ ...appearance, compact_mode: v })}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => resetToDefaults('appearance')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer
                </Button>
                <Button onClick={saveAppearance}>
                  <Save className="h-4 w-4 mr-2" />
                  Aplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system">
          {/* ... existing system content ... */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>Ajustes avanzados de funcionamiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Save className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Auto-guardado</p>
                      <p className="text-sm text-muted-foreground">Guarda cambios automáticamente</p>
                    </div>
                  </div>
                  <Switch
                    checked={system.auto_save}
                    onCheckedChange={(v) => setSystem({ ...system, auto_save: v })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Modo Offline</p>
                      <p className="text-sm text-muted-foreground">Trabaja sin conexión a internet</p>
                    </div>
                  </div>
                  <Switch
                    checked={system.offline_mode}
                    onCheckedChange={(v) => setSystem({ ...system, offline_mode: v })}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Frecuencia de Sincronización
                  </Label>
                  <Select
                    value={system.sync_frequency}
                    onValueChange={(v) => setSystem({ ...system, sync_frequency: v })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Cada 1 minuto</SelectItem>
                      <SelectItem value="5">Cada 5 minutos</SelectItem>
                      <SelectItem value="15">Cada 15 minutos</SelectItem>
                      <SelectItem value="30">Cada 30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Analíticas</p>
                      <p className="text-sm text-muted-foreground">Ayúdanos a mejorar la aplicación</p>
                    </div>
                  </div>
                  <Switch
                    checked={system.analytics_enabled}
                    onCheckedChange={(v) => setSystem({ ...system, analytics_enabled: v })}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => resetToDefaults('system')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer
                </Button>
                <Button onClick={saveSystem}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization / Danger Zone Tab */}
        {isMaster && (
          <TabsContent value="organization">
            <div className="space-y-6">
              <Card className="border-rose-200">
                <CardHeader className="bg-rose-50/50">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-6 w-6 text-rose-600" />
                    <div>
                      <CardTitle className="text-rose-900">Zona de Peligro (Danger Zone)</CardTitle>
                      <CardDescription className="text-rose-700">Acciones críticas e irreversibles de la organización</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="p-4 border border-rose-200 rounded-lg bg-rose-50/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-rose-900 text-sm">Eliminar esta organización</h4>
                        <p className="text-xs text-rose-600">
                          Esta acción destruirá permanentemente todos los datos de <strong>{organizationName}</strong>,
                          incluyendo productos, visitas, perfiles y pedidos.
                          Las droguerías serán migradas a la organización maestra de respaldo.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Eliminar Organización
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              ¿Estás absolutamente seguro?
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-700">
              Esta acción <strong>NO se puede deshacer</strong>. Se borrarán todos los datos operativos y
              se migrarán las droguerías para mantener la continuidad comercial.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-sm font-medium">
              Por favor, escribe <span className="font-bold select-none text-rose-600">{organizationName}</span> para confirmar:
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Nombre de la organización"
              className="border-rose-200 focus:ring-rose-500"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setConfirmName("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              disabled={confirmName !== organizationName || isDeleting}
              className="gap-2"
            >
              {isDeleting ? 'Borrando...' : <><Trash2 className="h-4 w-4" /> Eliminar permanentemente</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
