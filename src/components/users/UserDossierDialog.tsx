import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, MapPin, UserRound, Award, Calendar, Briefcase, Mail, Phone, Edit, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useAppRoles } from "@/hooks/useAppRoles";

interface UserDossierDialogProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onEditClick?: () => void;
}

export function UserDossierDialog({ userId, isOpen, onClose, onEditClick }: UserDossierDialogProps) {
    const { canManageUsers } = useAuth();
    const { data: appRoles } = useAppRoles();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    const getRoleLabel = (slug: string) => appRoles?.find(r => r.slug === slug)?.name || slug;
    const getRoleColor = (slug: string) => appRoles?.find(r => r.slug === slug)?.color || "bg-muted/10 text-muted-foreground border-border/40";

    useEffect(() => {
        if (isOpen && userId) {
            loadDossier();
        } else {
            setUserData(null);
        }
    }, [isOpen, userId]);

    const loadDossier = async () => {
        setLoading(true);
        try {
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select(`
                    *,
                    profiles:user_id (*)
                `)
                .eq('user_id', userId)
                .single();

            if (roleError) throw roleError;
            setUserData(roleData);
        } catch (error) {
            console.error("Error loading dossier:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] rounded-[3rem] border-border/40 shadow-premium-2xl p-0 overflow-y-auto max-h-[90vh] bg-card font-display">
                <DialogHeader className="bg-muted/20 p-10 pb-8 border-b border-border/40 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Expediente del Colaborador</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-70">
                                Visor de Información de Capital Humano y Cumplimiento
                            </DialogDescription>
                        </div>
                        {canManageUsers && onEditClick && (
                            <Button 
                                onClick={() => {
                                    onClose();
                                    onEditClick();
                                }}
                                className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Modificar Operador
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {loading || !userData ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analizando Expediente...</span>
                    </div>
                ) : (
                    <div className="p-10 space-y-10">
                        {/* Header Section */}
                        <div className="flex gap-8 items-center bg-muted/10 p-8 rounded-[2.5rem] border border-border/40 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                            
                            <div className="w-24 h-24 rounded-3xl bg-card border border-border shadow-inner flex items-center justify-center flex-shrink-0">
                                {userData.profiles?.avatar_url ? (
                                    <img src={userData.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-3xl" />
                                ) : (
                                    <UserRound className="h-10 w-10 text-slate-400" />
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
                                            {userData.profiles?.first_name} {userData.profiles?.last_name}
                                        </h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Badge className={cn("font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-md border", getRoleColor(userData.role))}>
                                                {getRoleLabel(userData.role)}
                                            </Badge>
                                            <Badge className={cn("font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-md border", userData.is_active ? 'bg-emerald-500/10 text-emerald-500 border-none' : 'bg-rose-500/10 text-rose-500 border-none')}>
                                                {userData.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-1">ID Colaborador</p>
                                        <p className="text-xs font-mono font-bold text-foreground bg-muted/30 px-3 py-1 rounded-lg border border-border/40">
                                            {userData.user_id.split('-')[0].toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Contact Info */}
                            <div className="space-y-6 bg-card border border-border/40 p-6 rounded-3xl shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                                    <Mail className="h-4 w-4" /> Información de Contacto
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Correo Corporativo</p>
                                        <p className="text-sm font-bold text-foreground">{userData.profiles?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Teléfono Registrado</p>
                                        <p className="text-sm font-bold text-foreground">{userData.profiles?.phone || 'No registrado'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Organizational Info */}
                            <div className="space-y-6 bg-card border border-border/40 p-6 rounded-3xl shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                                    <Briefcase className="h-4 w-4" /> Datos Organizacionales
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Antigüedad (Fecha Ingreso)</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <p className="text-sm font-bold text-foreground">
                                                {new Date(userData.created_at).toLocaleDateString()} 
                                                <span className="text-muted-foreground font-medium text-xs ml-2">
                                                    ({Math.max(0, Math.floor((new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)))} meses)
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Cumplimiento LOTTT</p>
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-emerald-500" />
                                            <p className="text-sm font-black text-emerald-500 uppercase">100% CUMPLIDO</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Territorial Scope */}
                            <div className="col-span-2 space-y-6 bg-muted/5 border border-border/40 p-6 rounded-3xl shadow-inner">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 border-b border-border/40 pb-3">
                                    <Globe className="h-4 w-4" /> Despliegue Geográfico
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Región Alpha</p>
                                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                            {userData.region ? userData.region : <span className="text-muted-foreground italic text-xs">Perímetro Global</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Estado Operativo</p>
                                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                            {userData.state ? (
                                                <><MapPin className="h-3 w-3 text-primary" /> {userData.state}</>
                                            ) : <span className="text-muted-foreground italic text-xs">N/A</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Radio de Cobertura</p>
                                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                            Vía Multi-Asignación
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                                className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10 gap-2"
                            >
                                Cerrar Expediente
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
