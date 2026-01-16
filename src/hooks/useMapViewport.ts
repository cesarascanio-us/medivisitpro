import { useMemo } from 'react';
import { UserRole } from './useAuth';

interface Viewport {
  center: [number, number];
  zoom: number;
}

// Venezuela geographic center
const VENEZUELA_CENTER: [number, number] = [7.0000, -66.0000];
const VENEZUELA_ZOOM = 6;

// Center for some states (example coordinates)
const STATE_CENTERS: Record<string, [number, number]> = {
  'Aragua': [10.2442, -67.5919],
  'Miranda': [10.2306, -66.5897],
  'Carabobo': [10.1620, -68.0077],
  'Distrito Capital': [10.5000, -66.9167],
  'Zulia': [10.6667, -71.6667],
};

export function useMapViewport(
  role: UserRole | undefined, 
  userState: string | null | undefined,
  currentUserLocation?: { lat: number; lng: number }
): Viewport {
  return useMemo(() => {
    // 1. MASTER: Full country view
    if (role === 'master' || role === 'admin' || role === 'manager') {
      return { center: VENEZUELA_CENTER, zoom: VENEZUELA_ZOOM };
    }

    // 2. SUPERVISOR / CHIEF: State view
    if ((role === 'supervisor' || role === 'chief' || role === 'coordinator') && userState) {
      const stateCenter = STATE_CENTERS[userState];
      if (stateCenter) {
        return { center: stateCenter, zoom: 10 };
      }
    }

    // 3. REPRESENTATIVE / OTHERS: GPS or default
    if (currentUserLocation) {
      return { center: [currentUserLocation.lat, currentUserLocation.lng], zoom: 14 };
    }

    // Default fallback
    return { center: VENEZUELA_CENTER, zoom: VENEZUELA_ZOOM };
  }, [role, userState, currentUserLocation]);
}
