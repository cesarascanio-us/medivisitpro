/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   
   PRUEBA DE CONCEPTO: OPTIMIZADOR DE RUTA (LEAD MAGNET)
   Nivel de Acceso: PÚBLICO
   ======================================================================== */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Navigation, CheckCircle2, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { geocodeAddress } from "@/services/nominatimService";
import { optimizeRoute, formatDistance, formatDuration } from "@/services/osrmService";
import LeafletMap, { MapMarker } from "@/components/map/LeafletMap";
import { motion, AnimatePresence } from "framer-motion";

export default function RouteOptimizer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([
    "Av. Bolívar, Maracay, Aragua",
    "CC Hyper Jumbo, Maracay",
    "Hospital Central de Maracay"
  ]);
  const [routeData, setRouteData] = useState<any>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [center, setCenter] = useState<[number, number]>([10.2542, -67.5922]);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const coords = await Promise.all(
        addresses.map(async (addr, index) => {
          const res = await geocodeAddress(addr);
          return res ? { ...res, id: `point-${index}`, name: addr } : null;
        })
      );

      const validPoints = coords.filter((p): p is any => p !== null);

      if (validPoints.length < 2) {
        alert("Por favor, ingrese al menos 2 direcciones válidas.");
        return;
      }

      const start = validPoints[0];
      const destinationPoints = validPoints.slice(1);

      const result = await optimizeRoute(
        { lat: start.lat, lng: start.lng },
        destinationPoints.map(p => ({ lat: p.lat, lng: p.lng, id: p.id }))
      );

      if (result) {
        setRouteData(result);
        const newMarkers: MapMarker[] = validPoints.map(p => ({
          id: p.id,
          position: [p.lat, p.lng],
          type: p.id === 'point-0' ? 'doctor' : 'hospital',
          name: p.name,
          popupContent: <div className="p-2 font-sans"><strong>{p.name}</strong></div>
        }));
        setMarkers(newMarkers);
        setCenter([start.lat, start.lng]);
      }
    } catch (error) {
      console.error("Error optimizando ruta:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4 border-blue-500/50 text-blue-400 bg-blue-500/5 px-3 py-1 uppercase tracking-widest text-[10px] font-bold">
              MediVisitPro Elite Tool
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 italic uppercase">
              Optimizador de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ruta Inteligente</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-light">
              Experimente el poder de la geolocalización industrial. Planifique sus visitas médicas con precisión soberana.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Side */}
          <motion.div 
            className="lg:col-span-4 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl border-t-blue-500/20 shadow-2xl overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-400" /> Parámetros de Ruta
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ingrese las direcciones de sus visitas para el ciclo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-1/2 bg-blue-500 transition-all duration-300 rounded-full" />
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block tracking-wider">
                      {idx === 0 ? "Punto de Inicio" : `Visita ${idx}`}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <Input
                        value={addr}
                        onChange={(e) => {
                          const newAddrs = [...addresses];
                          newAddrs[idx] = e.target.value;
                          setAddresses(newAddrs);
                        }}
                        className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-700 focus:border-blue-500/50 transition-all duration-300 h-11"
                        placeholder="Ej: Calle 1, Sector X..."
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleOptimize} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 group relative overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                  <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest text-xs">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                    Optimizar Ahora
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </CardFooter>
            </Card>

            <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm">
                <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Soberanía de Datos
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                    Esta herramienta utiliza **OpenStreetMap** y **OSRM**, garantizando que sus rutas no dependan de APIs propietarias costosas. 100% privacidad, 0% rastreo de Google/Bing.
                </p>
            </div>
          </motion.div>

          {/* Map Side */}
          <motion.div 
            className="lg:col-span-8 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="absolute inset-0 border-2 border-blue-500/0 group-hover:border-blue-500/10 transition-colors duration-500 z-20 pointer-events-none" />
              <LeafletMap 
                center={center}
                zoom={14}
                markers={markers}
                height="500px"
              />
              
              <AnimatePresence>
                {routeData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none"
                  >
                    <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 p-6 rounded-2xl shadow-3xl pointer-events-auto flex flex-wrap gap-8 items-center justify-between border-b-emerald-500/30">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Distancia Total</p>
                          <p className="text-2xl font-black text-white italic tracking-tighter tabular-nums">{formatDistance(routeData.totalDistance)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Tiempo Estimado</p>
                          <p className="text-2xl font-black text-white italic tracking-tighter tabular-nums">{formatDuration(routeData.totalDuration)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ruta Optimizada
                          </p>
                          <p className="text-[10px] text-slate-500 font-light italic">Algoritmo TSP v2.0</p>
                        </div>
                        <Button 
                          onClick={() => navigate('/auth')}
                          variant="outline" 
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 transition-all font-bold px-6 py-6 group"
                        >
                          PROBAR APP <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: <Zap className="w-4 h-4" />, title: "Velocidad Elite", desc: "Resultados en <2s" },
                    { icon: <Navigation className="w-4 h-4" />, title: "Mapas Libres", desc: "Basado en OSM" },
                    { icon: <ShieldCheck className="w-4 h-4" />, title: "Seguro", desc: "Data Encriptada" }
                ].map((feature, i) => (
                    <div key={i} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center gap-4 group hover:border-slate-700 transition-colors">
                        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-colors">
                            {feature.icon}
                        </div>
                        <div>
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider">{feature.title}</h5>
                            <p className="text-[10px] text-slate-500 font-light">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </motion.div>
        </div>
        
        {/* Footer Branding */}
        <div className="mt-20 pt-10 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-black text-[10px] text-white">CA</div>
                <span className="text-xs font-bold uppercase tracking-widest">César Ascanio | 2026</span>
            </div>
            <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest">
                <span className="hover:text-blue-400 cursor-pointer">MediVisitPro</span>
                <span className="hover:text-blue-400 cursor-pointer">Organiza2</span>
                <span className="hover:text-blue-400 cursor-pointer">MERCHANTs</span>
                <span className="hover:text-blue-400 cursor-pointer">PRL PRO</span>
            </div>
        </div>
      </div>
    </div>
  );
}
