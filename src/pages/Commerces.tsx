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
  ClipboardCheck, Pencil, Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
            if (isEditing && selectedCommerce) {
                await (supabase as any).from('commerces').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', selectedCommerce.id);
            } else {
                await (supabase as any).from('commerces').insert({ ...formData, user_id: user?.id, organization_id: organizationId });
            }
            setFormDialogOpen(false); loadCommerces();
            toast({ title: "Misión Cumplida", description: "Canal Comercio sincronizado." });
        } catch (error) { console.error('Error:', error); }
    };

    const handleEdit = (commerce: any) => {
        setSelectedCommerce(commerce); setIsEditing(true);
        setFormData({ ...commerce }); setFormDialogOpen(true);
    };

    return (
        <div className="space-y-10 font-display animate-in fade-in duration-700">
            {/* Header Elite Industrial */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase  tracking-tighter flex items-center gap-4 font-display">
                        <div className="w-16 h-16 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-soft">
                            <Store className="h-8 w-8 text-emerald-600 animate-pulse" />
                        </div>
                        Canal Comercio de Élite
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 ml-20 ">Gestión de Puntos de Venta Masivos y Retail Estratégico</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => exportToCSV(commerces, 'canal_comercio')} className="bg-white border-slate-100 text-slate-900 rounded-2xl h-14 px-8 font-black uppercase  text-xs hover:bg-slate-50 transition-all duration-300 shadow-soft">
                        <Download className="h-4 w-4 mr-3 text-primary" /> EXPORTAR
                    </Button>
                    <Button variant="outline" className="bg-white border-slate-100 text-slate-900 rounded-2xl h-14 px-8 font-black uppercase  text-xs hover:bg-slate-50 transition-all duration-300 shadow-soft">
                        <Upload className="h-4 w-4 mr-3 text-primary" /> IMPORTAR
                    </Button>
                    <Button onClick={() => { setIsEditing(false); setFormDialogOpen(true); }} className="bg-primary text-white rounded-2xl h-14 px-10 font-black uppercase  text-xs hover:bg-primary/90 shadow-premium-md transition-all duration-300 hover:scale-105 active:scale-95">
                        <Plus className="h-6 w-6 mr-3" /> ALTA COMERCIAL
                    </Button>
                </div>
            </div>

            <AdminDataFilter onFilterChange={(f) => setAdminFilters(f)} moduleType="contacts" />

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
                {[
                    { label: "Puntos de Venta", value: commerces.length, color: "text-emerald-600" },
                    { label: "Prioridad Élite", value: commerces.filter(c => c.priority === 'high').length, color: "text-amber-500" },
                    { label: "Cobertura Canal", value: "94%", color: "text-primary" },
                    { label: "Visitas Hoy", value: "12", color: "text-rose-500" }
                ].map((kpi, i) => (
                    <Card key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-premium-md border-l-4 border-l-primary relative overflow-hidden group hover:bg-slate-50 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ">{kpi.label}</p>
                        <div className={cn("text-5xl font-black  tracking-tighter leading-none tabular-nums", kpi.color)}>{kpi.value}</div>
                    </Card>
                ))}
            </div>

            <div className="relative group max-w-2xl mt-10">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input placeholder="LOCALIZAR PUNTO DE VENTA O RIF..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-16 h-16 bg-slate-50 border-none rounded-[1.5rem] text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary shadow-inner font-black uppercase tracking-widest transition-all" />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-72 bg-slate-50 rounded-[3rem] animate-pulse border border-slate-100 shadow-soft" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {commerces.map((commerce) => (
                        <Card key={commerce.id} className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden hover:border-primary/30 transition-all duration-500 group relative shadow-premium-md hover:shadow-premium-lg">
                            <CardHeader className="p-10 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <CardTitle className="text-2xl font-black text-slate-900 uppercase  tracking-tighter group-hover:text-primary transition-colors leading-none font-display">{commerce.name}</CardTitle>
                                        <Badge className="bg-slate-50 text-slate-400 border-none font-bold text-[9px] uppercase tracking-widest ">{commerce.rif || 'RIF PENDIENTE'}</Badge>
                                    </div>
                                    <Badge className={cn("px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em]  border-none shadow-glow transition-all", commerce.priority === 'high' ? "bg-amber-500/10 text-amber-500 shadow-amber-500/10" : "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/10")}>
                                        {commerce.priority === 'high' ? 'ÉLITE' : 'ESTÁNDAR'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 pt-4 space-y-6">
                                <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-tight ">
                                    <MapPin className="mr-4 h-5 w-5 text-primary opacity-60" /> {commerce.address || commerce.city || 'UBICACIÓN COMERCIAL S.P.'}
                                </div>
                                <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-tight ">
                                    <Phone className="mr-4 h-5 w-5 text-primary opacity-60" /> {commerce.phone || 'COMUNICACIÓN S.P.'}
                                </div>
                                <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-tight ">
                                    <ClipboardCheck className="mr-4 h-5 w-5 text-primary opacity-60" /> ÚLTIMA VISITA: {commerce.last_visit || 'HOJA EN BLANCO'}
                                </div>
                            </CardContent>
                            <CardFooter className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
                                <Button variant="ghost" onClick={() => navigate(`/visits/execution/new?contactId=${commerce.id}`)} className="flex-1 bg-white border border-slate-100 rounded-2xl h-12 text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all shadow-soft">NUEVA VISITA</Button>
                                <Button onClick={() => handleEdit(commerce)} variant="ghost" className="bg-white border border-slate-100 rounded-2xl h-12 px-4 hover:bg-primary/10 hover:text-primary text-slate-400 shadow-soft"><Pencil className="h-4 w-4" /></Button>
                            </CardFooter>
                        </Card>
                    ))}
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

            {/* Industrial Bottom Label */}
            <div className="flex items-center justify-between text-slate-400 pt-10 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] ">Directiva de Seguridad de Canal César Ascanio CA</span>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest">v6.2.0 • SINKRONIZACIÓN ACTIVA</p>
            </div>
        </div>
    );
}
