# Instrucciones: Aplicar Migraciones a Supabase

## ⚠️ IMPORTANTE
Estas migraciones son necesarias para alcanzar el 100% de funcionalidad de MediVisitPro.

---

## Orden de Ejecución

Debes ejecutar los archivos SQL en el siguiente orden en tu proyecto de Supabase:

### 1️⃣ Agregar campo `out_of_range` a visitas
**Archivo**: `migrations/001_add_out_of_range_to_visits.sql`
**Propósito**: Rastrear cuando un Check-in se realiza fuera del rango de 500m

```sql
-- Copia y pega en SQL Editor de Supabase
```

### 2️⃣ Crear tabla de estadísticas de representantes
**Archivo**: `migrations/002_create_rep_stats_summary.sql`
**Propósito**: Tabla pre-calculada para mejorar performance del dashboard

### 3️⃣ Crear triggers automáticos
**Archivo**: `migrations/003_create_rep_stats_triggers.sql`
**Propósito**: Mantener estadísticas actualizadas en tiempo real

### 4️⃣ Crear tabla de guías SPIN
**Archivo**: `migrations/004_create_sales_guides.sql`
**Propósito**: Preguntas contextuales para ventas basadas en producto/entidad

---

## Cómo Aplicar las Migraciones

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia el contenido del archivo SQL
5. Ejecuta la query
6. Repite para cada archivo en orden

---

## Verificación

Después de ejecutar todas las migraciones, verifica que las tablas existan:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rep_stats_summary', 'sales_guides');
```
