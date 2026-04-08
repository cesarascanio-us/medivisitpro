/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { OrganizationSwitcher } from "../organization/OrganizationSwitcher";

export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-foreground hover:bg-muted"
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="p-0 bg-sidebar border-r border-sidebar-border w-64 max-w-[85vw] flex flex-col"
            >
                <div className="p-4 border-b border-sidebar-border">
                    <OrganizationSwitcher />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Sidebar className="border-none shadow-none w-full" isMobile={true} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
