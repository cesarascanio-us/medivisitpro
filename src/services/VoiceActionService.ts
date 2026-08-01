/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
======================================================================== */

import { supabase } from '@/integrations/supabase/client';
import { createFutureVisit, getCurrentCycle } from './visitAutomationService';

export type VoiceIntent = 'schedule' | 'order' | 'unknown';

export interface VoiceActionResult {
  intent: VoiceIntent;
  entityName?: string;
  entityId?: string;
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Service to process natural language transcripts and trigger system actions.
 * Focuses on: "Agendar visita con..." and "Tomar pedido para..."
 */
export const processVoiceIntent = async (transcript: string, userId: string): Promise<VoiceActionResult> => {
  const lowerTranscript = transcript.toLowerCase();
  
  // 1. Detect Intent
  let intent: VoiceIntent = 'unknown';
  if (lowerTranscript.includes('agendar') || lowerTranscript.includes('cita') || lowerTranscript.includes('programar')) {
    intent = 'schedule';
  } else if (lowerTranscript.includes('pedido') || lowerTranscript.includes('orden') || lowerTranscript.includes('comprar')) {
    intent = 'order';
  }

  if (intent === 'unknown') {
    return { intent, success: false, message: "No se reconoció una acción clara (Agendar/Pedir)." };
  }

  // 2. Extract Entity Name (Fuzzy/Keyword based)
  const connectors = ["con el dr", "con la dra", "con el doctor", "con la doctora", "con", "a", "para", "de"];
  let entityName = "";
  let secondaryEntity = ""; // For "through" (a través de)

  // Handle multi-entity (Pharmacy through Drugstore)
  if (lowerTranscript.includes("a través de") || lowerTranscript.includes("por medio de")) {
    const parts = lowerTranscript.split(/a través de|por medio de/);
    secondaryEntity = parts[1]?.trim().split(' ').slice(0, 2).join(' ') || "";
  }

  for (const conn of connectors) {
    if (lowerTranscript.includes(conn)) {
      const remaining = lowerTranscript.split(conn)[1]?.trim();
      if (remaining) {
        const words = remaining.split(' ');
        entityName = words.slice(0, 2).join(' '); // Take up to 2 words for name
      }
      break;
    }
  }

  if (!entityName || entityName.length < 3) {
    return { intent, success: false, message: "No pude identificar el destino de la acción." };
  }

  // 3. Resolve Entity in DB
  try {
    // Resolve primary entity
    const { data: primaryResults } = await supabase
      .from('directory_items')
      .select('id, name')
      .ilike('name', `%${entityName}%`)
      .limit(1);

    if (!primaryResults || primaryResults.length === 0) {
      return { intent, success: false, message: `No encontré a "${entityName}".` };
    }

    const primaryEffect = primaryResults[0];

    if (intent === 'order' && secondaryEntity) {
        // Resolve secondary entity (Distributor)
        const { data: secondaryResults } = await supabase
          .from('directory_items')
          .select('id, name')
          .ilike('name', `%${secondaryEntity}%`)
          .limit(1);
        
        if (secondaryResults && secondaryResults.length > 0) {
            return {
                intent,
                entityId: primaryEffect.id,
                entityName: primaryEffect.name,
                success: true,
                message: `Perfecto. Iniciando pedido para ${primaryEffect.name} a través de ${secondaryResults[0].name}.`,
                data: { redirect: `/orders/builder?target=${primaryEffect.id}&distributor=${secondaryResults[0].id}` }
            };
        }
    }

    return executeAction(intent, primaryEffect.id, primaryEffect.name, userId);

  } catch (error) {
    console.error("Error resolving entity via voice:", error);
    return { intent, success: false, message: "Error técnico al procesar el comando de voz." };
  }
};

const executeAction = async (intent: VoiceIntent, entityId: string, entityName: string, userId: string): Promise<VoiceActionResult> => {
  if (intent === 'schedule') {
    const cycleId = await getCurrentCycle();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 15); // Default 15 days for voice scheduling
    const dateStr = nextDate.toISOString().split('T')[0];
    
    const result = await createFutureVisit(
      userId,
      entityId,
      dateStr,
      `Visita agendada vía Voz por comando: "${entityName}"`,
      cycleId
    );

    if (result.success) {
      return {
        intent,
        entityId,
        entityName,
        success: true,
        message: `¡Listo! He agendado una visita con ${entityName} para el ${dateStr}.`
      };
    } else {
      return { intent, success: false, message: "Falló la creación de la visita." };
    }
  }

  if (intent === 'order') {
    // For now, since OrderBuilder is a complex page, we notify the intent
    // In a full implementation, we could prepopulate a draft order
    return {
      intent,
      entityId,
      entityName,
      success: true,
      message: `He preparado el entorno para tomar un pedido de ${entityName}. ¿Qué productos agregamos?`,
      data: { redirect: `/orders/builder?target=${entityId}` }
    };
  }

  return { intent: 'unknown', success: false, message: "Acción no soportada." };
};
