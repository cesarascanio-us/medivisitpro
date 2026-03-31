/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Leaf,
    RefreshCw,
    Building,
    MapPin,
    Phone,
    Edit,
    Eye,
    Trash2,
    History,
    Calendar,
    ShoppingCart,
    MapPinOff,
    CheckCircle2,
    XCircle,
    Package,
    Navigation,
    DollarSign,
    ExternalLink
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NaturalStoreFormDialog } from "@/components/pharma/NaturalStoreFormDialog";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/hooks/useContacts";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import { HelpCircle, Download, Upload, Printer, Filter, Star } from "lucide-react";

export default function NaturalStores() {
    const [adminFilters, setAdminFilters] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState("");
    const { contacts: naturalStores, loading, refresh: loadNaturalStores } = useContacts({
        searchTerm,
        typeFilter: 'natural_store',
        adminFilters
    });

    const { toast } = useToast();
    const { user, organizationId } = useAuth();

    // Dialog States
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [storeVisits, setStoreVisits] = useState<any[]>([]);
    const [storeOrders, setStoreOrders] = useState<any[]>([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        rif: "",
        owner_name: "",
        sanitary_permits: false,
        address: "",
        city: "",
        phone: "",
        email: "",
        contact_type: "natural_store"
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
            if (isEditing && selectedStore) {
                const { error } = await supabase
                    .from('contacts')
                    .update({
                        ...formData,
                        contact_type: formData.contact_type as any,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', selectedStore.id);

                if (error) throw error;
                toast({ title: "Éxito", description: "Tienda actualizada correctamente." });
            } else {
                const { error } = await supabase
                    .from('contacts')
                    .insert({
                        ...formData,
                        contact_type: 'natural_store' as any, // Cast to any to bypass strict enum if needed, or just ensure it matches
                        user_id: user?.id,
                        organization_id: organizationId
                    });

                if (error) throw error;
                toast({ title: "Éxito", description: "Alta Comercial completada. Tienda registrada." });
            }
            setFormDialogOpen(false);
            loadNaturalStores();
        } catch (error: any) {
            toast({
                title: "Error al guardar",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEditStore = (store: any) => {
        setSelectedStore(store);
        setFormData({
            name: store.name || "",
            rif: store.rif || "",
            owner_name: store.owner_name || "",
            sanitary_permits: store.sanitary_permits || false,
            address: store.address || "",
            city: store.city || "",
            phone: store.phone || "",
            email: store.email || "",
            contact_type: "natural_store"
        });
        setIsEditing(true);
        setFormDialogOpen(true);
    };

    const handleDeleteStore = async (id: string) => {
        try {
            const { error } = await supabase.from('contacts').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Eliminado", description: "La tienda ha sido eliminada del directorio." });
            loadNaturalStores();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleViewDetails = async (store: any) => {
        setSelectedStore(store);
        setViewDialogOpen(true);
        loadStoreHistory(store.id);
    };

    const loadStoreHistory = async (storeId: string) => {
        try {
            setHistoryLoading(true);

            // Load Visits
            const { data: visits, error: visitsError } = await supabase
                .from('visits')
                .select('*')
                .eq('contact_id', storeId)
                .order('scheduled_date', { ascending: false });

            if (visitsError) throw visitsError;
            setStoreVisits(visits || []);

            // Load Orders (Transfer Orders)
            const { data: orders, error: ordersError } = await supabase
                .from('transfer_orders')
                .select('*')
                .eq('contact_id', storeId)
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
        if (!selectedStore) return;

        try {
            // Create a new visit record
            const { data: visit, error } = await supabase
                .from('visits')
                .insert([{
                    contact_id: selectedStore.id,
                    user_id: user?.id,
                    organization_id: organizationId,
                    status: 'pending',
                    scheduled_date: new Date().toISOString(),
                    visit_type: 'natural_store', // Explicit type
                    visit_objective: 'Reposición de Inventario y Venta'
                }])
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Visita Iniciada",
                description: "Redirigiendo al formulario de ejecución..."
            });

            // Navigate to visit execution
            navigate(`/visits/execution/${visit.id}`);
        } catch (error: any) {
            toast({
                title: "Error al registrar visita",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const filteredStores = naturalStores; // Handled by useContacts now

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Leaf className="h-6 w-6 text-indigo-600" />
                        </div>
                        Tiendas Naturistas
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 ml-14">Gestión de Canal Elite 🌿</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => exportToCSV(naturalStores, 'tiendas_naturistas')} className="bg-card border-border text-foreground hover:bg-muted">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>

                    <Button variant="outline" className="bg-card border-border text-foreground hover:bg-muted">
                        <Upload className="mr-2 h-4 w-4" />
                        Importar
                    </Button>

                    <Button variant="outline" onClick={handlePrint} className="hidden sm:flex bg-card border-border text-foreground hover:bg-muted">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
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
                                contact_type: "natural_store"
                            });
                            setFormDialogOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl transition-all hover:scale-105"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Nueva Tienda Naturista
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border border-slate-100 rounded-2xl shadow-soft p-6 transition-all hover:shadow-card">
                    <div className="text-3xl font-black text-indigo-600 mb-1">{naturalStores.length}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Registros</div>
                </Card>
                <Card className="bg-card border border-border rounded-xl shadow-sm text-center p-4">
                    <div className="text-2xl font-bold text-primary">{naturalStores.filter(s => s.priority === 'high' || s.status === 'high_potential').length}</div>
                    <div className="text-sm text-muted-foreground font-medium">Alta Prioridad</div>
                </Card>
                <Card className="medical-card text-center p-4">
                    <div className="text-2xl font-bold text-amber-500">{naturalStores.filter(s => s.lastVisit && new Date(s.lastVisit).getMonth() === new Date().getMonth()).length}</div>
                    <div className="text-sm text-muted-foreground">Visitadas Este Mes</div>
                </Card>
                <Card className="medical-card text-center p-4">
                    <div className="text-2xl font-bold text-foreground">
                        {naturalStores.length > 0
                            ? (naturalStores.reduce((acc, s) => acc + (s.rating || 0), 0) / naturalStores.length).toFixed(1)
                            : "0.0"}
                    </div>
                    <div className="text-sm text-muted-foreground">Rating Promedio</div>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar por nombre o RIF..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12 bg-slate-50 border-slate-100 focus-visible:ring-indigo-500 font-bold rounded-xl"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Admin Filters */}
            <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

            {/* List Table */}
            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-50">
                    <CardTitle className="text-base font-black text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Building className="h-4 w-4 text-indigo-600" />
                        </div>
                        Directorio de Establecimientos
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-50 hover:bg-transparent">
                                    <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Tienda Naturista</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ubicación Estratégica</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">RIF / ID</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estatus Operativo</TableHead>
                                    <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="pl-6"><div className="h-4 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-40 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-slate-100 animate-pulse rounded" /></TableCell>
                                            <TableCell className="text-right pr-6"><div className="h-8 w-8 ml-auto bg-slate-100 animate-pulse rounded" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : naturalStores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Leaf className="h-12 w-12 mb-4 opacity-5 text-emerald-400" />
                                                <p>No se encontraron tiendas naturistas.</p>
                                                <p className="text-sm">Comienza agregando una nueva tienda al sistema.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    naturalStores.map(store => (
                                        <TableRow key={store.id} className="hover:bg-indigo-50/30 transition-all border-slate-50 group">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-slate-700 group-hover:text-indigo-700 transition-colors">{store.name}</span>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-tighter mt-1">
                                                        <Phone className="h-3 w-3 text-indigo-400" /> {store.phone || 'Pendiente'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col max-w-[220px]">
                                                    <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{store.city || 'N/A'}</span>
                                                    <span className="text-xs text-slate-400 truncate mt-0.5">{store.address || 'Sin dirección registrada'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-[10px] border-slate-200 text-slate-600 bg-white">
                                                    {store.rif}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={store.priority === 'high' || store.status === 'high_potential' ? "bg-rose-50 text-rose-600 border-rose-100 font-black text-[9px] uppercase tracking-widest px-2.5" : "bg-indigo-50 text-indigo-600 border-indigo-100 font-black text-[9px] uppercase tracking-widest px-2.5"}>
                                                    {store.priority === 'high' || store.status === 'high_potential' ? "Alta Prioridad" : "Activa"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(store)} className="h-9 w-9 p-0 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditStore(store)} className="h-9 w-9 p-0 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción eliminará a <strong>{store.name}</strong> del directorio de Tiendas Naturistas.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteStore(store.id)} className="bg-red-600 hover:bg-red-700 font-medium">
                                                                    Eliminar Tienda
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Detail View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-3xl rounded-[2rem] bg-white">
                    <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 px-10 py-10 text-white relative">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner">
                                <Leaf className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight text-white m-0">
                                    {selectedStore?.name}
                                </DialogTitle>
                                <p className="text-indigo-200/70 text-xs font-bold uppercase tracking-widest mt-1">
                                    Expediente Comercial de Establecimiento
                                </p>
                            </div>
                        </div>
                    </div>

                    {selectedStore && (
                        <Tabs defaultValue="overview" className="mt-4">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-50 p-1 rounded-xl">
                                <TabsTrigger value="overview" className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">General</TabsTrigger>
                                <TabsTrigger value="visits" className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Visitas</TabsTrigger>
                                <TabsTrigger value="orders" className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Pedidos</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 py-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <h3 className="text-[10px] font-black text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                                <Building className="h-3.5 w-3.5 text-indigo-500" /> Información Comercial
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">RIF Identificador</span>
                                                    <span className="text-xs font-mono font-black text-indigo-700">{selectedStore.rif}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Dueño / Regente</span>
                                                    <span className="text-xs font-black text-slate-700">{selectedStore.owner_name || 'No especificado'}</span>
                                                </div>
                                                <div className="flex justify-between pt-1">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Estatus Legal</span>
                                                    <Badge className={selectedStore.sanitary_permits ? "bg-indigo-50 text-indigo-700 border-none font-black text-[9px] uppercase" : "bg-amber-50 text-amber-700 border-none font-black text-[9px] uppercase"}>
                                                        {selectedStore.sanitary_permits ? "Permisos al día" : "Permisos Pendientes"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <h3 className="text-[10px] font-black text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                                <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Ubicación Geográfica
                                            </h3>
                                            <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{selectedStore.city}, {selectedStore.state || ''}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-1.5 leading-relaxed">{selectedStore.address}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
                                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                                <Navigation className="w-24 h-24" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Operación de Impacto</h3>
                                                <p className="text-indigo-200/50 font-bold text-xs uppercase tracking-widest mb-8 leading-relaxed">Ejecuta una visita de campo o actualiza el perfil comercial.</p>
                                            </div>
                                            <div className="space-y-3 relative z-10">
                                                <Button onClick={handleRegisterVisit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl shadow-xl shadow-indigo-500/10 transition-all">
                                                    <Navigation className="mr-3 h-5 w-5" /> Registrar Nueva Visita
                                                </Button>
                                                <Button variant="outline" className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl transition-all" onClick={() => handleEditStore(selectedStore)}>
                                                    <Edit className="mr-3 h-4 w-4" /> Modificar Perfil
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="visits" className="py-4">
                                <ScrollArea className="h-[400px]">
                                    {historyLoading ? (
                                        <div className="flex justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-emerald-500" /></div>
                                    ) : storeVisits.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl">
                                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p>No hay registro de visitas previas.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {storeVisits.map(v => (
                                                <div key={v.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                    <div>
                                                        <p className="font-medium text-sm">{new Date(v.scheduled_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        <p className="text-xs text-muted-foreground">{v.visit_objective || 'Sin objetivo definido'}</p>
                                                    </div>
                                                    <Badge variant={v.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
                                                        {v.status === 'completed' ? 'Completada' : 'Pendiente'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="orders" className="py-4">
                                <ScrollArea className="h-[400px]">
                                    {historyLoading ? (
                                        <div className="flex justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-emerald-500" /></div>
                                    ) : storeOrders.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl">
                                            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p>Aún no se han registrado pedidos directos.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {storeOrders.map(o => (
                                                <div key={o.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                    <div>
                                                        <p className="font-bold text-sm">#{o.order_number}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(o.order_date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-indigo-700">${o.total?.toFixed(2)}</p>
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400">{o.status}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog >

            {/* Form Dialog */}
            < NaturalStoreFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
            />
        </div >
    );
}
