# Guía de Protección de Datos y Estabilidad (MediVisitPro)

Para asegurar que los avances logrados en el **Panel Master** y el aislamiento de **Multi-Tenancy** no se vean afectados por futuras actualizaciones, se recomienda seguir este protocolo:

## 1. Gestión de Migraciones (Inmutabilidad)

* **Regla de Oro**: Nunca edites un archivo SQL en `supabase/migrations` que ya haya sido ejecutado en producción.
* **Acción**: Si necesitas cambiar algo, crea un nuevo archivo con el prefijo de la fecha actual (ej. `20260219_ajuste_permisos.sql`). Esto crea un historial de auditoría y permite realizar "rollbacks" si algo falla.

## 2. Pruebas de Regresión de RLS (Seguridad en DB)

El mayor riesgo es que una nueva política de seguridad "rompa" el acceso global del Master o "filtre" datos entre organizaciones.

* **Verificación**: Antes de publicar cambios en RLS, utiliza el script `scripts/verify-security.js` para confirmar que las tablas críticas siguen siendo accesibles.
* **Test de Identidad**: Periódicamente, selecciona un usuario representante de una organización específica y verifica que **solo** pueda ver sus propios datos.

## 3. Backups y Snapshots

* **Exportación Semanal**: Utiliza el CLI de Supabase para descargar un volcado de datos:
    `supabase db dump --data-only > backups/backup_semanal.sql`
* **Control de Cambios en Código**: Asegúrate de que cambios en `useAuth.ts` o `AuthProvider.tsx` sean revisados meticulosamente, ya que son el "corazón" de la aplicación.

## 4. Auditoría de "Modo Dios"

Como el usuario Master tiene acceso total (FOR ALL), cualquier error en el código del `MasterPanel.tsx` podría afectar a múltiples organizaciones.

* **Limitación de Scope**: Utiliza siempre filtros de `organization_id` en las consultas del panel, a menos que realmente necesites ver el listado global.
* **Validación de Permisos**: La función `is_master()` en SQL es tu "última línea de defensa". No la modifiques sin entender el impacto global.

## 5. Documentación de "Source of Truth"

Mantén actualizado el archivo `ARCHITECTURE.md` para que cualquier desarrollador (o IA) entienda que:

1. **Master** = Acceso Global (RLS Bypass).
2. **Organización** = Aislamiento Total.

## 6. Sistema Sentinel (Alertas Automáticas)

Se ha implementado un sistema de monitoreo reactivo llamado **Sentinel**:

* **Base de Datos**: La tabla `public.security_alerts` registra cualquier anomalía detectada por el procedimiento `public.check_security_integrity()`.
* **Monitoreo de RLS**: Si una IA o usuario accidentalmente borra una política de seguridad en tablas críticas (`profiles`, `organizations`, etc.), Sentinel insertará una alerta de severidad **Crítica**.
* **Panel Master**: Al entrar al Panel Master, el sistema verifica automáticamente la integridad. Si ves un **Banner Rojo Parpadeante**, significa que la seguridad ha sido comprometida.

### Qué hacer en caso de Alerta

1. Identifica las tablas afectadas en el banner.
2. Ejecuta la migración de reparación más reciente (ej. `20260218_master_rls_fix.sql`).
3. Verifica que el banner desaparezca y se muestre la insignia verde: "Sentinel: Activo".
