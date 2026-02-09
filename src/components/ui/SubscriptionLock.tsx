import React from "react";
import { Lock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface SubscriptionLockProps {
    featureName: string;
    requiredPlan: "Profesional" | "Empresarial";
    description?: string;
}

export function SubscriptionLock({ featureName, requiredPlan, description }: SubscriptionLockProps) {
    const navigate = useNavigate();

    return (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden relative group">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative p-4 bg-slate-900 rounded-2xl border border-primary/30 shadow-2xl">
                        <Lock className="h-10 w-10 text-primary" />
                    </div>
                </div>

                <div className="space-y-2 max-w-sm">
                    <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px]">
                        Función Premium
                    </Badge>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                        {featureName} está bloqueado
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {description || `Esta herramienta avanzada está disponible exclusivamente para usuarios del plan ${requiredPlan}. Eleva tu gestión médica hoy mismo.`}
                    </p>
                </div>

                <Button
                    onClick={() => navigate("/billing")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
                >
                    <Zap className="mr-2 h-4 w-4 fill-current group-hover:animate-bounce" />
                    Mejorar a {requiredPlan}
                </Button>
            </CardContent>

            {/* Decorative background elements */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        </Card>
    );
}
