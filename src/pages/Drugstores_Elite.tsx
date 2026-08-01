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
    TrendingUp,
    Star,
    Mail,
    ChevronRight,
    ArrowRight,
    MoreVertical
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useOrganization } from "@/hooks/useOrganization";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useContacts } from "@/hooks/useContacts";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { exportToCSV } from "@/utils/exportUtils";
import { DrugstoreFormDialog } from "@/components/drugstores/DrugstoreFormDialog";
import { DrugstoreInventoryDialog } from "@/components/drugstores/DrugstoreInventoryDialog";
import { EliteHeader, EliteKPICard, EliteTabsList, EliteTabsTrigger, EliteTable } from "@/components/layout/DesignSystem";
import { ImportDialog } from "@/components/shared/ImportDialog";

export default function DrugstoresElite() {
    const [adminFilters, setAdminFilters] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState("");
    const { contacts: drugstores, loading: contactsLoading, refresh: loadDrugstores } = useContacts({
        searchTerm,
        typeFilter: 'drugstore',
        adminFilters
    });
    const [localLoading, setLocalLoading] = useState(false);
    const loading = contactsLoading || localLoading;

    const { toast } = useToast();
    const { user, isMaster } = useAuth();
    const { organization } = useOrganization();
    const organizationId = organization?.id;
    const organizationName = organization?.name;
    const navigate = useNavigate();

    // ── Permisos segmentados por tipo de droguería ─────────────────────────
    const userRole = user?.app_metadata?.role || user?.user_metadata?.role || user?.role || "";
    // Nacionales: solo admin / manager / telemarketing (catálogo global)
    const canManageNacional = isMaster || ["admin", "manager", "telemarketing"].includes(userRole);
    // Regionales: también commercial_rep y representative
    const canManageRegional = isMaster || ["admin", "manager", "telemarketing", "commercial_rep", "representative"].includes(userRole);
    // Helper: ¿puede editar/eliminar ESTA drogueria?
    const canManage = (store: any) => store.type === 'Nacional' ? canManageNacional : canManageRegional;
    // Puede crear alguna drogueria
    const canCreate = canManageNacional || canManageRegional;

    const [typeFilter, setTypeFilter] = useState<'Todas' | 'Nacional' | 'Regional'>('Todas');
    const filteredDrugstores = typeFilter === 'Todas' ? drugstores : drugstores.filter(d => d.type === typeFilter);

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
        type: canManageNacional ? "Regional" : "Regional",
        contact_type: "drugstore"
    });

    const handleFormSubmit = async () => {
        if (!formData.name) {
            toast({ title: "Información Incompleta", description: "El nombre es obligatorio.", variant: "destructive" });
            return;
        }

        try {
            const dbPayload = {
                name: formData.name,
                address: formData.address || null,
                phone: formData.phone || null,
                email: formData.email || null,
                contact_name: formData.owner_name || null,
                location: formData.city || null,
                type: formData.type || 'Regional',
                is_active: true
            };
            if (isEditing && selectedDrugstore) {
                const { error } = await (supabase as any).from('drugstores').update({ ...dbPayload, updated_at: new Date().toISOString() }).eq('id', selectedDrugstore.id);
                if (error) throw error;
                toast({ title: "Sincronización Exitosa", description: "Registro actualizado en el directorio central." });
            } else {
                const { error } = await (supabase as any).from('drugstores').insert({ ...dbPayload, user_id: user?.id, organization_id: organizationId });
                if (error) throw error;
                toast({ title: "Registro Comercial Completado", description: "Nueva droguería registrada en red." });
            }
            setFormDialogOpen(false);
            loadDrugstores();
        } catch (error: any) {
            toast({ title: "Fallo de Sistema", description: error.message, variant: "destructive" });
        }
    };

    const handleImport = async (data: Record<string, any>[]) => {
        try {
            const itemsToInsert = data.map((row: any) => ({
                user_id: user?.id, 
                organization_id: organizationId,
                name: row['Nombre'] || row['nombre'] || row['Name'] || '',
                address: row['Dirección'] || row['direccion'] || row['address'] || '',
                location: row['Ciudad'] || row['ciudad'] || row['city'] || '',
                phone: row['Teléfono'] || row['telefono'] || row['phone'] || '',
                is_active: true
            })).filter(item => item.name);
            
            if (itemsToInsert.length > 0) {
                const { error } = await (supabase as any).from('drugstores').insert(itemsToInsert);
                if (error) throw error;
                toast({ title: "Importación Exitosa", description: `Se importaron ${itemsToInsert.length} droguerías.` });
                loadDrugstores();
            }
        } catch (error: any) { 
            console.error('Error:', error); 
            toast({ title: "Error", description: `Hubo un error importando los datos: ${error.message || 'Error desconocido'}`, variant: "destructive" });
        }
    };

    const handleEmptyAll = async () => {
        try {
            setLocalLoading(true);
            const { error } = await (supabase as any)
                .from('drugstores')
                .delete()
                .eq('organization_id', organizationId);
            if (error) throw error;
            toast({ title: "Éxito", description: "Se han eliminado todas las droguerías." });
            loadDrugstores();
        } catch (error: any) {
            toast({ title: "Error", description: `Error al vaciar: ${error.message}`, variant: "destructive" });
        } finally {
            setLocalLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setLocalLoading(true);
            await loadDrugstores();
            toast({ title: "Sincronización Completada", description: "Datos de droguerías actualizados." });
        } catch (error: any) {
            toast({ title: "Error de Sincronización", description: error.message, variant: "destructive" });
        } finally {
            setLocalLoading(false);
        }
    };

    const handleEditDrugstore = (drugstore: any) => {
        setSelectedDrugstore(drugstore);
        setFormData({
            name: drugstore.name || "", 
            rif: drugstore.rif || "", 
            owner_name: drugstore.owner_name || drugstore.contact_name || "",
            sanitary_permits: drugstore.sanitary_permits || false, 
            address: drugstore.address || "",
            city: drugstore.city || drugstore.location || "", 
            phone: drugstore.phone || "", 
            email: drugstore.email || "",
            type: drugstore.type || 'Regional',
            contact_type: "drugstore"
        });
        setIsEditing(true);
        setFormDialogOpen(true);
    };

    const handleDeleteDrugstore = async (id: string) => {
        try {
            const { error } = await (supabase as any).from('drugstores').delete().eq('id', id).eq('organization_id', organizationId);
            if (error) throw error;
            toast({ title: "Registro Eliminado", description: "La droguería ha sido eliminada del directorio operativo." });
            loadDrugstores();
        } catch (error: any) {
            toast({ title: "Error de Sistema", description: error.message, variant: "destructive" });
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
            const { data: visits } = await (supabase as any).from('visits').select('*').eq('contact_id', drugstoreId).order('scheduled_date', { ascending: false });
            setStoreVisits(visits || []);
            const { data: orders } = await (supabase as any).from('transfer_orders').select('*').eq('contact_id', drugstoreId).order('order_date', { ascending: false });
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
            const { data: visit, error } = await (supabase as any).from('visits').insert([{ contact_id: selectedDrugstore.id, user_id: user?.id, organization_id: organizationId, status: 'pending', scheduled_date: new Date().toISOString(), visit_type: 'drugstore', visit_objective: 'Gestión de Cobranza e Inventario' }]).select().single();
            if (error) throw error;
            toast({ title: "Iniciando Visita", description: "Redirigiendo a interfaz de ejecución..." });
            navigate(`/visits/execution/${visit.id}`);
        } catch (error: any) {
            toast({ title: "Error de Sistema", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="flex flex-col min-h-full space-y-10 font-display animate-in fade-in duration-700 text-foreground pb-20">
            <EliteHeader 
                title="Droguerías Alpha"
                subtitle={organizationName || "Gestión de Socios Logísticos Biofarco"}
                icon={FlaskConical}
                badgeText="Red de Suministro"
                statusText={`${drugstores.length} Nodos Activos`}
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => exportToCSV(drugstores, 'droguerias')} className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all">
                            <Download className="mr-3 h-4 w-4 text-primary" /> Exportar Inteligencia
                        </Button>
                        <ImportDialog
                            onImport={handleImport}
                            title="Importar Droguerías"
                            description="Selecciona un archivo para importar droguerías."
                            triggerText="Importar Datos"
                            expectedColumns={[{ key: "Nombre", label: "Nombre", required: true }]}
                        />
                        <Button variant="outline" onClick={handleSync} className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all">
                            <RefreshCw className={cn("mr-3 h-4 w-4 text-primary", localLoading && "animate-spin")} /> Sincronizar
                        </Button>
                        <Button variant="destructive" onClick={() => {
                            if(window.confirm('¿Estás seguro de vaciar todas las droguerías? Esta acción no se puede deshacer.')) {
                                handleEmptyAll();
                            }
                        }} className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner">
                            Vaciar Todo
                        </Button>
                        {canCreate && (
                            <Button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ name: "", rif: "", owner_name: "", sanitary_permits: false, address: "", city: "", phone: "", email: "", type: "Regional", contact_type: "drugstore" });
                                    setFormDialogOpen(true);
                                }}
                                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-premium-md transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Plus className="h-6 w-6" /> Nueva Droguería
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <EliteKPICard title="Total Droguerías" value={drugstores.length} icon={Building2} color="blue" subtitle="Socios en red" />
                <EliteKPICard title="Nacionales" value={drugstores.filter(s => s.type === 'Nacional').length} icon={Star} color="indigo" subtitle="Catálogo global" />
                <EliteKPICard title="Regionales" value={drugstores.filter(s => s.type === 'Regional' || !s.type).length} icon={MapPin} color="emerald" subtitle="Por estado" />
                <EliteKPICard title="Sin Clasificar" value={drugstores.filter(s => !s.type).length} icon={TrendingUp} color="rose" subtitle="Requieren tipo" />
            </div>

            <AdminDataFilter onFilterChange={setAdminFilters} moduleType="contacts" />

            <EliteTable 
                title="Consolidado de Socios Logísticos"
                description="Control maestro de droguerías, geolocalización y performance de suministro."
                searchPlaceholder="LOCALIZAR POR NOMBRE, RIF O CIUDAD..."
                onSearch={setSearchTerm}
            >
                {/* Tab filter Nacional / Regional / Todas */}
                <div className="flex gap-2 px-1 pb-4">
                    {(['Todas', 'Nacional', 'Regional'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTypeFilter(t)}
                            className={cn(
                                "h-9 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all",
                                typeFilter === t
                                    ? t === 'Nacional'
                                        ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-400"
                                        : t === 'Regional'
                                            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                                            : "bg-primary/15 border-primary/50 text-primary"
                                    : "bg-transparent border-border/40 text-muted-foreground hover:border-border"
                            )}
                        >
                            {t}{t !== 'Todas' && ` (${drugstores.filter(d => d.type === t).length})`}
                        </button>
                    ))}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8 pl-8">Droguería Alpha</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">Tipo</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">Geolocalización</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">Identificador Fiscal</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8 text-right pr-8">Auditoría</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <TableRow key={i} className="animate-pulse border-border/40">
                                    <TableCell colSpan={5} className="py-10">
                                        <div className="h-4 bg-muted/20 rounded-full w-full"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredDrugstores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-50">
                                    Sin socios detectados en los cuadrantes de suministro.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDrugstores.map(store => (
                                <TableRow key={store.id} className="border-b border-border/20 hover:bg-muted/5 cursor-pointer group transition-colors" onClick={() => handleViewDetails(store)}>
                                    <TableCell className="py-8 pl-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20 group-hover:scale-105 transition-transform duration-500">
                                                <FlaskConical className="h-7 w-7 text-primary" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <p className="font-black text-base text-foreground uppercase tracking-tighter group-hover:text-primary transition-colors">{store.name}</p>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-[9px] text-muted-foreground font-black uppercase tracking-widest px-2 py-0.5 border-border/40">
                                                        <Phone className="h-3 w-3 mr-2" /> {store.phone || 'N/A'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* Columna: Tipo */}
                                    <TableCell className="py-8">
                                        <Badge className={cn(
                                            "font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full border",
                                            store.type === 'Nacional'
                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        )}>
                                            {store.type === 'Nacional' ? '🌐 Nacional' : '📍 Regional'}
                                        </Badge>
                                    </TableCell>
                                    {/* Columna: Geolocalización */}
                                    <TableCell className="py-8">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                <MapPin className="h-4 w-4 mr-3 text-primary opacity-60" />
                                                <span className="truncate max-w-[200px]">{store.city || 'S/C'}</span>
                                            </div>
                                            <div className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                                <span className="truncate max-w-[200px]">{store.address || 'SIN DIRECCIÓN REGISTRADA'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* Columna: Identificador Fiscal */}
                                    <TableCell className="py-8">
                                        <Badge className="bg-muted/10 text-muted-foreground border-border/40 font-mono text-[10px] font-black py-1.5 px-3 rounded-xl shadow-inner">
                                            {store.rif}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-8 text-right pr-8">
                                        <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                            <DrugstoreInventoryDialog
                                                drugstoreId={store.id}
                                                drugstoreName={store.name}
                                                trigger={
                                                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20 shadow-inner">
                                                        <Package className="h-5 w-5" />
                                                    </Button>
                                                }
                                            />
                                            {canManage(store) && (
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-12 w-12 p-0 rounded-2xl hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border/40 shadow-inner"
                                                            >
                                                                <MoreVertical className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border/40 shadow-premium-lg font-display bg-card p-2">
                                                            <DropdownMenuItem
                                                                className="rounded-xl font-black text-[11px] uppercase tracking-widest cursor-pointer px-4 py-3 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary gap-3"
                                                                onClick={() => handleEditDrugstore(store)}
                                                            >
                                                                <Edit className="h-4 w-4" /> Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="my-1 bg-border/40" />
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-black text-[11px] uppercase tracking-widest cursor-pointer px-4 py-3 text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-500 gap-3"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    <Trash2 className="h-4 w-4" /> Eliminar
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent className="rounded-[3rem] border-border/40 shadow-premium-2xl bg-card font-display p-10">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-3xl font-black text-foreground uppercase tracking-tighter">¿Eliminar Registro?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-70 mt-2">
                                                                ESTA ACCIÓN ELIMINARÁ PERMANENTEMENTE A <strong className="text-primary">{store.name}</strong> DEL DIRECTORIO OPERATIVO.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="mt-10 gap-4">
                                                            <AlertDialogCancel className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/40">Ignorar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteDrugstore(store.id)} className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20">Confirmar Eliminación</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        ))}
                    </TableBody>
                </Table>
            </EliteTable>

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-none shadow-premium-2xl rounded-[3rem] p-0 font-display">
                    <DialogHeader className="p-10 border-b border-border/40 bg-muted/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <DialogTitle className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                <FlaskConical className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase leading-none">{selectedDrugstore?.name}</h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-70 mt-1">Expediente Comercial</p>
                            </div>
                        </DialogTitle>
                        <DialogDescription className="hidden">
                            Detalles operativos de la droguería seleccionada.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDrugstore && (
                        <div className="p-10 space-y-12">
                            <Tabs defaultValue="overview" className="w-full">
                                <EliteTabsList className="mb-10">
                                    <EliteTabsTrigger value="overview" label="General Alpha" icon={Search} />
                                    <EliteTabsTrigger value="visits" label="Historial Visitas" icon={Calendar} />
                                    <EliteTabsTrigger value="orders" label="Pedidos Activos" icon={Package} />
                                </EliteTabsList>

                            <TabsContent value="overview" className="animate-in slide-in-from-bottom-5 duration-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="bg-muted/10 p-8 rounded-[2rem] border border-border/40 shadow-inner group">
                                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                                <Building className="h-4 w-4" /> Información de Activo
                                            </h3>
                                            <div className="space-y-6">
                                                <div className="flex justify-between border-b border-border/40 pb-4">
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">RIF</span>
                                                    <span className="text-xs font-black text-foreground font-mono">{selectedDrugstore.rif}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/40 pb-4">
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Operador</span>
                                                    <span className="text-xs font-black text-primary uppercase">{selectedDrugstore.owner_name || 'PENDIENTE'}</span>
                                                </div>
                                                <div className="flex justify-between pt-2">
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Estatus Sanitario</span>
                                                    <Badge className={selectedDrugstore.sanitary_permits ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-black text-[9px] uppercase px-4 py-1.5 rounded-full" : "bg-amber-500/10 text-amber-400 border-amber-500/30 font-black text-[9px] uppercase px-4 py-1.5 rounded-full"}>
                                                        {selectedDrugstore.sanitary_permits ? "VERIFICADO" : "EN REVISIÓN"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-muted/10 p-8 rounded-[2rem] border border-border/40 shadow-inner">
                                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                <MapPin className="h-4 w-4" /> Nodo Logístico
                                            </h3>
                                            <p className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{selectedDrugstore.city || 'SIN ZONA'}</p>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-4 leading-relaxed opacity-70">{selectedDrugstore.address || 'DIRECCIÓN NO REGISTRADA'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-primary rounded-[2.5rem] p-10 shadow-premium-2xl shadow-primary/20 flex flex-col justify-between group overflow-hidden relative border-8 border-background text-white">
                                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                            <Navigation className="h-40 w-40 text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-6">Gestión de<br />Seguimiento</h3>
                                            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-10 opacity-80">Iniciar visita para gestión de cobranza y auditoría de inventario.</p>
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <Button onClick={handleRegisterVisit} className="w-full bg-white text-primary shadow-xl font-black uppercase tracking-[0.2em] text-[10px] h-16 rounded-[1.5rem] transition-all hover:bg-muted active:scale-95 flex items-center justify-center">
                                                <Navigation className="mr-3 h-5 w-5" /> Iniciar Visita
                                            </Button>
                                            {canManage(selectedDrugstore) && (
                                                <Button variant="ghost" className="w-full border border-white/30 text-white hover:bg-white/10 h-16 rounded-[1.5rem] uppercase font-black tracking-[0.2em] text-[10px] shadow-sm flex items-center justify-center" onClick={() => handleEditDrugstore(selectedDrugstore)}>
                                                    <Edit className="mr-3 h-4 w-4" /> Editar Registro
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="visits" className="animate-in slide-in-from-right-5 duration-700">
                                <ScrollArea className="h-[500px] pr-6">
                                    {historyLoading ? (
                                        <div className="flex justify-center p-20"><RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
                                    ) : storeVisits.length === 0 ? (
                                        <div className="text-center py-32 bg-muted/5 rounded-[3rem] border border-border/40 border-dashed">
                                            <Calendar className="h-20 w-20 mx-auto mb-8 opacity-10 text-primary" />
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px]">Sin misiones registradas en el cuadrante</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {storeVisits.map(v => (
                                                <div key={v.id} className="p-8 bg-card border border-border/40 rounded-[2rem] flex justify-between items-center hover:bg-muted/5 transition-all group shadow-premium-sm">
                                                    <div className="flex items-center gap-8">
                                                        <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center border border-border/40 shadow-inner">
                                                            <Calendar className="h-6 w-6 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="font-black text-foreground uppercase tracking-tighter text-xl">{new Date(v.scheduled_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</p>
                                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">{v.visit_objective || 'GESTIÓN DE CANAL'}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(
                                                        "font-black text-[9px] uppercase tracking-widest px-5 py-2 rounded-full border shadow-sm",
                                                        v.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-muted/10 text-muted-foreground border-border/40"
                                                    )}>
                                                        {v.status === 'completed' ? 'VISITA COMPLETADA' : 'PLANIFICADA / PENDIENTE'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="orders" className="animate-in slide-in-from-right-5 duration-700">
                                <ScrollArea className="h-[500px] pr-6">
                                    {historyLoading ? (
                                        <div className="flex justify-center p-20"><RefreshCw className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
                                    ) : storeOrders.length === 0 ? (
                                        <div className="text-center py-32 bg-muted/5 rounded-[3rem] border border-border/40 border-dashed">
                                            <Package className="h-20 w-20 mx-auto mb-8 opacity-10 text-primary" />
                                            <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px]">Sin transferencias en el registro de red</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {storeOrders.map(o => (
                                                <div key={o.id} className="p-10 bg-card border border-border/40 rounded-[2.5rem] flex justify-between items-center hover:bg-muted/5 transition-all group shadow-premium-sm">
                                                    <div className="flex items-center gap-10">
                                                        <div className="w-20 h-20 bg-muted/20 rounded-[2rem] flex items-center justify-center border border-border/40 shadow-inner">
                                                            <Package className="h-10 w-10 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Orden de Transferencia</span>
                                                            <span className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">#{o.order_number}</span>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5 px-3 py-1">
                                                                    {new Date(o.order_date).toLocaleDateString()}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-3">
                                                        <p className="text-5xl font-black text-foreground tracking-tighter tabular-nums leading-none">${o.total?.toFixed(2)}</p>
                                                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-5 py-1.5 rounded-full shadow-sm">{o.status.toUpperCase()}</Badge>
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
                canManageNacional={canManageNacional}
            />
        </div>
    );
}
