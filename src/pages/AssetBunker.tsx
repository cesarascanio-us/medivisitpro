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
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <ShieldAlert className="h-20 w-20 text-destructive animate-pulse" />
                <h1 className="text-2xl font-black text-foreground">ACCESO RESTRINGIDO</h1>
                <p className="text-muted-foreground">Requiere nivel de seguridad "Bunker Protocol" (Manager+)</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -ml-20 -mb-20"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
                            Secure Asset Repository
                        </Badge>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4">
                                BÚNKER <span className="text-indigo-400">DE ACTIVOS</span>
                                <ShieldCheck className="h-10 w-10 text-emerald-400" />
                            </h1>
                            <p className="text-slate-400 mt-2 text-lg font-medium max-w-xl">
                                Almacén centralizado de artefactos legales, financieros y promocionales con cifrado militar y trazabilidad total.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SecurityStat icon={<Lock />} label="Encrypted" value="1,248" />
                        <SecurityStat icon={<UserCheck />} label="Verified" value="100%" />
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-muted p-1 rounded-2xl w-full md:w-auto">
                    <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="Todos" />
                    <TabButton active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} label="Legal" icon={<ShieldCheck className="h-4 w-4" />} />
                    <TabButton active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} label="Marketing" icon={<Briefcase className="h-4 w-4" />} />
                    <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label="Finanzas" icon={<DollarSign className="h-4 w-4" />} />
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Buscar artefactos..." 
                        className="pl-12 rounded-2xl border-border bg-background/50 backdrop-blur-sm focus:bg-background transition-all shadow-sm h-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Upload Placeholder */}
                <Card className="border-2 border-dashed border-border bg-muted/20 hover:bg-card hover:border-primary transition-all cursor-pointer group rounded-3xl flex flex-col items-center justify-center p-8 min-h-[220px]">
                    <div className="p-4 bg-primary/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-bold text-foreground">Subir Activo</p>
                    <p className="text-xs text-muted-foreground">Drag & Drop o Click</p>
                </Card>

                {filteredAssets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} />
                ))}
            </div>

            {/* Recent Activity / Digital Signatures */}
            <Card className="border-border shadow-card rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border p-6 px-8">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-black text-foreground flex items-center gap-3">
                            <History className="h-5 w-5 text-primary" />
                            Registro de Firmas Digitales (Vault)
                        </CardTitle>
                        <Button variant="ghost" className="text-primary font-bold hover:bg-primary/10 rounded-xl">
                            Ver Historial Completo
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
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                active ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
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
        <Card className="border-border hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 rounded-[2rem] overflow-hidden bg-card shadow-card group">
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-4 bg-muted/50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                        {getIcon()}
                    </div>
                    {asset.encrypted && (
                        <Badge variant="outline" className="border-primary/20 text-primary font-black rounded-full text-[9px] uppercase tracking-tighter bg-primary/5">
                            <Key className="h-3 w-3 mr-1" /> Encrypted
                        </Badge>
                    )}
                </div>
                <div>
                    <Badge className={`mb-2 font-bold uppercase text-[9px] tracking-widest ${categoryColors[asset.category] || 'bg-slate-50'}`}>
                        {asset.category}
                    </Badge>
                    <h3 className="font-bold text-foreground truncate mb-1" title={asset.name}>{asset.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{asset.size}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span>{asset.updatedAt}</span>
                    </p>
                </div>
                <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs font-bold border-border hover:bg-muted/30">
                        <History className="h-3 w-3 mr-2" /> Historial
                    </Button>
                    <Button className="flex-1 rounded-xl h-9 text-xs font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 text-white">
                        <Download className="h-3 w-3 mr-2" /> Abrir
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SignatureEntry({ name, entity, date, status }: any) {
    return (
        <div className="px-8 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${status === 'verified' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                    <FileSignature className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-bold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">Firmante: <span className="font-medium text-foreground/80">{entity}</span></p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground mb-1">{date}</p>
                <div className="flex items-center gap-1 justify-end">
                    <div className={`w-2 h-2 rounded-full ${status === 'verified' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground">{status === 'verified' ? 'Verificada' : 'Archivada'}</span>
                </div>
            </div>
        </div>
    );
}
