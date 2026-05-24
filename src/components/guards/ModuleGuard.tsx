import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SYSTEM_MODULES } from '@/config/systemModules';

export function ModuleGuard({
  moduleKey,
  children,
  fallback
}: {
  moduleKey: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { canAccessModule, isLoading } = usePermissions();

  if (isLoading) return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        </div>
        <div className="h-4 bg-muted w-48 rounded mb-2"></div>
        <div className="h-3 bg-muted w-64 rounded"></div>
      </div>
  );

  if (!canAccessModule(moduleKey)) {
    const sysMod = SYSTEM_MODULES.find(m => m.key === moduleKey);
    const tierRequired = sysMod?.tier === 'pro' ? 'Pro' : sysMod?.tier === 'team' ? 'Team' : sysMod?.tier === 'enterprise' ? 'Enterprise' : 'Superior';
    
    return fallback || (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4 border border-border">
          <Lock className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Módulo no disponible en tu plan
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          Este módulo requiere actualizar tu suscripción actual. Contacta al administrador de tu organización.
        </p>
        <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">
          Requiere plan {tierRequired}
        </Badge>
      </div>
    );
  }

  return <>{children}</>;
}
