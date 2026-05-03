/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
    ShieldAlert, 
    Lock, 
    Folder, 
    FileText, 
    ShieldCheck, 
    FileSignature, 
    History, 
    Download, 
    Search,
    Plus,
    Key,
    UserCheck,
    Briefcase,
    FileImage,
    FileArchive,
    DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";

interface Asset {
    id: string;
    name: string;
    type: string;
    category: 'legal' | 'marketing' | 'finance';
    size: string;
    updatedAt: string;
    encrypted?: boolean;
}

export default function AssetBunker() {
    const { user, isMaster, isAdmin, isManager } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'legal' | 'marketing' | 'finance'>('all');
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            setLoading(true);
            // Simulating fetching artifacts (in Phase 4 we will integrate with real storage)
            const mockAssets: Asset[] = [
                { id: "1", name: "Contrato_Master_SaaS_2026.pdf", type: "pdf", category: 'legal', size: "1.2 MB", updatedAt: "2026-03-01", encrypted: true },
                { id: "2", name: "Visual_Aid_Lanzamiento_Cardio.pdf", type: "pdf", category: 'marketing', size: "4.5 MB", updatedAt: "2026-03-10", encrypted: false },
                { id: "3", name: "Balance_General_Q1_2026.xlsx", type: "xlsx", category: 'finance', size: "850 KB", updatedAt: "2026-03-12", encrypted: true },
                { id: "4", name: "Firma_Compromiso_Dr_Ascanio.png", type: "png", category: 'legal', size: "320 KB", updatedAt: "2026-03-14", encrypted: true },
                { id: "5", name: "Manual_Identidad_Corporativa.zip", type: "zip", category: 'marketing', size: "12.8 MB", updatedAt: "2026-02-15", encrypted: false },
            ];
            setAssets(mockAssets);
        } catch (error) {
            console.error('Error loading assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || asset.category === activeTab;
        return matchesSearch && matchesTab;
    });

    if (!isMaster && !isAdmin && !isManager) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="p-6 bg-rose-50 rounded-full">
                    <ShieldAlert className="h-16 w-16 text-rose-500" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Acceso Restringido</h1>
                    <p className="text-slate-500 max-w-xs mx-auto">Esta sección requiere permisos de nivel gerencial o superior para visualizar documentos sensibles.</p>
                </div>
                <Button variant="outline" className="rounded-xl font-bold" onClick={() => window.history.back()}>
                    Regresar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <EliteHeader
                title="Almacén de Activos"
                subtitle="Repositorio centralizado de documentos legales, financieros y promocionales"
                icon={Folder}
                badgeText="Repositorio"
                statusText="Seguro"
                statusColor="bg-emerald-500"
                rightContent={
                    <div className="flex items-center gap-4">
                        <EliteKPICard
                            title="Protegidos"
                            value="1,248"
                            icon={Lock}
                            color="blue"
                            className="hidden md:flex h-20"
                        />
                        <EliteKPICard
                            title="Verificados"
                            value="100%"
                            icon={UserCheck}
                            color="emerald"
                            className="hidden md:flex h-20"
                        />
                    </div>
                }
            />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-slate-50 p-1 rounded-2xl w-full md:w-auto border border-slate-100">
                    <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="Todos" />
                    <TabButton active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} label="Legal" icon={<ShieldCheck className="h-4 w-4" />} />
                    <TabButton active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} label="Marketing" icon={<Briefcase className="h-4 w-4" />} />
                    <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label="Finanzas" icon={<DollarSign className="h-4 w-4" />} />
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Buscar documentos..." 
                        className="pl-12 rounded-2xl border-none bg-slate-50 shadow-inner focus:ring-2 focus:ring-primary/20 transition-all h-12 font-semibold text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary transition-all cursor-pointer group rounded-[2rem] flex flex-col items-center justify-center p-8 min-h-[220px] shadow-sm">
                    <div className="p-4 bg-primary/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-bold text-slate-700">Subir Documento</p>
                    <p className="text-xs text-slate-400">PDF, XLSX o Imágenes</p>
                </Card>

                {filteredAssets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} />
                ))}
            </div>

            <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-6 px-8">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                            <History className="h-5 w-5 text-primary" />
                            Registro de firmas digitales
                        </CardTitle>
                        <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl text-xs">
                            Ver historial completo
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                        <SignatureEntry 
                            name="Firma de Compromiso IP" 
                            entity="Dr. César Ascanio" 
                            date="Hace 2 horas" 
                            status="verified"
                        />
                        <SignatureEntry 
                            name="Recepción de Stock Muestras" 
                            entity="Farmacia Central" 
                            date="Ayer, 14:30" 
                            status="verified"
                        />
                        <SignatureEntry 
                            name="Convenio de Cooperación" 
                            entity="Droguería Nena" 
                            date="12 Mar 2026" 
                            status="archived"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function SecurityStat({ icon, label, value }: any) {
    return (
        <div className="bg-background/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-2 bg-background/10 rounded-xl text-primary">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{label}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, icon }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-xs transition-all ${
                active ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function AssetCard({ asset }: { asset: Asset }) {
    const getIcon = () => {
        if (asset.type === 'pdf') return <FileText className="h-6 w-6 text-rose-500" />;
        if (asset.type === 'xlsx') return <FileText className="h-6 w-6 text-emerald-500" />;
        if (asset.type === 'png') return <FileImage className="h-6 w-6 text-amber-500" />;
        return <FileArchive className="h-6 w-6 text-indigo-500" />;
    };

    const categoryColors: any = {
        legal: "bg-emerald-50 text-emerald-600",
        marketing: "bg-indigo-50 text-indigo-600",
        finance: "bg-amber-50 text-amber-600"
    };

    return (
        <Card className="border-slate-100 hover:shadow-md transition-all duration-300 rounded-[2rem] overflow-hidden bg-card shadow-sm group">
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-primary/5 transition-colors">
                        {getIcon()}
                    </div>
                    {asset.encrypted && (
                        <Badge variant="outline" className="border-primary/20 text-primary font-bold rounded-full text-[10px] bg-primary/5 shadow-none">
                            <Key className="h-3 w-3 mr-1" /> Protegido
                        </Badge>
                    )}
                </div>
                <div>
                    <Badge variant="outline" className={`mb-2 font-bold text-[9px] uppercase tracking-wider rounded-lg border-none ${categoryColors[asset.category] || 'bg-slate-50'}`}>
                        {asset.category}
                    </Badge>
                    <h3 className="font-bold text-slate-900 truncate mb-1 text-sm tracking-tight" title={asset.name}>{asset.name}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 font-medium">
                        <span>{asset.size}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span>{asset.updatedAt}</span>
                    </p>
                </div>
                <div className="flex gap-2 pt-2">
                    <Button variant="ghost" className="flex-1 rounded-xl h-9 text-xs font-bold text-slate-500 hover:bg-slate-50">
                        <History className="h-3 w-3 mr-2 text-primary" /> Historial
                    </Button>
                    <Button className="flex-1 rounded-xl h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-sm">
                        <Download className="h-3 w-3 mr-2" /> Abrir
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SignatureEntry({ name, entity, date, status }: any) {
    return (
        <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-2xl ${status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                    <FileSignature className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm tracking-tight">{name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Firmante: <span className="text-slate-600 font-bold">{entity}</span></p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 mb-1.5">{date}</p>
                <div className="flex items-center gap-2 justify-end">
                    <div className={`w-2 h-2 rounded-full ${status === 'verified' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{status === 'verified' ? 'Verificada' : 'Archivada'}</span>
                </div>
            </div>
        </div>
    );
}
