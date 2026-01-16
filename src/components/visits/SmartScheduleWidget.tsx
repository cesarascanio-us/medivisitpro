import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Edit2, Check, Target, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { VisitScenario } from '@/services/visitAutomationService';

interface SmartScheduleWidgetProps {
    scenario: VisitScenario;
    suggestedObjective: string;
    suggestedDate: string;
    lastCommitment: string | null;
    onObjectiveChange: (objective: string) => void;
    onDateChange: (date: string) => void;
}

/**
 * Widget showing auto-calculated objective and next visit date
 * with optional edit capabilities
 */
export function SmartScheduleWidget({
    scenario,
    suggestedObjective,
    suggestedDate,
    lastCommitment,
    onObjectiveChange,
    onDateChange,
}: SmartScheduleWidgetProps) {
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isEditingObjective, setIsEditingObjective] = useState(false);
    const [objective, setObjective] = useState(suggestedObjective);
    const [date, setDate] = useState(suggestedDate);

    const handleSaveObjective = () => {
        onObjectiveChange(objective);
        setIsEditingObjective(false);
    };

    const handleSaveDate = () => {
        onDateChange(date);
        setIsEditingDate(false);
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-VE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    const scenarioColors = {
        conquest: 'bg-amber-100 text-amber-800 border-amber-200',
        development: 'bg-blue-100 text-blue-800 border-blue-200',
        maturity: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };

    return (
        <Card className={`border-2 ${scenarioColors[scenario.type]}`}>
            <CardContent className="pt-4 space-y-4">
                {/* Scenario Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        <span className="font-semibold">Asistente Inteligente</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {scenario.label}
                    </Badge>
                </div>

                {/* Suggested Objective */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm font-medium">
                            <Target className="h-4 w-4" />
                            Tu Misión Hoy
                        </div>
                        {!isEditingObjective && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setIsEditingObjective(true)}
                            >
                                <Edit2 className="h-3 w-3 mr-1" /> Editar
                            </Button>
                        )}
                    </div>

                    {isEditingObjective ? (
                        <div className="flex gap-2">
                            <Input
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                className="text-sm h-8 flex-1"
                            />
                            <Button size="sm" className="h-8" onClick={handleSaveObjective}>
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm bg-white/50 p-2 rounded-lg border">
                            {suggestedObjective}
                        </p>
                    )}

                    {lastCommitment && (
                        <p className="text-xs opacity-75">
                            📝 Compromiso anterior: "{lastCommitment}"
                        </p>
                    )}
                </div>

                {/* Next Visit Date */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm font-medium">
                            <Calendar className="h-4 w-4" />
                            Próxima Visita
                        </div>
                        {!isEditingDate && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setIsEditingDate(true)}
                            >
                                <Edit2 className="h-3 w-3 mr-1" /> Editar
                            </Button>
                        )}
                    </div>

                    {isEditingDate ? (
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="text-sm h-8 flex-1"
                            />
                            <Button size="sm" className="h-8" onClick={handleSaveDate}>
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm bg-white/50 p-2 rounded-lg border capitalize">
                            📅 {formatDate(suggestedDate)}
                        </p>
                    )}
                    <p className="text-xs opacity-75">
                        Se agendará automáticamente al finalizar esta visita
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
