/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
    DollarSign
} from "lucide-react";
import { EliteHeader, EliteKPICard } from "@/components/layout/DesignSystem";
import { useTexts } from "@/hooks/useTexts";

interface Asset {
    id: string;
    name: string;
    type: string;
    category: 'legal' | 'marketing' | 'finance';
    size: string;
    updatedAt: string;
    encrypted?: boolean;
}

export default function DocumentCenter() {
    const t = useTexts();
    const { isMaster, isAdmin, isManager } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'legal' | 'marketing' | 'finance'>('all');
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            // Mock documents
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
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || asset.category === activeTab;
        return matchesSearch && matchesTab;
    });


    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <EliteHeader
                title={t.documents_title}
                subtitle={t.documents_subtitle}
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
                <div className="flex bg-muted/20 p-1 rounded-lg w-full md:w-auto border border-border/40">
                    <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="Todos" />
                    <TabButton active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} label="Legal" icon={<ShieldCheck className="h-4 w-4" />} />
                    <TabButton active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} label="Marketing" icon={<Briefcase className="h-4 w-4" />} />
                    <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label="Finanzas" icon={<DollarSign className="h-4 w-4" />} />
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-4 w-4 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Buscar documentos..." 
                        className="pl-12 rounded-lg border-none bg-muted/20 shadow-inner focus:ring-2 focus:ring-primary/20 transition-all h-10 font-semibold text-xs text-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <Card className="border-2 border-dashed border-border/40 bg-muted/5 hover:bg-muted/10 hover:border-primary transition-all cursor-pointer group rounded-lg flex flex-col items-center justify-center p-8 min-h-[220px] shadow-premium-md">
                    <div className="p-4 bg-primary/10 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-bold text-foreground text-sm">Subir Documento</p>
                    <p className="text-xs text-muted-foreground">PDF, XLSX o Imágenes</p>
                </Card>

                {filteredAssets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} />
                ))}
            </div>

            <Card className="border-border/40 shadow-premium-md rounded-lg overflow-hidden bg-card">
                <CardHeader className="bg-muted/5 border-b border-border/40 p-6 px-8">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-bold text-foreground flex items-center gap-3 tracking-tight">
                            <History className="h-5 w-5 text-primary" />
                            Historial de Acuerdos Firmados
                        </CardTitle>
                        <Button variant="ghost" size="sm">
                            Ver historial completo
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
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

function TabButton({ active, onClick, label, icon }: any) {
    return (
        <Button 
            variant={active ? "default" : "ghost"}
            size="sm"
            onClick={onClick}
            className="flex items-center gap-2 rounded-lg"
        >
            {icon}
            {label}
        </Button>
    );
}

function AssetCard({ asset }: { asset: Asset }) {
    const getIcon = () => {
        if (asset.type === 'pdf') return <FileText className="h-6 w-6 text-rose-500" />;
        if (asset.type === 'xlsx') return <FileText className="h-6 w-6 text-emerald-500" />;
        if (asset.type === 'png') return <FileImage className="h-6 w-6 text-amber-500" />;
        return <FileText className="h-6 w-6 text-indigo-500" />;
    };

    const categoryColors: any = {
        legal: "bg-emerald-500/10 text-emerald-400",
        marketing: "bg-indigo-500/10 text-indigo-400",
        finance: "bg-amber-500/10 text-amber-400"
    };

    return (
        <Card className="border-border/40 hover:shadow-premium-md transition-all duration-300 rounded-lg overflow-hidden bg-card shadow-premium-md group">
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-4 bg-muted/20 rounded-lg group-hover:bg-primary/10 transition-colors">
                        {getIcon()}
                    </div>
                    {asset.encrypted && (
                        <Badge variant="outline" className="border-primary/20 text-primary font-bold rounded-full text-[10px] bg-primary/5 shadow-none">
                            <Key className="h-3 w-3 mr-1" /> Protegido
                        </Badge>
                    )}
                </div>
                <div>
                    <Badge variant="outline" className={`mb-2 font-bold text-[10px] uppercase tracking-wider rounded-lg border-none ${categoryColors[asset.category] || 'bg-muted/30'}`}>
                        {asset.category}
                    </Badge>
                    <h3 className="font-bold text-foreground truncate mb-1 text-sm tracking-tight" title={asset.name}>{asset.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                        <span>{asset.size}</span>
                        <span className="w-1 h-1 rounded-full bg-border/40"></span>
                        <span>{asset.updatedAt}</span>
                    </p>
                </div>
                <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                        <History className="h-3 w-3 mr-2 text-primary" /> Historial
                    </Button>
                    <Button variant="default" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-2" /> Abrir
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SignatureEntry({ name, entity, date, status }: any) {
    return (
        <div className="px-8 py-5 flex items-center justify-between hover:bg-muted/10 transition-colors group">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted/30 text-muted-foreground'}`}>
                    <FileSignature className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-bold text-foreground text-sm tracking-tight">{name}</p>
                    <p className="text-xs text-muted-foreground font-medium">Firmante: <span className="text-foreground font-bold">{entity}</span></p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground mb-1.5">{date}</p>
                <div className="flex items-center gap-2 justify-end">
                    <div className={`w-2 h-2 rounded-full ${status === 'verified' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-muted/40'}`}></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{status === 'verified' ? 'Verificada' : 'Archivada'}</span>
                </div>
            </div>
        </div>
    );
}
