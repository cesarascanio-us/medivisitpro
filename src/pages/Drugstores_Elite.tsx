/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Plus,
    Search,
    Building2,
    Building,
    MapPin,
    Phone,
    Edit,
    Eye,
    Trash2,
    Download,
    Upload,
    RefreshCw,
    Navigation,
    Calendar,
    Package,
    Store,
    FlaskConical,
    TrendingUp
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/hooks/useContacts";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { exportToCSV } from "@/utils/exportUtils";
import { DrugstoreFormDialog } from "@/components/drugstores/DrugstoreFormDialog";
import { DrugstoreInventoryDialog } from "@/components/drugstores/DrugstoreInventoryDialog";
import { EliteHeader, EliteKPICard, EliteTabsList, EliteTabsTrigger } from "@/components/layout/DesignSystem";

export default function DrugstoresElite() {
    const [adminFilters, setAdminFilters] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState("");
    const { contacts: drugstores, loading, refresh: loadDrugstores } = useContacts({
        searchTerm,
        typeFilter: 'drugstore',
        adminFilters
    });

    const { toast } = useToast();
    const { user, organizationId } = useAuth();
    const navigate = useNavigate();

    // Dialog States
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDrugstore, setSelectedDrugstore] = useState<any>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [storeVisits, setStoreVisits] = useState<any[]>([]);
    const [storeOrders, setStoreOrders] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        rif: "",
        owner_name: "",
        sanitary_permits: false,
        address: "",
        city: "",
        phone: "",
        email: "",
        contact_type: "drugstore"
    });

    const handleFormSubmit = async () => {
        if (!formData.name || !formData.rif) {
            toast({
                title: "Campos Requeridos",
                description: "Nombre y RIF son obligatorios para el Alta Comercial.",
                variant: "destructive"
            });
            return;
        }

        try {
            if (isEditing && selectedDrugstore) {
                const { error } = await (supabase as any)
                    .from('drugstores')
                    .update({
                        ...formData,
                        contact_type: 'drugstore' as any,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedDrugstore.id);

                if (error) throw error;
                toast({ title: "Éxito", description: "Droguería actualizada correctamente." });
            } else {
                const { error } = await (supabase as any)
                    .from('drugstores')
                    .insert({
                        ...formData,
                        contact_type: 'drugstore' as any,
                        user_id: user?.id,
                        organization_id: organizationId
                    });

                if (error) throw error;
                toast({ title: "Éxito", description: "Alta Comercial completada. Droguería registrada." });
            }
            setFormDialogOpen(false);
            loadDrugstores();
        } catch (error: any) {
            toast({
                title: "Error al guardar",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEditDrugstore = (drugstore: any) => {
        setSelectedDrugstore(drugstore);
        setFormData({
            name: drugstore.name || "",
            rif: drugstore.rif || "",
            owner_name: drugstore.owner_name || "",
            sanitary_permits: drugstore.sanitary_permits || false,
            address: drugstore.address || "",
            city: drugstore.city || "",
            phone: drugstore.phone || "",
            email: drugstore.email || "",
            contact_type: "drugstore"
        });
        setIsEditing(true);
        setFormDialogOpen(true);
    };

    const handleDeleteDrugstore = async (id: string) => {
        try {
            const { error } = await (supabase as any).from('drugstores').delete().eq('id', id).eq('organization_id', organizationId);
            if (error) throw error;
            toast({ title: "Eliminado", description: "La droguería ha sido eliminada del directorio." });
            loadDrugstores();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleViewDetails = async (drugstore: any) => {
        setSelectedDrugstore(drugstore);
        setViewDialogOpen(true);
        loadStoreHistory(drugstore.id);
    };

    const loadStoreHistory = async (drugstoreId: string) => {
        try {
            setHistoryLoading(true);
            const { data: visits, error: visitsError } = await (supabase as any)
                .from('visits')
                .select('*')
                .eq('contact_id', drugstoreId)
                .order('scheduled_date', { ascending: false });

            if (visitsError) throw visitsError;
            setStoreVisits(visits || []);

            const { data: orders, error: ordersError } = await (supabase as any)
                .from('transfer_orders')
                .select('*')
                .eq('contact_id', drugstoreId)
                .order('order_date', { ascending: false });

            if (ordersError) throw ordersError;
            setStoreOrders(orders || []);
        } catch (error: any) {
            console.error("Error loading history:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRegisterVisit = async () => {
        if (!selectedDrugstore) return;
        try {
            const { data: visit, error } = await (supabase as any)
                .from('visits')
                .insert([{
                    contact_id: selectedDrugstore.id,
                    user_id: user?.id,
                    organization_id: organizationId,
                    status: 'pending',
                    scheduled_date: new Date().toISOString(),
                    visit_type: 'drugstore',
                    visit_objective: 'Gestión de Cobranza e Inventario'
                }])
                .select()
                .single();

            if (error) throw error;
            if (!visit) throw new Error("No se pudo crear la visita");
            
            toast({ title: "Visita Iniciada", description: "Redirigiendo..." });
            navigate(`/visits/execution/${visit.id}`);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-display transition-colors duration-500 overflow-y-auto space-y-10">
            <EliteHeader 
                title="Droguerías"
                subtitle="Directorio de socios comerciales"
                icon={Building2}
                badgeText="Red de Distribución"
                statusText="Canal activo"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 w-full sm:w-auto">
                        <Button variant="outline" onClick={() => exportToCSV(drugstores, 'droguerias')} className="h-10 md:h-12 px-4 md:px-6 border-slate-200 dark:border-slate-800 bg-card text-foreground rounded-xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm">
                            <Download className="mr-2 h-4 w-4" /> Exportar
                        </Button>
                        <Button
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    name: "",
                                    rif: "",
                                    owner_name: "",
                                    sanitary_permits: false,
                                    address: "",
                                    city: "",
                                    phone: "",
                                    email: "",
                                    contact_type: "drugstore"
                                });
                                setFormDialogOpen(true);
                            }}
                            className="bg-primary text-white shadow-md font-bold text-xs h-10 md:h-12 px-6 md:px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Plus className="h-5 w-5 mr-2" /> Nueva Droguería
                        </Button>
                    </div>
                }
            />

            {/* KPI Section Elite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <EliteKPICard 
                    title="Total droguerías"
                    value={drugstores.length}
                    subtitle="Socios registrados"
                    icon={Building2}
                    color="blue"
                    delay={100}
                />
                <EliteKPICard 
                    title="Prioridad alta"
                    value={drugstores.filter(s => s.priority === 'high' || s.priority === 'urgent').length}
                    subtitle="Gestión urgente"
                    icon={Building}
                    color="amber"
                    delay={200}
                />
                <EliteKPICard 
                    title="Visitas del mes"
                    value={drugstores.filter(s => s.lastVisit && new Date(s.lastVisit).getMonth() === new Date().getMonth()).length}
                    subtitle="Seguimiento activo"
                    icon={Calendar}
                    color="emerald"
                    delay={300}
                />
                <EliteKPICard 
                    title="Calificación"
                    value={drugstores.length > 0 ? (drugstores.reduce((acc, s) => acc + (s.rating || 0), 0) / drugstores.length).toFixed(1) : "0.0"}
                    subtitle="Promedio servicio"
                    icon={TrendingUp}
                    color="indigo"
                    delay={400}
                />
            </div>

            {/* Search and Filters Section */}
            <div className="space-y-6 mb-10">
                <Card className="bg-card border border-border rounded-[2rem] p-4 shadow-premium-sm">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input
                            type="text"
                            placeholder="Buscar droguería por nombre, RIF o ciudad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 pl-16 bg-transparent border-none text-foreground font-semibold placeholder:text-slate-400 focus-visible:ring-0 text-sm"
                        />
                    </div>
                </Card>

                {/* Admin Filters - Control de Territorio */}
                <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />
            </div>

            {/* Table Section Industrial */}
            <Card className="bg-card border border-border rounded-[3rem] shadow-premium-lg overflow-hidden">
                <CardHeader className="p-8 border-b border-border/40">
                    <CardTitle className="text-xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <Building className="h-5 w-5 text-primary" />
                        Listado de Droguerías
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="pl-8 h-14 text-slate-400 font-bold text-[11px] uppercase tracking-wider">Droguería</TableHead>
                                <TableHead className="h-14 text-slate-400 font-bold text-[11px] uppercase tracking-wider">Ubicación</TableHead>
                                <TableHead className="h-14 text-slate-400 font-bold text-[11px] uppercase tracking-wider">RIF</TableHead>
                                <TableHead className="h-14 text-slate-400 font-bold text-[11px] uppercase tracking-wider">Estado</TableHead>
                                <TableHead className="pr-8 h-14 text-right text-slate-400 font-bold text-[11px] uppercase tracking-wider">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i} className="border-white/5">
                                        <TableCell colSpan={5} className="h-24"><div className="w-full h-8 bg-background/5 animate-pulse rounded-xl" /></TableCell>
                                    </TableRow>
                                ))
                            ) : drugstores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-96 text-center">
                                        <Building2 className="h-20 w-20 mx-auto mb-6 opacity-10 text-indigo-500" />
                                        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No hay registros en el Canal Distribución</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                drugstores.map(store => (
                                    <TableRow key={store.id} className="border-border/20 group hover:bg-muted/50 transition-all duration-300">
                                        <TableCell className="pl-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-base font-bold text-foreground tracking-tight">{store.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3" /> {store.phone || 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-600">{store.city || 'N/A'}</span>
                                                <span className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">{store.address || 'Sin dirección'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-mono text-[10px] py-0.5 px-2 rounded-lg">
                                                {store.rif}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "py-0.5 px-3 rounded-full font-bold text-[9px] uppercase tracking-wider",
                                                store.priority === 'high' || store.priority === 'urgent' 
                                                    ? "bg-rose-50 text-rose-600 border-none" 
                                                    : "bg-emerald-50 text-emerald-600 border-none"
                                            )}>
                                                {store.priority === 'high' || store.priority === 'urgent' ? "Prioritario" : "Activo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DrugstoreInventoryDialog
                                                    drugstoreId={store.id}
                                                    drugstoreName={store.name}
                                                    trigger={
                                                        <Button variant="ghost" className="h-9 w-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-primary transition-all">
                                                            <Package className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button variant="ghost" onClick={() => handleViewDetails(store)} className="h-9 w-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-all">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" onClick={() => handleEditDrugstore(store)} className="h-9 w-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-all">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" className="h-9 w-9 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-card border-slate-200 rounded-2xl shadow-xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-xl font-bold tracking-tight">Confirmar eliminación</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-slate-500 text-sm">
                                                                ¿Estás seguro de que deseas eliminar a <strong className="text-foreground">{store.name}</strong>? Esta acción no se puede deshacer.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="mt-6 gap-2">
                                                            <AlertDialogCancel className="bg-slate-50 border-none rounded-lg h-10 font-bold text-xs">Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteDrugstore(store.id)} className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg h-10 font-bold text-xs">Eliminar droguería</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detail View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-none shadow-premium-2xl rounded-[3rem] p-0 font-display">
                    <DialogHeader className="p-8 border-b border-border/40">
                        <DialogTitle className="flex items-center gap-5 text-2xl font-bold text-foreground tracking-tight leading-none">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">{selectedDrugstore?.name}</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">Expediente comercial</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDrugstore && (
                        <div className="p-4 md:p-10">
                            <Tabs defaultValue="overview" className="space-y-6 md:space-y-8">
                                <EliteTabsList>
                                    <EliteTabsTrigger value="overview" label="General" icon={Search} />
                                    <EliteTabsTrigger value="visits" label="Visitas" icon={Calendar} />
                                    <EliteTabsTrigger value="orders" label="Pedidos" icon={Package} />
                                </EliteTabsList>

                            <TabsContent value="overview" className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                                            <h3 className="text-[9px] md:text-[10px] font-bold text-slate-500 mb-4 md:mb-6 flex items-center gap-3 uppercase tracking-wider">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                    <Building className="h-4 w-4 text-primary" />
                                                </div>
                                                Información Comercial
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                                    <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">RIF</span>
                                                    <span className="text-[9px] md:text-[10px] font-mono font-bold text-foreground">{selectedDrugstore.rif}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                                    <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Encargado</span>
                                                    <span className="text-[9px] md:text-[10px] font-bold text-primary uppercase">{selectedDrugstore.owner_name || 'PENDIENTE'}</span>
                                                </div>
                                                <div className="flex justify-between pt-2">
                                                    <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estatus Legal</span>
                                                    <Badge className={selectedDrugstore.sanitary_permits ? "bg-emerald-500/10 text-emerald-600 border-none font-bold text-[8px] md:text-[9px] uppercase px-3 py-1 rounded-full" : "bg-amber-500/10 text-amber-600 border-none font-bold text-[8px] md:text-[9px] uppercase px-3 py-1 rounded-full"}>
                                                        {selectedDrugstore.sanitary_permits ? "PERMISOS OK" : "PENDIENTE"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                                            <h3 className="text-[9px] md:text-[10px] font-bold text-slate-500 mb-4 md:mb-6 flex items-center gap-3 uppercase tracking-wider">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                </div>
                                                Ubicación Principal
                                            </h3>
                                            <p className="text-lg md:text-xl font-bold text-foreground uppercase tracking-tight leading-none">{selectedDrugstore.city || 'S/C'}</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 leading-relaxed">{selectedDrugstore.address || 'Sin dirección registrada'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-primary rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-primary/20 h-full flex flex-col justify-between group overflow-hidden relative border-4 border-white dark:border-slate-800 text-white">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                                <Navigation className="h-24 md:h-32 w-24 md:w-32 text-white" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight uppercase leading-[0.9] mb-4">Gestión<br />Comercial</h3>
                                                <p className="text-primary-foreground/70 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-8">Ejecutar seguimiento de cobranza o inventario.</p>
                                            </div>
                                            <div className="space-y-3 md:space-y-4 relative z-10">
                                                <button onClick={handleRegisterVisit} className="w-full bg-white text-primary shadow-lg font-bold uppercase tracking-wider text-[9px] md:text-[10px] h-12 md:h-14 rounded-xl md:rounded-2xl transition-all hover:bg-slate-50 active:scale-95 flex items-center justify-center">
                                                    <Navigation className="mr-2 md:mr-3 h-4 md:h-5 w-4 md:w-5" /> Iniciar Visita
                                                </button>
                                                <button className="w-full border border-white/30 text-white hover:bg-white/10 h-12 md:h-14 rounded-xl md:rounded-2xl uppercase font-bold tracking-wider text-[9px] md:text-[10px] shadow-sm flex items-center justify-center" onClick={() => handleEditDrugstore(selectedDrugstore)}>
                                                    <Edit className="mr-2 md:mr-3 h-4 w-4" /> Editar Perfil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="visits" className="animate-in slide-in-from-right-5 duration-500">
                                <ScrollArea className="h-[450px] pr-4">
                                    {historyLoading ? (
                                        <div className="flex justify-center p-12"><RefreshCw className="h-10 w-10 animate-spin text-primary" /></div>
                                    ) : storeVisits.length === 0 ? (
                                        <div className="text-center py-20 bg-muted/20 rounded-[3rem] border border-border/40 border-dashed">
                                            <Calendar className="h-16 w-16 mx-auto mb-6 opacity-10 text-primary" />
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sin historial de gestiones registradas</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {storeVisits.map(v => (
                                                <div key={v.id} className="p-8 bg-card border border-border rounded-[2rem] flex justify-between items-center hover:shadow-premium-md transition-all group shadow-premium-sm">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 bg-muted/30 rounded-xl flex items-center justify-center border border-border/40 shadow-inner">
                                                            <Calendar className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-foreground uppercase tracking-tighter text-lg">{new Date(v.scheduled_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 ">{v.visit_objective || 'GESTIÓN GENERAL'}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={v.status === 'completed' ? 'default' : 'secondary'} className={v.status === 'completed' ? "bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full" : "bg-slate-100 text-slate-400 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full"}>
                                                        {v.status === 'completed' ? 'ÉXITO / CERRADA' : 'OPERACIÓN EN CURSO'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="orders" className="animate-in slide-in-from-right-5 duration-500">
                                <ScrollArea className="h-[450px] pr-4">
                                    {historyLoading ? (
                                        <div className="flex justify-center p-12"><RefreshCw className="h-10 w-10 animate-spin text-primary" /></div>
                                    ) : storeOrders.length === 0 ? (
                                        <div className="text-center py-20 bg-muted/20 rounded-[3rem] border border-border/40 border-dashed">
                                            <Package className="h-16 w-16 mx-auto mb-6 opacity-10 text-primary" />
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sin registros de órdenes directas</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {storeOrders.map(o => (
                                                <div key={o.id} className="p-10 bg-card border border-border rounded-[2.5rem] flex justify-between items-center hover:shadow-premium-md transition-all group shadow-premium-sm">
                                                    <div className="flex items-center gap-8">
                                                        <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center border border-border/40 shadow-inner">
                                                            <Package className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ">Orden de Transferencia</span>
                                                            <span className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">#{o.order_number}</span>
                                                            <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-primary text-white" /> {new Date(o.order_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-4xl font-black text-foreground tracking-tighter mb-2 tabular-nums">${o.total?.toFixed(2)}</p>
                                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">{o.status}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </div>
                    )}
                </DialogContent>
            </Dialog>

            <DrugstoreFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
            />
        </div>
    );
}
