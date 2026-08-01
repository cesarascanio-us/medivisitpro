import { useTheme } from "next-themes";

/**
 * MASTER CHART THEME HOOK - MEDIVISITPRO
 * Proporciona colores hexadecimales adaptativos para componentes Recharts (SVG).
 * Resuelve el problema de las variables CSS en elementos SVG.
 */
export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return {
    // Slate/Zinc based colors for Industrial Elite aesthetic
    axisColor: isDark ? "#94a3b8" : "#64748b", // slate-400 : slate-500
    gridColor: isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(100, 116, 139, 0.1)",
    tooltipBg: isDark ? "#0f172a" : "#ffffff", // slate-950 : white
    tooltipBorder: isDark ? "#1e293b" : "#e2e8f0", // slate-800 : slate-200
    
    // Brand Colors (Elite Industrial)
    primary: "#3b82f6", // blue-500
    secondary: "#8b5cf6", // violet-500
    success: "#10b981", // emerald-500
    warning: "#f59e0b", // amber-500
    danger: "#ef4444", // red-500
    
    // Specialized Chart Series
    series: [
        "#3b82f6", // blue
        "#10b981", // emerald
        "#f59e0b", // amber
        "#8b5cf6", // violet
        "#ef4444", // red
        "#06b6d4"  // cyan
    ]
  };
}
