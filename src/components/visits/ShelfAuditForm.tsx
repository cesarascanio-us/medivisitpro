/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, TrendingUp, History, Package, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotationHistory } from "./RotationHistory";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const productAuditSchema = z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    has_stock: z.boolean().default(true),
    pvp: z.preprocess((a) => parseFloat(z.string().parse(String(a))), z.number().min(0).optional()),
    cantidad_actual: z.preprocess((a) => parseInt(z.string().parse(String(a))), z.number().min(0).default(0)),
    cantidad_anterior: z.number().default(0),
    ventas_estimadas: z.number().default(0),
    faces: z.preprocess((a) => parseInt(z.string().parse(String(a))), z.number().min(0).default(0)),
    substitution_alert: z.boolean().default(false),
});

const auditFormSchema = z.object({
    audits: z.array(productAuditSchema),
    pop_poster: z.boolean().default(false),
    pop_talker: z.boolean().default(false),
    pop_stack: z.boolean().default(false),
    pop_extra: z.boolean().default(false),
    competitor_faces: z.preprocess((a) => parseInt(z.string().parse(String(a))), z.number().min(0).default(0)),
    competitor_notes: z.string().optional(),
    trained_staff: z.boolean().default(false),
    pop_visible: z.boolean().default(false),
});

type AuditFormValues = z.infer<typeof auditFormSchema>;

interface ShelfAuditFormProps {
    visitId: string;
    pharmacyId?: string;
    pharmacyName?: string;
    onSuccess?: () => void;
}

