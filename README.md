# MediVisitPro

> **Asistente de Visita Médica Offline-First** - Sistema integral de gestión para representantes médicos y equipos comerciales farmacéuticos.

[![Vercel](https://vercelbadge.vercel.app/api/yourusername/medivisitpro)](https://medivisitpro-s2ro.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ecf8e)](https://supabase.com/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Prerequisitos](#-prerequisitos)
- [Instalación](#-instalación)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Deployment](#-deployment)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### Core Features

- 🔐 **Autenticación Multi-Rol**: Sistema RBAC con 12 tipos de roles
- 📱 **PWA Offline-First**: Funciona sin conexión gracias a Service Workers e IndexedDB
- 🗺️ **Mapa de Cobertura**: Visualización geográfica con Leaflet y clustering
- 📊 **Dashboards Dinámicos**: Analytics específicos por rol (representante, supervisor, master)
- 📝 **Gestión de Visitas**: Ejecución detallada de visitas médicas con firma digital
- 💊 **Inventario de Muestras**: Control de stock y distribución
- 📦 **Sistema de Productos**: Catálogo con especialidades médicas
- 💰 **Gestión de Gastos**: Reportes y aprobaciones
- 🎯 **Objetivos y Ciclos**: Planificación comercial por ciclos promocionales

### Módulos Avanzados

- 👥 **Multi-tenant**: Organizaciones independientes con datos aislados
- 🏥 **Contactos Médicos**: Médicos, farmacias, hospitales, droguerías
- 📅 **Agenda y Planificación**: Scheduler semanal y calendario de eventos
- 🚚 **Warehouse Management**: Control de almacenes (roles específicos)
- 📈 **Reportes Avanzados**: Exportación a Excel y PDF
- 💳 **Sistema de Billing**: Facturación y gestión de suscripciones (master)
- 🎫 **Sistema de Tickets**: Soporte integrado
- 📝 **Audit Logs**: Trazabilidad completa de acciones

---

## 🛠️ Stack Tecnológico

### Frontend

- **Framework**: [React 18.3.1](https://react.dev/) + [TypeScript 5.8.3](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 5.4.19](https://vitejs.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS 3.4.17](https://tailwindcss.com/)
- **State Management**: [TanStack Query 5.83](https://tanstack.com/query)
- **Routing**: [React Router DOM 6.30](https://reactrouter.com/)
- **Forms**: [React Hook Form 7.61](https://react-hook-form.com/) + [Zod 3.25](https://zod.dev/)
- **Charts**: [Recharts 2.15](https://recharts.org/)
- **Maps**: [Leaflet 1.9](https://leafletjs.com/) + [React Leaflet 4.2](https://react-leaflet.js.org/)

### Backend & Services

- **BaaS**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime + Storage)
- **Database**: PostgreSQL 15+ con Row Level Security (RLS)
- **Authentication**: Supabase Auth con custom AuthProvider
- **Deployment**: [Vercel](https://vercel.com/)
- **CI/CD**: GitHub Actions

### Additional Tools

- **PWA**: vite-plugin-pwa (Workbox)
- **Offline Storage**: IndexedDB (idb)
- **PDF Generation**: jsPDF
- **Excel Export**: xlsx
- **QR Codes**: qrcode.react
- **Diagrams**: @xyflow/react

---

## 📦 Prerequisitos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 (o yarn/pnpm)
- **Git**: Para clonar el repositorio
- **Cuenta Supabase**: Para configurar el backend

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/yourusername/MediVisitPro.git
cd MediVisitPro
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega tus credenciales de Supabase:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 **Obtén tus credenciales** en [Supabase Dashboard](https://app.supabase.com/) > Project Settings > API

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:8080`

### 5. (Opcional) Configurar Supabase local

```bash
npm install -g supabase
supabase init
supabase db push
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Inicia servidor de desarrollo (localhost:8080)
npm run build              # Build de producción
npm run preview            # Preview del build de producción

# Calidad de código
npm run lint               # Ejecuta ESLint
npm run lint:fix           # Arregla errores de ESLint automáticamente
npm run type-check         # Verifica tipos de TypeScript

# Supabase
npm run gen:types          # Regenera tipos de TypeScript desde Supabase

# Base de datos (si usas Supabase CLI)
npm run db:reset           # Resetea base de datos local
npm run db:dump            # Exporta schema de base de datos
```

---

## 📁 Estructura del Proyecto

```
MediVisitPro/
├── .github/
│   └── workflows/           # GitHub Actions (deploy, migrations)
├── public/                  # Assets estáticos
├── src/
│   ├── components/          # Componentes React (~161 archivos)
│   │   ├── auth/           # AuthProvider, ProtectedRoute
│   │   ├── layout/         # Layout, Sidebar, Header
│   │   ├── ui/             # shadcn/ui components
│   │   └── ...
│   ├── contexts/            # React Contexts
│   │   ├── AuthContext.tsx
│   │   └── MockDataProvider.tsx
│   ├── hooks/               # Custom hooks (~18 hooks)
│   │   ├── useAuth.ts
│   │   ├── useOrganization.tsx
│   │   ├── useBilling.ts
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts    # Supabase client
│   │       └── types.ts     # Auto-generated DB types
│   ├── lib/                 # Utilidades
│   ├── pages/               # Componentes de página (~48 páginas)
│   │   ├── Dashboard.tsx
│   │   ├── Visits.tsx
│   │   ├── Doctors.tsx
│   │   └── ...
│   ├── services/            # Servicios de negocio
│   ├── types/               # Type definitions
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Componente raíz
│   └── main.tsx             # Entry point
├── supabase/
│   ├── migrations/          # Migraciones SQL (163 archivos)
│   └── functions/           # Edge Functions
├── .env.example             # Template de variables de entorno
├── .env.local               # Variables locales (git-ignored)
├── .env.production          # Variables de producción
├── package.json
├── tsconfig.json            # Configuración TypeScript
├── vite.config.ts           # Configuración Vite
├── tailwind.config.ts       # Configuración Tailwind
└── vercel.json              # Configuración Vercel
```

---

## 🏗️ Arquitectura

### Sistema de Autenticación

MediVisitPro utiliza un sistema de roles jerárquico con 12 tipos:

```
master → admin → manager → chief → coordinator → supervisor → 
telemarketing → representative + specialized roles (doctor, pharmacist, service_chief)
```

**Características**:

- Bypass nuclear para usuario master (`cesar.ascanio@gmail.com`)
- Modo auditoría para inspección de organizaciones
- Feature flags dinámicos por organización
- Permisos granulares vía RBAC

### Base de Datos (Supabase)

**Tablas principales**:

- `organizations`: Configuración multi-tenant
- `profiles`: Perfiles de usuario
- `user_roles`: Relación usuario-rol-organización
- `contacts`: Médicos, farmacias, etc.
- `visits`: Registro de visitas médicas
- `products`: Catálogo de productos
- `inventario_muestras`: Stock de muestras
- `subscription_plans`: Planes de suscripción
- `audit_logs`: Logs de auditoría

**Seguridad**:

- Row Level Security (RLS) en todas las tablas
- Políticas de acceso basadas en `organization_id` y `user_id`
- Funciones SQL para control de permisos

### Offline-First

1. **Service Worker**: Cache de assets y API responses
2. **IndexedDB**: Almacenamiento local de datos críticos
3. **Sync Queue**: Cola de sincronización para acciones offline
4. **Optimistic Updates**: UX instantáneo con TanStack Query

---

## 🗺️ Características de Mapas

MediVisitPro incluye funcionalidades avanzadas de mapas **100% gratuitas**:

### Geocoding Automático (Nominatim)

- Convierte direcciones a coordenadas automáticamente
- Búsqueda de direcciones con autocompletado
- Reverse geocoding (coordenadas → dirección)
- Sin necesidad de API key

**Uso**:

```typescript
import { geocodeAddress } from '@/services/nominatimService';

const coords = await geocodeAddress("Av. Bolívar, Maracay, Aragua");
// → { lat: 10.2542, lng: -67.5922 }
```

### Rutas Optimizadas (OSRM)

- Cálculo de rutas reales por carreteras
- Optimización de orden de visitas (TSP)
- Distancia y tiempo estimado precisos
- Polylines decodificados para visualización

**Uso**:

```typescript
import { optimizeRoute } from '@/services/osrmService';

const result = await optimizeRoute(startPoint, visitPoints);
// Devuelve: orden optimizado, distancia total, duración, polyline
```

### Heatmap de Visitas

- Visualización de densidad de visitas
- Identificación de zonas con alta/baja cobertura
- Plugin leaflet.heat integrado

### Componentes Disponibles

- `<GeocodingButton />` - Botón reutilizable para geocoding
- `<VisitHeatmap />` - Capa de mapa de calor (próximamente)
- `<PlacesSearch />` - Búsqueda de lugares cercanos (próximamente)

---

## 🚢 Deployment

### Vercel (Recomendado)

1. **Conecta tu repositorio** en [Vercel Dashboard](https://vercel.com/)
2. **Configura variables de entorno**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy automático** en cada push a `main`

### Deployment manual

```bash
npm run build
# Despliega la carpeta dist/ a tu hosting preferido
```

---

## 🤝 Contribuir

### Workflow

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones

- **Commits**: Usa [Conventional Commits](https://www.conventionalcommits.org/)
- **Código**: Ejecuta `npm run lint:fix` antes de commit
- **TypeScript**: Evita `any`, usa tipos estrictos
- **Componentes**: Prefiere functional components con hooks

### Testing

```bash
# (Por implementar)
npm run test           # Unit tests
npm run test:e2e       # E2E tests
```

---

## 📄 Licencia

Este proyecto es propiedad privada de [Tu Empresa/Nombre].  
Todos los derechos reservados © 2025-2026.

---

## 📞 Soporte

- **Email**: <soporte@medivisitpro.com>
- **WhatsApp**: Integrado en la aplicación
- **Documentación**: [Ver docs completas](./ARCHITECTURE.md)

---

## 🙏 Agradecimientos

- [Lovable.dev](https://lovable.dev/) - Desarrollo inicial
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Hosting y deployment

---

**Construido con ❤️ para transformar la gestión de visitas médicas**
