import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface WorkProcess {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    department: string | null;
    responsible_person: string | null;
    objectives: string | null;
    scope: string | null;
    diagram_nodes: Json | null;
    diagram_edges: Json | null;
    risks: Json | null;
    created_at: string | null;
    updated_at: string | null;
}

export function useWorkProcesses() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [processes, setProcesses] = useState<WorkProcess[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadProcesses = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('work_processes')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;



            // Parse JSONB fields safely
            const parsedData = (data || []).map((process: any) => {
                let nodes = process.diagram_nodes;
                let edges = process.diagram_edges;
                let risks = process.risks;

                // Robust parsing if returned as string
                try {
                    if (typeof nodes === 'string') nodes = JSON.parse(nodes);
                    if (typeof edges === 'string') edges = JSON.parse(edges);
                    if (typeof risks === 'string') risks = JSON.parse(risks);
                } catch (e) {
                    console.error('Error parsing JSON for process:', process.name, e);
                }

                const parsed = {
                    ...process,
                    diagram_nodes: Array.isArray(nodes) ? nodes : [],
                    diagram_edges: Array.isArray(edges) ? edges : [],
                    risks: Array.isArray(risks) ? risks : []
                };



                return parsed;
            });

            setProcesses(parsedData);
        } catch (error: any) {
            console.error('Error loading work processes:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los procesos de trabajo.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        loadProcesses();
    }, [loadProcesses]);

    const createProcess = async (processData: Partial<WorkProcess>): Promise<WorkProcess | null> => {
        if (!user) return null;

        setSaving(true);
        try {
            const newProcess = {
                user_id: user.id,
                name: processData.name || 'Nuevo Proceso',
                description: processData.description || null,
                department: processData.department || null,
                responsible_person: processData.responsible_person || null,
                objectives: processData.objectives || null,
                scope: processData.scope || null,
                diagram_nodes: processData.diagram_nodes || [],
                diagram_edges: processData.diagram_edges || [],
                risks: processData.risks || []
            };

            const { data, error } = await supabase
                .from('work_processes')
                .insert(newProcess)
                .select()
                .single();

            if (error) throw error;

            const createdProcess = {
                ...data,
                diagram_nodes: data.diagram_nodes || [],
                diagram_edges: data.diagram_edges || [],
                risks: data.risks || []
            };

            setProcesses(prev => [createdProcess, ...prev]);

            toast({
                title: 'Proceso creado',
                description: 'El proceso de trabajo ha sido creado exitosamente.'
            });

            return createdProcess;
        } catch (error: any) {
            console.error('Error creating work process:', error);
            toast({
                title: 'Error',
                description: 'No se pudo crear el proceso de trabajo.',
                variant: 'destructive'
            });
            return null;
        } finally {
            setSaving(false);
        }
    };

    const updateProcess = async (id: string, updates: Partial<WorkProcess>): Promise<boolean> => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('work_processes')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setProcesses(prev =>
                prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)
            );

            toast({
                title: 'Proceso actualizado',
                description: 'Los cambios han sido guardados.'
            });

            return true;
        } catch (error: any) {
            console.error('Error updating work process:', error);
            toast({
                title: 'Error',
                description: 'No se pudo actualizar el proceso.',
                variant: 'destructive'
            });
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteProcess = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('work_processes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProcesses(prev => prev.filter(p => p.id !== id));

            toast({
                title: 'Proceso eliminado',
                description: 'El proceso ha sido eliminado.'
            });

            return true;
        } catch (error: any) {
            console.error('Error deleting work process:', error);
            toast({
                title: 'Error',
                description: 'No se pudo eliminar el proceso.',
                variant: 'destructive'
            });
            return false;
        }
    };

    return {
        processes,
        loading,
        saving,
        createProcess,
        updateProcess,
        deleteProcess,
        refreshProcesses: loadProcesses
    };
}
