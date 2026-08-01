/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

// [TEMP FIX] Time Travel Hack for 2026
const originalDateNow = Date.now;
Date.now = function() {
  const now = originalDateNow();
  // Si estamos en 2026 o después, restamos ~2 años (63072000000 ms)
  // para engañar a supabase-js y que crea que estamos en 2024, coincidiendo con el servidor.
  if (now > 1767225600000) { 
    return now - 63072000000;
  }
  return now;
};

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'


createRoot(document.getElementById("root")!).render(<App />);
