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
import { Loader2, Save, TrendingUp, History, Package, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotationHistory } from "./RotationHistory";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { EliteButton, EliteCard, EliteInput } from "@/components/layout/DesignSystem";
import { useOrganization } from "@/hooks/useOrganization";

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
    const { organizationId } = useOrganization();
    const [orgSettings, setOrgSettings] = useState({ safety_threshold_default: 6 });

    const form = useForm<AuditFormValues>({
        resolver: zodResolver(auditFormSchema),
        defaultValues: { audits: [], pop_poster: false, pop_talker: false, pop_stack: false, pop_extra: false, competitor_faces: 0, competitor_notes: "", trained_staff: false, pop_visible: false },
    });

    const { fields } = useFieldArray({ control: form.control, name: "audits" });

    useEffect(() => { loadProducts(); loadOrgSettings(); }, []);

    const loadOrgSettings = async () => {
        if (!organizationId) return;
        const { data: org } = await supabase.from('organizations').select('settings').eq('id', organizationId).single();
        if (org?.settings) setOrgSettings(prev => ({ ...prev, ...(org.settings as any) }));
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
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
        <div className="space-y-10 animate-in fade-in duration-700 font-display">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                        {fields.map((field, index) => (
                            <EliteCard key={field.id} className="overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-lg bg-card">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-xl bg-muted/5 flex items-center justify-center text-primary font-black shadow-inner border border-border/40">
                                                {field.product_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-foreground uppercase tracking-tight leading-none mb-2">{field.product_name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <Badge className="badge-elite-info border-none text-[8px]">INVENTORY SYNC</Badge>
                                                    <span className="text-elite-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Ant: <span className="text-foreground ml-2 tabular-nums">{field.cantidad_anterior}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6">
                                            <FormField control={form.control} name={`audits.${index}.has_stock`} render={({ field }) => (
                                                <FormItem className="flex items-center gap-3 space-y-0">
                                                    <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground/60 tracking-widest">STOCK</FormLabel>
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" /></FormControl>
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name={`audits.${index}.cantidad_actual`} render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground/60 tracking-widest ml-1">CANT</FormLabel>
                                                    <FormControl><Input {...field} type="number" className="h-10 bg-muted/5 border-border/40 text-center font-black text-foreground rounded-xl focus:ring-primary shadow-inner" disabled={!form.watch(`audits.${index}.has_stock`)} /></FormControl>
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name={`audits.${index}.pvp`} render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground/60 tracking-widest ml-1">PVP ($)</FormLabel>
                                                    <FormControl><Input {...field} type="number" step="0.01" className="h-10 bg-muted/5 border-border/40 text-center font-black text-primary rounded-xl focus:ring-primary shadow-inner" disabled={!form.watch(`audits.${index}.has_stock`)} /></FormControl>
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name={`audits.${index}.faces`} render={({ field }) => (
                                                <FormItem className="w-20">
                                                    <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground/60 tracking-widest ml-1">FACES</FormLabel>
                                                    <FormControl><Input {...field} type="number" className="h-10 bg-muted/5 border-border/40 text-center font-black text-emerald-500 rounded-xl shadow-inner" disabled={!form.watch(`audits.${index}.has_stock`)} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            </EliteCard>
                        ))}
                    </div>

                    <EliteCard className="p-8 space-y-10">
                        <div className="flex items-center gap-4 pb-6 border-b border-border/40">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            <h4 className="text-lg font-black text-foreground uppercase tracking-tighter font-display">Inteligencia de Exhibición & Competencia</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h5 className="text-elite-xs font-black text-primary uppercase tracking-[0.4em] leading-none opacity-80">Presencia Material POP</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    {[["pop_poster", "Afiche"], ["pop_talker", "Hablador"], ["pop_stack", "Ruma/Pila"], ["pop_extra", "Exh. Adic"]].map(([name, label]) => (
                                        <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                                            <FormItem className="flex items-center gap-4 space-y-0 p-4 bg-muted/5 rounded-xl border border-border/40 hover:bg-muted/10 transition-colors shadow-inner">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" /></FormControl>
                                                <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground cursor-pointer tracking-widest">{label}</FormLabel>
                                            </FormItem>
                                        )} />
                                    ))}
                                </div>
                                <div className="pt-8 border-t border-border/40 space-y-6">
                                    <h5 className="text-elite-xs font-black text-emerald-500 uppercase tracking-[0.4em] leading-none flex items-center gap-3 opacity-80"><ShieldCheck className="w-4 h-4" /> Blindaje Estratégico</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="trained_staff" render={({ field }) => (
                                            <FormItem className="flex items-center gap-4 space-y-0 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 shadow-inner">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" /></FormControl>
                                                <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground tracking-widest">Personal Capacitado</FormLabel>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="pop_visible" render={({ field }) => (
                                            <FormItem className="flex items-center gap-4 space-y-0 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 shadow-inner">
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" /></FormControl>
                                                <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground tracking-widest">POP Visible</FormLabel>
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h5 className="text-elite-xs font-black text-rose-500 uppercase tracking-[0.4em] leading-none flex items-center gap-3 opacity-80"><AlertTriangle className="w-4 h-4" /> Radar de Ataque Competidor</h5>
                                <div className="space-y-6">
                                    <FormField control={form.control} name="competitor_faces" render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1 tracking-widest">Caras Competencia</FormLabel>
                                            <FormControl><Input {...field} type="number" className="h-12 bg-muted/5 border-border/40 text-rose-500 font-black uppercase rounded-xl px-6 shadow-inner" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="competitor_notes" render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-elite-xs font-black uppercase text-muted-foreground/60 ml-1 tracking-widest">Observaciones Tácticas</FormLabel>
                                            <FormControl><Textarea {...field} placeholder="PRECIOS, OFERTAS, CAMBIOS DE EXHIBICIÓN..." className="bg-muted/5 border-border/40 text-foreground font-black uppercase rounded-2xl p-6 shadow-inner" rows={4} /></FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        </div>
                    </EliteCard>

                    <div className="flex justify-end pt-4">
                        <EliteButton type="submit" disabled={saving} className="h-16 px-16 min-w-[240px] shadow-premium-lg" icon={saving ? Loader2 : CheckCircle2}>
                            {saving ? 'SINCRONIZANDO...' : 'SINCRONIZAR AUDITORÍA'}
                        </EliteButton>
                    </div>
                </form>
            </Form>
        </div>
    );
}
