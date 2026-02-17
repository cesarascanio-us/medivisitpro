# Product Marketing Context

Last updated: 2026-02-16

## Product Overview

**One-liner:** Asistente de Visita Médica Offline-First - Sistema integral de gestión para representantes médicos y equipos comerciales farmacéuticos.
**What it does:** MediVisitPro es una plataforma integral que optimiza la planificación de rutas, gestiona el inventario de muestras promocionales y realiza un seguimiento detallado del rendimiento de los visitadores médicos. Su arquitectura offline-first garantiza que el equipo comercial pueda trabajar en hospitales y clínicas sin señal de internet.
**Product category:** CRM Farmacéutico / Gestión de Fuerza de Ventas (SFA).
**Product type:** SaaS (Software as a Service) / PWA (Progressive Web App).
**Business model:** Suscripción mensual/anual con un modelo Freemium (Plan Gratuito Permanente).

## Target Audience

**Target companies:** Laboratorios farmacéuticos, distribuidoras de medicamentos, empresas de dispositivos médicos y equipos de comercialización de salud.
**Decision-makers:** Directores Comerciales, Gerentes de Ventas, Supervisores Regionales y Visitadores Médicos (Usuarios finales).
**Primary use case:** Optimización de la jornada diaria del visitador médico, desde la planificación de la ruta hasta la entrega de muestras y el reporte de KPIs.
**Jobs to be done:**

- Recuperar tiempo administrativo (10+ horas semanales) automatizando la agenda.
- Mantener un control del 100% sobre el inventario de muestras y material POP.
- Ejecutar visitas con firma digital y reportes instantáneos incluso sin conexión.
- Visualizar la cobertura del territorio y el cumplimiento de objetivos por ciclo promocional.

## Personas

| Persona | Cares about | Challenge | Value we promise |
| :--- | :--- | :--- | :--- |
| **Visitador Médico** | Eficiencia en ruta, cumplimiento de cuotas, no perder muestras. | Pierde horas en reportes manuales y planificación de rutas ineficientes. | "Oficina en tu bolsillo" que le ahorra 10 horas semanales y le permite enfocarse en las relaciones médicas. |
| **Supervisor/Gerente** | Cobertura de zona, cumplimiento de visitas de su equipo, análisis de datos. | Falta de visibilidad en tiempo real del trabajo de campo y errores en reportes consolidados. | Dashboards dinámicos con KPIs claros y trazabilidad completa (Audit Logs) del equipo. |
| **Administrador/Dueño** | Rentabilidad, billing, configuración global de la organización. | Gestión de múltiples organizaciones y control de acceso granular. | Sistema multi-tenant seguro con RBAC de 12 niveles y gestión de suscripciones integrada. |

## Problems & Pain Points

**Core problem:** La ineficiencia administrativa y la falta de datos precisos en la visita médica tradicional, a menudo dependiente de procesos manuales o herramientas que fallan sin conexión.
**Why alternatives fall short:**

- CRMs tradicionales (Salesforce/HubSpot) no están adaptados al flujo específico farmacéutico (muestras, especialidades).
- Herramientas corporativas pesadas (Veeva/IQVIA) son costosas y a menudo difíciles de usar en dispositivos móviles con poca señal.
- Excel y papel no ofrecen geolocalización, sincronización offline ni trazabilidad.

**What it costs them:** Tiempo valioso de venta (10-15 horas/mes), pérdida de muestras costosas, decisiones basadas en datos obsoletos.
**Emotional tension:** Estrés por no alcanzar la cuota, frustración con aplicaciones lentas que fallan en hospitales, dudas sobre la efectividad de la cobertura.

## Competitive Landscape

**Direct:** Veeva CRM, IQVIA (OCE), ForceManager.
**Secondary:** Salesforce Health Cloud, HubSpot (customizado).
**Indirect:** Hojas de cálculo (Excel/Google Sheets), agendas físicas de papel, grupos de WhatsApp para reportes.

## Differentiation

**Key differentiators:**

- **Offline-First Real:** Diseñado para funcionar perfectamente en sótanos de hospitales o clínicas remotas.
- **Geolocalización Gratuita:** Rutas optimizadas (TSP) y geocoding sin costos de APIs externas (OSRM/Nominatim).
- **Control de Muestras:** Gestión granular de inventario promocional vinculada directamente a la visita.
- **RBAC Extremo:** Jerarquía de 12 niveles diseñada para estructuras comerciales farmacéuticas complejas.

