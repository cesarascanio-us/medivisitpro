import { EliteHeader, EliteCard } from "@/components/layout/DesignSystem";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  return (
    <div className="space-y-6 pb-10">
      <EliteHeader 
        title="Preguntas y Respuestas"
        subtitle="Base de Conocimiento y Soporte"
        icon={HelpCircle}
      />
      <EliteCard className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <HelpCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight font-display mb-2">Próximamente</h2>
        <p className="text-muted-foreground max-w-md">
          El portal de preguntas frecuentes se está integrando con el centro de ayuda. Aquí encontrarás respuestas rápidas a políticas, manuales y SOP.
        </p>
      </EliteCard>
    </div>
  );
}
