/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface SystemDocument {
    id: string;
    title: string;
    category: 'technical' | 'manual' | 'sop' | 'policy';
    content: string;
    version: string;
    last_updated: string;
}

export function useDocumentation() {
    const [documents, setDocuments] = useState<SystemDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('system_documents' as any)
                .select('*')
                .order('category', { ascending: true })
                .order('title', { ascending: true });

            if (error) throw error;
            setDocuments((data as any) || []);
        } catch (err: any) {
            console.error('Error loading documents:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveDocument = async (doc: SystemDocument) => {
        try {
            const { error } = await supabase
                .from('system_documents' as any)
                .upsert({
                    id: doc.id,
                    title: doc.title,
                    category: doc.category,
                    content: doc.content,
                    version: doc.version,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            toast({
                title: "Documento guardado",
                description: "Los cambios se han guardado correctamente.",
            });

            await loadDocuments(); // Reload to get fresh state
            return true;
        } catch (err: any) {
            console.error('Error saving document:', err);
            toast({
                title: "Error al guardar",
                description: err.message,
                variant: "destructive"
            });
            return false;
        }
    };

    const createDocument = async (title: string, category: string) => {
        try {
            const { error } = await supabase
                .from('system_documents' as any)
                .insert({
                    title: title,
                    category: category,
                    content: '# Nuevo Documento\n\nEscribe aquí el contenido...',
                    version: '1.0.0'
                });

            if (error) throw error;

            toast({
                title: "Documento creado",
                description: `Se ha creado el documento "${title}".`,
            });

            await loadDocuments();
            return true;
        } catch (err: any) {
            console.error('Error creating document:', err);
            toast({
                title: "Error al crear",
                description: err.message,
                variant: "destructive"
            });
            return false;
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    // Helper to group by category
    const groupedDocuments = {
        technical: documents.filter(d => d.category === 'technical'),
        manual: documents.filter(d => d.category === 'manual'),
        sop: documents.filter(d => d.category === 'sop'),
        policy: documents.filter(d => d.category === 'policy'),
    };

    return {
        documents,
        groupedDocuments,
        loading,
        error,
        refreshDocuments: loadDocuments,
        saveDocument,
        createDocument
    };
}
