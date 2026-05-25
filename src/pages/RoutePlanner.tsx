/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UserPlus, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const DAYS_OF_WEEK = [
  { id: "Lunes", label: "Lunes" },
  { id: "Martes", label: "Martes" },
  { id: "Miércoles", label: "Miércoles" },
  { id: "Jueves", label: "Jueves" },
  { id: "Viernes", label: "Viernes" },
];

export default function RoutePlanner() {
  const { user, organizationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("Lunes");

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const [docsRes, pharmsRes] = await Promise.all([
        supabase.from("doctors").select("id, name, specialty, days"),
        supabase.from("pharmacies").select("id, name, address, schedule")
      ]);

      if (docsRes.data) setDoctors(docsRes.data);
      if (pharmsRes.data) setPharmacies(pharmsRes.data);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Error al cargar los contactos");
    } finally {
      setLoading(false);
    }
  };

  const assignToDay = async (type: "doctor" | "pharmacy", id: string, currentDays: string | null) => {
    try {
      let daysArray = currentDays ? currentDays.split(",").map(d => d.trim()) : [];
      
      if (daysArray.includes(selectedDay)) {
        // Remove
        daysArray = daysArray.filter(d => d !== selectedDay);
      } else {
        // Add
        daysArray.push(selectedDay);
      }
      
      const newDaysStr = daysArray.join(", ");

      if (type === "doctor") {
        await supabase.from("doctors").update({ days: newDaysStr }).eq("id", id);
        setDoctors(doctors.map(d => d.id === id ? { ...d, days: newDaysStr } : d));
      } else {
        await supabase.from("pharmacies").update({ schedule: newDaysStr }).eq("id", id);
        setPharmacies(pharmacies.map(p => p.id === id ? { ...p, schedule: newDaysStr } : p));
      }

      toast.success("Ruta actualizada exitosamente");
    } catch (error) {
      console.error("Error updating route:", error);
      toast.error("No se pudo actualizar la ruta");
    }
  };

  const getFilteredContacts = (list: any[], type: "doctor" | "pharmacy") => {
    return list.filter(item => {
      const isMatch = item.name.toLowerCase().includes(search.toLowerCase());
      const hasDay = type === "doctor" 
        ? item.days?.includes(selectedDay) 
        : item.schedule?.includes(selectedDay);
      return isMatch;
    });
  };

  const hasDay = (item: any, type: "doctor" | "pharmacy") => {
     return type === "doctor" 
        ? item.days?.includes(selectedDay) 
        : item.schedule?.includes(selectedDay);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="text-primary" />
            Planificador de Rutas Semanales
          </h1>
          <p className="text-muted-foreground">Asigna médicos y farmacias a los días de la semana</p>
        </div>
      </div>

      <div className="flex gap-2 p-2 bg-muted/30 rounded-2xl overflow-x-auto">
        {DAYS_OF_WEEK.map((day) => (
          <Button
            key={day.id}
            variant={selectedDay === day.id ? "default" : "ghost"}
            className={`rounded-xl flex-1 min-w-[100px] ${selectedDay === day.id ? "shadow-md" : ""}`}
            onClick={() => setSelectedDay(day.id)}
          >
            {day.label}
          </Button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar contacto para agregar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="medical-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg">Médicos asignados a {selectedDay}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {getFilteredContacts(doctors, "doctor").map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-semibold">{doc.name}</h4>
                    <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                    {doc.days && <p className="text-[10px] mt-1 text-primary">Rutas: {doc.days}</p>}
                  </div>
                  <Button 
                    variant={hasDay(doc, "doctor") ? "default" : "outline"}
                    size="sm"
                    className="rounded-lg"
                    onClick={() => assignToDay("doctor", doc.id, doc.days)}
                  >
                    {hasDay(doc, "doctor") ? "Quitar" : "Asignar"}
                  </Button>
                </div>
              ))}
              {getFilteredContacts(doctors, "doctor").length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">No hay médicos</p>
              )}
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg">Farmacias asignadas a {selectedDay}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {getFilteredContacts(pharmacies, "pharmacy").map(pharm => (
                <div key={pharm.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-semibold">{pharm.name}</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{pharm.address}</p>
                    {pharm.schedule && <p className="text-[10px] mt-1 text-primary">Rutas: {pharm.schedule}</p>}
                  </div>
                  <Button 
                    variant={hasDay(pharm, "pharmacy") ? "default" : "outline"}
                    size="sm"
                    className="rounded-lg"
                    onClick={() => assignToDay("pharmacy", pharm.id, pharm.schedule)}
                  >
                    {hasDay(pharm, "pharmacy") ? "Quitar" : "Asignar"}
                  </Button>
                </div>
              ))}
              {getFilteredContacts(pharmacies, "pharmacy").length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">No hay farmacias</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
