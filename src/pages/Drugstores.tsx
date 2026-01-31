import { useState } from "react";
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
    Leaf,
    Download,
    Upload,
    Printer,
    RefreshCw,
    Navigation,
    Calendar,
    ShoppingCart
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
import { exportToCSV, handlePrint } from "@/utils/exportUtils";
import { DrugstoreFormDialog } from "@/components/drugstores/DrugstoreFormDialog";
import { DrugstoreInventoryDialog } from "@/components/drugstores/DrugstoreInventoryDialog";

export default function Drugstores() {
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
                    .from('contacts')
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
                    .from('contacts')
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
            const { error } = await supabase.from('contacts').delete().eq('id', id);
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
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2 text-indigo-700">
                        <Building2 className="h-8 w-8" />
                        Droguerías y Distribución
                    </h1>
                    <p className="text-muted-foreground font-medium">Gestión de Canal Indirecto 📦</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => exportToCSV(drugstores, 'droguerias')} className="bg-card border-border text-foreground hover:bg-muted">
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
                                contact_type: "drugstore"
                            });
                            setFormDialogOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-medium"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Nueva Droguería
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border border-border rounded-xl shadow-sm text-center p-4">
                    <div className="text-2xl font-bold text-indigo-600">{drugstores.length}</div>
                    <div className="text-sm text-muted-foreground font-medium">Total Droguerías</div>
                </Card>
                <Card className="bg-card border border-border rounded-xl shadow-sm text-center p-4">
                    <div className="text-2xl font-bold text-primary">{drugstores.filter(s => s.priority === 'high' || s.priority === 'urgent').length}</div>
                    <div className="text-sm text-muted-foreground font-medium">Alta Prioridad</div>
                </Card>
                <Card className="medical-card text-center p-4">
                    <div className="text-2xl font-bold text-amber-500">{drugstores.filter(s => s.lastVisit && new Date(s.lastVisit).getMonth() === new Date().getMonth()).length}</div>
                    <div className="text-sm text-muted-foreground">Visitadas Este Mes</div>
                </Card>
                <Card className="medical-card text-center p-4">
                    <div className="text-2xl font-bold text-foreground">
                        {drugstores.length > 0
                            ? (drugstores.reduce((acc, s) => acc + (s.rating || 0), 0) / drugstores.length).toFixed(1)
                            : "0.0"}
                    </div>
                    <div className="text-sm text-muted-foreground">Reputación Promedio</div>
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
                                placeholder="Buscar por nombre, RIF o ciudad..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-background border-input focus-visible:ring-indigo-500"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Admin Filters */}
            <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

            {/* List Table */}
            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Building className="h-4 w-4 text-indigo-600" />
                        Directorio de Distribución
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-indigo-50/30">
                                <TableRow>
                                    <TableHead className="pl-6">Droguería</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>RIF</TableHead>
                                    <TableHead>Estatus</TableHead>
                                    <TableHead className="text-right pr-6">Acciones</TableHead>
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
                                ) : drugstores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Building2 className="h-12 w-12 mb-4 opacity-5 text-indigo-400" />
                                                <p>No se encontraron droguerías.</p>
                                                <p className="text-sm">Inicia registrando un nuevo distribuidor.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    drugstores.map(store => (
                                        <TableRow key={store.id} className="hover:bg-indigo-50/10 transition-colors">
                                            <TableCell className="pl-6 font-medium text-slate-900">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{store.name}</span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal">
                                                        <Phone className="h-2.5 w-2.5" /> {store.phone || 'Sin teléfono'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col max-w-[200px]">
                                                    <span className="text-xs font-semibold text-slate-700">{store.city || 'S/C'}</span>
                                                    <span className="text-xs text-muted-foreground truncate">{store.address || 'Sin dirección registrada'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-[10px] border-indigo-100 text-indigo-800">
                                                    {store.rif}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={store.priority === 'high' || store.priority === 'urgent' ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-indigo-100 text-indigo-800 border-indigo-200"}>
                                                    {store.priority === 'high' || store.priority === 'urgent' ? "Prioridad Alta" : "Activa"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2 text-right">
                                                    <DrugstoreInventoryDialog
                                                        drugstoreId={store.id}
                                                        drugstoreName={store.name}
                                                        trigger={
                                                            <Button variant="ghost" size="sm" title="Gestión de Inventario">
                                                                <Package className="h-4 w-4 text-indigo-600" />
                                                            </Button>
                                                        }
                                                    />
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(store)}>
                                                        <Eye className="h-4 w-4 text-indigo-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditDrugstore(store)}>
                                                        <Edit className="h-4 w-4 text-indigo-600" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción eliminará a <strong>{store.name}</strong> del directorio.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteDrugstore(store.id)} className="bg-red-600 hover:bg-red-700 font-medium">
                                                                    Eliminar
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900 border-b pb-4">
                            <Building2 className="h-6 w-6 text-indigo-600" />
                            {selectedDrugstore?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Detalle completo del distribuidor, historial de visitas y pedidos realizados.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDrugstore && (
                        <Tabs defaultValue="overview" className="mt-4">
                            <TabsList className="grid w-full grid-cols-3 bg-indigo-50/50">
                                <TabsTrigger value="overview">General</TabsTrigger>
                                <TabsTrigger value="visits">Visitas</TabsTrigger>
                                <TabsTrigger value="orders">Pedidos</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 py-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                                            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                                <Building className="h-4 w-4" /> Información Comercial
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between border-b border-indigo-50 pb-2">
                                                    <span className="text-sm text-muted-foreground">RIF:</span>
                                                    <span className="text-sm font-mono font-bold text-indigo-800">{selectedDrugstore.rif}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-indigo-50 pb-2">
                                                    <span className="text-sm text-muted-foreground">Encargado:</span>
                                                    <span className="text-sm font-medium">{selectedDrugstore.owner_name || 'No especificado'}</span>
                                                </div>
                                                <div className="flex justify-between pt-2">
                                                    <span className="text-sm text-muted-foreground">Estatus Legal:</span>
                                                    <Badge className={selectedDrugstore.sanitary_permits ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}>
                                                        {selectedDrugstore.sanitary_permits ? "Permisos al día" : "Permisos Pendientes"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                                            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                                <MapPin className="h-4 w-4" /> Ubicación
                                            </h3>
                                            <p className="text-sm font-medium">{selectedDrugstore.city || 'S/C'}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{selectedDrugstore.address || 'Sin dirección registrada'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-500/10 h-full flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold mb-2">Acción Comercial</h3>
                                                <p className="text-slate-400 text-sm mb-6">Registra la gestión de cobranza o inventario.</p>
                                            </div>
                                            <div className="space-y-3">
                                                <Button onClick={handleRegisterVisit} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold h-12">
                                                    <Navigation className="mr-2 h-5 w-5" /> Iniciar Gestión
                                                </Button>
                                                <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800 h-10" onClick={() => handleEditDrugstore(selectedDrugstore)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Editar Información
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="visits" className="py-4">
                                <ScrollArea className="h-[400px]">
                                    {historyLoading ? (
                                        <div className="flex justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-indigo-500" /></div>
                                    ) : storeVisits.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl">
                                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p>No hay registro de gestiones previas.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {storeVisits.map(v => (
                                                <div key={v.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                    <div>
                                                        <p className="font-medium text-sm">{new Date(v.scheduled_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        <p className="text-xs text-muted-foreground">{v.visit_objective || 'General'}</p>
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
                                        <div className="flex justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-indigo-500" /></div>
                                    ) : storeOrders.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl">
                                            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p>Aún no se han registrado órdenes directas.</p>
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
                                                        <p className="font-bold text-indigo-700">${o.total?.toFixed(2)}</p>
                                                        <Badge variant="outline" className="text-[9px]">{o.status}</Badge>
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
