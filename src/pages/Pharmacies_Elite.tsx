import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Store,
    Plus,
    Search,
    Download,
    Clock,
    Package,
    AlertCircle,
    MapPin,
    Phone,
    Calendar,
    Send,
    Edit,
    PlusCircle,
    Eye,
    Trash2,
    RefreshCw,
    Filter
} from "lucide-react";
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
    Tabs,
    TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { exportToCSV } from "@/utils/exportUtils";
import { PharmacyFormDialog } from "@/components/pharma/PharmacyFormDialog";
import { PharmacyInventoryDialog } from "@/components/pharma/PharmacyInventoryDialog";
import { EliteTabsList, EliteTabsTrigger, EliteKPICard, EliteHeader, EliteTable } from "@/components/layout/DesignSystem";
import { useTheme } from "@/context/ThemeContext";
import { ImportDialog } from "@/components/shared/ImportDialog";

export default function PharmaciesElite() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { organization } = useOrganization();
    const organizationId = organization?.id;
    const organizationName = organization?.name;
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("pharmacies");
    const [adminFilters, setAdminFilters] = useState<any>({});

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPharmacyId, setEditingPharmacyId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({
        name: "",
        rif: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        contact_name: "",
        contact_position: "",
        segmentation: "C",
        potential: "Medio",
        status: "Activo"
    });

    useEffect(() => {
        loadAllData();
    }, [adminFilters]);

    const handleImport = async (data: Record<string, any>[]) => {
        try {
            const itemsToInsert = data.map((row: any) => ({
                user_id: user?.id, 
                organization_id: organizationId,
                name: row['Nombre'] || row['nombre'] || row['Name'] || '',
                rif: row['RIF'] || row['rif'] || '',
                address: row['Dirección'] || row['direccion'] || row['address'] || '',
                city: row['Ciudad'] || row['ciudad'] || row['city'] || '',
                phone: row['Teléfono'] || row['telefono'] || row['phone'] || '',
                potential: 'Medio',
                status: 'Activo'
            })).filter(item => item.name);
            
            if (itemsToInsert.length > 0) {
                const { error } = await supabase.from('pharmacies').insert(itemsToInsert);
                if (error) throw error;
                toast({ title: "Importación Exitosa", description: `Se importaron ${itemsToInsert.length} farmacias.` });
                loadAllData();
            }
        } catch (error: any) { 
            console.error('Error:', error); 
            toast({ title: "Error", description: `Hubo un error importando los datos: ${error.message || 'Error desconocido'}`, variant: "destructive" });
        }
    };

    const handleEmptyAll = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('pharmacies')
                .delete()
                .eq('organization_id', organizationId);
            if (error) throw error;
            toast({ title: "Éxito", description: "Se han eliminado todas las farmacias." });
            loadAllData();
        } catch (error: any) {
            toast({ title: "Error", description: `Error al vaciar: ${error.message}`, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const loadAllData = async () => {
        try {
            setLoading(true);
            let query = supabase.from('pharmacies').select('*');
            
            // Triangulate User IDs based on Region, State, or Zone
            let filteredUserIds: string[] | null = null;
            if ((adminFilters.region && adminFilters.region !== 'all') || 
                (adminFilters.state && adminFilters.state !== 'all') || 
                (adminFilters.zoneId && adminFilters.zoneId !== 'all')) {
                
                let userQuery = supabase.from('user_roles').select('user_id');
                if (adminFilters.region && adminFilters.region !== 'all') userQuery = userQuery.eq('region', adminFilters.region);
                if (adminFilters.state && adminFilters.state !== 'all') userQuery = userQuery.eq('state', adminFilters.state);
                if (adminFilters.zoneId && adminFilters.zoneId !== 'all') userQuery = userQuery.eq('zone_id', adminFilters.zoneId);
                
                const { data: usersData } = await userQuery;
                filteredUserIds = usersData?.map(u => u.user_id) || [];
            }

            if (filteredUserIds !== null) {
                let orConditions = [];
                if (filteredUserIds.length > 0) {
                    orConditions.push(`user_id.in.(${filteredUserIds.join(',')})`);
                }
                
                if (adminFilters.state && adminFilters.state !== 'all') {
                    orConditions.push(`state.eq.${adminFilters.state}`);
                } else if (adminFilters.region && adminFilters.region !== 'all') {
                    const states = getStatesInRegion(adminFilters.region);
                    if (states.length > 0) {
                        orConditions.push(`state.in.(${states.join(',')})`);
                    }
                }
                
                if (orConditions.length > 0) {
                    query = query.or(orConditions.join(','));
                } else {
                    query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // Force empty if no users match
                }
            }

            if (adminFilters.userId && adminFilters.userId !== 'all') {
                query = query.eq('user_id', adminFilters.userId);
            }
            
            const { data: pharmaData, error: pharmaError } = await query;
            if (pharmaError) throw pharmaError;
            setPharmacies(pharmaData || []);

            const { data: transData, error: transError } = await supabase
                .from('transfer_orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (transError) throw transError;
            setTransfers(transData || []);

        } catch (error: any) {
            toast({ title: "Error de Protocolo", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalPharmacies: pharmacies.length,
        pendingVisits: 0,
        activeOrders: transfers.filter(t => t.status === 'pending' || t.status === 'sent').length,
        pendingReports: 0
    };

    const filteredPharmacies = pharmacies.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.rif && p.rif.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col min-h-full space-y-10 font-display animate-in fade-in duration-700 text-foreground pb-20">
            <EliteHeader 
                title={theme?.texts?.pharmacies_title || "Red de Farmacias"}
                subtitle={theme?.texts?.pharmacies_subtitle || organizationName || "Gestión de Activos Biofarco"}
                icon={Store}
                badgeText="Puntos de Venta"
                statusText={`${pharmacies.length} Centros Activos`}
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => exportToCSV(pharmacies, 'farmacias')} className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all">
                            <Download className="mr-3 h-4 w-4 text-primary" /> Exportar Inteligencia
                        </Button>
                        <ImportDialog
                            onImport={handleImport}
                            title="Importar Farmacias"
                            description="Selecciona un archivo para importar farmacias."
                            triggerText="Importar Datos"
                            expectedColumns={[{ key: "Nombre", label: "Nombre", required: true }]}
                        />
                        <Button variant="outline" onClick={async () => {
                            try {
                                setLoading(true);
                                await loadAllData();
                                toast({ title: "Sincronización Completada", description: "Datos de farmacias actualizados." });
                            } catch (e: any) {
                                toast({ title: "Error de Sincronización", description: e.message, variant: "destructive" });
                            } finally {
                                setLoading(false);
                            }
                        }} className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all">
                            <RefreshCw className={cn("mr-3 h-4 w-4 text-primary", loading && "animate-spin")} /> Sincronizar
                        </Button>
                        <Button variant="destructive" onClick={() => {
                            if(window.confirm('¿Estás seguro de vaciar todas las farmacias? Esta acción no se puede deshacer.')) {
                                handleEmptyAll();
                            }
                        }} className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner">
                            Vaciar Todo
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingPharmacyId(null);
                                setFormData({
                                    name: "",
                                    rif: "",
                                    address: "",
                                    city: "",
                                    state: "",
                                    phone: "",
                                    email: "",
                                    contact_name: "",
                                    contact_position: "",
                                    segmentation: "C",
                                    potential: "Medio",
                                    status: "Activo"
                                });
                                setDialogOpen(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-premium-md transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Plus className="h-6 w-6" /> Nueva Farmacia
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <EliteKPICard title="Total Farmacias" value={stats.totalPharmacies} icon={Store} color="blue" subtitle="Activos en red" />
                <EliteKPICard title="Visitas Pendientes" value={stats.pendingVisits} icon={Clock} color="amber" subtitle="Quedan por cubrir" />
                <EliteKPICard title="Pedidos Activos" value={stats.activeOrders} icon={Package} color="emerald" subtitle="En tránsito" />
                <EliteKPICard title="Alertas" value={stats.pendingReports} icon={AlertCircle} color="rose" subtitle="Requieren acción" />
            </div>

            <AdminDataFilter
                onFilterChange={(filters) => setAdminFilters(filters)}
                moduleType="pharmacies"
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <EliteTabsList className="mb-12">
                    <EliteTabsTrigger value="pharmacies" label="Directorio Alpha" icon={Store} />
                    <EliteTabsTrigger value="transfers" label="Transferencias" icon={Send} />
                </EliteTabsList>

                <TabsContent value="pharmacies" className="animate-in slide-in-from-bottom-5 duration-700">
                    <EliteTable 
                        title="Directorio de Puntos de Venta"
                        description="Control maestro de farmacias y segmentación comercial."
                        searchPlaceholder="BUSCAR POR NOMBRE O RIF..."
                        onSearch={setSearchTerm}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/40">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">Activo Comercial</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Geolocalización</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Enlace Directo</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Último Contacto</TableHead>
                                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6 pr-8">Operaciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [1,2,3,4,5].map(i => (
                                        <TableRow key={i} className="animate-pulse border-border/40">
                                            <TableCell colSpan={5} className="h-16 py-8">
                                                <div className="h-4 bg-muted/20 rounded-full w-full"></div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredPharmacies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                                            Sin activos interceptados en este cuadrante.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPharmacies.map(pharma => (
                                        <TableRow key={pharma.id} className="hover:bg-muted/5 transition-colors border-border/40 group">
                                            <TableCell className="pl-8 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20 group-hover:scale-105 transition-transform duration-500">
                                                        <Store className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-black text-foreground uppercase tracking-tighter text-base group-hover:text-primary transition-colors">{pharma.name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase opacity-70">RIF: {pharma.rif || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-8">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4 text-primary opacity-60" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">{pharma.address || pharma.city || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-8">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="h-4 w-4 text-primary opacity-60" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{pharma.phone || 'SIN CONTACTO'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-8">
                                                <Badge className={cn(
                                                    "font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full border",
                                                    pharma.last_visit ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-muted/10 text-muted-foreground border-border/40"
                                                )}>
                                                    {pharma.last_visit ? new Date(pharma.last_visit).toLocaleDateString() : 'SIN REGISTRO'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8 py-8">
                                                <div className="flex justify-end gap-3">
                                                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-primary/10 text-muted-foreground hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-200 shadow-inner"
                                                        onClick={() => {
                                                            setEditingPharmacyId(pharma.id);
                                                            setFormData({
                                                                name: pharma.name || "",
                                                                rif: pharma.rif || "",
                                                                address: pharma.address || "",
                                                                city: pharma.city || "",
                                                                state: pharma.state || "",
                                                                phone: pharma.phone || "",
                                                                email: pharma.email || "",
                                                                contact_name: pharma.contact_name || "",
                                                                contact_position: pharma.contact_position || "",
                                                                segmentation: pharma.segmentation || "C",
                                                                potential: pharma.potential || "Medio",
                                                                status: pharma.status || "Activo"
                                                            });
                                                            setDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-all border border-transparent hover:border-red-200 shadow-inner"
                                                        onClick={async () => {
                                                            if(window.confirm('¿Estás seguro de eliminar esta farmacia?')) {
                                                                const { error } = await supabase.from('pharmacies').delete().eq('id', pharma.id);
                                                                if(!error) {
                                                                    toast({ title: "Farmacia Eliminada" });
                                                                    loadAllData();
                                                                } else {
                                                                    toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={() => navigate(`/agenda?pharmacyId=${pharma.id}`)} 
                                                        className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-border/40 hover:bg-primary/10 hover:text-primary transition-all shadow-inner"
                                                    >
                                                        <Calendar className="h-4 w-4 mr-2" /> Agendar
                                                    </Button>
                                                    <PharmacyInventoryDialog pharmacyId={pharma.id} pharmacyName={pharma.name} trigger={
                                                        <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20 shadow-inner">
                                                            <Package className="h-5 w-5" />
                                                        </Button>
                                                    } />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </EliteTable>
                </TabsContent>

                <TabsContent value="transfers" className="animate-in slide-in-from-bottom-5 duration-700">
                    <EliteTable 
                        title="Registro de Transferencias"
                        description="Control de flujo de inventario hacia puntos de venta."
                        searchPlaceholder="BUSCAR POR ID O FARMACIA..."
                        onSearch={() => {}}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/40">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">ID Protocolo</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Destinatario Alpha</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Canal de Suministro</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Fecha</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Importe (USD)</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Estatus</TableHead>
                                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6 pr-8">Auditoría</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transfers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                                            Sin movimientos en el registro de inteligencia.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transfers.map(order => (
                                        <TableRow key={order.id} className="hover:bg-muted/5 transition-colors border-border/40 group">
                                            <TableCell className="pl-8 py-8 font-black text-primary uppercase text-xs">#{order.order_number}</TableCell>
                                            <TableCell className="font-black text-foreground uppercase tracking-tight text-sm">{order.pharmacy_name}</TableCell>
                                            <TableCell className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{order.drugstore_name || 'CENTRAL'}</TableCell>
                                            <TableCell className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-black text-foreground text-base tracking-tighter">${order.total?.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full border",
                                                    order.status === 'delivered' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                )}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-muted/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20 shadow-inner">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </EliteTable>
                </TabsContent>
            </Tabs>

            <PharmacyFormDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen} 
                formData={formData}
                setFormData={setFormData}
                onSubmit={async () => {
                    try {
                        const { error } = editingPharmacyId 
                            ? await supabase.from('pharmacies').update(formData).eq('id', editingPharmacyId)
                            : await supabase.from('pharmacies').insert([{ ...formData, organization_id: organizationId }]);
                        
                        if (error) throw error;
                        
                        toast({ title: "Sincronización Completada", description: editingPharmacyId ? "Activo actualizado en red." : "Nuevo activo registrado." });
                        setDialogOpen(false);
                        loadAllData();
                    } catch (error: any) {
                        toast({ title: "Fallo de Protocolo", description: error.message, variant: "destructive" });
                    }
                }}
                isEditing={!!editingPharmacyId} 
            />
        </div>
    );
}
