import { cn } from "@/lib/utils";
import { Check, Clock, Package, Truck, FileText } from "lucide-react";

interface StatusStepperProps {
    status: string;
    className?: string;
}

export function StatusStepper({ status, className }: StatusStepperProps) {
    const steps = [
        { id: 'pending', label: 'Solicitado', icon: Clock },
        { id: 'approved', label: 'Aprobado', icon: Check },
        { id: 'processing', label: 'En Proceso', icon: Package },
        { id: 'shipped', label: 'Enviado', icon: Truck },
        { id: 'delivered', label: 'Entregado', icon: FileText },
    ];

    // Determine current index
    const statusMap: Record<string, number> = {
        pending: 0,
        approved: 1,
        processing: 2,
        shipped: 3,
        delivered: 4,
        cancelled: -1 // Special case
    };

    const currentIndex = statusMap[status.toLowerCase()] ?? 0;

    if (status === 'cancelled') {
        return (
            <div className="w-full bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                <span className="text-red-700 font-bold">Pedido Cancelado</span>
            </div>
        );
    }

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-500"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div 
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isCompleted 
                                        ? "bg-green-500 border-green-500 text-white" 
                                        : "bg-white border-gray-300 text-gray-300",
                                    isCurrent && "ring-4 ring-green-100"
                                )}
                            >
                                <step.icon className="w-4 h-4" />
                            </div>
                            <span 
                                className={cn(
                                    "text-xs mt-2 font-medium transition-colors duration-300",
                                    isCompleted ? "text-green-700" : "text-gray-400"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
