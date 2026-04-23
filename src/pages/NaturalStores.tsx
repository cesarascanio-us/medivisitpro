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
    Eye,
    Trash2,
    Calendar,
    Navigation,
    Activity,
    ShieldCheck,
    Star,
    ArrowUpRight,
    Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { exportToCSV } from "@/utils/exportUtils";
import { NaturalStoreFormDialog } from "@/components/pharma/NaturalStoreFormDialog";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useNavigate } from "react-router-dom";

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
    const { user, organizationId } = useAuth();
    const navigate = useNavigate();

    // Dialog States
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(null);
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
            toast({ title: "Campos Requeridos", description: "Nombre y RIF son obligatorios.", variant: "destructive" });
            return;
        }

        try {
            if (isEditing && selectedStore) {
                const { error } = await supabase.from('natural_stores').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', selectedStore.id);
                if (error) throw error;
                toast({ title: "Éxito", description: "Tienda actualizada correctamente." });
            } else {
                const { error } = await supabase.from('natural_stores').insert({ ...formData, user_id: user?.id, organization_id: organizationId });
                if (error) throw error;
                toast({ title: "Éxito", description: "Alta de Canal completada." });
            }
            setFormDialogOpen(false);
            loadNaturalStores();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 p-10 font-outfit transition-colors duration-500 overflow-y-auto">
            {/* Header Industrial Elite */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 mb-10 animate-in fade-in slide-in-from-top duration-1000">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl">
                        <Sprout className="h-8 w-8 text-indigo-500 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase  tracking-tighter leading-tight">Canal Naturista de Élite</h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 ">Gestión de Establecimientos y Tiendas Naturistas Estratégicas</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => exportToCSV(naturalStores, 'tiendas_naturistas')} className="h-14 px-8 border-border/40 bg-card text-foreground rounded-2xl font-black text-xs uppercase  tracking-widest hover:bg-slate-50 transition-all duration-300">
                        <Download className="mr-3 h-4 w-4" /> Exportar
                    </Button>
                    <Button variant="outline" className="h-14 px-8 border-border/40 bg-card text-foreground rounded-2xl font-black text-xs uppercase  tracking-widest hover:bg-slate-50 transition-all duration-300">
                        <Upload className="mr-3 h-4 w-4" /> Importar
                    </Button>
                    <Button
                        onClick={() => {
                            setIsEditing(false);
                            setFormData({ name: "", rif: "", owner_name: "", sanitary_permits: false, address: "", city: "", phone: "", email: "", contact_type: "natural_store" });
                            setFormDialogOpen(true);
                        }}
                        className="bg-card text-slate-900 shadow-2xl font-black uppercase tracking-widest  text-xs h-14 px-10 rounded-2xl transition-all hover:bg-slate-100 hover:scale-105"
                    >
                        <Plus className="h-6 w-6 mr-3" /> Alta Comercial
                    </Button>
                </div>
            </div>

            <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="contacts" />

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 mb-10 overflow-visible">
                {[
                    { label: "Establecimientos", value: naturalStores.length, icon: Building, color: "text-indigo-400" },
                    { label: "Potencial Alto", value: naturalStores.filter(s => s.priority === 'high').length, icon: Star, color: "text-amber-500" },
                    { label: "Visitas Mes", value: naturalStores.filter(s => s.lastVisit && new Date(s.lastVisit).getMonth() === new Date().getMonth()).length, icon: Calendar, color: "text-emerald-400" },
                    { label: "Cobertura", value: "88%", icon: Activity, color: "text-blue-500" }
                ].map((kpi, i) => (
                    <Card key={i} className="bg-card backdrop-blur-xl border border-border/40 shadow-premium-sm rounded-[2rem] p-8 hover:bg-card/90 transition-all duration-500 group overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-foreground">
                            <kpi.icon className="h-20 w-20" />
                        </div>
                        <div className={`text-5xl font-black ${kpi.color} mb-2 tabular-nums  tracking-tighter leading-none`}>{kpi.value}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 ">
                           <kpi.icon className="h-3 w-3" /> {kpi.label}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Area: Search + Tablet */}
            <div className="flex-1 min-h-0 flex flex-col gap-6">
                <Card className="bg-card border border-border/40 rounded-[1.5rem] shadow-soft p-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Busca por nombre, RIF o ciudad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 bg-muted/10 border-transparent focus-visible:ring-indigo-500 font-bold rounded-2xl text-foreground transition-all focus:bg-card shadow-inner"
                        />
                    </div>
                </Card>

                <Card className="flex-1 min-h-0 bg-card border border-border/40 rounded-[2rem] shadow-soft overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 font-outfit">
                        <Table>
                            <TableHeader className="bg-muted/5 sticky top-0 z-10 backdrop-blur-sm">
                                <TableRow className="hover:bg-transparent border-border/40">
                                    <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Punto de Venta</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localidad</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identificación</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estatus</TableHead>
                                    <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse border-border"><TableCell colSpan={5} className="h-16 bg-muted/10" /></TableRow>
                                    ))
                                ) : naturalStores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-[300px] text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Sprout className="h-20 w-20 text-indigo-400" />
                                                <p className="font-bold text-muted-foreground">No se encontraron tiendas en el canal.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    naturalStores.map(store => (
                                        <TableRow key={store.id} className="hover:bg-indigo-500/10 transition-all border-border group">
                                            <TableCell className="pl-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight ">{store.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-2 mt-1">
                                                       <Phone className="h-3 w-3 text-indigo-300" /> {store.phone || 'S/N Registrado'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <p className="text-xs font-black text-muted-foreground uppercase mb-0.5">{store.city || 'N/A'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px]">{store.address}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="px-3 py-1 bg-muted/20 rounded-lg text-[10px] font-mono font-bold text-muted-foreground/60 inline-block">
                                                    {store.rif}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={store.priority === 'high' ? "bg-amber-500/10 text-amber-500 border-none font-black text-[9px] uppercase tracking-widest px-3" : "bg-indigo-500/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-widest px-3"}>
                                                    {store.priority === 'high' ? "Alta Prioridad" : "Activa"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => navigate(`/visits/execution/new?contactId=${store.id}`)} className="h-10 w-10 p-0 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-md hover:shadow-indigo-500/30">
                                                        <Navigation className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 p-0 hover:bg-foreground hover:text-background rounded-xl transition-all">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </Card>
            </div>

            {/* Float Label: Industrial Standard */}
            <div className="mt-6 flex items-center justify-between text-muted-foreground px-2">
                <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="h-3.5 w-3.5" /> Directiva de Auditoría Médica César Ascanio CA
                </p>
                <div className="flex gap-4">
                    <span className="text-[9px] font-bold">V 6.0.0</span>
                    <span className="text-[9px] font-bold">SINK OK</span>
                </div>
            </div>

            {/* Form Dialog */}
            <NaturalStoreFormDialog
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
