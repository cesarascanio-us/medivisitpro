# Guía de Administración Master - MediVisitPro

Esta guía documenta las herramientas exclusivas para el usuario de nivel **Master** (System Admin).

## 1. Editor de Landing Page (CMS)

Ubicación: `Menú Lateral > Administración Global > Editor Landing Page`

El Editor de Landing Page te permite personalizar la cara pública de MediVisitPro sin tocar código.

### Secciones Editables

- **Hero (Inicio):** Títulos, subtítulos y la imagen principal 3D.
- **Inteligencia:** Textos de la sección de mapas de calor y su imagen.
- **Beneficios:** Listado de funcionalidades con iconos (Lucide).
- **Testimonios:** Cita, autor, cargo y foto del cliente.
- **FAQ:** Preguntas y respuestas frecuentes.
- **Cierre (CTA):** Título final y textos de los botones de acción.

### Gestión de Imágenes

Ahora puedes subir imágenes directamente desde tu dispositivo:

1. En cualquier campo de imagen, haz clic en el botón **📂 Subir**.
2. Selecciona el archivo de tu PC.
3. El sistema lo subirá automáticamente a **Supabase Storage** y generará una URL pública.
4. No olvides hacer clic en **Guardar Cambios** al final.

---

## 2. Gestión de Membresías y Planes

Ubicación: `Menú Lateral > Administración Global > Planes & Suscripciones`

### Funcionalidades

- **Crear Nuevo Plan:** Define el nombre y precio mensual.
- **Editar Plan:** Ahora puedes corregir el nombre o precio de planes existentes.
- **Activar/Desactivar:** Usa el interruptor (Switch) para ocultar o mostrar planes en la landing.
- **Sincronizar:** El botón **Sincronizar con Landing** restaura los planes oficiales (Starter, Pro, Team) y sus características predefinidas.

---

## 3. Centro de Mando (Dashboard Master)

Ubicación: `Menú Lateral > SaaS Control > SaaS Dashboard`

Panel global para monitorear el estado de todo el ecosistema MediVisitPro.

- **Ventas Totales:** Acumulado de facturación de todos los tenants.
- **Visitas Médicas:** Flujo total de visitas en la plataforma.
- **Pedidos:** Volumen de transacciones comerciales.
- **Zonas Activas:** Cantidad de territorios bajo control.

---

## Información Técnica

- **Almacenamiento:** Las imágenes se guardan en el bucket `landing-assets`.
- **Base de Datos:** Los textos se almacenan en la tabla `site_settings`.
- **Seguridad:** Todas estas rutas están protegidas por el componente `ProtectedRoute` con el rol `master`.
