/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import { Plus, Search, Stethoscope, Trash2, Edit } from "lucide-react";
import { SpecialtyDialog } from "@/components/specialties/SpecialtyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTexts } from "@/hooks/useTexts";
import { EliteHeader, EliteKPICard, EliteCard, EliteButton, EliteInput, EliteTable, EliteTabsList, EliteTabsTrigger } from '@/components/layout/DesignSystem';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Specialties() {
    const t = useTexts();
    const { toast } = useToast();
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState<any>(null);

    useEffect(() => {
        loadSpecialties();
    }, []);

    const loadSpecialties = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("specialties")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            setSpecialties(data || []);
        } catch (error: any) {
            console.error("Error loading specialties:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las especialidades.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (specialty: any) => {
        setEditingSpecialty(specialty);
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("specialties")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({
                title: "Especialidad eliminada",
                description: "La especialidad ha sido eliminada correctamente.",
            });
            // Optimistic update
            setSpecialties(prev => prev.filter(s => s.id !== id));
            // Only reload if needed, but the optimistic update handles the UI immediately
            // loadSpecialties();
        } catch (error: any) {
            console.error("Error deleting specialty:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar la especialidad (puede estar en uso).",
                variant: "destructive",
            });
        }
    };

    const filteredSpecialties = specialties.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-background p-8 font-sans transition-colors duration-500 overflow-y-auto">
            
            {/* HEADER INDUSTRIAL ELITE */}
            <EliteHeader
                title={t.specialties_title || "Especialidades"}
                subtitle={t.specialties_subtitle || "Gestiona las especialidades médicas"}
                icon={Stethoscope}
                badgeText="Catálogo Médico"
                statusText="Sincronizado"
                statusColor="bg-emerald-500"
                rightContent={
                    <EliteButton
                        onClick={() => { setEditingSpecialty(null); setDialogOpen(true); }}
                        className="bg-primary hover:bg-primary/90 text-white shadow-premium-md font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5 mr-3" /> Nueva Especialidad
                    </EliteButton>
                }
            />

            {/* SEARCH AREA */}
            <EliteCard className="p-6 shrink-0 mt-8 mb-8">
                <EliteInput
                    icon={Search}
                    placeholder="Buscar especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-16 bg-muted/20 border-none font-bold rounded-2xl text-foreground transition-all shadow-inner pl-14"
                />
            </EliteCard>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground font-black text-xs uppercase tracking-widest">Cargando especialidades...</div>
            ) : filteredSpecialties.length === 0 ? (
                <EliteCard className="text-center py-16">
                    <Stethoscope className="mx-auto h-16 w-16 text-muted-foreground/30 mb-6" />
                    <h3 className="text-lg font-black uppercase tracking-tight font-display mb-2">No hay especialidades</h3>
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Agrega la primera especialidad médica al sistema</p>
                </EliteCard>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSpecialties.map((specialty) => (
                        <EliteCard key={specialty.id} className="hover:shadow-premium-md transition-all group relative rounded-elite-xl">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-border/30">
                                            <Stethoscope className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight font-display leading-tight">{specialty.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <EliteButton variant="ghost" size="icon" onClick={() => handleEdit(specialty)} className="w-10 h-10 rounded-xl hover:bg-primary/5 flex items-center justify-center">
                                            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                        </EliteButton>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <EliteButton variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-rose-500/10 flex items-center justify-center">
                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                </EliteButton>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-[3rem] border-none shadow-2xl bg-card p-0 overflow-hidden">
                                                <div className="bg-rose-600 p-10 text-white relative">
                                                    <AlertDialogTitle className="text-3xl font-black uppercase tracking-tighter font-display leading-none">Eliminar Especialidad</AlertDialogTitle>
                                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-4">Protocolo de seguridad</p>
                                                </div>
                                                <div className="p-10">
                                                    <AlertDialogDescription className="text-muted-foreground font-bold text-base leading-relaxed font-sans">
                                                        ¿Está seguro que desea eliminar la especialidad <span className="text-rose-600 underline">"{specialty.name}"</span>? Esta acción no se puede deshacer y podría afectar el catálogo de médicos vinculados.
                                                    </AlertDialogDescription>
                                                </div>
                                                <div className="p-10 pt-0 flex gap-4">
                                                    <AlertDialogCancel asChild>
                                                        <EliteButton variant="secondary" className="flex-1 h-16 rounded-2xl border-border/40 bg-muted/20 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Abortar</EliteButton>
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction asChild>
                                                        <EliteButton onClick={() => handleDelete(specialty.id)} className="flex-1 h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black uppercase tracking-widest text-[10px] text-white shadow-premium-md shadow-rose-500/20 transition-all">Confirmar</EliteButton>
                                                    </AlertDialogAction>
                                                </div>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                {specialty.detail && (
                                    <p className="text-xs font-bold text-muted-foreground line-clamp-3 leading-relaxed mt-2">{specialty.detail}</p>
                                )}
                            </div>
                        </EliteCard>
                    ))}
                </div>
            )}

            <SpecialtyDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                specialtyToEdit={editingSpecialty}
                onSuccess={loadSpecialties}
            />
        </div>
    );
}
