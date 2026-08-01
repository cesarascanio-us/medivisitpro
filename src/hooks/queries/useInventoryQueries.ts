/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventoryService";

import { useDemoData } from "@/contexts/MockDataProvider";

export function useRepInventory(userId: string) {
    const demoData = useDemoData();
    return useQuery({
        queryKey: ['inventory', 'rep', userId],
        queryFn: () => {
            if (demoData) return demoData.inventory;
            return inventoryService.getRepInventory(userId);
        },
        enabled: !!userId || !!demoData,
    });
}

export function useBankInventory(bankId: string) {
    const demoData = useDemoData();
    return useQuery({
        queryKey: ['inventory', 'bank', bankId],
        queryFn: () => {
            if (demoData) {
                // Return inventory for this specific bank if bankId is a demo id
                return demoData.bankInventory.filter(item => item.bank_id === bankId);
            }
            return inventoryService.getBankInventory(bankId);
        },
        enabled: !!bankId || !!demoData,
    });
}

export function useBanks(userId?: string) {
    const demoData = useDemoData();
    return useQuery({
        queryKey: ['inventory', 'banks', userId],
        queryFn: () => {
            if (demoData) return demoData.sampleBanks;
            return inventoryService.getBanks(userId);
        },
        enabled: userId !== undefined || !!demoData
    });
}

export function useInventoryMovement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (movement: Parameters<typeof inventoryService.executeMovement>[0]) =>
            inventoryService.executeMovement(movement),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
    });
}

export function useBankAudit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bankId, movements }: { bankId: string, movements: any[] }) =>
            inventoryService.verifyAudit(bankId, movements),
        onSuccess: (_, { bankId }) => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'bank', bankId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'banks'] });
        }
    });
}
