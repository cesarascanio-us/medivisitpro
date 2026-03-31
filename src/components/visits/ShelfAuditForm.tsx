/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */


import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotationHistory } from "./RotationHistory";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp, History } from "lucide-react";

// Schema for a single product audit
const productAuditSchema = z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    has_stock: z.boolean().default(true),
    pvp: z.preprocess(
        (a) => parseFloat(z.string().parse(String(a))),
        z.number().min(0, "El precio debe ser mayor o igual a 0").optional()
    ),
    cantidad_actual: z.preprocess(
        (a) => parseInt(z.string().parse(String(a))),
        z.number().min(0, "La cantidad debe ser mayor o igual a 0").default(0)
    ),
    cantidad_anterior: z.number().default(0),
    ventas_estimadas: z.number().default(0),
    faces: z.preprocess(
        (a) => parseInt(z.string().parse(String(a))),
        z.number().min(0).default(0)
    ),
    substitution_alert: z.boolean().default(false),
});

const auditFormSchema = z.object({
    audits: z.array(productAuditSchema),
    pop_poster: z.boolean().default(false),
    pop_talker: z.boolean().default(false),
    pop_stack: z.boolean().default(false),
    pop_extra: z.boolean().default(false),
    competitor_faces: z.preprocess(
        (a) => parseInt(z.string().parse(String(a))),
        z.number().min(0).default(0)
    ),
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

    const form = useForm<AuditFormValues>({
        resolver: zodResolver(auditFormSchema),
        defaultValues: {
            audits: [],
            pop_poster: false,
            pop_talker: false,
            pop_stack: false,
            pop_extra: false,
            competitor_faces: 0,
            competitor_notes: "",
            trained_staff: false,
            pop_visible: false,
        },
    });

    const [orgSettings, setOrgSettings] = useState({
        safety_threshold_default: 6,
        conversion_factor_default: 0.7,
        geo_radius_attribution: 1.5
    });

    const { fields, append } = useFieldArray({
        control: form.control,
        name: "audits",
    });

    useEffect(() => {
        loadProducts();
        loadOrgSettings();
    }, []);

    const loadOrgSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (profile?.organization_id) {
            const { data: org } = await supabase
                .from('organizations')
                .select('settings')
                .eq('id', profile.organization_id)
                .single();

            if (org?.settings) {
                setOrgSettings(prev => ({ ...prev, ...(org.settings as any) }));
            }
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);

            // 1. Get current visit details to find pharmacy and date
            const { data: currentVisit, error: visitErr } = await (supabase as any)
                .from("visits")
                .select("pharmacy_id, scheduled_date")
                .eq("id", visitId)
                .single();

            if (visitErr) throw visitErr;

            // 2. Fetch active products
            const { data: products, error } = await (supabase as any)
                .from("products")
                .select("id, name")
                .eq("status", "Activo")
                .order("name");

            if (error) throw error;

            if (products) {
                // 3. Fetch latest audits for this pharmacy (including manual entries)
                const { data: latestAudits } = await (supabase as any)
                    .from("registro_pvp_farmacia")
                    .select("producto_id, cantidad_actual, created_at")
                    .eq("pharmacy_id", currentVisit.pharmacy_id)
                    .lt("created_at", currentVisit.scheduled_date)
                    .order("created_at", { ascending: false });

                let prevAuditsMap = new Map();
                let lastAuditDate = null;

                if (latestAudits && latestAudits.length > 0) {
                    // Group by product to get the latest for EACH
                    latestAudits.forEach((a: any) => {
                        if (!prevAuditsMap.has(a.producto_id)) {
                            prevAuditsMap.set(a.producto_id, a.cantidad_actual);
                            // We use the most recent audit overall to calculate sales from that point
                            if (!lastAuditDate || new Date(a.created_at) > new Date(lastAuditDate)) {
                                lastAuditDate = a.created_at;
                            }
                        }
                    });
                } else {
                    // Fallback to previous visit logic if no direct records with pharmacy_id exist yet
                    // (for backward compatibility after migration)
                    const { data: prevVisit } = await (supabase as any)
                        .from("visits")
                        .select("id, scheduled_date")
                        .eq("pharmacy_id", currentVisit.pharmacy_id)
                        .lt("scheduled_date", currentVisit.scheduled_date)
                        .eq("status", "completed")
                        .order("scheduled_date", { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (prevVisit) {
                        lastAuditDate = prevVisit.scheduled_date;
                        const { data: vAudits } = await (supabase as any)
                            .from("registro_pvp_farmacia")
                            .select("producto_id, cantidad_actual")
                            .eq("visit_id", prevVisit.id);

                        if (vAudits) {
                            vAudits.forEach((a: any) => prevAuditsMap.set(a.producto_id, a.cantidad_actual));
                        }
                    }
                }

                // 4. Fetch orders between last audit/visit and now
                const startDate = lastAuditDate || '2000-01-01'; // Default to long ago if no history
                const { data: orders } = await (supabase as any)
                    .from("transfer_orders")
                    .select("products")
                    .eq("contact_id", currentVisit.pharmacy_id)
                    .gte("order_date", startDate)
                    .lte("order_date", currentVisit.scheduled_date)
                    .not("status", "eq", "cancelled");

                const newSalesMap = new Map();
                if (orders) {
                    orders.forEach((o: any) => {
                        const items = Array.isArray(o.products) ? o.products : [];
                        items.forEach((item: any) => {
                            const pid = item.id || item.product_id;
                            const qty = item.quantity || 0;
                            newSalesMap.set(pid, (newSalesMap.get(pid) || 0) + qty);
                        });
                    });
                    setSalesMap(newSalesMap);
                }

                // Initialize form with products and rotation data
                const initialAudits = products.map((p: any) => {
                    const cantAnterior = prevAuditsMap.get(p.id) || 0;
                    const compras = newSalesMap.get(p.id) || 0;

                    return {
                        product_id: p.id,
                        product_name: p.name,
                        has_stock: true,
                        pvp: 0,
                        cantidad_actual: 0,
                        cantidad_anterior: cantAnterior,
                        ventas_estimadas: 0, // Will be calculated when user inputs current qty
                    };
                });

                form.setValue("audits", []);
                initialAudits.forEach(audit => append(audit));
                form.reset({ audits: initialAudits });
            }
        } catch (error: any) {
            console.error("Error loading products:", error);
            toast.error("Error al cargar productos: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: AuditFormValues) => {
        try {
            setSaving(true);

            // 1. Save Product Audits (registro_pvp_farmacia)
            const recordsToInsert = values.audits.map((audit) => {
                return {
                    visit_id: visitId,
                    producto_id: audit.product_id,
                    pharmacy_id: pharmacyId,
                    tiene_stock: audit.has_stock,
                    pvp: audit.has_stock ? audit.pvp : null,
                    cantidad_actual: audit.cantidad_actual,
                    cantidad_anterior: audit.cantidad_anterior,
                    ventas_estimadas: audit.ventas_estimadas,
                    faces: audit.faces,
                    substitution_alert: audit.substitution_alert,
                };
            });

            const { error: productsError } = await (supabase as any)
                .from("registro_pvp_farmacia")
                .insert(recordsToInsert);

            if (productsError) throw productsError;

            // 2. Save Global Visibility Audit (visits.visibility_audit)
            const visibilityData = {
                pop_poster: values.pop_poster,
                pop_talker: values.pop_talker,
                pop_stack: values.pop_stack,
                pop_extra: values.pop_extra,
                competitor_faces: values.competitor_faces,
                competitor_notes: values.competitor_notes,
                // Aggregated product faces
                product_faces: values.audits.reduce((acc: any, curr) => {
                    if (curr.faces > 0) acc[curr.product_name] = curr.faces;
                    return acc;
                }, {}),
                total_our_faces: values.audits.reduce((acc, curr) => acc + (curr.faces || 0), 0)
            };

            const { error: visitError } = await supabase
                .from("visits")
                .update({
                    visibility_audit: visibilityData,
                    trained_staff: values.trained_staff,
                    pop_visible: values.pop_visible
                } as any)
                .eq("id", visitId);

            if (visitError) throw visitError;

            toast.success("Auditoría de anaquel y visibilidad guardada");
            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Error saving audit:", error);
            toast.error("Error al guardar auditoría: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Auditoría de Anaquel</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
                                    <div className="flex-1 truncate pr-4">
                                        <span className="font-medium text-sm">{field.product_name}</span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-4">
                                            <div className="text-[10px] text-muted-foreground w-20">
                                                Ant: <span className="font-bold">{field.cantidad_anterior}</span>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name={`audits.${index}.has_stock`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormLabel className="text-xs font-normal text-muted-foreground mr-1 w-12">
                                                            {field.value ? "Stock" : "Agotado"}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`audits.${index}.cantidad_actual`}
                                                render={({ field }) => (
                                                    <FormItem className="w-20">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                className={`h-8 text-center ${field.value < orgSettings.safety_threshold_default ? "border-red-500 bg-red-50 text-red-700 animate-pulse font-bold" : ""}`}
                                                                disabled={!form.watch(`audits.${index}.has_stock`)}
                                                            />
                                                            {field.value < orgSettings.safety_threshold_default && field.value > 0 && (
                                                                <div className="absolute -top-6 left-0 right-0 text-center">
                                                                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold">QUIEBRE!</span>
                                                                </div>
                                                            )}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`audits.${index}.pvp`}
                                                render={({ field }) => (
                                                    <FormItem className="w-20">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="PVP"
                                                                className="h-8 text-right font-semibold text-blue-600"
                                                                disabled={!form.watch(`audits.${index}.has_stock`)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`audits.${index}.faces`}
                                                render={({ field }) => (
                                                    <FormItem className="w-16">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                placeholder="Caras"
                                                                className="h-8 text-center bg-slate-50"
                                                                disabled={!form.watch(`audits.${index}.has_stock`)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`audits.${index}.substitution_alert`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-1">
                                                        <FormControl>
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[8px] uppercase font-bold text-orange-600">Sustit.</span>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                    className="scale-75"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {form.watch(`audits.${index}.has_stock`) && (
                                            <div className="flex flex-col gap-2 mt-1">
                                                <div className="flex justify-end pr-1">
                                                    <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        Rotación: {Number(field.cantidad_anterior) + (salesMap.get(field.product_id) || 0) - Number(form.watch(`audits.${index}.cantidad_actual`) || 0)} unidades
                                                    </span>
                                                </div>

                                                {pharmacyId && (
                                                    <Accordion type="single" collapsible className="w-full">
                                                        <AccordionItem value="history" className="border-none">
                                                            <AccordionTrigger className="py-1 px-1 text-[10px] hover:no-underline text-blue-600 font-medium justify-end gap-2 flex-row-reverse">
                                                                <span className="flex items-center gap-1">
                                                                    <History className="h-3 w-3" /> Ver histórico
                                                                </span>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pb-0">
                                                                <div className="pt-2 bg-slate-50/50 rounded-md p-2 border border-dashed">
                                                                    <RotationHistory
                                                                        pharmacyId={pharmacyId}
                                                                        productId={field.product_id}
                                                                    />
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Card className="border-dashed bg-slate-50">
                            <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" /> Visibilidad y Competencia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-3 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Material POP</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={form.control}
                                                name="pop_poster"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="text-xs font-normal">Afiche</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="pop_talker"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="text-xs font-normal">Hablador</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="pop_stack"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="text-xs font-normal">Ruma/Pila</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="pop_extra"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="text-xs font-normal">Exh. Adic</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="pt-4 space-y-3 border-t">
                                            <h4 className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                                                🛡️ Blindaje de PDV
                                            </h4>
                                            <FormField
                                                control={form.control}
                                                name="trained_staff"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="text-xs font-medium">¿Personal Capacitado?</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="pop_visible"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="text-xs font-medium">¿Material POP Visible?</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Competencia</h4>
                                        <FormField
                                            control={form.control}
                                            name="competitor_faces"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Caras Competencia</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" className="h-8" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="competitor_notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Observaciones</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Promos, precios..." className="h-8" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar Auditoría
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
