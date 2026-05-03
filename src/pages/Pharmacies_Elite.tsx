/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Store,
    Plus,
    Search,
    Download,
    Upload,
    Clock,
    Package,
    AlertCircle,
    MapPin,
    Phone,
    Building2,
    Calendar,
    Send,
    ClipboardList,
    Edit,
    PlusCircle,
    Eye,
    Trash2,
    Mail,
    Building,
    FileText,
    History,
    RefreshCw,
    Clipboard
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { exportToCSV } from "@/utils/exportUtils";
import { PharmacyFormDialog } from "@/components/pharma/PharmacyFormDialog";
import { PharmacyInventoryDialog } from "@/components/pharma/PharmacyInventoryDialog";
import { EliteTabsList, EliteTabsTrigger, EliteKPICard, EliteHeader } from "@/components/layout/DesignSystem";

export default function PharmaciesElite() {
    const { user, organizationId } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [drugstores, setDrugstores] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("pharmacies");
    const [adminFilters, setAdminFilters] = useState<any>({});

    // Dialog States
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewPharmacyDialogOpen, setViewPharmacyDialogOpen] = useState(false);
    const [selectedPharmacyView, setSelectedPharmacyView] = useState<any>(null);
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

    const loadAllData = async () => {
        try {
            setLoading(true);
            
            // Build query with filters - Mapeo de ADN Elite
            let query = supabase.from('contacts').select('*').eq('contact_type', 'pharmacy');
            
            // Filtros de Territorio Industrial
            if (adminFilters.region && adminFilters.region !== 'all') query = query.eq('region', adminFilters.region);
            if (adminFilters.state && adminFilters.state !== 'all') query = query.eq('state', adminFilters.state);
            if (adminFilters.zoneId && adminFilters.zoneId !== 'all') query = query.eq('zone_id', adminFilters.zoneId);
            if (adminFilters.userId && adminFilters.userId !== 'all') query = query.eq('user_id', adminFilters.userId);
            
            const { data: pharmaData, error: pharmaError } = await query;
            if (pharmaError) throw pharmaError;
            setPharmacies(pharmaData || []);

            const { data: drugData, error: drugError } = await supabase.from('contacts').select('*').eq('contact_type', 'drugstore');
            if (drugError) throw drugError;
            setDrugstores(drugData || []);

            const { data: transData, error: transError } = await supabase
                .from('transfer_orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (transError) throw transError;
            setTransfers(transData || []);

            const { data: prodData, error: prodError } = await supabase.from('products').select('*');
            if (prodError) throw prodError;
            setProducts(prodData || []);

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
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
        <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700">
            {/* Header Elite Industrial */}
            <EliteHeader 
                title="Farmacias"
                subtitle="Directorio de farmacias y control de transferencias"
                icon={Store}
                badgeText="Farmacias"
                statusText="Monitor de actividad activo"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => exportToCSV(pharmacies, 'farmacias')} className="h-12 px-6 rounded-xl border-slate-200 bg-card text-foreground font-bold text-xs hover:bg-slate-50 transition-all shadow-sm">
                            <Download className="mr-2 h-4 w-4 text-primary" /> Exportar
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
                            className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md font-bold text-xs transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" /> Nueva Farmacia
                        </Button>
                    </div>
                }
            />

            {/* KPI Section Elite */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard title="Total farmacias" value={stats.totalPharmacies} icon={Store} color="blue" />
                <EliteKPICard title="Visitas pendientes" value={stats.pendingVisits} icon={Clock} color="amber" />
                <EliteKPICard title="Pedidos activos" value={stats.activeOrders} icon={Package} color="emerald" />
                <EliteKPICard title="Reportes pendientes" value={stats.pendingReports} icon={AlertCircle} color="rose" />
            </div>

            {/* Admin Data Filter - Control de Territorio */}
            <AdminDataFilter
                onFilterChange={(filters) => setAdminFilters(filters)}
                moduleType="pharmacies"
            />

            {/* Tabs System Elite */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <EliteTabsList className="mb-10">
                    <EliteTabsTrigger 
                        value="pharmacies" 
                        label="Directorio"
                        icon={Store}
                    />
                    <EliteTabsTrigger 
                        value="transfers" 
                        label="Transferencias"
                        icon={Send}
                    />
                </EliteTabsList>

                <TabsContent value="pharmacies" className="animate-in slide-in-from-bottom-5 duration-700">
                    {/* SEARCH AREA PREMIUM */}
                    <div className="mb-10">
                        <Card className="bg-card border border-slate-100 rounded-2xl shadow-sm p-4 flex-1 flex flex-col md:flex-row gap-4 relative overflow-hidden group/search">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover/search:opacity-100 transition-opacity" />
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within/search:text-primary transition-colors" />
                                <Input
                                    placeholder="Buscar por nombre o RIF..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-14 h-12 bg-slate-50 border-none focus-visible:ring-primary/20 font-semibold rounded-xl text-slate-900 placeholder:text-slate-400 transition-all text-xs shadow-inner"
                                />
                            </div>
                        </Card>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-muted-foreground">Cargando farmacias...</div>
                    ) : filteredPharmacies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-[4rem] border border-dashed border-border/40">
                            <Store className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-2 font-display">Sin Activos Registrados</h3>
                            <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Inicie el despliegue dando de alta una nueva farmacia</p>
                        </div>
                    ) : (
                        <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-premium-sm overflow-hidden p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Farmacia</TableHead>
                                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Ubicación</TableHead>
                                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Contacto</TableHead>
                                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Última Visita</TableHead>
                                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6 text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPharmacies.map(pharma => (
                                            <TableRow key={pharma.id} className="border-b border-border/20 hover:bg-muted/50 cursor-pointer group transition-colors" onClick={() => { setSelectedPharmacyView(pharma); setViewPharmacyDialogOpen(true); }}>
                                                <TableCell className="py-4 align-top">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shadow-inner border border-primary/10">
                                                            <Store className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">{pharma.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">RIF: {pharma.rif || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 align-top">
                                                    <div className="flex items-center text-xs text-muted-foreground font-bold uppercase tracking-wide">
                                                        <MapPin className="h-3.5 w-3.5 mr-2 text-primary opacity-60" />
                                                        <span className="truncate max-w-[200px]">{pharma.address || pharma.city || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 align-top">
                                                    <div className="flex items-center text-xs text-muted-foreground font-bold uppercase tracking-wide">
                                                        <Phone className="h-3.5 w-3.5 mr-2 text-primary opacity-60" />
                                                        {pharma.phone || 'SIN CONTACTO'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 align-top">
                                                    <span className={cn("text-xs font-bold", pharma.last_visit ? "text-emerald-500" : "text-slate-400")}>
                                                        {pharma.last_visit ? new Date(pharma.last_visit).toLocaleDateString() : 'Pendiente'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 align-top text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/agenda?pharmacyId=${pharma.id}`); }} className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary border-primary/20 hover:bg-primary hover:text-white">
                                                            <Calendar className="h-4 w-4 mr-2" /> Agendar
                                                        </Button>
                                                        <PharmacyInventoryDialog pharmacyId={pharma.id} pharmacyName={pharma.name} trigger={
                                                            <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()} className="h-10 w-10 p-0 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                                                                <Package className="h-4 w-4" />
                                                            </Button>
                                                        } />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="transfers" className="animate-in slide-in-from-bottom-5 duration-700">
                    <Card className="bg-card border border-slate-100 rounded-2xl shadow-sm p-8">
                         <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground tracking-tight leading-none">Transferencias</h2>
                                <p className="text-slate-400 font-medium text-xs mt-1">Historial de movimientos de inventario</p>
                            </div>
                            <Button className="h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95">
                                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Orden
                            </Button>
                         </div>
                         
                         <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="pl-8 h-14 font-bold text-[11px] uppercase tracking-wider text-slate-400">ID Orden</TableHead>
                                        <TableHead className="h-14 font-bold text-[11px] uppercase tracking-wider text-slate-400">Farmacia</TableHead>
                                        <TableHead className="h-14 font-bold text-[11px] uppercase tracking-wider text-slate-400">Droguería</TableHead>
                                        <TableHead className="h-14 font-bold text-[11px] uppercase tracking-wider text-slate-400">Fecha</TableHead>
                                        <TableHead className="h-14 font-bold text-[11px] uppercase tracking-wider text-slate-400">Monto (USD)</TableHead>
                                        <TableHead className="h-14 font-bold text-[11px] uppercase tracking-wider text-slate-400">Estado</TableHead>
                                        <TableHead className="pr-8 h-14 text-right font-bold text-[11px] uppercase tracking-wider text-slate-400">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transfers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-60 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] ">Sin órdenes en el registro operativo</TableCell>
                                        </TableRow>
                                    ) : (
                                        transfers.map(order => (
                                            <TableRow key={order.id} className="border-slate-50 hover:bg-primary/5 transition-all group">
                                                 <TableCell className="pl-8 font-mono text-primary font-bold text-xs">#{order.order_number}</TableCell>
                                                <TableCell className="text-foreground font-bold text-xs tracking-tight">{order.pharmacy_name}</TableCell>
                                                <TableCell className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{order.drugstore_name || 'Central'}</TableCell>
                                                <TableCell className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-foreground font-bold text-sm tracking-tight">${order.total?.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("text-[9px] font-bold uppercase px-3 py-0.5 rounded-full border-none", order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-8 text-right">
                                                    <Button variant="ghost" className="h-9 w-9 bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-all">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                         </div>
                    </Card>
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
                            ? await supabase.from('contacts').update(formData).eq('id', editingPharmacyId)
                            : await supabase.from('contacts').insert([{ ...formData, contact_type: 'pharmacy', organization_id: organizationId }]);
                        
                        if (error) throw error;
                        
                        toast({ title: "Éxito", description: editingPharmacyId ? "Farmacia actualizada" : "Farmacia registrada" });
                        setDialogOpen(false);
                        loadAllData();
                    } catch (error: any) {
                        toast({ title: "Error", description: error.message, variant: "destructive" });
                    }
                }}
                isEditing={!!editingPharmacyId} 
            />
        </div>
    );
}
