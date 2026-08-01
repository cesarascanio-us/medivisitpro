import React from 'react';
import { EliteHeader } from '@/components/layout/DesignSystem';
import { PhoneCall } from 'lucide-react';

export default function DashboardTelemarketing() {
  return (
    <div className="space-y-10 pb-10 p-1 animate-in fade-in duration-700">
      <EliteHeader 
        title="Panel de Telemarketing"
        subtitle="Gestión de contactos y pedidos B2B remotos"
        icon={PhoneCall}
        badgeText="Ventas Internas"
        statusText="OPERATIVO"
        statusColor="bg-primary"
      />

      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl text-center h-[400px]">
        <PhoneCall className="w-12 h-12 text-muted-foreground/20 mb-4" />
        <h4 className="font-bold text-lg text-foreground">Módulo en Construcción</h4>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          El panel de telemarketing y automatización de llamadas está siendo habilitado. Próximamente verá aquí la cola de contactos.
        </p>
      </div>
    </div>
  );
}
