import { useState, useEffect } from "react";
import { Users, AlertCircle, CheckCircle2, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { autoAssignRepresentatives } from "@/services/suggestionService";
import { useToast } from "@/hooks/use-toast";

export function AutoAssignmentPanel() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [unassignedDoctors, setUnassignedDoctors] = useState<any[]>([]);
    const [representatives, setRepresentatives] = useState<any[]>([]);
    const [previewAssignments, setPreviewAssignments] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Get unassigned doctors (those whose user_id is the admin or null)
            const { data: doctors } = await supabase
                .from('contacts')
                .select('id, name, specialty, zone_id, contact_type')
                .eq('contact_type', 'doctor');

            // Get all representatives
            const { data: roles } = await supabase
                .from('user_roles')
                .select('user_id, role, zone_id, profiles(id, first_name, last_name)')
                .eq('role', 'representative');

            const reps = (roles || []).map((r: any) => ({
                id: r.user_id,
                name: `${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.trim() || 'Representante',
                zone_id: r.zone_id,
                therapeutic_area: '' // Mocking for now, could be loaded from profile
            }));

            setUnassignedDoctors(doctors || []);
            setRepresentatives(reps);
        } catch (error) {
            console.error("Error loading auto-assignment data:", error);
        } finally {
            setLoading(false);
        }
    };

    const runPreview = () => {
        if (unassignedDoctors.length === 0 || representatives.length === 0) return;

        const results = autoAssignRepresentatives(unassignedDoctors, representatives);
        const enrichedResults = results.map(res => ({
            ...res,
            doctorName: unassignedDoctors.find(d => d.id === res.doctorId)?.name,
            repName: representatives.find(r => r.id === res.representativeId)?.name
        }));

        setPreviewAssignments(enrichedResults);

        toast({
            title: "Simulación completada",
            description: `Se han sugerido ${results.length} asignaciones óptimas.`,
        });
    };

    const confirmAssignments = async () => {
        setLoading(true);
        try {
            // Update each contact with the new user_id
            for (const assignment of previewAssignments) {
                await supabase
                    .from('contacts')
                    .update({ user_id: assignment.representativeId })
                    .eq('id', assignment.doctorId);
            }

            toast({
                title: "Asignaciones guardadas",
                description: "Se han actualizado los médicos con los nuevos representantes.",
            });

            setPreviewAssignments([]);
            loadData();
        } catch (error) {
            console.error("Error saving assignments:", error);
            toast({
                title: "Error",
                description: "No se pudieron guardar todas las asignaciones.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="medical-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center">
                            <Sparkles className="mr-2 h-5 w-5 text-primary" />
                            Asignación Inteligente IA
                        </CardTitle>
                        <CardDescription>
                            Match automático basado en zona geográfica y especialidad
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{unassignedDoctors.length}</p>
                        <p className="text-xs text-muted-foreground">Médicos en Sistema</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{representatives.length}</p>
                        <p className="text-xs text-muted-foreground">Representantes</p>
                    </div>
                </div>

                {previewAssignments.length === 0 ? (
                    <Button
                        className="w-full btn-medical"
                        onClick={runPreview}
                        disabled={loading || unassignedDoctors.length === 0}
                    >
                        {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Sugerir Asignaciones
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/20">
                            <div className="flex items-center">
                                <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">{previewAssignments.length} Sugerencias listas</span>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setPreviewAssignments([])}>Cancelar</Button>
                                <Button size="sm" className="btn-medical" onClick={confirmAssignments} disabled={loading}>
                                    Aplicar Todo
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="h-[250px] pr-4">
                            <div className="space-y-2">
                                {previewAssignments.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-muted/50 rounded-lg border border-transparent hover:border-primary/30 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold">{item.doctorName}</p>
                                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    Asignar a: <span className="ml-1 text-primary font-medium">{item.repName}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-primary/5">
                                                Match: {item.matchScore}%
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {unassignedDoctors.length === 0 && (
                    <div className="flex items-center p-3 bg-blue-50 text-blue-800 rounded-lg text-xs">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Todos los médicos están actualmente asignados.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
