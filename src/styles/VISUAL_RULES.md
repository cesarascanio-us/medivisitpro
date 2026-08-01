---
# REGLAS DE IDENTIDAD VISUAL — MEDIVISITPRO
## Estas reglas son OBLIGATORIAS en cada modificación de UI

### REGLA 1 — Sin valores hardcodeados
PROHIBIDO escribir colores, espaciados o radios directamente.
❌ text-blue-600, bg-slate-900, p-4, rounded-lg
✅ Usar siempre variables de design-tokens.css

### REGLA 2 — Sin cambios de layout no solicitados
Si un componente usa flex, no cambiar a grid.
Si usa gap-4, no cambiar a margin.
El layout solo cambia si el usuario lo pide explícitamente.

### REGLA 3 — Componente canónico como referencia
Antes de crear o modificar cualquier componente consultar:
- EliteHeader en DesignSystem.tsx para encabezados
- EliteKPICard en DesignSystem.tsx para métricas
- EliteTabsList en DesignSystem.tsx para navegación
- Wrapper obligatorio: <div className="flex flex-col h-full bg-background">

### REGLA 4 — DIFF visual obligatorio
Cada modificación con elementos visuales DEBE incluir:
ANTES: [clases que tenía]
DESPUÉS: [clases que pusiste]
RAZÓN FUNCIONAL: [por qué fue necesario]
Si no hay razón funcional, los estilos NO se tocan.

### REGLA 5 — Verificación antes de entregar
Antes de cada respuesta que incluya código UI, revisar:
[ ] ¿Usé algún valor hardcodeado de color?
[ ] ¿Cambié algún layout sin que me lo pidieran?
[ ] ¿Me aparté de los componentes canónicos?
[ ] ¿Incluí el DIFF visual?
Si alguna respuesta es SÍ, corregir antes de entregar.
---
