import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

/**
 * MASTER THEME PROVIDER - MEDIVISITPRO
 * Gestiona el estado de apariencia (Light/Dark/System) de forma centralizada.
 * Por defecto respeta la preferencia del sistema.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
