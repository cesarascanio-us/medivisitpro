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
                const { error } = await supabase
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
                const { error } = await supabase
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
            const { error } = await supabase.from('drugstores').delete().eq('id', id).eq('organization_id', organizationId);
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
            const { data: visits, error: visitsError } = await supabase
                .from('visits')
                .select('*')
                .eq('contact_id', drugstoreId)
                .order('scheduled_date', { ascending: false });

            if (visitsError) throw visitsError;
            setStoreVisits(visits || []);

            const { data: orders, error: ordersError } = await supabase
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
            const { data: visit, error } = await supabase
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
            toast({ title: "Visita Iniciada", description: "Redirigiendo..." });
            navigate(`/visits/execution/${visit.id}`);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-display transition-colors duration-500 overflow-y-auto space-y-10">
            <EliteHeader 
                title="Canal Distribución"
                subtitle="DIRECTORIO LOGÍSTICO Y OPERATIVO"
                icon={FlaskConical}
                badgeText="DISTRIBUCIÓN V.ELITE"
                statusText="CANAL ESTRATÉGICO ACTIVO"
                statusColor="bg-primary"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => exportToCSV(drugstores, 'droguerias')} className="h-14 px-8 border-border bg-card text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all duration-300 shadow-premium-sm">
                            <Download className="mr-3 h-4 w-4" /> Exportar
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
                            className="bg-primary text-white shadow-premium-md font-black uppercase tracking-widest text-xs h-14 px-10 rounded-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="h-6 w-6 mr-3" /> Nueva Droguería
                        </Button>
                    </div>
                }
            />

            {/* KPI Section Elite */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 mb-10">
                <EliteKPICard 
                    title="Total Distribución"
                    value={drugstores.length}
                    subtitle="Droguerías Registradas"
                    icon={Building2}
                    color="primary"
                    delay={100}
                />
                <EliteKPICard 
                    title="Foco Prioritario"
                    value={drugstores.filter(s => s.priority === 'high' || s.priority === 'urgent').length}
                    subtitle="Gestión Urgente"
                    icon={Building}
                    color="amber"
                    delay={200}
                />
                <EliteKPICard 
                    title="Auditorías Mes"
                    value={drugstores.filter(s => s.lastVisit && new Date(s.lastVisit).getMonth() === new Date().getMonth()).length}
                    subtitle="Seguimiento Activo"
                    icon={Calendar}
                    color="emerald"
                    delay={300}
                />
                <EliteKPICard 
                    title="Rating Desempeño"
                    value={drugstores.length > 0 ? (drugstores.reduce((acc, s) => acc + (s.rating || 0), 0) / drugstores.length).toFixed(1) : "0.0"}
                    subtitle="Calidad de Servicio"
                    icon={Package}
                    color="blue"
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
                            placeholder="BUSCAR DISTRIBUIDOR POR NOMBRE, RIF O CIUDAD..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-16 pl-16 bg-transparent border-none text-foreground font-bold placeholder:text-slate-300 focus-visible:ring-0 text-sm uppercase tracking-widest"
                        />
                    </div>
                </Card>

                {/* Admin Filters - Control de Territorio */}
                <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />
            </div>

            {/* Table Section Industrial */}
            <Card className="bg-card border border-border rounded-[3rem] shadow-premium-lg overflow-hidden">
                <CardHeader className="p-10 border-b border-border/40">
                    <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-4">
                        <Building className="h-6 w-6 text-primary" />
                        Directorio de Distribución Estratégica
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="pl-10 h-16 text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">Distribuidor</TableHead>
                                <TableHead className="h-16 text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">Geolocalización</TableHead>
                                <TableHead className="h-16 text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">Identificación Fiscal</TableHead>
                                <TableHead className="h-16 text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">Estatus Táctico</TableHead>
                                <TableHead className="pr-10 h-16 text-right text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">Mando</TableHead>
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
                                        <TableCell className="pl-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-foreground tracking-tighter uppercase">{store.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                                    <Phone className="h-3 w-3 text-primary/50" /> {store.phone || 'S/T'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-300 uppercase  tracking-tight">{store.city || 'S/C'}</span>
                                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px] mt-1 ">{store.address || 'S/D'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-indigo-500/5 border-indigo-500/20 text-indigo-400 font-mono text-[10px] py-1 px-3 rounded-lg tracking-widest">
                                                {store.rif}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={store.priority === 'high' || store.priority === 'urgent' ? "bg-rose-500/10 text-rose-500 border-rose-500/20 py-1 px-4 rounded-full font-black text-[9px] uppercase tracking-widest" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 py-1 px-4 rounded-full font-black text-[9px] uppercase tracking-widest"}>
                                                {store.priority === 'high' || store.priority === 'urgent' ? "CRÍTICO / PRIORITARIO" : "ACTIVO / OPERATIVO"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-10 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DrugstoreInventoryDialog
                                                    drugstoreId={store.id}
                                                    drugstoreName={store.name}
                                                    trigger={
                                                        <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-background/5 hover:bg-indigo-500/20 text-indigo-400 transition-all border border-transparent hover:border-indigo-500/20">
                                                            <Package className="h-5 w-5" />
                                                        </Button>
                                                    }
                                                />
                                                <Button variant="ghost" onClick={() => handleViewDetails(store)} className="h-12 w-12 rounded-2xl bg-background/5 hover:bg-blue-500/20 text-blue-400 transition-all border border-transparent hover:border-blue-500/20">
                                                    <Eye className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" onClick={() => handleEditDrugstore(store)} className="h-12 w-12 rounded-2xl bg-background/5 hover:bg-amber-500/20 text-amber-400 transition-all border border-transparent hover:border-amber-500/20">
                                                    <Edit className="h-5 w-5" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-background/5 hover:bg-rose-500/20 text-rose-400 transition-all border border-transparent hover:border-rose-500/20">
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-slate-900 border-white/5 rounded-[2rem] text-white">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white font-black text-2xl tracking-tighter uppercase ">Confirmar Purga</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                                                Esta acción eliminará a <strong className="text-white">{store.name}</strong> de forma irreversible.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="mt-8 gap-4">
                                                            <AlertDialogCancel className="bg-slate-800 border-none text-white rounded-xl h-11 uppercase font-black tracking-widest text-[10px]">Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteDrugstore(store.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 uppercase font-black tracking-widest text-[10px]">Ejecutar Eliminación</AlertDialogAction>
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
                    <DialogHeader className="p-10 border-b border-border/40">
                        <DialogTitle className="flex items-center gap-6 text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-premium-sm">
                                <Building2 className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">{selectedDrugstore?.name}</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 italic">Expediente Comercial V.Industrial</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDrugstore && (
                        <div className="p-10">
                            <Tabs defaultValue="overview" className="space-y-8">
                                <EliteTabsList>
                                    <EliteTabsTrigger value="overview" label="General" icon={Search} />
                                    <EliteTabsTrigger value="visits" label="Visitas" icon={Calendar} />
                                    <EliteTabsTrigger value="orders" label="Pedidos" icon={Package} />
                                </EliteTabsList>

                            <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/40 shadow-inner">
                                            <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-3 uppercase tracking-[0.3em] ">
                                                <div className="p-2 bg-card rounded-lg shadow-sm">
                                                    <Building className="h-4 w-4 text-primary" />
                                                </div>
                                                Información Comercial
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between border-b border-border/40 pb-4">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest ">RIF</span>
                                                    <span className="text-[10px] font-mono font-black text-foreground tracking-widest">{selectedDrugstore.rif}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/40 pb-4">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest ">Encargado</span>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedDrugstore.owner_name || 'PENDIENTE'}</span>
                                                </div>
                                                <div className="flex justify-between pt-2">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest ">Estatus Legal</span>
                                                    <Badge className={selectedDrugstore.sanitary_permits ? "bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full" : "bg-amber-500/10 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full"}>
                                                        {selectedDrugstore.sanitary_permits ? "PERMISOS OK" : "TRÁMITE PENDIENTE"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/40 shadow-inner">
                                            <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-3 uppercase tracking-[0.3em] ">
                                                <div className="p-2 bg-card rounded-lg shadow-sm">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                </div>
                                                Geolocalización Táctica
                                            </h3>
                                            <p className="text-xl font-black text-foreground uppercase tracking-tighter leading-none">{selectedDrugstore.city || 'S/C'}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3 leading-relaxed">{selectedDrugstore.address || 'Sin direccion registrada'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-primary rounded-[2.5rem] p-10 shadow-premium-lg shadow-primary/20 h-full flex flex-col justify-between group overflow-hidden relative border-4 border-white text-white">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                                <Navigation className="h-32 w-32 text-white" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-4">Acción<br />Comercial</h3>
                                                <p className="text-primary-foreground/70 text-[10px] font-black uppercase tracking-widest mb-8">Ejecutar gestión de cobranza o inventario de alto nivel.</p>
                                            </div>
                                            <div className="space-y-4 relative z-10">
                                                <Button onClick={handleRegisterVisit} className="w-full bg-card text-primary shadow-premium-lg font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-95">
                                                    <Navigation className="mr-3 h-5 w-5" /> Iniciar Gestión Táctica
                                                </Button>
                                                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-background/10 h-14 rounded-2xl uppercase font-black tracking-widest text-[10px] shadow-sm" onClick={() => handleEditDrugstore(selectedDrugstore)}>
                                                    <Edit className="mr-3 h-4 w-4" /> Editar ADN Comercial
                                                </Button>
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
