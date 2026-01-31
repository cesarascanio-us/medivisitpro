import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Added missing Textarea
import { useToast } from "@/hooks/use-toast";
import {
    MapPin, Clock, Camera, CheckCircle, Navigation, AlertTriangle, Play, Square,
    FileText, PenTool, Brain, Activity as ActivityIcon, Star, Calculator, Store
} from "lucide-react";
import type { VisitExecution as VisitExecutionType } from "@/types/visits"; // Rename type import
import { SPINGuideAlert } from "@/components/visits/SPINGuideAlert";
import { CommercialAudit, CommercialAuditData, validateCommercialAudit, emptyCommercialAudit } from "@/components/visits/CommercialAudit";
import { useVisit, useStartVisit, useCompleteVisit } from "@/hooks/queries/useVisitQueries";
import { VoiceInput } from "@/components/common/VoiceInput";
import { useVisitScenario } from "@/hooks/useVisitScenario";
import { MasterDataCard } from "@/components/visits/MasterDataCard";
import { createFutureVisit, updateDirectoryMasterData } from "@/services/visitAutomationService";
import { useAuth } from "@/hooks/useAuth";
import { ImageUploadInput } from "@/components/common/ImageUploadInput";
import { SmartScheduleWidget } from "@/components/visits/SmartScheduleWidget";
import { SampleDeliveryManager, DeliveryItem } from "@/components/visits/SampleDeliveryManager";
import { POPDeliveryManager, POPDeliveryItem } from "@/components/visits/POPDeliveryManager";
import {
    calculateCycleCondition,
    calculateSuggestedNextVisit,
    autoSuggestObjective
} from "@/services/visitAutomationService";
import { SignaturePad, SignaturePadRef, dataUrlToBlob } from "@/components/common/SignaturePad";
// Dynamic Visit Components
import { DynamicInterviewForm, validateDynamicInterview, getEmptyInterviewData, DynamicInterviewData } from "@/components/visits/DynamicInterviewForm";
import { VisualAidModal } from "@/components/visits/VisualAidModal";
import { CommercialCalculator } from "@/components/catalog/CommercialCalculator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VisitExecutionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();

    // Queries & Mutations
    const { data: visit, isLoading: loadingVisita } = useVisit(id || '');

    // Wholesale Detection Logic
    const isWholesale = useMemo(() => {
        if (!visit?.directory_items?.entity_type) return false;
        const type = visit.directory_items.entity_type.toLowerCase();
        return type === 'drugstore' || type === 'drogueria';
    }, [visit]);
    const startVisitMutation = useStartVisit();
    const completeVisitMutation = useCompleteVisit();

    // Visit Automation: Scenario Detection
    const directoryItemId = (visit as any)?.directory_item_id || null;
    const entityType = visit?.directory_items?.entity_type || 'doctor';
    const { scenario, history, autoFields, loading: scenarioLoading } = useVisitScenario(directoryItemId, entityType);

    // Automation state
    const [masterData, setMasterData] = useState<{ email?: string; phone?: string }>({});
    const [customObjective, setCustomObjective] = useState<string>('');
    const [customNextDate, setCustomNextDate] = useState<string>('');

    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        emotional_state: "",
        purchase_driver: "",
        next_commitment: "",
        notes: "",
        selected_product_id: null as string | null,
        competitor_activity: "",
        promotional_materials: "",
        doctor_interest: 3 // Default 3 stars
    });

    // Show shelf audit for pharmacies
    const [showShelfAudit, setShowShelfAudit] = useState(false);

    // Signature for sample delivery
    const signatureRef = useRef<SignaturePadRef>(null);
    const [samplesDelivered, setSamplesDelivered] = useState(false);

    // Interview Data (Cerebro de la Visita)
    // Removed legacy ClinicalInterviewData state
    const [commercialData, setCommercialData] = useState<CommercialAuditData>(emptyCommercialAudit);

    // Dynamic Interview State
    const [dynamicInterviewData, setDynamicInterviewData] = useState<any>(null);
    const [interviewErrors, setInterviewErrors] = useState<string[]>([]);

    // New state for 100% coverage
    const [deliveredSamples, setDeliveredSamples] = useState<DeliveryItem[]>([]);
    const [deliveredPOP, setDeliveredPOP] = useState<POPDeliveryItem[]>([]);
    const [centralStockAlerts, setCentralStockAlerts] = useState<Array<{ productId: string; status: string }>>([]);

    // Photo evidence
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    // Negotiation State
    const [negotiationModalOpen, setNegotiationModalOpen] = useState(false);
    const [negotiationProduct, setNegotiationProduct] = useState<any>(null);
    const [negotiationProducts, setNegotiationProducts] = useState<any[]>([]);

    // Navigation Helper
    const [activeTab, setActiveTab] = useState("strategy");

    const goToTab = (tab: string) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchNegotiationProducts = async () => {
            // Mock fetch or real fetch of key products
            // Using limit 15 to show a good list of "Key Focus" products
            const { data } = await supabase.from('products').select('*').limit(15);
            if (data) setNegotiationProducts(data);
        };
        fetchNegotiationProducts();
    }, []);

    const handleNegotiate = (product: any) => {
        setNegotiationProduct(product);
        setNegotiationModalOpen(true);
    };

    const handleSaveAgreement = (details: any) => {
        const agreementText = `✅ ACUERDO: ${details.productName} - ${details.quantity} Unidades - Desc: ${details.discountPercent}% - Vía: ${details.drugstoreName} (Total: $${details.totalUSD.toFixed(2)})`;
        setFormData(prev => ({
            ...prev,
            notes: (prev.notes ? prev.notes + '\n' : '') + agreementText
        }));
        setNegotiationModalOpen(false);
        toast({
            title: "Acuerdo Registrado",
            description: "Se ha agregado el acuerdo a las notas de la visita.",
            variant: "default"
        });
    };

    // Resume timer on visit load
    useEffect(() => {
        if (visit?.checkin_at && !visit.checkout_at) {
            const checkinTime = new Date(visit.checkin_at).getTime();
            const now = new Date().getTime();
            setTimer(Math.max(0, Math.floor((now - checkinTime) / 1000)));
            setIsTimerRunning(true);
        }
    }, [visit]);

    // GPS Warmup Strategy
    // We start watching position immediately to warm up the GPS radio and cache a location.
    // This prevents the "Timeout" error when the user actually clicks the button.
    const [cachedPosition, setCachedPosition] = useState<GeolocationPosition | null>(null);

    useEffect(() => {
        if ('geolocation' in navigator) {
            console.log("📍 Initializing GPS Warmup...");
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    // console.log("📍 GPS Location Updated:", position.coords);
                    setCachedPosition(position);
                },
                (error) => {
                    console.warn("📍 GPS Warmup Warning:", error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 30000, // Wait up to 30s for a fix
                    maximumAge: 30000 // Accept positions up to 30s old
                }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Initialize Dynamic Data when scenario is loaded
    useEffect(() => {
        if (scenario && !dynamicInterviewData) {
            setDynamicInterviewData(getEmptyInterviewData(scenario, entityType));
        }
    }, [scenario, entityType]);

    // Sample Limit Warning for Conquest (Visit 1)
    useEffect(() => {
        if (scenario?.type === 'conquest' && deliveredSamples.length > 2) {
            toast({
                title: "⚠️ Exceso de Muestras (Visita 1)",
                description: "En la fase de mapeo, se recomienda entregar MÁXIMO 2 unidades para evitar saturación.",
                variant: 'destructive',
                duration: 5000
            });
        }
    }, [deliveredSamples, scenario]);



    // Haversine formula to calculate distance between two coordinates (in meters)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    const handleCheckIn = async () => {
        // Optimization for Demo Mode: Bypass real GPS to avoid blocks
        const isDemo = id?.startsWith('detail-');
        if (isDemo) {
            console.log("🚀 Demo Mode: Bypassing GPS for fast check-in");
            processCheckIn(10.4806, -66.8983);
            return;
        }

        // Get real geolocation from device
        if (!navigator.geolocation) {
            toast({
                title: "GPS No Disponible",
                description: "Tu dispositivo no soporta geolocalización.",
                variant: "destructive"
            });
            return;
        }

        toast({ title: "Obteniendo ubicación...", description: "Activando GPS del dispositivo" });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const pos = position || cachedPosition; // Fallback? No, position will be null if error.
                // Actually getCurrentPosition passes the position to this callback.
                // We don't need to manually use cachedPosition here because if getCurrentPosition succeeds, we use that.
                // However, we can OPTIMIZE carefully: if we have a fresh cachedPosition, maybe we skip getCurrentPosition?
                // But native getCurrentPosition(maxAge) does that for us.

                await processCheckIn(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                // FALLBACK: If real-time fails, try to use cached position if available
                if (cachedPosition) {
                    toast({
                        title: "GPS Lento",
                        description: "Usando última ubicación conocida para evitar bloqueo.",
                        variant: "default" // Not red, just info
                    });
                    processCheckIn(cachedPosition.coords.latitude, cachedPosition.coords.longitude);
                    return;
                }

                let errorMessage = "No se pudo obtener tu ubicación.";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = "Has denegado el permiso de ubicación. Por favor, actívalo en tu navegador.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = "La ubicación no está disponible en este momento.";
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = "Tiempo de espera agotado. Muévete a un lugar despejado e intenta nuevamente.";
                }

                toast({
                    title: "Error de GPS",
                    description: errorMessage,
                    variant: "destructive"
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 20000, // Increased to 20s
                maximumAge: 60000 // Accept positions up to 1 minute old (High cache hit rate)
            }
        );
    };

    const processCheckIn = (currentLat: number, currentLng: number) => {
        // Proximity validation
        let isOutOfRange = false;
        const directoryItem = (visit as any).directory_items;

        if (directoryItem?.latitude && directoryItem?.longitude) {
            const distance = calculateDistance(
                currentLat,
                currentLng,
                directoryItem.latitude,
                directoryItem.longitude
            );

            if (distance > 500) {
                isOutOfRange = true;
                const confirmContinue = window.confirm(
                    `⚠️ Estás a ${Math.round(distance)}m de la ubicación registrada.\n\n` +
                    `¿Deseas continuar con el Check-in de todas formas?`
                );

                if (!confirmContinue) {
                    toast({
                        title: "Check-in Cancelado",
                        description: "Debes estar cerca de la ubicación para registrar la visita."
                    });
                    return;
                }
            }
        }

        startVisitMutation.mutate({
            visitId: id!,
            location: { lat: currentLat, lng: currentLng, outOfRange: isOutOfRange }
        }, {
            onSuccess: () => {
                setIsTimerRunning(true);
                toast({
                    title: "Check-in Exitoso",
                    description: isOutOfRange
                        ? "⚠️ Ubicación registrada (fuera de rango)"
                        : "El cronómetro ha iniciado."
                });
            },
            onError: () => {
                toast({ title: "Error", description: "Fallo al realizar Check-in", variant: "destructive" });
            }
        });
    };

    const handleCheckOut = async () => {
        // COMPLIANCE: Validate Sample Lots
        if (deliveredSamples.length > 0) {
            const missingLots = deliveredSamples.filter(i => !i.lotNumber || i.lotNumber.trim() === '');
            if (missingLots.length > 0) {
                toast({
                    title: "⛔ Compliance Bloqueante",
                    description: `Falta el N° de Lote para: ${missingLots.map(i => i.product_name).join(', ')}. Es obligatorio por normativa.`,
                    variant: "destructive"
                });
                return;
            }
        }

        // Validar campos Neuro-Ventas básicos
        if (!formData.emotional_state || !formData.next_commitment) {
            toast({ title: "Faltan datos", description: "Completa el reporte de Neuro-Ventas antes de finalizar.", variant: "destructive" });
            return;
        }

        // BLINDAJE: Validar entrevista estructurada según tipo
        const entityType = (visit as any).directory_items?.entity_type;
        let interviewValidationErrors: string[] = [];
        let interviewDataToSave: any = {};

        const isCommerce = entityType === 'pharmacy' || entityType === 'store' || entityType === 'drugstore';

        if (isCommerce) {
            // Priority: Alta Comercial (Profiling) if Visit 1
            if (scenario?.type === 'conquest') {
                interviewValidationErrors = validateDynamicInterview(scenario, dynamicInterviewData, entityType);
                interviewDataToSave = {
                    type: 'commercial_profiling',
                    scenario_type: 'conquest',
                    ...dynamicInterviewData
                };
            } else {
                // Secondary/Legacy: Commercial Audit
                interviewValidationErrors = validateCommercialAudit(commercialData);
                interviewDataToSave = { type: 'commercial', ...commercialData };
            }
        } else if (entityType === 'doctor') {
            if (scenario) {
                interviewValidationErrors = validateDynamicInterview(scenario, dynamicInterviewData, entityType);
                interviewDataToSave = {
                    type: 'dynamic',
                    scenario_type: scenario.type,
                    ...dynamicInterviewData
                };
            }
        }

        if (interviewValidationErrors.length > 0) {
            setInterviewErrors(interviewValidationErrors);
            toast({
                title: "⚠️ Entrevista Incompleta",
                description: "Completa TODOS los campos obligatorios del formulario para poder finalizar.",
                variant: "destructive"
            });
            return;
        }

        completeVisitMutation.mutate({
            visitId: id!,
            data: {
                emotional_state: formData.emotional_state,
                purchase_driver: formData.purchase_driver,
                next_commitment: formData.next_commitment,
                notes: formData.notes,
                // Auto-calculated fields
                cycle_id: autoFields.cycleId,
                objective: customObjective || autoFields.suggestedObjective,
                // Competitor & Promo Ops
                competitor_activity: formData.competitor_activity,
                promotional_materials: deliveredPOP.length > 0
                    ? deliveredPOP.map(p => `${p.product_name} (${p.quantity})`).join(', ')
                    : formData.promotional_materials,
                samples_delivered: deliveredSamples.length > 0
                    ? deliveredSamples.map(d => `${d.product_name} (${d.quantity}) [Lote: ${d.lotNumber || 'N/A'}]`).join(', ')
                    : null,
                // Photo evidence
                photo_url: photoUrl,
                interview_data: {
                    ...interviewDataToSave,
                    visit_context: {
                        emotional_state: formData.emotional_state,
                        doctor_interest: formData.doctor_interest, // Compliance 360
                        purchase_driver: formData.purchase_driver,
                        next_commitment: formData.next_commitment,
                        notes: formData.notes,
                        out_of_range: (visit as any).out_of_range,
                        central_alerts: centralStockAlerts
                    },
                    scenario: scenario?.type,
                    visit_count: history.visitCount,
                    timestamp: new Date().toISOString()
                }
            }
        }, {
            onSuccess: async () => {
                setIsTimerRunning(false);

                // PROCESS SAMPLE DROPS
                if (deliveredSamples.length > 0 && !id?.startsWith('detail-')) {
                    for (const item of deliveredSamples) {
                        await supabase.rpc('register_visit_sample_drop', {
                            p_visit_id: id!,
                            p_product_id: item.product_id,
                            p_quantity: item.quantity,
                            p_notes: `Entrega Visita - Lote: ${item.lotNumber}` // Compliance Requirement
                        });
                    }
                }

                // PROCESS POP DROPS (360)
                if (deliveredPOP.length > 0 && !id?.startsWith('detail-')) {
                    for (const item of deliveredPOP) {
                        await supabase.rpc('register_visit_pop_drop' as any, {
                            p_visit_id: id!,
                            p_material_id: item.id,
                            p_quantity: item.quantity
                        });
                    }
                }

                // AUTO-CREATE FUTURE VISIT
                if (user?.id && directoryItemId) {
                    const nextDate = customNextDate || autoFields.suggestedNextVisitDate;
                    const nextObjective = `Seguimiento: ${formData.next_commitment || customObjective || autoFields.suggestedObjective}`;

                    const result = await createFutureVisit(
                        user.id,
                        directoryItemId,
                        nextDate,
                        nextObjective,
                        autoFields.cycleId
                    );

                    if (result.success) {
                        toast({
                            title: "✅ Visita Finalizada",
                            description: `Vector de datos guardado. Próxima visita agendada para ${nextDate}.`
                        });
                    } else {
                        toast({ title: "✅ Visita Finalizada", description: "Vector de datos guardado exitosamente." });
                    }
                } else {
                    toast({ title: "✅ Visita Finalizada", description: "Vector de datos guardado exitosamente." });
                }

                // UPDATE MASTER DATA (if provided in conquest scenario)
                if (scenario?.showMasterDataCard && directoryItemId && (masterData.email || masterData.phone)) {
                    await updateDirectoryMasterData(directoryItemId, masterData);
                }

                setTimeout(() => navigate('/planning/weekly'), 1500);
            },
            onError: () => {
                toast({ title: "Error", description: "No se pudo finalizar la visita", variant: "destructive" });
            }
        });
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loadingVisita) return <div className="p-8 text-center">Cargando visita...</div>;
    if (!visit) return <div className="p-8 text-center">Visita no encontrada</div>;

    // Map contacts data to legacy directory_items structure
    const directoryItem = {
        name: (visit as any).contacts?.name,
        address: (visit as any).contacts?.address,
        entity_type: (visit as any).visit_type,
        email: (visit as any).contacts?.email,
        phone: (visit as any).contacts?.phone,
        latitude: null, // Contacts table usually doesn't have lat/long yet
        longitude: null
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        {directoryItem?.name || "Cliente Desconocido"}
                    </h1>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {directoryItem?.address || "Sin dirección"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => goToTab("negotiation")}
                        className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-bold gap-1 shadow-sm"
                    >
                        💲 Venta/Negociación
                    </Button>
                    {isTimerRunning && (
                        <Badge variant="outline" className="text-xs font-normal text-slate-400 border-slate-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(timer)}
                        </Badge>
                    )}
                </div>
            </div>

            {!visit.checkin_at ? (
                <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Navigation className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Listo para iniciar</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                        Comprueba tu ubicación y presiona Check-in.
                    </p>
                    <Button size="lg" onClick={handleCheckIn} className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-200">
                        <Play className="h-5 w-5" /> INICIAR VISITA
                    </Button>
                </div>
            ) : visit.status === 'completed' ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Visita Completada</h3>
                    <Button
                        onClick={() => navigate('/agenda')}
                        className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all active:scale-95"
                    >
                        Volver a la Agenda
                    </Button>
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-white/80 p-1.5 h-auto md:h-16 rounded-2xl border border-slate-200 shadow-lg backdrop-blur-xl">
                        <TabsTrigger
                            value="strategy"
                            className="rounded-xl text-slate-500 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-bold text-sm md:text-base gap-2 h-12 md:h-full"
                        >
                            <Brain className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">1. Estrategia</span>
                            <span className="sm:hidden">Estrat.</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="development"
                            className="rounded-xl text-slate-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-bold text-sm md:text-base gap-2 h-12 md:h-full"
                        >
                            <ActivityIcon className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">2. Desarrollo</span>
                            <span className="sm:hidden">Desarr.</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="negotiation"
                            className="rounded-xl text-slate-500 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-bold text-sm md:text-base gap-2 h-12 md:h-full"
                        >
                            <Store className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">3. Negociación</span>
                            <span className="sm:hidden">Negoc.</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="closing"
                            className="rounded-xl text-slate-500 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-bold text-sm md:text-base gap-2 h-12 md:h-full"
                        >
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">4. Cierre</span>
                            <span className="sm:hidden">Cierre</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: ESTRATEGIA & PREPARACIÓN */}
                    <TabsContent value="strategy" className="space-y-6 animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {scenario && !scenarioLoading && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2">
                                        <Brain className="h-6 w-6 text-emerald-600" /> Brain 360: Sugerencia Estratégica
                                    </h3>
                                    <SmartScheduleWidget
                                        scenario={scenario}
                                        suggestedObjective={customObjective || autoFields.suggestedObjective}
                                        suggestedDate={customNextDate || autoFields.suggestedNextVisitDate}
                                        lastCommitment={history.lastVisit?.commitment || null}
                                        onObjectiveChange={setCustomObjective}
                                        onDateChange={setCustomNextDate}
                                    />
                                </div>
                            )}

                            <Card className="border-slate-200 bg-white shadow-lg rounded-2xl overflow-hidden">
                                <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
                                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-emerald-600" /> Preparación y Foco
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    {scenario?.showMasterDataCard && (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <MasterDataCard
                                                directoryItemId={directoryItemId || ''}
                                                currentEmail={directoryItem?.email}
                                                currentPhone={directoryItem?.phone}
                                                onUpdate={setMasterData}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Objetivo Transaccional</label>
                                        <div className="relative group">
                                            <Input
                                                value={customObjective || (visit as any).objective || ''}
                                                readOnly
                                                className="relative bg-white border-slate-300 text-slate-800 font-medium h-14 text-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* DYNAMIC FORM INJECTION FOR CONQUEST (VISIT 1) */}
                            {/* For Visit 1, profiling is part of the Strategy/Assessment phase */}
                            {((entityType === 'doctor' && scenario?.type === 'conquest') ||
                                ((entityType === 'pharmacy' || entityType === 'store' || entityType === 'drugstore') && scenario?.type === 'conquest')) &&
                                dynamicInterviewData && (
                                    <div className="col-span-1 lg:col-span-2">
                                        <DynamicInterviewForm
                                            scenario={scenario!}
                                            data={dynamicInterviewData}
                                            onChange={(data) => {
                                                setDynamicInterviewData(data);
                                                setInterviewErrors([]);
                                            }}
                                            errors={interviewErrors}
                                            lastVisitSamples={history.lastVisit?.samples_delivered}
                                            entityType={entityType}
                                        />
                                    </div>
                                )}

                        </div>
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => goToTab("development")} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl h-12 px-6 gap-2 font-bold text-lg hover:scale-105 transition-transform">
                                Siguiente Fase <Navigation className="h-5 w-5" />
                            </Button>
                        </div>
                    </TabsContent>

                    {/* TAB 2: DESARROLLO (NEURO VENTAS & ENTREVISTA) */}
                    <TabsContent value="development" className="space-y-4 animate-in fade-in-50">
                        <Card className="border-slate-200 bg-white shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                    <Star className="h-5 w-5 text-yellow-500" /> Psicología de Venta & Interés
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                {/* Interest Scale */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-4 text-center sm:text-left">Nivel de Engagement</label>
                                    <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setFormData((prev: any) => ({ ...prev, doctor_interest: star }))}
                                                className={`p-3 transition-all transform hover:scale-110 rounded-xl border ${formData.doctor_interest >= star
                                                    ? 'bg-yellow-400 text-white shadow-md border-yellow-500'
                                                    : 'bg-white text-slate-300 border-slate-200 hover:text-yellow-400 hover:border-yellow-300'}`}
                                            >
                                                <Star className={`h-8 w-8 ${formData.doctor_interest >= star ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center sm:text-left text-base font-bold text-slate-700 mt-4 bg-white py-2 px-4 rounded-full border border-slate-200 inline-block">
                                        {formData.doctor_interest === 1 && "❌ Rechazo Frontal"}
                                        {formData.doctor_interest === 2 && "🤔 Escéptico / Barreras"}
                                        {formData.doctor_interest === 3 && "😐 Neutral / Informativo"}
                                        {formData.doctor_interest === 4 && "⭐ Muy Interesado"}
                                        {formData.doctor_interest === 5 && "🚀 Compromiso Total de Venta"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Estado Emocional</label>
                                        <Select
                                            value={formData.emotional_state}
                                            onValueChange={(v) => setFormData({ ...formData, emotional_state: v })}
                                        >
                                            <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12">
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200 text-slate-900">
                                                <SelectItem value="open">Abierto / Receptivo</SelectItem>
                                                <SelectItem value="skeptical">Escéptico / Crítico</SelectItem>
                                                <SelectItem value="indifferent">Indiferente</SelectItem>
                                                <SelectItem value="closed">Cerrado / Molesto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Motivador Detectado</label>
                                        <Select
                                            value={formData.purchase_driver}
                                            onValueChange={(v) => setFormData({ ...formData, purchase_driver: v })}
                                        >
                                            <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12">
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200 text-slate-900">
                                                <SelectItem value="price">Precio / Rentabilidad</SelectItem>
                                                <SelectItem value="quality">Calidad / Eficacia</SelectItem>
                                                <SelectItem value="relationship">Relación / Confianza</SelectItem>
                                                <SelectItem value="availability">Disponibilidad / Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <VoiceInput
                                    label="Observaciones Clave"
                                    rows={3}
                                    placeholder="Detalles de la conversación..."
                                    value={formData.notes}
                                    onValueChange={(val) => setFormData({ ...formData, notes: val })}
                                />
                            </CardContent>
                        </Card>

                        {/* Entrevistas Estructuradas */}
                        <div className="pt-6">
                            {/* For Development/Maturity, the interview (Validation/Maintenance) happens here in Phase 2 */}
                            {entityType === 'doctor' && scenario && scenario.type !== 'conquest' && dynamicInterviewData && (
                                <div className="space-y-4">
                                    {scenario.type === 'development' && (
                                        <div className="flex justify-end">
                                            <VisualAidModal />
                                        </div>
                                    )}

                                    <DynamicInterviewForm
                                        scenario={scenario}
                                        data={dynamicInterviewData}
                                        onChange={(data) => {
                                            setDynamicInterviewData(data);
                                            setInterviewErrors([]);
                                        }}
                                        errors={interviewErrors}
                                        lastVisitSamples={history.lastVisit?.samples_delivered}
                                        entityType={entityType}
                                    />
                                </div>
                            )}
                            {(entityType === 'pharmacy' || entityType === 'store' || entityType === 'drugstore') && scenario && scenario.type !== 'conquest' && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg">
                                    <CommercialAudit
                                        data={commercialData}
                                        onChange={(data) => {
                                            setCommercialData(data);
                                            setInterviewErrors([]);
                                        }}
                                        errors={interviewErrors}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between mt-8">
                            <Button variant="outline" onClick={() => goToTab("strategy")} className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 h-12 px-6 rounded-xl font-medium">
                                <Navigation className="h-5 w-5 rotate-180" /> Volver
                            </Button>
                            <Button onClick={() => goToTab("negotiation")} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 rounded-xl h-12 px-6 gap-2 font-bold text-lg hover:scale-105 transition-transform">
                                Ir a Negociación <Store className="h-5 w-5" />
                            </Button>
                        </div>
                    </TabsContent >

                    {/* TAB: NEGOCIACIÓN (NUEVA INTEGRACIÓN) */}
                    <TabsContent value="negotiation" className="space-y-6 animate-in fade-in-50">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-200 shadow-sm">
                                <h3 className="text-xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                                    <Store className="h-6 w-6 text-purple-600" /> Foco Comercial: Línea Femenina
                                </h3>
                                <p className="text-slate-400 mb-6">Selecciona un producto clave para iniciar la negociación y registrar acuerdos.</p>

                                {isWholesale && (
                                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <h4 className="font-bold text-red-800 flex items-center gap-2 mb-4">
                                            <AlertCircle className="h-5 w-5" /> 🚨 Monitor de Inventario Central (Falla)
                                        </h4>
                                        <div className="space-y-4">
                                            {negotiationProducts.slice(0, 5).map(product => (
                                                <div key={`alert-${product.id}`} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                                                    <span className="text-sm font-medium text-slate-700">{product.name}</span>
                                                    <Select
                                                        value={centralStockAlerts.find(a => a.productId === product.id)?.status || 'available'}
                                                        onValueChange={(v) => {
                                                            const newAlerts = centralStockAlerts.filter(a => a.productId !== product.id);
                                                            if (v !== 'available') {
                                                                newAlerts.push({ productId: product.id, status: v });
                                                                if (v === 'out_of_stock') {
                                                                    toast({
                                                                        title: "🔥 ALERTA DE FALLA",
                                                                        description: `Se ha registrado agotamiento de ${product.name} en esta droguería.`,
                                                                        variant: "destructive"
                                                                    });
                                                                }
                                                            }
                                                            setCentralStockAlerts(newAlerts);
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[180px] h-9 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="available">🟢 Disponible</SelectItem>
                                                            <SelectItem value="low">🟡 Poca Existencia</SelectItem>
                                                            <SelectItem value="out_of_stock">🔴 AGOTADO (Falla)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {negotiationProducts.map(product => (
                                        <Card key={product.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{product.name}</h4>
                                                    <p className="text-sm text-slate-500 mt-1">{product.active_ingredients || 'Producto Clave'}</p>
                                                    <div className="mt-2 text-emerald-600 font-mono font-bold">
                                                        ${product.price ? product.price.toFixed(2) : '0.00'}
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleNegotiate(product)}
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-100"
                                                >
                                                    💲 Negociar
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent >

                    {/* TAB 3: CIERRE (MUESTRAS, POP, EVIDENCIA) */}
                    <TabsContent value="closing" className="space-y-8 animate-in fade-in-50 duration-500">
                        <Card className="border-orange-100 bg-orange-50 shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="bg-orange-50/50 pb-4 border-b border-orange-100">
                                <CardTitle className="text-lg font-bold text-orange-700 flex items-center gap-2">
                                    <ActivityIcon className="h-5 w-5" /> Inteligencia Competitiva 360°
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Textarea
                                    placeholder="¿Qué está haciendo la competencia en este punto? (Precios, promociones, visitas...)"
                                    value={formData.competitor_activity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, competitor_activity: e.target.value }))}
                                    className="w-full text-base p-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[100px]"
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 border-b pb-2">Entrega de Materiales</h3>

                            <SampleDeliveryManager
                                onUpdate={setDeliveredSamples}
                                initialItems={deliveredSamples}
                            />

                            <POPDeliveryManager
                                onUpdate={setDeliveredPOP}
                                initialItems={deliveredPOP}
                            />

                            {/* Fallback legacy input if needed, can be hidden */}
                            <div className="hidden">
                                <Input
                                    placeholder="Describir material entregado..."
                                    value={formData.promotional_materials}
                                    onChange={(e) => setFormData(prev => ({ ...prev, promotional_materials: e.target.value }))}
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-md">
                                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <PenTool className="h-5 w-5 text-emerald-600" /> Evidencia y Firma
                                </h3>
                                <div className="space-y-6">
                                    <ImageUploadInput
                                        value={photoUrl}
                                        onUpload={setPhotoUrl}
                                        onDelete={() => setPhotoUrl(null)}
                                        path="visits"
                                        label="Foto de Visita (Fachada/Exhibición)"
                                    />

                                    {deliveredSamples.length > 0 && (
                                        <div className="pt-4">
                                            <SignaturePad
                                                ref={signatureRef}
                                                title="Firma Digital de Recepción"
                                                required={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-md flex-grow">
                                    <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                                        <Navigation className="h-5 w-5" /> Próximo Paso
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Acuerdo Alcanzado</label>
                                        <Textarea
                                            placeholder="¿Cuál es el compromiso para la siguiente visita?"
                                            value={formData.next_commitment}
                                            onChange={(e) => setFormData({ ...formData, next_commitment: e.target.value })}
                                            className="w-full text-lg p-4 rounded-xl border border-blue-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 transition-all min-h-[120px]"
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-20 text-xl font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 border border-slate-200 rounded-2xl group overflow-hidden relative"
                                    onClick={handleCheckOut}
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <Square className="h-6 w-6 mr-3 fill-current group-hover:scale-110 transition-transform" />
                                    FINALIZAR VISITA ESTRATÉGICA
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            )
            }

            {/* CALCULATOR MODAL */}
            <Dialog open={negotiationModalOpen} onOpenChange={setNegotiationModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 p-0 rounded-2xl border-0">
                    <DialogHeader className="p-6 pb-2 bg-white">
                        <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Calculator className="h-6 w-6 text-blue-600" />
                            Negociación: <span className="text-blue-600">{negotiationProduct?.name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-2 bg-slate-50">
                        {negotiationProduct && (
                            <CommercialCalculator
                                basePrice={negotiationProduct.price || 0}
                                priceDronena={negotiationProduct.price_dronena || 0}
                                competitorPrice={negotiationProduct.price_cobeca || 0}
                                productName={negotiationProduct.name}
                                onSaveAgreement={handleSaveAgreement}
                                isWholesale={isWholesale}
                                priceDistributor={negotiationProduct.price || 0}
                                entityType={visit?.visit_type}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}


