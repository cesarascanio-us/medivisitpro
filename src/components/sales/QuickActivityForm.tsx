/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from "react";
import { Phone, Mail, MessageCircle, FileText, CalendarCheck, StickerIcon, ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACTIVITY_TYPES = [
    { value: "call", label: "Llamada", icon: Phone, color: "bg-blue-500" },
    { value: "email", label: "Email", icon: Mail, color: "bg-indigo-500" },
    { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-emerald-500" },
    { value: "meeting", label: "Reunión", icon: CalendarCheck, color: "bg-amber-500" },
    { value: "note", label: "Nota", icon: StickerIcon, color: "bg-slate-500" },
    { value: "task", label: "Tarea", icon: FileText, color: "bg-purple-500" },
];

interface QuickActivityFormProps {
    dealId: string;
    onSubmit: (activity: {
        type: string;
        title: string;
        description: string;
        due_date: string | null;
    }) => void;
    onCancel?: () => void;
}

export function QuickActivityForm({ dealId, onSubmit, onCancel }: QuickActivityFormProps) {
    const [selectedType, setSelectedType] = useState("note");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");

    const isTask = selectedType === "task";

    const handleSubmit = () => {
        if (!title.trim()) return;
        onSubmit({
            type: selectedType,
            title: title.trim(),
            description: description.trim(),
            due_date: isTask && dueDate ? dueDate : null,
        });
        setTitle("");
        setDescription("");
        setDueDate("");
    };

    return (
        <div className="space-y-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            {/* Type Selector */}
            <div>
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Tipo de Actividad
                </Label>
                <div className="flex flex-wrap gap-2">
                    {ACTIVITY_TYPES.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border",
                                selectedType === type.value
                                    ? `${type.color} text-white border-transparent shadow-lg scale-105`
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm"
                            )}
                        >
                            <type.icon className="h-3.5 w-3.5" />
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Title */}
            <div>
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Título
                </Label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`Ej: ${selectedType === 'call' ? 'Llamada de seguimiento' : selectedType === 'task' ? 'Enviar propuesta comercial' : 'Nota sobre reunión'}`}
                    className="h-11 rounded-xl border-slate-200 font-semibold"
                />
            </div>

            {/* Description */}
            <div>
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Descripción (Opcional)
                </Label>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles adicionales..."
                    className="min-h-[60px] rounded-xl border-slate-200 text-sm"
                    rows={2}
                />
            </div>

            {/* Due Date (only for tasks) */}
            {isTask && (
                <div>
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                        Fecha Límite
                    </Label>
                    <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="h-11 rounded-xl border-slate-200 font-semibold w-48"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
                <Button
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                    className="bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest h-11 px-6 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 gap-2"
                >
                    <ArrowRightCircle className="h-4 w-4" />
                    Registrar
                </Button>
                {onCancel && (
                    <Button variant="ghost" onClick={onCancel} className="text-slate-500 font-bold text-xs rounded-xl h-11">
                        Cancelar
                    </Button>
                )}
            </div>
        </div>
    );
}
