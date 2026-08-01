# Documentación de Excepciones — Design System Consolidation

Este documento registra de forma oficial las incidencias detectadas por los scripts de auditoría que son **Intencionales** y no deben ser migradas para preservar la identidad de marca o efectos visuales específicos.

| Módulo | Elemento | Motivo de Excepción | Clases Involucradas |
| :--- | :--- | :--- | :--- |
| **AuthPage.tsx** | Panel de Bienvenida (Izquierdo) | Identidad Visual Corporativa (Búnker). Debe ser oscuro siempre. | `bg-slate-900`, `text-white` |
| **AuthPage.tsx** | Botones RRSS (Google/Apple) | Cumplimiento de guías de marca (Brand Guidelines). | `text-black` (o similar), `bg-white` |
| **AuthPage.tsx** | Efectos Glassmorphism | Definición técnica del efecto cristal de fondo. | `bg-white/5` |
| **Common Icons** | Logotipos de Terceros | Los colores de logotipos comerciales no deben ser alterados por el tema. | Varios |

---
*Última actualización: 2026-04-03*