**How we do it differently:** Enfocamos la herramienta en el usuario final (el visitador) para asegurar la adopción, mientras entregamos datos de altísima calidad al gerente.
**Why that's better:** Una herramienta que el equipo *quiere* usar genera datos más precisos y mejora la moral del equipo.
**Why customers choose us:** Por la simplicidad de la interfaz móvil, la capacidad offline y la relación funcionalidad/precio balanceada.

## Objections

| Objection | Response |
| :--- | :--- |
| "Es muy complejo migrar mis datos." | Ofrecemos herramientas de importación masiva y estructura compatible con la mayoría de los listados médicos. |
| "¿Qué pasa si no tengo señal?" | El sistema está diseñado para trabajar 100% offline; tus datos se sincronizarán solos cuando detecte conexión. |
| "Ya usamos Excel y nos va bien." | Excel no te permite ver mapas de calor de cobertura ni optimizar tus rutas para ahorrar gasolina y tiempo. |

**Anti-persona:** Micro-empresas que no tienen un equipo comercial (solo un vendedor) o médicos individuales que buscan un software de gestión de consultorio (MediVisitPro es para la *visita*, no para la consulta).

## Switching Dynamics

**Push:** Reportes interminables al final del viernes, muestras perdidas, rutas que dan vueltas innecesarias.
**Pull:** La promesa de ser el "N°1 de la zona", reportes automáticos, control total en el móvil.
**Habit:** "Siempre lo hemos hecho así", "Mi equipo ya está acostumbrado a su libreta".
**Anxiety:** "¿Perderé mis contactos antiguos?", "¿Será muy difícil de configurar para mi laboratorio?".

## Customer Language

**How they describe the problem:**

- "Pierdo todo el viernes haciendo reportes."
- "No sé cuántas muestras le he dado a cada médico este mes."
- "En el hospital nunca tengo señal y la app se me queda pegada."

**How they describe us:**

- "Es como tener mi oficina en el bolsillo."
- "Mi arma secreta para superar las cuotas."
- "La herramienta que por fin entiende cómo trabajamos en la calle."

**Words to use:** Optimización de rutas, control de muestras, offline-first, KPIs comerciales, visita médica, prescripciones.
**Words to avoid:** "Software genérico", "Base de datos", "Herramienta compleja".
**Glossary:**

| Term | Meaning |
| :--- | :--- |
| Visitador | Representante de ventas farmacéuticas. |
| Ciclo Promocional | Periodo de tiempo (usualmente mes/trimestre) para objetivos de ventas. |
| Muestra | Medicamento promocional entregado gratis al médico. |
| Target | Grupo de médicos seleccionados para visita prioritaria. |

## Brand Voice

**Tone:** Profesional, Empoderador, Moderno, Cercano.
**Style:** Directo y orientado a resultados.
**Personality:** Eficiente, Confiable, Innovadora, El "Asistente Inteligente".

## Proof Points

**Metrics:**

- +30% más visitas diarias por representante.
- 100% de control sobre el stock de muestras.
- 0 errores en los reportes de fin de ciclo.
- 4.9/5 valoración media de usuarios reales.

**Customers:** Laboratorios regionales y equipos independientes de alto rendimiento.
**Testimonials:**

> "MediVisitPro me devolvió mis fines de semana. Antes pasaba horas reportando, ahora todo está listo al final del día automáticamente." — Visitador Senior.

**Value themes:**

| Theme | Proof |
| :--- | :--- |
| Eficiencia de Tiempo | Automatización de agenda y rutas (Ahorro de 10h/semana). |
| Control Total | Gestión de muestras vinculada a firma digital. |
| Fiabilidad Técnica | Modo Offline que no falla en centros de salud. |

## Goals

**Business goal:** Convertirse en el estándar de gestión para visitadores médicos independientes y laboratorios medianos en la región.
**Conversion action:** Crear una cuenta gratuita o probar la demo interactiva.
**Current metrics:** +520 usuarios registrados (según Schema.org en landing).
