/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useFavorites() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const loadFavorites = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_favorites')
                .select('product_id')
                .eq('user_id', user.id);

            if (error) throw error;

            const ids = new Set(data?.map(f => f.product_id) || []);
            setFavoriteIds(ids);
        } catch (error: any) {
            console.error('Error loading favorites:', error);
            // Don't show toast for this, it's a background operation
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const isFavorite = useCallback((productId: string): boolean => {
        return favoriteIds.has(productId);
    }, [favoriteIds]);

    const toggleFavorite = async (productId: string): Promise<boolean> => {
        if (!user) {
            toast({
                title: 'Error',
                description: 'Debes iniciar sesión para agregar favoritos.',
                variant: 'destructive'
            });
            return false;
        }

        const isCurrentlyFavorite = favoriteIds.has(productId);

        try {
            if (isCurrentlyFavorite) {
                // Remove from favorites
                const { error } = await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);

                if (error) throw error;

                setFavoriteIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });

                toast({
                    title: 'Eliminado de favoritos',
                    description: 'El producto ha sido eliminado de tu lista de favoritos.'
                });
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from('user_favorites')
                    .insert({
                        user_id: user.id,
                        product_id: productId
                    });

                if (error) throw error;

                setFavoriteIds(prev => new Set([...prev, productId]));

                toast({
                    title: 'Agregado a favoritos',
                    description: 'El producto ha sido agregado a tu lista de favoritos.'
                });
            }

            return true;
        } catch (error: any) {
            console.error('Error toggling favorite:', error);
            toast({
                title: 'Error',
                description: 'No se pudo actualizar los favoritos.',
                variant: 'destructive'
            });
            return false;
        }
    };

    const getFavoriteProductIds = (): string[] => {
        return Array.from(favoriteIds);
    };

    return {
        favoriteIds,
        loading,
        isFavorite,
        toggleFavorite,
        getFavoriteProductIds,
        refreshFavorites: loadFavorites
    };
}
