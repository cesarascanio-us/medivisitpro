import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    CheckCircle2,
    Copy,
    Camera,
    CreditCard,
    Smartphone,
    Globe,
    Wallet,
    UploadCloud,
    Loader2,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useBilling } from '@/hooks/useBilling';
import { supabase } from '@/integrations/supabase/client';

interface ManualPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planName: string;
    amount: number | string;
}

const PAYMENT_METHODS = [
    {
        id: 'pago_movil',
        name: 'Pago Móvil',
        icon: <Smartphone className="w-4 h-4" />,
        color: 'text-emerald-400',
        details: [
            { label: 'Banco', value: 'Banesco (0134)' },
            { label: 'Teléfono', value: '0412-3411879' },
            { label: 'Cédula/RIF', value: 'V-12345678' }
        ]
    },
    {
        id: 'binance',
        name: 'Binance Pay',
        icon: <Wallet className="w-4 h-4" />,
        color: 'text-yellow-400',
        details: [
            { label: 'Email / PayID', value: 'cesar.ascanio@gmail.com' },
            { label: 'Nombre', value: 'César Ascanio' }
        ]
    },
    {
        id: 'paypal',
        name: 'PayPal',
        icon: <Globe className="w-4 h-4" />,
        color: 'text-blue-400',
        details: [
            { label: 'Email', value: 'cesar.ascanio@gmail.com' },
            { label: 'Nota', value: 'Pagar como "Amigos y Familia"' }
        ]
    },
    {
        id: 'transferencia',
        name: 'Transferencia',
        icon: <CreditCard className="w-4 h-4" />,
        color: 'text-purple-400',
        details: [
            { label: 'Banco', value: 'Mercantil' },
            { label: 'Cuenta', value: '0105-XXXX-XX-XXXXXXXXXX' },
            { label: 'Nombre', value: 'Corporación MediVisit' }
        ]
    }
];

export const ManualPaymentDialog = ({ open, onOpenChange, planName, amount }: ManualPaymentDialogProps) => {
    const { toast } = useToast();
    const { reportManualPayment } = useBilling();
    const [step, setStep] = useState<'info' | 'report'>('info');
    const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
    const [reference, setReference] = useState('');
    const [uploading, setUploading] = useState(false);
    const [proofUrl, setProofUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado", description: "Dato copiado al portapapeles." });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `proofs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath);

            setProofUrl(publicUrl);
            toast({ title: "Archivo subido", description: "Captura de pantalla recibida." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error al subir", description: error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!reference) {
            toast({ variant: 'destructive', title: "Falta información", description: "Por favor ingresa el número de referencia." });
            return;
        }

        setIsSubmitting(true);
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount.replace('$', ''));

        const success = await reportManualPayment({
            planId: planName,
            method: selectedMethod.name,
            reference: reference,
            amount: numericAmount,
            proofUrl: proofUrl || undefined
        });

        if (success) {
            onOpenChange(false);
            setStep('info');
            setReference('');
            setProofUrl(null);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white overflow-hidden p-0 gap-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {step === 'info' ? 'Métodos de Pago (Venezuela)' : 'Reportar Pago'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {step === 'info'
                                ? `Estás adquiriendo el plan ${planName} por ${amount}/mes.`
                                : 'Completa los datos para verificar tu pago.'}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 'info' ? (
                        <div className="space-y-6">
                            {/* Tabs-like selector */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {PAYMENT_METHODS.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${selectedMethod.id === method.id
                                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                            : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`${method.color}`}>
                                            {method.icon}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{method.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Details Card */}
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                    Instrucciones para {selectedMethod.name}
                                </h4>
                                <div className="space-y-3">
                                    {selectedMethod.details.map((detail, idx) => (
                                        <div key={idx} className="flex justify-between items-center group">
                                            <span className="text-xs text-slate-500">{detail.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-200">{detail.value}</span>
                                                <button
                                                    onClick={() => copyToClipboard(detail.value)}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                >
                                                    <Copy className="w-3 h-3 text-emerald-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={() => setStep('report')}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 shadow-lg shadow-emerald-500/20"
                            >
                                Ya realicé el pago
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="reference" className="text-slate-300">Número de Referencia / ID Transacción</Label>
                                <Input
                                    id="reference"
                                    placeholder="Ej: 12345678"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    className="bg-slate-800 border-slate-700 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Comprobante (Opcional)</Label>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        className="hidden"
                                        id="proof-upload"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="proof-upload"
                                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer ${proofUrl
                                            ? 'border-emerald-500/50 bg-emerald-500/5'
                                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        {uploading ? (
                                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                        ) : proofUrl ? (
                                            <>
                                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                                                <span className="text-xs text-emerald-400 font-medium">¡Captura lista!</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
                                                <span className="text-xs text-slate-400">Clic para subir captura</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep('info')}
                                    className="flex-1 border-slate-700 hover:bg-slate-800"
                                >
                                    Volver
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !reference}
                                    className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Reporte'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-800/30 p-4 text-center border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                        <Check className="w-3 h-3 text-emerald-500" /> Activación manual en menos de 2 horas (08:00 - 20:00)
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
