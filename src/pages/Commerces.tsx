/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useMemo } from "react";
import { 
  Plus, Search, Store, Download, Building2, Phone, Edit, 
  ShieldCheck, Star, Navigation, Activity, Calendar, MapPin, 
  ClipboardCheck, Pencil, Upload, Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { exportToCSV } from "@/utils/exportUtils";
import { NaturalStoreFormDialog } from "@/components/pharma/NaturalStoreFormDialog";
import { AdminDataFilter } from "@/components/admin/AdminDataFilter";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EliteKPICard, EliteHeader } from "@/components/layout/DesignSystem";

export default function Commerces() {
    const [adminFilters, setAdminFilters] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState("");
    const contactOptions = useMemo(() => ({
        searchTerm,
        typeFilter: 'commerce' as const,
        adminFilters: adminFilters
    }), [searchTerm, adminFilters]);

    const { contacts: commerces, loading, refresh: loadCommerces } = useContacts(contactOptions);
    const { toast } = useToast();
    const { user, organizationId } = useAuth();
    const navigate = useNavigate();

    // Dialog States
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "", rif: "", owner_name: "", sanitary_permits: false, 
        address: "", city: "", phone: "", email: "", contact_type: "commerce"
    });

    const handleFormSubmit = async () => {
        if (!formData.name || !formData.rif) return;
        try {
            const { contact_type, ...dbPayload } = formData;
            if (isEditing && selectedCommerce) {
                await (supabase as any).from('commerces').update({ ...dbPayload, updated_at: new Date().toISOString() }).eq('id', selectedCommerce.id);
            } else {
                await (supabase as any).from('commerces').insert({ ...dbPayload, user_id: user?.id, organization_id: organizationId });
            }
            setFormDialogOpen(false); loadCommerces();
            toast({ title: "Registro Completado", description: "Canal Comercio sincronizado." });
        } catch (error) { console.error('Error:', error); }
    };

    const handleEdit = (commerce: any) => {
        setSelectedCommerce(commerce); setIsEditing(true);
        setFormData({ ...commerce }); setFormDialogOpen(true);
    };

    return (
        <div className="space-y-10 pb-10 font-display animate-in fade-in duration-700">
            <EliteHeader
                title="Canal Comercio"
                subtitle="Gestión de Puntos de Venta Masivos y Retail"
                icon={Store}
                badgeText="V6.0 ELITE"
                statusText="Canal Comercial Activo"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => exportToCSV(commerces, 'canal_comercio')} className="h-14 px-8 rounded-2xl border-border/40 bg-card text-foreground font-black text-[10px] uppercase tracking-widest shadow-premium-sm hover:shadow-premium-md transition-all">
                            <Download className="h-5 w-5 mr-3 text-primary" /> Exportar
                        </Button>
                        <Button onClick={() => { setIsEditing(false); setFormDialogOpen(true); }} className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-premium-md font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3">
                            <Plus className="h-6 w-6" /> Registro Comercial
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <EliteKPICard title="Puntos de Venta" value={commerces.length} icon={Store} color="emerald" />
                <EliteKPICard title="Prioridad Élite" value={commerces.filter(c => c.priority === 'high').length} icon={Star} color="amber" />
                <EliteKPICard title="Zonas Activas" value={new Set(commerces.map(c => c.city).filter(Boolean)).size} icon={MapPin} color="blue" />
                <EliteKPICard title="Visitados" value={commerces.filter(c => c.last_visit).length} icon={ClipboardCheck} color="rose" />
            </div>

            <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="contacts" />

            <div className="flex flex-col md:flex-row gap-6">
                <Card className="bg-card border border-border/40 rounded-[2.5rem] shadow-premium-sm p-6 flex-1 relative overflow-hidden group/search">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                        <Input placeholder="LOCALIZAR PUNTO DE VENTA O RIF..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-16 h-16 bg-muted/30 border-border focus-visible:ring-primary/20 font-black rounded-2xl text-foreground placeholder:text-muted-foreground/50 transition-all text-xs tracking-widest shadow-inner uppercase" />
                    </div>
                </Card>
            </div>

            {loading ? (
                <div className="py-20 text-center text-muted-foreground">Cargando comercios...</div>
            ) : commerces.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-[4rem] border border-dashed border-border/40">
                    <Store className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-2">Sin Registros</h3>
                    <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Registre un nuevo punto de venta</p>
                </div>
            ) : (
                <div className="bg-card rounded-[2.5rem] border border-border/40 shadow-premium-sm overflow-hidden p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/40 hover:bg-transparent">
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Comercio</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Ubicación</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Contacto</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6">Última Visita</TableHead>
                                    <TableHead className="font-black text-[10px] text-muted-foreground uppercase tracking-widest py-6 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {commerces.map((commerce) => (
                                    <TableRow key={commerce.id} className="border-b border-border/20 hover:bg-muted/50 cursor-pointer group transition-colors">
                                        <TableCell className="py-4 align-top">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shadow-inner border border-emerald-500/20">
                                                    <Store className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{commerce.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{commerce.rif || 'RIF PENDIENTE'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 align-top">
                                            <div className="flex items-center text-xs text-muted-foreground font-bold uppercase tracking-wide">
                                                <MapPin className="h-3.5 w-3.5 mr-2 text-emerald-500 opacity-60" />
                                                <span className="truncate max-w-[200px]">{commerce.address || commerce.city || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 align-top">
                                            <div className="flex items-center text-xs text-muted-foreground font-bold uppercase tracking-wide">
                                                <Phone className="h-3.5 w-3.5 mr-2 text-emerald-500 opacity-60" />
                                                {commerce.phone || 'SIN CONTACTO'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 align-top">
                                            <span className={cn("text-xs font-bold uppercase tracking-wide", commerce.last_visit ? "text-emerald-500" : "text-muted-foreground")}>
                                                {commerce.last_visit || 'PENDIENTE'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 align-top text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/visits/execution/new?contactId=${commerce.id}`)} className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary border-primary/20 hover:bg-primary hover:text-white">
                                                    <Calendar className="h-4 w-4 mr-2" /> Visita
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(commerce)} className="h-10 w-10 p-0 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

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
