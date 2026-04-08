/* ========================================================================
 MASTER DESIGN SYSTEM - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
 
 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 ======================================================================== */

import React, { useState } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EliteColumn<T> {
    header: string;
    key: keyof T | string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface EliteTableProps<T> {
    data: T[];
    columns: EliteColumn<T>[];
    searchKey?: keyof T;
    searchPlaceholder?: string;
    onRowClick?: (item: T) => void;
    className?: string;
    pageSize?: number;
}

export function EliteTable<T>({ 
    data, 
    columns, 
    searchKey, 
    searchPlaceholder = "Buscar registros...",
    onRowClick,
    className,
    pageSize = 10
}: EliteTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = data.filter(item => {
        if (!searchTerm || !searchKey) return true;
        const value = item[searchKey];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = filteredData.slice(startIndex, startIndex + pageSize);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Table Search & Tools */}
            {searchKey && (
                <div className="relative group max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-14 h-16 bg-muted/30 border-border rounded-2xl text-sm font-bold placeholder:text-muted-foreground/50 focus-visible:ring-primary/40 focus-visible:border-primary/20 transition-all text-foreground"
                    />
                </div>
            )}

            {/* Table Container */}
            <div className="bg-card/50 border border-border rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-border hover:bg-transparent">
                            {columns.map((col, idx) => (
                                <TableHead key={idx} className={cn("py-8 px-8 text-[11px] font-black uppercase text-muted-foreground tracking-[0.3em]", col.className)}>
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length > 0 ? (
                            currentData.map((item, rowIdx) => (
                                <TableRow 
                                    key={rowIdx} 
                                    onClick={() => onRowClick?.(item)}
                                    className="border-border hover:bg-muted/20 transition-all group cursor-pointer"
                                >
                                    {columns.map((col, colIdx) => (
                                        <TableCell key={colIdx} className={cn("py-6 px-8", col.className)}>
                                            {col.render ? col.render(item) : (
                                                <span className="text-foreground font-bold tracking-tight">
                                                    {String(item[col.key as keyof T] || '')}
                                                </span>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-20 text-muted-foreground">
                                        <Inbox className="h-12 w-12" />
                                        <p className="text-sm font-bold uppercase tracking-widest">Sin registros encontrados</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-8 border-t border-border flex items-center justify-between bg-muted/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Mostrando {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="h-10 w-10 rounded-xl hover:bg-accent"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <span className="text-xs font-black text-foreground px-2">
                                {currentPage} / {totalPages}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="h-10 w-10 rounded-xl hover:bg-accent"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
