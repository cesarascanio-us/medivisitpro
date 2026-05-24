import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganizationPlan } from '@/hooks/useOrganizationPlan';
import { useAuth } from '@/hooks/useAuth';

export function SubscriptionBanner() {
  const { daysUntilExpiry, isExpired, subscriptionStatus } = useOrganizationPlan();
  const { profile } = useAuth();

  // Solo mostrar a manager/admin — no molestar a representantes en campo
  if (!profile || !['manager','admin', 'master'].includes(profile?.role)) return null;
  if (subscriptionStatus === 'active' && (!daysUntilExpiry || daysUntilExpiry > 14)) return null;

  if (isExpired) return (
    <div className="bg-destructive/10 border-b border-destructive/20 px-5 py-2.5 flex items-center justify-center gap-3 w-full sticky top-0 z-50">
      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive font-semibold">
        Tu suscripción ha vencido. Algunos módulos críticos están restringidos.
      </p>
      <Button size="sm" variant="destructive" className="ml-4 h-8 text-xs px-4">Renovar ahora</Button>
    </div>
  );

  if (daysUntilExpiry !== null && daysUntilExpiry <= 14) return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center justify-center gap-3 w-full sticky top-0 z-50">
      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <p className="text-sm text-amber-600 font-semibold">
        Tu suscripción vence en {daysUntilExpiry} {daysUntilExpiry === 1 ? 'día' : 'días'}.
      </p>
      <Button size="sm" variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-600/10 ml-4 h-8 text-xs px-4">
        Renovar suscripción
      </Button>
    </div>
  );

  return null;
}
