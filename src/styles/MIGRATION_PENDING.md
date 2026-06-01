# PENDIENTES DE MIGRACIÓN: VALORES HARDCODEADOS
*Nota: Estos valores deben ser migrados a los design tokens correspondientes de manera progresiva (solo cuando se modifique el archivo por otros motivos funcionales).*

| Archivo | Valor actual | Token correcto |
|---------|-------------|----------------|
| `src/pages/Dashboard.tsx` | `bg-blue-50`, `text-blue-600` | `var(--color-blue-50)`, `var(--color-primary)` |
| `src/pages/Dashboard.tsx` | `text-emerald-500` | `var(--color-success)` / `text-success` |
| `src/pages/Dashboard.tsx` | `bg-amber-50`, `text-amber-600` | `var(--color-warning)` background/text |
| `src/pages/DashboardMaster.tsx` | `bg-slate-900`, `text-white` | `bg-card dark:bg-muted`, `text-foreground` |
| `src/pages/DashboardMaster.tsx` | `text-indigo-500`, `text-emerald-500` | `text-info`, `text-success` |
| `src/pages/MasterPanel.tsx` | `bg-slate-50`, `text-slate-500` | `bg-muted`, `text-muted-foreground` |
| `src/pages/MasterPanel.tsx` | `text-rose-500`, `text-blue-500` | `text-destructive`, `text-primary` |
| `src/pages/Users.tsx` | `bg-green-50`, `text-green-600` | `bg-success/10`, `text-success` |
| `src/pages/Users.tsx` | `bg-red-50`, `text-red-600` | `bg-destructive/10`, `text-destructive` |
| `src/components/layout/Sidebar.tsx`| `bg-slate-100/80` (hover), `text-slate-600` | `hover:bg-muted/80`, `text-muted-foreground` |
| `src/components/dashboard/VisitsChart.tsx`| `#10b981`, `#f59e0b` | `var(--color-success)`, `var(--color-warning)` |
| `src/pages/Expenses.tsx` | `text-rose-600`, `text-emerald-600` | `text-destructive`, `text-success` |
| `src/pages/SalesPipeline.tsx` | `bg-indigo-50`, `text-indigo-600` | `bg-primary/10`, `text-primary` |
| `src/pages/Pharmacies.tsx` | `bg-blue-600`, `text-sky-600` | `bg-primary`, `text-secondary` |
| `src/pages/Visits.tsx` | `bg-gray-100`, `text-gray-500` | `bg-muted`, `text-muted-foreground` |

*(La lista refleja los hallazgos del análisis de la Fase 1. Cada vez que se intervenga uno de estos componentes, se usarán los tokens de `design-tokens.css` o los equivalentes semánticos integrados del theme y luego se borrarán de esta lista).*
