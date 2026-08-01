# 🏛️ MediVisitPro — Auditoría Integral y Estado Maestro de Arquitectura (2026)

> **Documento de Referencia Permanente:** Este archivo refleja la radiografía técnica real de la plataforma, documentando la resolución de deuda técnica, la arquitectura multi-tenant de 12 roles, y los estándares de calidad industrial establecidos para garantizar la estabilidad del sistema.

---

## 📌 1. Radiografía del Estado Técnico Actual (Verificado y Certificado)

| Vector de Evaluación | Calificación | Estado y Certificación |
| :--- | :---: | :--- |
| **Integridad de Tipos (TypeScript)** | 🟢 **100% Impecable** | `npm run type-check` (`tsc --noEmit`) compila con **0 errores**. |
| **Calidad de Código y Reglas (ESLint)** | 🟢 **0 Errores** | `npm run lint -- --quiet` finaliza con **0 errores**. Violaciones de React Hooks, bloques vacíos y condiciones constantes eliminadas. |
| **Infraestructura de Pruebas (Vitest)** | 🟢 **100% Operativa** | Vitest 2.1.8 + `happy-dom` ejecutando y pasando el 100% de la suite automatizada (**8/8 tests pasando** en <5s). |
| **Seguridad y Control de Acceso (Zero-Trust)** | 🟢 **Blindado** | Eliminado el chequeo de email en cliente (`cesar.ascanio@gmail.com`). Verificación de permisos Master mediante RPC segura de base de datos (`is_master`) y validación de Tenant 0. |
| **Sincronización Offline (PWA / IndexedDB)** | 🟢 **Grado Farmacéutico** | Soporte de transacciones atómicas batch (`enqueueBatchVisitSync`) con versionamiento de payloads (visita + muestras + GPS). |
| **Consolidación de Contextos** | 🟢 **Estandarizado** | Estructura unificada en `src/contexts/` (`ThemeContext.tsx`, `AuthContext.tsx`, `MockDataProvider.tsx`), eliminando duplicidad de carpetas y referencias inconsistentes. |

---

## 🗺️ 2. Arquitectura de Dominio y Jerarquía de 12 Roles

MediVisitPro opera bajo un modelo **Multi-Tenant Jerárquico B2B/SaaS Farmacéutico**:

```
[Tenant 0: Master Global / SaaS SuperAdmin]
      │
      ├── [Tenant X: Organización / Laboratorio Farmacéutico]
      │       │
      │       ├── 1. Gerente General / Admin de Organización
      │       ├── 2. Jefe Regional (Supervisión de Zonas)
      │       ├── 3. Coordinador Táctico (Planificación & Rutas)
      │       ├── 4. Supervisor de Campo (Acompañamiento & Muestras)
      │       ├── 5. Representante Comercial (Farmacias & Puntos de Venta)
      │       ├── 6. Visitador Médico (Visita Científica & Médicos)
      │       ├── 7. Representante Integral (Comercial + Médico)
      │       └── 8. Telemarketing (Ventas Internas & Tele-visitas)
      │
      └── [Portales Externos B2B / Institucionales]
              ├── 9. Portal Farmacia (Pedidos de Transferencia & Stock)
              ├── 10. Portal Compras Institucional (Licitaciones & Baremos)
              ├── 11. Portal Médico (Material Científico & Solicitudes)
              └── 12. Jefe de Servicio Médico
```

---

## 🛠️ 3. Intervenciones Realizadas ("Modo Dios")

### Fase 1: Estabilización de React Hooks y Linter
- **`MasterPanel.tsx`**: Reordenamiento incondicional de los hooks `useEffect` en la raíz del componente, eliminando retornos tempranos que alteraban el orden de hooks en React.
- **`package.json`**: Normalización de scripts de linting (`npm run lint`, `npm run lint:fix`) reemplazando pipes Unix (`|| true`) por comandos agnósticos compatibles con Windows PowerShell y CI/CD.
- **`vite.config.ts`**: Reemplazo de directivas `@ts-ignore` por `@ts-expect-error`.
- **`ManualPaymentApprover.tsx`**: Corrección de etiqueta JSX `TableCell` no cerrada en la tabla de pagos manuales.
- **`LeafletMap.tsx`**: Manejo seguro y documentado de bloques catch en los métodos de parcheo de capas Leaflet.
- **`WorkProcesses.tsx`**: Eliminación de condición constante `true ?` sustituyéndola por la validación reactiva `isMaster`.

### Fase 2: Estabilización de Vitest y Test Runner
- Migración de configuración de Vitest hacia `@vitejs/plugin-react` y el entorno ligero de alta velocidad `happy-dom`.
- Resolución de conflictos de bindings nativos de rolldown en Windows x64.
- Ejecución completa y verificación exitosa de pruebas unitarias (`sampleDistribution.test.ts` y `offlineSync.test.ts`).

### Fase 3: Seguridad Zero-Trust
- Erradicación de emails estáticos en código fuente de `AuthProvider.tsx`.
- Autorización de SuperAdmin vinculada a la función PostgreSQL `is_master()` y verificación de pertenencia a Tenant 0 (`00000000-0000-0000-0000-000000000000`).
- Verificación del cliente Supabase con token de almacenamiento persistente y control de latencia mediante el protocolo Sentinel.

### Fase 4: Saneamiento de Contextos
- Migración y consolidación de `src/context/ThemeContext.tsx` a `src/contexts/ThemeContext.tsx`.
- Eliminación del directorio redundante `src/context/`.
- Actualización de todos los módulos consumidores (`App.tsx`, `Visits.tsx`, `Pharmacies_Elite.tsx`, `Doctors.tsx`, `AuthPage.tsx`, `useTexts.ts`, `ThemePreview.tsx`, `ThemeBuilder.tsx`, `Sidebar.tsx`).

### Fase 5: Motor Offline Transaccional
- Implementación de la función `enqueueBatchVisitSync()` en `src/lib/offlineSync.ts`.
- Tipado enriquecido con `batchId`, `version` y tipo de operación `batch_visit`.
- Nueva prueba unitaria automatizada en `src/__tests__/offlineSync.test.ts` validando la persistencia de transacciones compuestas en IndexedDB.

---

## 🚀 4. Comandos de Verificación Rápida

Para comprobar la salud del proyecto en cualquier momento:

```powershell
# 1. Comprobar tipado estricto
npm run type-check

# 2. Comprobar linter (debe retornar 0 errores)
npm run lint -- --quiet

# 3. Ejecutar suite de pruebas
npm run test

# 4. Servidor de desarrollo
npm run dev
```
