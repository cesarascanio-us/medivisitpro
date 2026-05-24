/* ========================================================================
 MASTER FRAMEWORK - CESAR ASCANIO CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useMemo } from "react";
import {
    Plus,
    Search,
    Sprout,
    Download,
    Building,
    Phone,
    Edit,
    Trash2,
    Calendar,
    Navigation,
    Activity,
    ShieldCheck,
    Star,
    Upload,
    MapPin,
    Building2,
    Mail
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { exportToCSV } from "@/utils/exportUtils";
import { NaturalStoreFormDialog } from "@/components/pharma/NaturalStoreFormDialog";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useNavigate } from "react-router-dom";
import { EliteHeader, EliteKPICard, EliteTable } from "@/components/layout/DesignSystem";
import { cn } from "@/lib/utils";

export default function NaturalStores() {
    const [adminFilters, setAdminFilters] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState("");
    const contactOptions = useMemo(() => ({
        searchTerm,
        typeFilter: 'natural_store' as const,
        adminFilters: adminFilters
    }), [searchTerm, adminFilters]);

    const { contacts: naturalStores, loading, refresh: loadNaturalStores } = useContacts(contactOptions);

    const { toast } = useToast();
    const { user, organizationId, organizationName } = useAuth();
    const navigate = useNavigate();

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "", rif: "", owner_name: "", sanitary_permits: false, address: "", city: "", phone: "", email: "", contact_type: "natural_store"
    });

    const handleFormSubmit = async () => {
        if (!formData.name || !formData.rif) {
            toast({ title: "Validación Fallida", description: "Nombre y RIF son parámetros obligatorios.", variant: "destructive" });
            return;
        }

        try {
            const { contact_type, ...dbPayload } = formData;
            if (isEditing && selectedStore) {
                const { error } = await supabase.from('natural_stores').update({ ...dbPayload, updated_at: new Date().toISOString() }).eq('id', selectedStore.id);
                if (error) throw error;
                toast({ title: "Sincronización Exitosa", description: "Establecimiento actualizado en red." });
            } else {
                const { error } = await supabase.from('natural_stores').insert({ ...dbPayload, user_id: user?.id, organization_id: organizationId });
                if (error) throw error;
                toast({ title: "Alta Completada", description: "Nuevo activo registrado en el Canal Naturista." });
            }
            setFormDialogOpen(false);
            loadNaturalStores();
        } catch (error: any) {
            toast({ title: "Error de Sistema", description: error.message, variant: "destructive" });
        }
    };

    const handleEdit = (store: any) => {
        setSelectedStore(store);
        setFormData({
            name: store.name || "", rif: store.rif || "", owner_name: store.owner_name || "",
            sanitary_permits: store.sanitary_permits || false, address: store.address || "",
            city: store.city || "", phone: store.phone || "", email: store.email || "",
            contact_type: "natural_store"
        });
        setIsEditing(true);
        setFormDialogOpen(true);
    };

    return (
        <div className="flex flex-col min-h-full space-y-10 font-display animate-in fade-in duration-700 text-foreground pb-20">
            <EliteHeader 
                title="Canal Naturista Alpha"
                subtitle={organizationName || "Gestión de Establecimientos Estratégicos"}
                icon={Sprout}
                badgeText="Red Botánica"
                statusText={`${naturalStores.length} Nodos en Red`}
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => exportToCSV(naturalStores, 'tiendas_naturistas')} className="bg-muted/10 border-border/40 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-inner hover:bg-muted/20 transition-all">
                            <Download className="mr-3 h-4 w-4 text-primary" /> Exportar Inteligencia
                        </Button>
                        <Button
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({ name: "", rif: "", owner_name: "", sanitary_permits: false, address: "", city: "", phone: "", email: "", contact_type: "natural_store" });
                                setFormDialogOpen(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-premium-md transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Plus className="h-6 w-6" /> Alta Comercial
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <EliteKPICard title="Total Tiendas" value={naturalStores.length} icon={Building2} color="indigo" subtitle="Establecimientos" />
                <EliteKPICard title="Potencial Alto" value={naturalStores.filter(s => s.priority === 'high').length} icon={Star} color="rose" subtitle="Segmento Elite" />
                <EliteKPICard title="Visitas Mes" value={naturalStores.filter(s => s.lastVisit && new Date(s.lastVisit).getMonth() === new Date().getMonth()).length} icon={Calendar} color="emerald" subtitle="Cobertura Activa" />
                <EliteKPICard title="Salud de Canal" value="88%" icon={Activity} color="blue" subtitle="Performance Media" />
            </div>

            <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="contacts" />

            <EliteTable 
                title="Directorio de Establecimientos Naturistas"
                description="Control maestro de tiendas, parafarmacias y centros de bienestar."
                searchPlaceholder="LOCALIZAR POR NOMBRE, RIF O CIUDAD..."
                onSearch={setSearchTerm}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8 pl-8">Establecimiento Alpha</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">Ubicación / Nodo</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">ID Fiscal</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8">Estatus Operativo</TableHead>
                            <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-8 text-right pr-8">Operaciones</TableHead>
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
                        ) : naturalStores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-50">
                                    Sin activos detectados en el canal botánico.
                                </TableCell>
                            </TableRow>
                        ) : (
                            naturalStores.map(store => (
                                <TableRow key={store.id} className="border-b border-border/20 hover:bg-muted/5 cursor-pointer group transition-colors">
                                    <TableCell className="py-8 pl-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner border border-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
                                                <Sprout className="h-7 w-7 text-indigo-500" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <p className="font-black text-base text-foreground uppercase tracking-tighter group-hover:text-indigo-500 transition-colors">{store.name}</p>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-[9px] text-muted-foreground font-black uppercase tracking-widest px-2 py-0.5 border-border/40">
                                                        <Phone className="h-3 w-3 mr-2" /> {store.phone || 'S/N'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                <MapPin className="h-4 w-4 mr-3 text-indigo-500 opacity-60" />
                                                <span className="truncate max-w-[200px]">{store.city || 'S/Z'}</span>
                                            </div>
                                            <div className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                                <span className="truncate max-w-[200px]">{store.address || 'SIN DIRECCIÓN'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <Badge className="bg-muted/10 text-muted-foreground border-border/40 font-mono text-[10px] font-black py-1.5 px-3 rounded-xl shadow-inner">
                                            {store.rif}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-8">
                                        <Badge className={cn(
                                            "font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full border",
                                            store.priority === 'high' 
                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                                                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                                        )}>
                                            {store.priority === 'high' ? "ALTA PRIORIDAD" : "NODO ACTIVO"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-8 text-right pr-8">
                                        <div className="flex justify-end gap-3">
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => navigate(`/visits/execution/new?contactId=${store.id}`)} 
                                                className="h-12 w-12 p-0 rounded-2xl hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-500/20 shadow-inner"
                                            >
                                                <Navigation className="h-5 w-5" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleEdit(store)} 
                                                className="h-12 w-12 p-0 rounded-2xl hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-500/20 shadow-inner"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </EliteTable>

            <div className="mt-6 flex items-center justify-between text-muted-foreground px-2 opacity-50">
                <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="h-3.5 w-3.5" /> Directiva de Auditoría Médica César Ascanio CA
                </p>
                <div className="flex gap-4">
                    <span className="text-[9px] font-black uppercase">V 6.0.0 ALPHA</span>
                    <span className="text-[9px] font-black uppercase text-emerald-500">SINK OK</span>
                </div>
            </div>

            <NaturalStoreFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} formData={formData} setFormData={setFormData} onSubmit={handleFormSubmit} isEditing={isEditing} />
        </div>
    );
}
