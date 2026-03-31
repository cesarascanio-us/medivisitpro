/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    FileText,
    Scale,
    Calendar,
    TrendingUp,
    ShieldCheck,
    Search,
    Filter,
    Plus,
    ChevronRight,
    UserRound,
    FileCheck,
    Calculator,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

// Simulated Employee Data for RRHH (LOTTT Compliant)
const EMPLOYEES = [
    {
        id: "1",
        name: "César Ascanio",
        role: "Director General",
        hireDate: "2024-01-15",
        status: "activo",
        salary: 2500,
        lottt_status: "100% cumplido",
        pending_vacations: 0,
        seniority_months: 26
    },
    {
        id: "2",
        name: "Humberto Venta",
        role: "Representante Senior",
        hireDate: "2024-03-01",
        status: "activo",
        salary: 1200,
        lottt_status: "Pendiente Anexo 142",
        pending_vacations: 15,
        seniority_months: 24
    },
    {
        id: "3",
        name: "Darly Morffe",
        role: "Supervisora de Campo",
        hireDate: "2024-06-12",
        status: "activo",
        salary: 1500,
        lottt_status: "100% cumplido",
        pending_vacations: 5,
        seniority_months: 20
    }
];

export default function HumanResources() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
            {/* Header Estilo Corporate White */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                        <UserRound className="h-8 w-8 text-primary" />
                        Talento Humano (RRHH)
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Gestión integral bajo normativa <span className="font-bold text-primary italic">LOTTT</span> (V01-CA)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                        <Scale className="h-4 w-4" />
                        Auditoría Legal
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        Nuevo Contrato
                    </Button>
                </div>
            </div>

            {/* KPI Cards Nivel Dios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Colaboradores", value: "32", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Cumplimiento LOTTT", value: "94.2%", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Bonus Vacacional", value: "$4,250", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Fondo Prestaciones", value: "$12,8K", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
                            <div className={cn("absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity", kpi.bg)} />
                            <CardContent className="p-6 relative">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{kpi.label}</p>
                                    <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                                </div>
                                <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{kpi.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Tabs System */}
            <Tabs defaultValue="directory" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 border border-slate-200">
                    <TabsTrigger value="directory" className="gap-2">
                        <Users className="h-4 w-4" /> Directorio
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="gap-2">
                        <Scale className="h-4 w-4" /> Legal & LOTTT
                    </TabsTrigger>
                    <TabsTrigger value="simulator" className="gap-2">
                        <Calculator className="h-4 w-4" /> Simulador Prestaciones
                    </TabsTrigger>
                </TabsList>

                {/* Directorio de Empleados */}
                <TabsContent value="directory" className="mt-6 space-y-4">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nombre, cargo o rol..."
                                className="pl-10 border-slate-200 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" /> Filtros
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EMPLOYEES.map((employee) => (
                            <Card key={employee.id} className="corporate-card group overflow-hidden border-none shadow-sm">
                                <CardHeader className="p-0">
                                    <div className="h-2 bg-primary/80 group-hover:bg-primary transition-colors" />
                                    <div className="p-6 pb-2 flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
                                            <UserRound className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <Badge variant={employee.status === 'activo' ? 'success' : 'outline'} className="uppercase text-[10px] tracking-tighter">
                                            {employee.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-2">
                                    <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{employee.role}</p>

                                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Antigüedad</p>
                                            <p className="text-sm font-semibold text-slate-700">{employee.seniority_months} meses</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Cumplimiento</p>
                                            <p className="text-sm font-semibold text-primary">{employee.lottt_status}</p>
                                        </div>
                                    </div>

                                    <Button variant="ghost" className="w-full mt-6 gap-2 text-slate-600 hover:text-primary hover:bg-primary/5">
                                        Ver Expediente Completo
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Módulo Legal LOTTT */}
                <TabsContent value="legal" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileCheck className="h-5 w-5 text-primary" />
                                    Bóveda de Documentos Legales
                                </CardTitle>
                                <CardDescription>Gestión de anexos obligatorios según Art. 142 y 190 LOTTT</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { doc: "Anexo Cálculo Prestaciones Anual", date: "2026-01-30", status: "Certificado" },
                                        { doc: "Libro de Control de Vacaciones", date: "2026-02-15", status: "Actualizado" },
                                        { doc: "Contrato de Confidencialidad (NDA)", date: "2026-02-20", status: "Firma Pendiente" },
                                        { doc: "Reporte Salud Ocupacional", date: "2025-12-05", status: "Vencido" }
                                    ].map((doc) => (
                                        <div key={doc.doc} className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{doc.doc}</p>
                                                    <p className="text-[10px] text-slate-500">Última actualización: {doc.date}</p>
                                                </div>
                                            </div>
                                            <Badge variant={doc.status === 'Certificado' || doc.status === 'Actualizado' ? 'success' : doc.status === 'Vencido' ? 'destructive' : 'warning'}>
                                                {doc.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                                    <AlertCircle className="h-5 w-5" />
                                    Alertas de Calidad (Audit)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-white rounded-lg border border-primary/20 shadow-sm">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Prioridad Alta</p>
                                    <p className="text-xs font-semibold text-slate-800">Actualizar Expediente Morffe</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Falta anexo legal de antigüedad Art. 142 para Q1 2026.</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Próxima Visita</p>
                                    <p className="text-xs font-semibold text-slate-800">Cierre de Ciclo Vacacional</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Humberto Venta debe tomar 15 días antes de Marzo.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="simulator" className="mt-6">
                    <Card className="border-none shadow-sm max-w-2xl mx-auto">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold tracking-tight">Simulador de Prestaciones LOTTT</CardTitle>
                            <CardDescription>Cálculo estimado de liquidaciones y prestaciones sociales acumuladas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Fecha de Ingreso</label>
                                    <Input type="date" className="border-slate-200" defaultValue="2024-01-15" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Último Salario Base ($)</label>
                                    <Input type="number" className="border-slate-200" defaultValue="1500" />
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-600">Días Acumulados (75% Antigüedad)</span>
                                    <span className="font-bold text-slate-800">45 días</span>
                                </div>
                                <div className="flex justify-between items-center mb-4 border-t border-slate-200 pt-4">
                                    <span className="text-slate-600 font-medium">TOTAL ESTIMADO PRESTACIONES</span>
                                    <span className="text-2xl font-bold text-primary tracking-tighter">$2,250.00</span>
                                </div>
                            </div>
                            <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20">Generar Reporte PDF Legal</Button>
                            <p className="text-[10px] text-center text-slate-400 italic">Este simulador es de carácter informativo. Los montos finales dependen de la auditoría contable oficial de Empresa CA.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

