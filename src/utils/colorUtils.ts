/* ========================================================================
   MASTER FRAMEWORK - EMPRESA CA
   Copyright (c) 2026 César Ascanio. Todos los derechos reservados.
   ======================================================================== */

// Color conversion utilities for dynamically injecting colors into CSS variables

/**
 * Converts a HEX color string (e.g., "#10b981") to HSL space formatted for Tailwind/CSS variables.
 * Output: "160 84% 39%" (without hsl() wrapper, so that opacity modifier work: hsl(var(--primary) / 0.1))
 */
export function hexToHsl(hex: string): string {
  // Normalize hex string
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      case b: hue = (r - g) / d + 4; break;
    }
    hue /= 6;
  }

  const hueDeg = Math.round(hue * 360);
  const satPct = Math.round(sat * 100);
  const lightPct = Math.round(l * 100);

  return `${hueDeg} ${satPct}% ${lightPct}%`;
}

/**
 * Converts HSL values ("160 84% 39%") back to HEX color string.
 */
export function hslToHex(hslStr: string): string {
  const parts = hslStr.trim().split(/\s+/);
  if (parts.length < 3) return "#000000";

  const h = parseInt(parts[0]) / 360;
  const s = parseInt(parts[1].replace('%', '')) / 100;
  const l = parseInt(parts[2].replace('%', '')) / 100;

  let r = 0, g = 0, b = 0;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Helper to adjust lightness of a HEX color.
 * Used to automatically generate foreground, hover and muted states.
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map(char => char + char).join('');
  }

  let r = parseInt(h.substring(0, 2), 16);
  let g = parseInt(h.substring(2, 4), 16);
  let b = parseInt(h.substring(4, 6), 16);

  r = Math.max(0, Math.min(255, r + (r * percent) / 100));
  g = Math.max(0, Math.min(255, g + (g * percent) / 100));
  b = Math.max(0, Math.min(255, b + (b * percent) / 100));

  const toHex = (val: number) => {
    const hexStr = Math.round(val).toString(16);
    return hexStr.length === 1 ? '0' + hexStr : hexStr;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
