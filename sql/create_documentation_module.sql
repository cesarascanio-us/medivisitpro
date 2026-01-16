-- 1. Create Documents Table
CREATE TABLE IF NOT EXISTS public.system_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('technical', 'manual', 'sop', 'policy')),
    content TEXT NOT NULL, -- Markdown content
    version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enhance RLS
ALTER TABLE public.system_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can READ
CREATE POLICY "Enable read access for all users" ON public.system_documents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only Master/Admin can WRITE
CREATE POLICY "Enable write access for masters" ON public.system_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('master', 'admin')
        )
    );

-- 3. Populate with Initial Data (Upsert based on title)
-- (We use separate INSERTs for clarity and to handle potential connection size limits if doing all at once, though here it is small enough)

-- Tech Docs
DELETE FROM public.system_documents WHERE title = 'Manual de Arquitectura Técnica';
INSERT INTO public.system_documents (title, category, content) VALUES (
    'Manual de Arquitectura Técnica', 
    'technical',
    $$# 📘 MediVisit Pro - Manual de Arquitectura Técnica

**Versión:** 1.0.0
**Fecha:** 27 de Diciembre, 2025
**Responsable:** Dirección de Tecnología (CTO)

---

## 1. Stack Tecnológico

MediVisit Pro está construido sobre una arquitectura moderna, reactiva y Serverless.

### Frontend
- **Framework:** React 18 + TypeScript.
- **Build Tool:** Vite.
- **Estilos:** Tailwind CSS + ShadcnUI.
- **Estado:** TanStack Query.

### Backend & Database
- **Plataforma:** Supabase (BaaS).
- **Database:** PostgreSQL 15.
- **Auth:** Supabase Auth (JWT).

---

## 2. Diccionario de Datos (Schema)

### A. Tabla `visits`
- **`id`**: UUID.
- **`interview_data`**: JSONB (Notas, Productos).
- **`status`**: pending/completed.

### B. Tabla `transfer_orders`
- **`items_snapshot`**: JSONB (Precios históricos).
- **`drugstore_id`**: Droguería seleccionada.

---

## 3. Seguridad (RLS)
- **Users can see their own territory**: Representantes solo ven su zona.
- **Masters see everything**: Admin tiene acceso global.
$$
);

-- User Manual
DELETE FROM public.system_documents WHERE title = 'Manual de Operaciones del Usuario';
INSERT INTO public.system_documents (title, category, content) VALUES (
    'Manual de Operaciones del Usuario', 
    'manual',
    $$# 📖 MediVisit Pro - Manual de Operaciones

**Bienvenido a MediVisit Pro**.

---

## 🏗️ Para el Representante

### 1. Visita Médica
1. Navegue a **"Médicos"**.
2. Pulse **"Iniciar Visita"** (Check-in GPS).
3. Registre productos y muestras.
4. Pulse **"Finalizar"**.

### 2. Visita a Farmacia
1. Vaya a **"Farmacias"**.
2. **Auditoría:** Ingrese stock actual en anaquel.
3. **Pedido:** Cree transferencia si falta producto. Seleccione Droguería.

### 3. Muestras Médicas
- **Auditoría Mensual:** Obligatoria a fin de mes.
- **Entrega:** Se descuenta automáticamente al reportar en visita.

---

## 💼 Para el Gerente / Master

### 1. Dashboard
- Use filtros de **Región** y **Representante**.
- Mapas de calor en tiempo real.

### 2. Aprobación de Pedidos
- Vaya a **"Pedidos"** > **"Por Aprobar"**.
- Revise márgenes y apruebe/rechace.
$$
);

-- SOPs
DELETE FROM public.system_documents WHERE title = 'Standard Operating Procedures (SOPs)';
INSERT INTO public.system_documents (title, category, content) VALUES (
    'Standard Operating Procedures (SOPs)', 
    'sop',
    $$# ⚙️ Estándares Operativos (SOPs)

---

## SOP-001: Ciclo de Pedido Triangulado
**Objetivo:** Regular pedidos vía droguería.
1. **No Facturación Directa:** Prohibido cobrar efectivo.
2. **Selección Droguería:** Obligatorio seleccionar droguería activa.
3. **Validación Stock:** No vender productos agotados.

---

## SOP-002: Control de Muestras
**Objetivo:** Uso ético de muestras (MM).
1. **Inventario Negativo:** Bloqueo automático si saldo es 0.
2. **Registro Real:** Prohibido registrar entregas "a posteriori".
3. **Auditoría:** Cierre mensual obligatorio. Diferencias >5% generan alerta.

---

## SOP-003: Eventos
1. **Vinculación:** Salidas de stock para eventos deben usar tipo `treatment_start`.
2. **Cierre:** Stock sobrante debe devolverse (`return`).
$$
);

-- Policies
DELETE FROM public.system_documents WHERE title = 'Políticas de Uso y Gobernanza';
INSERT INTO public.system_documents (title, category, content) VALUES (
    'Políticas de Uso y Gobernanza', 
    'policy',
    $$# ⚖️ Políticas de Uso y Gobernanza

---

## 1. Geolocalización (GPS)
1. **Captura:** Solo al Iniciar/Finalizar visita o Auditoría.
2. **Privacidad:** NO hay rastreo fuera de horario laboral.

---

## 2. Activos Digitales
1. **Credenciales:** Usuario/Pass son intransferibles.
2. **Sincronización:** Responsabilidad diaria antes de las 18:00.

---

## 3. Integridad
1. **Visitas Fantasma:** Falsificar GPS es falta grave.
2. **Data:** Prohibido compartir BD de médicos con competencia.
$$
);

-- Notify Pgrst
NOTIFY pgrst, 'reload config';
