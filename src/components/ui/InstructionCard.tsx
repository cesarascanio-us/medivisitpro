import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Info } from "lucide-react";

interface InstructionCardProps {
    title: string;
    description?: string;
    items?: string[];
    className?: string;
}

export function InstructionCard({ title, description, items, className }: InstructionCardProps) {
    return (
        <div className={`bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6 shadow-sm ${className}`}>
            <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200 leading-tight">{title}</h3>
                    {description && (
                        <p className="text-sm text-blue-800/80 dark:text-blue-300/80 leading-relaxed">{description}</p>
                    )}
                    {items && items.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-2 mt-3">
                            {items.map((item, idx) => (
                                <li key={idx} className="pl-1">{item}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
