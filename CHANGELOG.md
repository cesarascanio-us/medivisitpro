# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Agregado

- Documentación completa del proyecto
- Archivo `.env.example` para nuevos desarrolladores
- Scripts adicionales en `package.json` (`lint:fix`, `type-check`, `clean`)
- `CONTRIBUTING.md` con guías de contribución
- `ARCHITECTURE.md` con documentación técnica detallada
- Este CHANGELOG.md

### Mejorado

- README.md con instrucciones completas de setup
- Configuración de desarrollo mejorada

---

## [1.0.1] - 2025-12-28

### Agregado

- Sistema de autenticación con 12 roles
- Modo auditoría para usuario master
- Feature flags dinámicos por organización
- Sistema multi-tenant completo
- Mapa de cobertura con Leaflet
- Gestión de visitas médicas
- Inventario de muestras
- Sistema de productos
- Gestión de gastos
- Dashboards por rol

### Modificado

- Migración de Clerk a Supabase Auth
- Optimización de dark mode
- Mejoras en UI/UX

### Corregido

- Problemas de autenticación
- Errores de compilación de CSS
- Issues de navegación
- Bugs en filtro global de compañía

---

## [1.0.0] - 2025-11-01

### Agregado

- Versión inicial del proyecto
- Integración con Supabase
- Deployment en Vercel
- PWA con soporte offline
- Sistema RBAC completo
- 48+ páginas de funcionalidad
- 163 migraciones de base de datos

---

## Guía de Versiones

- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nueva funcionalidad compatible
- **PATCH** (0.0.X): Correcciones de bugs compatibles

---

## Tipos de Cambios

- **Agregado**: Nueva funcionalidad
- **Modificado**: Cambios en funcionalidad existente
- **Obsoleto**: Funcionalidad que será removida
- **Eliminado**: Funcionalidad removida
- **Corregido**: Correcciones de bugs
- **Seguridad**: Vulnerabilidades corregidas

---

[Unreleased]: https://github.com/yourorg/medivisitpro/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/yourorg/medivisitpro/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/yourorg/medivisitpro/releases/tag/v1.0.0
