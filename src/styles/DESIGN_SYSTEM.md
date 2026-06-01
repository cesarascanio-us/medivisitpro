# DESIGN SYSTEM & DESIGN TOKENS
**MASTER FRAMEWORK - EMPRESA CA**
*Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA*

Este documento es la fuente de la verdad para el **Elite Design System** de la aplicación MediVisitPro y todo el ecosistema de la sede central. Cualquier desarrollo o modificación visual debe adherirse estrictamente a estas reglas y valores.

---

## 1. TOKENS DE DISEÑO CENTRALIZADOS

Todas las variables visuales están unificadas en `src/styles/design-tokens.css` y mapeadas a través de `tailwind.config.ts`.

### Colores Semánticos (Theme)
| Elemento | Token | Contexto de Uso |
| :--- | :--- | :--- |
| **Primary** | `--color-primary` | Botones principales, brand visual (Azul CA: #0056b3) |
| **Secondary** | `--color-secondary` | Detalles de soporte, acentos secundarios (#00a0e9) |
| **Background** | `--color-background` | Fondo principal (`bg-background` -> blanco/roto claro o Slate 950 oscuro) |
| **Card / Surface**| `--color-card` | Fondos de paneles y tarjetas estructuradas |
| **Muted** | `--color-muted` | Fondos de cápsulas (e.g. `bg-muted/50`), Tabs inactivos |
| **Success** | `--color-success` o Ext. Emerald | KPIs positivos, Operaciones Completadas (`text-emerald-500`) |
| **Warning** | `--color-warning` o Ext. Amber | Alertas de sistema, Metas diarias (`text-amber-500`) |
| **Destructive**| `--color-destructive` o Ext. Rose | Errores, Pedidos pendientes (`text-rose-500`) |
| **Info / Focus** | Ext. Indigo | KPIs generales consolidados, elementos focus (`text-indigo-500`) |

### Escala de Espaciados (Spacings Extrapolados)
| Token Variable | Equivalencia Tailwind | Uso Común |
| :--- | :--- | :--- |
| `--spacing-2` | `p-2`, `gap-2` | Separaciones menores en items de lista |
| `--spacing-4` | `p-4`, `gap-4` | Padding interno común en sub-cards y forms |
| `--spacing-8` | `p-8`, `gap-8` | Padding global de tarjetas principales |
| `--spacing-10` | `p-10`, `gap-10` | Padding de KPIs maestras (`p-10`) y Header Elite |
| `--spacing-12` | `p-12` | Espaciado vertical en el Master Header |

### Radios de Borde (Capsule System)
| Token Variable | Clases Asociadas | Uso Visual |
| :--- | :--- | :--- |
| `--radius-base` | `rounded-xl` | Tarjetas médicas pequeñas y modales de uso rápido |
| `--radius-lg` | `rounded-2xl` | Inputs (`rounded-2xl`), contenedores secundarios |
| `--radius-xl` | `rounded-[2.5rem]`, `rounded-[3.5rem]` | Componentes Maestros (Header Elite, Panel general) |
| `--radius-pill`| `rounded-full` | Arquitectura de "Cápsula de Aire" para Tabs y Botones Action |

### Tipografía y Breakpoints
Las fuentes maestras son **Inter** (sans-serif legible) y **Outfit** (headings, Display robusto).
Breakpoints permitidos (Estándar Tailwind):
*   `sm:` >= 640px (Mobile lndscape)
*   `md:` >= 768px (Tablets)
*   `lg:` >= 1024px (Desktops)

---

## 2. COMPONENTES CANÓNICOS IDENTIFICADOS

Antes de crear cualquier parte visual nueva, refiérase al componente *Canónico* centralizado en `src/components/layout/DesignSystem.tsx`.

### A. Master Header (`<EliteHeader />`)
*   **Contexto**: El encabezado inmenso superior presente en Master, Dashboard y Transfers.
*   **Reglas**: Ocupa el espaciado máximo. El contenedor es `rounded-[3.5rem]` (Cápsula Masiva). Título en mayúsculas `font-black italic text-4xl/5xl`. Ningún header de nivel superior debe escribirse con clases inline sueltas o colores arbitrarios.

### B. KPI Capsule (`<EliteKPICard />`)
*   **Contexto**: Tarjetas de métricas visuales con iconos flotantes en la derecha y cifras impactantes a la izquierda.
*   **Reglas**: Emplear colores exactos (`indigo`, `rose`, `emerald`, `amber`). Contenedor `bg-muted/30 dark:bg-slate-900/40 rounded-[2.5rem]`. Cifra usar `font-black text-5xl tabular-nums italic`. *Nunca forzar padding inline distinto a p-10.*

### C. Sistema de Pestañas (`<EliteTabsList />`, `<EliteTabsTrigger />`)
*   **Contexto**: Navegación intra-módulo (e.g. Dashboard -> Equipo -> Pedidos).
*   **Reglas**: Contenedor maestro con fondo borroso/cápsula pastilla `bg-muted/50 rounded-full p-2`. Elementos internos (Triggers) son `rounded-full` que alternan a transparente (inactivo) o solid primary (activo). Letra `font-black text-[12px] uppercase lg`.

### D. Tablas Globales
*   **Contexto**: Listado de información transaccional (Transfer Orders).
*   **Reglas**: (A definir centralización de `<EliteTable />` para evitar clases inline en celdas). Cabecera sutil, celdas principales tracking-tight uppercase.

---

## 3. REGLAS DE LAYOUT ESTRUCTURAL

1.  **Jerarquía de Wrapper**: Cada página o módulo operativo debe estar contenido en una abstracción superior que implemente `bg-background h-full`. El layout general *NUNCA* debe ser alterado internamente en la página usando `bg-transparent` que herede colores contaminados.
2.  **Sistema Flex > Grid**: Se favorece agresivamente Flexbox (`flex-col gap-8` para vertical) en layouts generales. Grid de tarjetas usará sistemáticamente `grid-cols-2 md:grid-cols-4`.
3.  **Prohibición de Scroll Indeseable**: La app es concebida en la medida de lo posible ("Cero Scroll Vertical" donde no hay tabla tabular), ajustándose al 100vh usando `.h-full` y `.overflow-hidden` dentro de layouts contenedores controlados.
