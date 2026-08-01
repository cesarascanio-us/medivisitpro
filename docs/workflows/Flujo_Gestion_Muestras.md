# Flujo de Gestión de Muestras Médicas

Este documento detalla el procedimiento operativo estándar para la solicitud, asignación y entrega de Muestras Médicas dentro de la plataforma **MediVisit Pro**, asegurando que las responsabilidades recaigan sobre la cadena de mando operativa y no generen embudos en la Alta Gerencia o Administración SaaS.

## 1. Principios del Flujo

- **Descentralización Operativa:** El "Gerente" y el "Admin" tienen un rol de auditoría y configuración general. No gestionan las entregas de muestras físicas del día a día.
- **Cadena de Responsabilidad:** El flujo sigue una cascada natural:
  1.  **Coordinador / Jefe Regional:** Planifica la campaña y define necesidades.
  2.  **Operaciones:** Ejecuta la distribución macro hacia las zonas geográficas.
  3.  **Supervisor:** Recibe el inventario por zona y lo fracciona entre sus representantes.
  4.  **Representante (Visitador/Comercial):** Recibe el stock final en su maletín y lo entrega a los médicos/farmacias.

---

## 2. Configuración de Acceso Dinámico (Matriz de Roles)

El acceso a los diferentes módulos de la pestaña de "Muestras" está controlado por la **Matriz de Permisos** (RoleManager), lo que permite asignar y retirar responsabilidades sin requerir cambios en el código.

Los permisos específicos introducidos son:
- `samples.view_supervision`: Permite a un rol ver la pestaña "Supervisión" dentro de Muestras.
- `samples.manage_banks`: Permite a un rol crear, editar y asignar "Bancos de Muestras" a nivel territorial.
- `samples.assign_stock`: Permite a un rol asignar/transferir inventario físico a la capa inmediatamente inferior (Ej. Operaciones a Supervisores).

> [!NOTE]
> Por defecto, el sistema hace un "auto-seed" de estos permisos a los roles operativos clave (Operaciones, Coordinador, Jefe, Supervisor), pero un Administrador puede personalizarlos en la vista de configuración.

---

## 3. El Flujo de Vida de una Muestra

### Fase A: Solicitud y Logística Macro
1. El **Coordinador** o **Jefe Regional** determina que la Zona "Este" requiere 5,000 unidades de Paracetamol 500mg para la campaña de invierno.
2. Tras una validación verbal/documental con el Gerente, el rol de **Operaciones** (que tiene el permiso `samples.assign_stock` y `samples.manage_banks`) envía físicamente las muestras al **Supervisor** de la Zona Este.
3. En la plataforma, Operaciones ingresa a la pestaña **Supervisión -> Asignar Stock**, selecciona los productos de su almacén principal y se los asigna al perfil del Supervisor correspondiente.

### Fase B: Bancos de Muestras
- Para evitar enviar muestras individuales a la casa de cada representante, **Operaciones** o el **Jefe** puede crear **"Bancos de Muestras"** físicos (Ej. un almacén en un distribuidor aliado).
- El sistema permite asignar a un responsable directo sobre ese Banco, manteniendo trazabilidad de quién retiró qué cantidad.

### Fase C: Fraccionamiento Zonal
1. El **Supervisor** de la Zona Este recibe en el sistema una alerta de que le han enviado 5,000 unidades. 
2. Acepta la solicitud en su vista de "Solicitudes Pendientes", lo que suma este stock a su propio "Maletín" o "Banco Zonal".
3. Luego, el Supervisor va a su vista de **Supervisión -> Asignar Stock**. Dado su rol, el sistema **solamente** le permitirá seleccionar en el menú desplegable a los **Representantes** a su cargo.
4. El Supervisor divide el stock, enviando 500 unidades a cada uno de sus 10 Representantes.

### Fase D: Entrega Final y Maletín del Representante
1. El **Representante** entra a su app desde su dispositivo móvil o tablet.
2. Va a la pestaña **Mi Maletín -> Solicitudes** y visualiza las 500 unidades enviadas por su supervisor.
3. Al presionar **"Aceptar"**, el stock se descuenta del Supervisor y pasa a estar disponible y activo en el "Maletín Virtual" del Representante.
4. Durante las jornadas médicas o las visitas, el Representante hace entregas y el stock disminuye automáticamente en tiempo real.

---

> [!IMPORTANT]
> **Condición de Pantallas Limpias:** Si un usuario no posee el permiso explícito en su rol, la interfaz se adapta automáticamente. Por ejemplo, si a un "Representante" no se le asigna el permiso `samples.view_supervision`, la pestaña completa de "Supervisión" dejará de existir en su dispositivo, evitando confusión y ruidos visuales.