export function ShelfAuditForm({ visitId, pharmacyId, pharmacyName, onSuccess }: ShelfAuditFormProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [salesMap, setSalesMap] = useState<Map<string, number>>(new Map());
    const [orgSettings, setOrgSettings] = useState({ safety_threshold_default: 6 });

    const form = useForm<AuditFormValues>({
        resolver: zodResolver(auditFormSchema),
        defaultValues: { audits: [], pop_poster: false, pop_talker: false, pop_stack: false, pop_extra: false, competitor_faces: 0, competitor_notes: "", trained_staff: false, pop_visible: false },
    });

    const { fields, append } = useFieldArray({ control: form.control, name: "audits" });

    useEffect(() => { loadProducts(); loadOrgSettings(); }, []);

    const loadOrgSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
        if (profile?.organization_id) {
            const { data: org } = await supabase.from('organizations').select('settings').eq('id', profile.organization_id).single();
            if (org?.settings) setOrgSettings(prev => ({ ...prev, ...(org.settings as any) }));
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const { data: currentVisit } = await (supabase as any).from("visits").select("pharmacy_id, scheduled_date").eq("id", visitId).single();
            const { data: products } = await (supabase as any).from("products").select("id, name").eq("status", "Activo").order("name");
            if (products) {
                const initialAudits = products.map((p: any) => ({ product_id: p.id, product_name: p.name, has_stock: true, pvp: 0, cantidad_actual: 0, cantidad_anterior: 0, ventas_estimadas: 0 }));
                form.reset({ audits: initialAudits });
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const onSubmit = async (values: AuditFormValues) => {
        try {
            setSaving(true);
            const records = values.audits.map(a => ({ visit_id: visitId, producto_id: a.product_id, pharmacy_id: pharmacyId, tiene_stock: a.has_stock, pvp: a.pvp, cantidad_actual: a.cantidad_actual, faces: a.faces }));
            await (supabase as any).from("registro_pvp_farmacia").insert(records);
            toast.success("Auditoría Industrial Sincronizada ✅"); if (onSuccess) onSuccess();
        } catch (error) { toast.error("Error en Sincronización Industrial"); } finally { setSaving(false); }
    };

    if (loading) return <div className="flex justify-center p-20 animate-pulse"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-outfit">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="bg-slate-900 border-white/5 rounded-3xl overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-2xl">
                                <CardContent className="p-8">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-background/5 flex items-center justify-center text-primary  font-black shadow-inner">
                                                {field.product_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white  uppercase tracking-tighter leading-none mb-2">{field.product_name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-background/5 text-slate-500 border-none font-bold text-[8px] uppercase tracking-widest ">Inventory Sync</Badge>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ">Ant: <span className="text-white ml-2 tabular-nums">{field.cantidad_anterior}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6">
                                            <FormField control={form.control} name={`audits.${index}.has_stock`} render={({ field }) => (
                                                <FormItem className="flex items-center gap-3 space-y-0">
                                                    <FormLabel className="text-[9px] font-black uppercase text-slate-500  tracking-widest">Estado</FormLabel>
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" /></FormControl>
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name={`audits.${index}.cantidad_actual`} render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel className="text-[9px] font-black uppercase text-slate-500  tracking-widest ml-1">Stock</FormLabel>
                                                    <FormControl><Input {...field} type="number" className="h-12 bg-slate-950 border-white/5 text-center font-black  text-white rounded-xl focus:ring-primary shadow-inner underline-offset-4" disabled={!form.watch(`audits.${index}.has_stock`)} /></FormControl>
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name={`audits.${index}.pvp`} render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel className="text-[9px] font-black uppercase text-slate-500  tracking-widest ml-1">PVP ($)</FormLabel>
                                                    <FormControl><Input {...field} type="number" step="0.01" className="h-12 bg-slate-950 border-white/5 text-center font-black  text-indigo-400 rounded-xl focus:ring-indigo-500 shadow-inner" disabled={!form.watch(`audits.${index}.has_stock`)} /></FormControl>
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name={`audits.${index}.faces`} render={({ field }) => (
                                                <FormItem className="w-20">
                                                    <FormLabel className="text-[9px] font-black uppercase text-slate-500  tracking-widest ml-1">Caras</FormLabel>
                                                    <FormControl><Input {...field} type="number" className="h-12 bg-slate-950 border-white/5 text-center font-black  text-emerald-400 rounded-xl" disabled={!form.watch(`audits.${index}.has_stock`)} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-slate-900 border-white/5 rounded-[3rem] shadow-3xl overflow-hidden">
                        <CardHeader className="bg-slate-950/50 p-8 border-b border-white/5">
                            <CardTitle className="text-xl font-black text-white  uppercase tracking-tighter flex items-center gap-4">
                                <TrendingUp className="h-6 w-6 text-indigo-500" /> Inteligencia de Exhibición & Competencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]  leading-none">Presencia Material POP</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    {[["pop_poster", "Afiche"], ["pop_talker", "Hablador"], ["pop_stack", "Ruma/Pila"], ["pop_extra", "Exh. Adic"]].map(([name, label]) => (
                                        <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                                            <FormItem className="flex items-center gap-4 space-y-0 p-4 bg-background/5 rounded-2xl border border-white/5 hover:bg-background/10 transition-colors">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <FormLabel className="text-xs font-black uppercase  text-slate-400 cursor-pointer">{label}</FormLabel>
                                            </FormItem>
                                        )} />
                                    ))}
                                </div>
                                <div className="pt-8 border-t border-white/5 space-y-6">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]  leading-none flex items-center gap-3"><ShieldCheck className="w-4 h-4" /> Blindaje Estratégico</h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField control={form.control} name="trained_staff" render={({ field }) => (
                                            <FormItem className="flex items-center gap-4 space-y-0 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" /></FormControl>
                                                <FormLabel className="text-xs font-black uppercase  text-slate-400">Personal Capacitado</FormLabel>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="pop_visible" render={({ field }) => (
                                            <FormItem className="flex items-center gap-4 space-y-0 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" /></FormControl>
                                                <FormLabel className="text-xs font-black uppercase  text-slate-400">POP Visible</FormLabel>
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]  leading-none flex items-center gap-3"><AlertTriangle className="w-4 h-4" /> Radar de Ataque Competidor</h4>
                                <div className="space-y-6">
                                    <FormField control={form.control} name="competitor_faces" render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase text-slate-500 ml-1">Caras Competencia</FormLabel>
                                            <FormControl><Input {...field} type="number" className="h-14 bg-slate-950 border-white/5 text-rose-400 font-black  uppercase rounded-2xl px-6" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="competitor_notes" render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase text-slate-500 ml-1">Observaciones Tácticas</FormLabel>
                                            <FormControl><Textarea {...field} placeholder="PRECIOS, OFERTAS, CAMBIOS DE EXHIBICIÓN..." className="bg-slate-950 border-white/5 text-white font-black  uppercase rounded-3xl p-6" rows={4} /></FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={saving} className="h-16 px-12 bg-card text-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-3xl">
                            {saving ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Save className="mr-3 h-5 w-5" />}
                            SINCRONIZAR AUDITORÍA
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
