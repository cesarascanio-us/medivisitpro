import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Building2,
    Users,
    Shield,
    CreditCard,
    LogOut,
    Activity,
    Plus,
    Settings,
    MoreVertical,
    Loader2,
    MapPin,
    AlertCircle
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const MasterDashboard = () => {
    const { signOut, user } = useAuth();
    const { toast } = useToast();
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentCompany, setCurrentCompany] = useState<any>({ name: '', plan: 'Pro' });
    const [processing, setProcessing] = useState(false);
    const [ownerProfiles, setOwnerProfiles] = useState<Record<string, any>>({});

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const { data: companiesData, error } = await supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setCompanies(companiesData || []);

            // Fetch owner profiles
            if (companiesData && companiesData.length > 0) {
                const ownerIds = [...new Set(companiesData.map(c => c.owner_id))];
                await fetchOwnerProfiles(ownerIds);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast({
                title: "Error cargando empresas",
                description: "No se pudieron obtener los datos.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchOwnerProfiles = async (userIds: string[]) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, user_id, first_name, last_name, email')
                .in('user_id', userIds);

            if (error) throw error;

            const profileMap: Record<string, any> = {};
            data?.forEach(profile => {
                profileMap[profile.user_id] = profile; // Map by user_id
            });
            // Also try to map by 'id' if user_id is different, but companies.owner_id usually refers to auth.uid() which matches profile.id or profile.user_id
            // In many schemas, profile.id IS the user.id. Let's assume user_id column in profiles exists as verified.

            setOwnerProfiles(profileMap);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    const handleCreateCompany = async () => {
        if (!currentCompany.name.trim()) {
            toast({ title: "Error", description: "El nombre es requerido.", variant: "destructive" });
            return;
        }

        try {
            setProcessing(true);
            const { error } = await supabase
                .from('companies')
                .insert({
                    name: currentCompany.name,
                    plan: currentCompany.plan,
                    subscription_status: 'active',
                    owner_id: user?.id as string
                });

            if (error) throw error;

            toast({ title: "Éxito", description: "Empresa creada correctamente." });
            setIsCreateOpen(false);
            setCurrentCompany({ name: '', plan: 'Pro' });
            fetchCompanies();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const handleEditCompany = async () => {
        if (!currentCompany.name.trim()) return;

        try {
            setProcessing(true);
            const { error } = await supabase
                .from('companies')
                .update({
                    name: currentCompany.name,
                    plan: currentCompany.plan
                })
                .eq('id', currentCompany.id);

            if (error) throw error;

            toast({ title: "Éxito", description: "Empresa actualizada." });
            setIsEditOpen(false);
            setCurrentCompany({ name: '', plan: 'Pro' });
            fetchCompanies();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteCompany = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar "${name}"? Esta acción es irreversible.`)) return;

        try {
            const { error } = await supabase.from('companies').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Empresa eliminada", description: "Los datos han sido borrados." });
            fetchCompanies();
        } catch (error: any) {
            toast({ title: "Error", description: "No se pudo eliminar la empresa.", variant: "destructive" });
        }
    };

    const openEdit = (company: any) => {
        setCurrentCompany({ ...company });
        setIsEditOpen(true);
    };

    const getOwnerName = (id: string) => {
        if (id === user?.id) return "Tú (Super Admin)";
        const profile = ownerProfiles[id];
        if (profile) return `${profile.first_name} ${profile.last_name}`;
        return id.substring(0, 8) + "...";
    };

    // Calculate MRR (simple estimation)
    const calculateMRR = () => {
        return companies.reduce((acc, curr) => {
            const price = curr.plan === 'Enterprise' ? 299 : curr.plan === 'Pro' ? 99 : 0;
            return acc + price;
        }, 0);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Master Header */}
            <header className="bg-slate-900 text-white border-b border-slate-700 sticky top-0 z-20">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">MedVisit Master</h1>
                                <p className="text-xs text-slate-400">Panel de Super Administrador</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium">{user?.email}</p>
                                <p className="text-xs text-slate-400">Master Access</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={signOut} className="text-slate-300 hover:text-white hover:bg-slate-800">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Empresas Activas</CardTitle>
                            <Building2 className="w-4 h-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{companies.length}</div>
                            <p className="text-xs text-muted-foreground">Registradas</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">MRR Estimado</CardTitle>
                            <CreditCard className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${calculateMRR()}</div>
                            <p className="text-xs text-muted-foreground">+ Mensual recurrente</p>
                        </CardContent>
                    </Card>
                    {/* Additional Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Estado Sistema</CardTitle>
                            <Activity className="w-4 h-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">100%</div>
                            <p className="text-xs text-muted-foreground">Operacional</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Companies Management */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Gestión de Empresas</CardTitle>
                                <CardDescription>Administra las suscripciones y accesos</CardDescription>
                            </div>
                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nueva Empresa
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Registrar Nueva Empresa</DialogTitle>
                                        <DialogDescription>Crea un nuevo tenant.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nombre de la Empresa</Label>
                                            <Input
                                                id="name"
                                                value={currentCompany.name}
                                                onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="plan">Plan de Suscripción</Label>
                                            <Select
                                                value={currentCompany.plan}
                                                onValueChange={(val) => setCurrentCompany({ ...currentCompany, plan: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un plan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Basic">Basic ($0)</SelectItem>
                                                    <SelectItem value="Pro">Pro ($99)</SelectItem>
                                                    <SelectItem value="Enterprise">Enterprise ($299)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateCompany} disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Crear Empresa
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                <p className="text-muted-foreground mt-2">Cargando...</p>
                            </div>
                        ) : companies.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No hay empresas registradas.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Propietario / Admin</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                                        {company.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{company.name}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> N/A
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    company.plan === 'Enterprise' ? 'border-purple-500 text-purple-600' :
                                                        company.plan === 'Pro' ? 'border-indigo-500 text-indigo-600' :
                                                            'border-slate-500 text-slate-600'
                                                }>
                                                    {company.plan || 'Free'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={company.subscription_status === 'active' ? 'default' : 'secondary'}
                                                    className="capitalize"
                                                >
                                                    {company.subscription_status || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {getOwnerName(company.owner_id)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEdit(company)}>
                                                            <Settings className="w-4 h-4 mr-2" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCompany(company.id, company.name)}>
                                                            <LogOut className="w-4 h-4 mr-2" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Empresa</DialogTitle>
                            <DialogDescription>Modificar datos de la empresa</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nombre</Label>
                                <Input
                                    id="edit-name"
                                    value={currentCompany.name}
                                    onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-plan">Plan</Label>
                                <Select
                                    value={currentCompany.plan}
                                    onValueChange={(val) => setCurrentCompany({ ...currentCompany, plan: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Basic">Basic</SelectItem>
                                        <SelectItem value="Pro">Pro</SelectItem>
                                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleEditCompany} disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div >
    );
};

export default MasterDashboard;
