import { supabase } from '@/integrations/supabase/client';

export interface FullLesson {
  title: string;
  content_type: 'text' | 'video' | 'quiz';
  content_body: string;
  video_url?: string;
  duration_mins: number;
  points_reward: number;
  is_required: boolean;
  order_index: number;
}

export interface FullSection {
  title: string;
  order_index: number;
  lessons: FullLesson[];
}

export interface FullQuestion {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: { label: string; value: string }[];
  correct_answer: string;
  points: number;
  order_index: number;
}

export interface FullQuiz {
  title: string;
  passing_score: number;
  max_attempts: number;
  time_limit_mins: number;
  questions: FullQuestion[];
}

export interface FullCourse {
  slug_id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  duration_mins: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_informative: boolean;
  target_roles: string[];
  course_type: 'platform' | 'custom';
  status: 'published' | 'active';
  sections: FullSection[];
  quiz: FullQuiz;
}

export const COMPLETE_LMS_COURSES: FullCourse[] = [
  // -------------------------------------------------------------
  // CURSO 1: VISITADORES MÉDICOS
  // -------------------------------------------------------------
  {
    slug_id: 'sys_course_rep',
    title: 'Mastery de Campo: Ejecución de Visita Médica y Muestras',
    description: 'Capacitación obligatoria para Representantes de Ventas: planificación de agenda, check-in con Geo-Tagging GPS, ayudas visuales interactivas, entrega de muestras y firmas digitales.',
    category: 'app_onboarding',
    points_reward: 150,
    duration_mins: 35,
    difficulty: 'beginner',
    is_informative: false,
    target_roles: ['representative'],
    course_type: 'platform',
    status: 'published',
    sections: [
      {
        title: 'Sección 1: Planificación y Ruteo Inteligente',
        order_index: 0,
        lessons: [
          {
            title: '1.1 Optimización de Ruta Diaria y Mapa de Cobertura',
            content_type: 'text',
            duration_mins: 6,
            points_reward: 25,
            is_required: true,
            order_index: 0,
            content_body: `# Optimización de Ruta Diaria y Mapa de Cobertura

Bienvenido al módulo operativo de **MediVisit Pro**. Como Representante Médico, la preparación previa de tu jornada es el 50% del éxito en ventas.

### 📍 1. Uso del Mapa de Cobertura
1. Accede al menú lateral y haz clic en **"Mapa Cobertura"** o **"Agenda"**.
2. Filtra los facultativos por **Especialidad médica** (ej. Cardiología, Pediatría, Medicina Interna) y por **Categoría A/B/C**.
3. El mapa agrupa los consultorios cercanos para minimizar tiempos de traslado y optimizar combustible.

### 📅 2. Creación de Citas en la Agenda
- Selecciona el médico en el mapa y presiona **"Agendar Visita"**.
- El sistema te alertará si el médico tiene un horario de atención restringido o si ya fue visitado en el ciclo actual.
- Las citas se sincronizan con tu dispositivo para que puedas consultarlas incluso sin internet.

> 💡 **Tip Pro:** Planifica tus visitas de categoría A en las primeras horas de la mañana cuando el flujo en consultorios suele ser más receptivo.`
          },
          {
            title: '1.2 Auditoría de Fichero y Actualización de Contactos',
            content_type: 'text',
            duration_mins: 5,
            points_reward: 25,
            is_required: true,
            order_index: 1,
            content_body: `# Auditoría y Mantenimiento de Contactos

Un fichero médico desactualizado genera visitas perdidas y reportes erróneos.

### 📋 Pasos para Mantener tus Contactos al Día:
1. En la vista de **Médicos / Contactos**, verifica el número de colegiado, teléfono y correo electrónico.
2. Si el médico cambió de consultorio o clínica, actualiza la dirección y presiona **"Guardar Ubicación GPS"** cuando estés en el nuevo sitio.
3. Si el médico no ejerce o se trasladó de ciudad, notifícalo a tu Gerente mediante el botón **"Solicitar Baja/Cambio de Fichero"**.

> ⚠️ **Importante:** Las coordenadas GPS registradas se usan para validar la presencia física durante la visita.`
          }
        ]
      },
      {
        title: 'Sección 2: Ejecución de la Visita y Firma Digital',
        order_index: 1,
        lessons: [
          {
            title: '2.1 Check-In con Geo-Tagging GPS y Modo Offline',
            content_type: 'text',
            duration_mins: 7,
            points_reward: 25,
            is_required: true,
            order_index: 0,
            content_body: `# Check-In Presencial con Geo-Tagging GPS

La transparencia y verificación de campo son pilares de **MediVisit Pro**.

### 🛰️ ¿Cómo funciona el Check-In?
1. Al llegar a la puerta del consultorio o clínica, abre la cita en la app y pulsa **"Iniciar Visita"**.
2. La app validará tus coordenadas GPS contra la ubicación registrada del médico:
   - **Verde (Radio < 150m):** Visita verificada exitosamente en sitio.
   - **Ámbar (Radio > 150m):** La app te solicitará una justificación breve (ej: médico atendió en piso hospitalario anexo).
3. **¿No tienes señal móvil?** No te preocupes: **MediVisit Pro funciona 100% Offline**. Los datos se encriptan en tu teléfono y se sincronizan apenas recuperes red.`
          },
          {
            title: '2.2 Ayudas Visuales y Captura de Firma Digital',
            content_type: 'text',
            duration_mins: 7,
            points_reward: 25,
            is_required: true,
            order_index: 1,
            content_body: `# Presentación Interactiva y Firma de Conformidad

### 📊 Presentación de Productos (Ayudas Visuales)
- Durante la entrevista médica, utiliza la pestaña **"Material Promocional"** para mostrar estudios clínicos, dosis y ventajas competitivas del producto foco.
- La app contabiliza los segundos de visualización de cada producto para análisis de impacto comercial.

### ✍️ Captura de Firma Digital
1. Al finalizar la entrevista, pasa a la pantalla de **"Firma Digital"**.
2. Pídele al médico que firme directamente sobre la pantalla táctil de tu teléfono o tablet.
3. La firma queda estampada con marca de tiempo UTC y hash criptográfico inviolable.`
          }
        ]
      },
      {
        title: 'Sección 3: Muestras Médicas y Cierre de Visita',
        order_index: 2,
        lessons: [
          {
            title: '3.1 Descargo de Muestras Médicas y Material POP',
            content_type: 'text',
            duration_mins: 5,
            points_reward: 25,
            is_required: true,
            order_index: 0,
            content_body: `# Control Riguroso de Muestras Médicas

La entrega de muestras está regulada por normativas de salud y auditoría interna.

### 📦 Procedimiento de Entrega:
1. En la sección **"Muestras Entregadas"**, selecciona los productos de tu stock asignado.
2. Ingresa la cantidad exacta entregada (ej: 2 cajas de muestra médica).
3. Selecciona el **Lote** correspondiente a la muestra física entregada.
4. El inventario personal de tu maletín se descuenta en tiempo real.

> 🔒 **Regla de Cumplimiento:** Toda entrega de muestras debe coincidir con la firma del médico capturada en la lección anterior.`
          },
          {
            title: '3.2 Cierre de Visita, Compromisos y Próximos Pasos',
            content_type: 'text',
            duration_mins: 5,
            points_reward: 25,
            is_required: true,
            order_index: 1,
            content_body: `# Cierre y Compromisos de Prescripción

El valor de la visita reside en el seguimiento.

### 📝 Al pulsar "Finalizar Visita":
- Registra el **Nivel de Aceptación** del médico (Alto, Medio, Bajo).
- Anota las **Objeciones o Dudas** planteadas sobre la molécula o posología.
- Programa el **Compromiso** para el próximo ciclo (ej: traer caso clínico de paciente hipertenso).
- Presiona **"Guardar y Sincronizar"**. ¡Listo! Tu visita queda archivada y sumas puntos en tu perfil.`
          }
        ]
      }
    ],
    quiz: {
      title: 'Examen de Certificación: Ejecución de Visita Médica y Muestras',
      passing_score: 80,
      max_attempts: 3,
      time_limit_mins: 15,
      questions: [
        {
          question_text: '¿Qué ocurre si realizas el Check-in en un consultorio sin conexión a internet?',
          question_type: 'multiple_choice',
          points: 20,
          order_index: 0,
          options: [
            { label: 'La app guarda los datos encriptados localmente y se sincronizan al volver la señal', value: 'opt_0' },
            { label: 'La app bloquea el dispositivo y se pierde la visita', value: 'opt_1' },
            { label: 'Se debe reiniciar el teléfono de inmediato', value: 'opt_2' },
            { label: 'El médico debe firmar un papel físico obligatorio', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿El descargo de muestras médicas actualiza el kardex e inventario del visitador en tiempo real?',
          question_type: 'true_false',
          points: 20,
          order_index: 1,
          options: [
            { label: 'Verdadero (Se descuenta del stock personal inmediatamente)', value: 'true' },
            { label: 'Falso (Solo se actualiza a fin de mes)', value: 'false' }
          ],
          correct_answer: 'true'
        },
        {
          question_text: '¿Cuál es el radio GPS sugerido para que el Check-in se marque en estado Verde (verificado en sitio)?',
          question_type: 'multiple_choice',
          points: 20,
          order_index: 2,
          options: [
            { label: 'Menor a 150 metros del consultorio', value: 'opt_0' },
            { label: 'A más de 5 kilómetros de distancia', value: 'opt_1' },
            { label: 'En cualquier parte de la ciudad sin restricción', value: 'opt_2' },
            { label: 'Únicamente en la sede corporativa de la empresa', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿Es obligatorio capturar la firma digital del médico para validar la entrega de muestras médicas?',
          question_type: 'true_false',
          points: 20,
          order_index: 3,
          options: [
            { label: 'Verdadero (Requisito regulatorio y de auditoría interna)', value: 'true' },
            { label: 'Falso (Es totalmente opcional y se puede omitir siempre)', value: 'false' }
          ],
          correct_answer: 'true'
        },
        {
          question_text: '¿Qué acción clave se debe registrar al finalizar la visita médica en la app?',
          question_type: 'multiple_choice',
          points: 20,
          order_index: 4,
          options: [
            { label: 'Nivel de aceptación, objeciones y compromisos de seguimiento', value: 'opt_0' },
            { label: 'Borrar el contacto del médico', value: 'opt_1' },
            { label: 'Cerrar la sesión de usuario y desinstalar la app', value: 'opt_2' },
            { label: 'Enviar un correo manual al director general', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // CURSO 2: SUPERVISIÓN GERENCIAL
  // -------------------------------------------------------------
  {
    slug_id: 'sys_course_mgr',
    title: 'Supervisión Gerencial: Ciclos, Cobertura y Tablero de Control',
    description: 'Capacitación obligatoria para Gerentes y Supervisores: diseño de ciclos promocionales, asignación de baremos, auditoría de rutas en vivo, transferencias de pedidos y canje de premios.',
    category: 'management',
    points_reward: 200,
    duration_mins: 40,
    difficulty: 'intermediate',
    is_informative: false,
    target_roles: ['manager', 'gerente', 'admin'],
    course_type: 'platform',
    status: 'published',
    sections: [
      {
        title: 'Sección 1: Planificación de Ciclos y Territorios',
        order_index: 0,
        lessons: [
          {
            title: '2.1 Creación de Ciclos Promocionales y Cuotas de Visita',
            content_type: 'text',
            duration_mins: 8,
            points_reward: 35,
            is_required: true,
            order_index: 0,
            content_body: `# Estructura de Ciclos Promocionales en MediVisit Pro

Como Gerente, la asignación equitativa y estratégica de metas determina el cumplimiento del presupuesto comercial.

### 🎯 Pasos para Crear un Ciclo:
1. Navega a **"Ciclos Promocionales"** en el panel de Gestión.
2. Define la fecha de inicio y fin (ej. Ciclo Marzo: 01/03 al 31/03).
3. Configura la **Frecuencia de Visita**:
   - **Médicos Categoría A:** 2 visitas por ciclo.
   - **Médicos Categoría B:** 1 visita por ciclo.
   - **Médicos Categoría C:** 1 visita cada 2 ciclos.
4. Asigna las **Parrillas de Producto Prioritarias** que cada representante debe promocionar.`
          },
          {
            title: '2.2 Asignación de Baremos y Zonas Comerciales',
            content_type: 'text',
            duration_mins: 7,
            points_reward: 35,
            is_required: true,
            order_index: 1,
            content_body: `# Baremos y Distribución Territorial

El módulo de **"Baremos"** permite definir los márgenes de descuento y bonificaciones según volumen.

### 📈 Configuración Gerencial:
- Establece los topes de descuento autorizados para farmacias independientes vs cadenas.
- Asigna las zonas geográficas a cada visitador para evitar solapamientos y conflictos de cartera.
- Define las cuotas de pedidos transfer (Transferencistas) para farmacias de alto volumen.`
          }
        ]
      },
      {
        title: 'Sección 2: Auditoría y Control en Tiempo Real',
        order_index: 1,
        lessons: [
          {
            title: '2.3 Dashboard Gerencial y KPIs de Cobertura',
            content_type: 'text',
            duration_mins: 8,
            points_reward: 40,
            is_required: true,
            order_index: 0,
            content_body: `# Monitoreo del Tablero de Control Gerencial

El **Dashboard Gerencial** consolida métricas clave para la toma de decisiones ágiles.

### 📊 Indicadores Críticos a Revisar Diariamente:
1. **Cobertura de Fichero (%):** Porcentaje de médicos visitados respecto a la meta del ciclo.
2. **Visitas Efectivas vs Desviadas:** Proporción de Check-ins con GPS validado en verde vs observaciones.
3. **Muestras Entregadas por Especialidad:** Detección de posibles desbalances en la colocación de productos clave.
4. **Top Representantes del Ciclo:** Ranking por actividad, cobertura y ventas generadas.`
          },
          {
            title: '2.4 Gestión de Premios e Incentivos del Equipo',
            content_type: 'text',
            duration_mins: 7,
            points_reward: 40,
            is_required: true,
            order_index: 1,
            content_body: `# Aprobación de Canjes en la Tienda de Premios

La motivación de la fuerza de ventas impulsa la disciplina operativa.

### 🎁 Flujo de Aprobación Gerencial:
1. Ingresa a **"Gestión Academia & Premios"** > pestaña **"Solicitudes de Canje"** (o directamente en **/rewards**).
2. Revisa el colaborador que solicita el premio, la fecha y los puntos gastados.
3. Haz clic en **"Aprobar"** para autorizar la orden con RRHH o **"Entregar"** una vez entregado el beneficio.
4. Si detectas irregularidades en el origen de los puntos, puedes **"Rechazar"** el canje con justificación.`
          }
        ]
      }
    ],
    quiz: {
      title: 'Examen de Certificación Gerencial: Ciclos, Cobertura y Auditoría',
      passing_score: 80,
      max_attempts: 3,
      time_limit_mins: 15,
      questions: [
        {
          question_text: '¿Cuál es la frecuencia de visita estándar recomendada para médicos de Categoría A en un ciclo promocional?',
          question_type: 'multiple_choice',
          points: 20,
          order_index: 0,
          options: [
            { label: '2 visitas por ciclo promocional', value: 'opt_0' },
            { label: '1 visita al año', value: 'opt_1' },
            { label: 'Ninguna visita requerida', value: 'opt_2' },
            { label: 'Solo llamada telefónica sin visita presencial', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿El Dashboard Gerencial permite auditar en tiempo real la cobertura efectiva de cada representante de campo?',
          question_type: 'true_false',
          points: 20,
          order_index: 1,
          options: [
            { label: 'Verdadero (Muestra visitas realizadas vs planificadas y validación GPS)', value: 'true' },
            { label: 'Falso (Solo muestra datos con 30 días de retraso)', value: 'false' }
          ],
          correct_answer: 'true'
        },
        {
          question_text: '¿Dónde puede el Gerente aprobar o entregar los premios canjeados por los visitadores médicos?',
          question_type: 'multiple_choice',
          points: 20,
          order_index: 2,
          options: [
            { label: 'En el módulo de Premios (/rewards) y Gestión Academia (/admin/academy)', value: 'opt_0' },
            { label: 'Solo imprimiendo un formulario físico en papel', value: 'opt_1' },
            { label: 'No se pueden gestionar premios en la plataforma', value: 'opt_2' },
            { label: 'En la papelera de reciclaje del sistema', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿Qué módulo de la plataforma se utiliza para configurar políticas de descuento y cuotas de transferencia?',
          question_type: 'multiple_choice',
          points: 20,
          order_index: 3,
          options: [
            { label: 'Módulo de Baremos y Ciclos Promocionales', value: 'opt_0' },
            { label: 'Módulo de Ayuda y FAQ', value: 'opt_1' },
            { label: 'Configuración de tema visual', value: 'opt_2' },
            { label: 'Calculadora de combustible', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿Es posible rechazar una solicitud de canje si el colaborador no cumple los criterios de auditoría?',
          question_type: 'true_false',
          points: 20,
          order_index: 4,
          options: [
            { label: 'Verdadero (El gerente tiene la potestad de aprobar o rechazar con motivo)', value: 'true' },
            { label: 'Falso (Todos los canjes son automáticos e irreversibles)', value: 'false' }
          ],
          correct_answer: 'true'
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // CURSO 3: ADMINISTRACIÓN SAAS Y SENTINEL
  // -------------------------------------------------------------
  {
    slug_id: 'sys_course_admin',
    title: 'Gobernanza y Administración SaaS: Sentinel, Roles y Facturación',
    description: 'Guía de alta seguridad para Administradores y Directores: control de acceso Zero-Trust, monitoreo Sentinel, configuración de catálogos y gestión de planes de suscripción.',
    category: 'compliance',
    points_reward: 100,
    duration_mins: 25,
    difficulty: 'advanced',
    is_informative: true,
    target_roles: ['admin', 'master'],
    course_type: 'platform',
    status: 'published',
    sections: [
      {
        title: 'Sección 1: Seguridad Zero-Trust y Gestión de Roles',
        order_index: 0,
        lessons: [
          {
            title: '3.1 Asignación de Roles y Permisos Organizacionales',
            content_type: 'text',
            duration_mins: 6,
            points_reward: 25,
            is_required: true,
            order_index: 0,
            content_body: `# Control de Acceso Basado en Roles (RBAC)

MediVisit Pro implementa arquitectura Zero-Trust para salvaguardar la propiedad intelectual y los datos de salud.

### 🔐 Jerarquía de Roles:
1. **Master / Owner:** Acceso irrestricto, auditoría de base de datos y facturación global.
2. **Admin:** Gestión de usuarios, productos, zonas y aprobación de políticas.
3. **Manager / Supervisor:** Gestión de ciclos, baremos y supervisión del equipo de campo asignado.
4. **Representative (Visitador):** Ejecución de agenda, visitas, muestras y formación LMS.`
          },
          {
            title: '3.2 Monitoreo y Auditoría con Sentinel Shield',
            content_type: 'text',
            duration_mins: 6,
            points_reward: 25,
            is_required: true,
            order_index: 1,
            content_body: `# Sentinel: Detección Activa de Amenazas

El módulo **Sentinel** audita continuamente las sesiones y operaciones sensibles.

### 🛡️ Capacidades del Sentinel:
- Registro de IP, User-Agent y geolocalización de cada inicio de sesión.
- Detección de inicios de sesión simultáneos o desde ubicaciones anómalas.
- Trazabilidad total de altas, bajas y modificaciones en bases de datos maestras.`
          }
        ]
      },
      {
        title: 'Sección 2: Facturación y Planes SaaS',
        order_index: 1,
        lessons: [
          {
            title: '3.3 Administración de Planes y Facturación',
            content_type: 'text',
            duration_mins: 6,
            points_reward: 25,
            is_required: true,
            order_index: 0,
            content_body: `# Facturación y Capacidad del Workspace

En **Ajustes > Facturación**, los administradores pueden:
- Consultar el consumo de licencias de visitadores activas.
- Descargar facturas fiscales generadas mensualmente.
- Solicitar ampliación de cupos de almacenamiento o usuarios de campo adicionales.`
          }
        ]
      }
    ],
    quiz: {
      title: 'Examen de Certificación: Gobernanza SaaS y Seguridad Sentinel',
      passing_score: 80,
      max_attempts: 3,
      time_limit_mins: 15,
      questions: [
        {
          question_text: '¿Cuál es el rol con máximos privilegios de configuración global en la plataforma?',
          question_type: 'multiple_choice',
          points: 25,
          order_index: 0,
          options: [
            { label: 'Master / SuperAdmin', value: 'opt_0' },
            { label: 'Visitador Médico Junior', value: 'opt_1' },
            { label: 'Usuario Invitado Temporal', value: 'opt_2' },
            { label: 'Farmacia Externa', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿Qué función cumple el sistema Sentinel Shield en la plataforma?',
          question_type: 'multiple_choice',
          points: 25,
          order_index: 1,
          options: [
            { label: 'Monitorear accesos sospechosos y registrar auditoría de seguridad', value: 'opt_0' },
            { label: 'Enviar emails promocionales a los médicos', value: 'opt_1' },
            { label: 'Calcular el precio de venta al público de fármacos', value: 'opt_2' },
            { label: 'Limpiar la memoria del teléfono del visitador', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿La arquitectura de MediVisit Pro aplica el principio de Privilegio Mínimo (Zero-Trust) para restringir acceso según el rol?',
          question_type: 'true_false',
          points: 25,
          order_index: 2,
          options: [
            { label: 'Verdadero (Cada usuario solo accede a los datos estrictamente necesarios)', value: 'true' },
            { label: 'Falso (Todos los usuarios ven toda la información financiera)', value: 'false' }
          ],
          correct_answer: 'true'
        },
        {
          question_text: '¿Dónde se gestionan las licencias activas y los planes de suscripción de la organización?',
          question_type: 'multiple_choice',
          points: 25,
          order_index: 3,
          options: [
            { label: 'En Ajustes > Facturación y Planes SaaS', value: 'opt_0' },
            { label: 'En el chat de soporte de WhatsApp', value: 'opt_1' },
            { label: 'En la sección de contactos médicos', value: 'opt_2' },
            { label: 'En la agenda de visitas', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // CURSO 4: GUÍA INTEGRAL DE LA APP SEGÚN TU ROL
  // -------------------------------------------------------------
  {
    slug_id: 'sys_course_universal',
    title: 'Guía Universal de la App: Flujo Operativo según tu Rol',
    description: 'Manual interactivo para todos los usuarios: cómo navegar tu panel de control, aprovechar el modo Offline en consultorios, acumular puntos y canjear premios.',
    category: 'app_onboarding',
    points_reward: 120,
    duration_mins: 30,
    difficulty: 'beginner',
    is_informative: false,
    target_roles: ['representative', 'manager', 'admin'],
    course_type: 'platform',
    status: 'published',
    sections: [
      {
        title: 'Sección 1: Tu Espacio de Trabajo Personalizado',
        order_index: 0,
        lessons: [
          {
            title: '4.1 Interfaz Adaptativa según tu Rol',
            content_type: 'text',
            duration_mins: 6,
            points_reward: 20,
            is_required: true,
            order_index: 0,
            content_body: `# Tu Espacio de Trabajo en MediVisit Pro

La plataforma adapta su menú y herramientas en función de tus responsabilidades diarias:

### 👤 Si eres Visitador Médico:
- **Agenda:** Tu itinerario del día priorizado por geolocalización.
- **Médicos & Farmacias:** Tu fichero asignado con historial de prescripción y firmas.
- **Muestras & Material POP:** El stock disponible en tu maletín.
- **Academia & Premios:** Cursos para perfeccionar tu técnica y ganar incentivos.

### 👔 Si eres Gerente o Supervisor:
- **Dashboard:** Visión macro de cobertura y desvíos de ruta.
- **Ciclos & Baremos:** Configuración de cuotas y políticas de descuento.
- **Gestión Academia:** Creación de cursos corporativos y aprobación de canjes de premios.`
          },
          {
            title: '4.2 Modo Offline y Resiliencia en Zonas sin Cobertura',
            content_type: 'text',
            duration_mins: 6,
            points_reward: 20,
            is_required: true,
            order_index: 1,
            content_body: `# ¿Cómo Trabajar sin Internet?

Muchos consultorios médicos están en sótanos o zonas de baja señal celular.

### 📶 Mecanismo de Sincronización Automática:
1. **No cierres la app:** Puedes realizar Check-ins, mostrar ayudas visuales y capturar firmas normalmente.
2. Un indicador de estado en la parte superior te mostrará **"Modo Offline"**.
3. Apenas el dispositivo detecte Wi-Fi o datos móviles, la app enviará todas las transacciones pendientes a la nube de forma invisible.`
          }
        ]
      },
      {
        title: 'Sección 2: Gamificación, Academia y Premios',
        order_index: 1,
        lessons: [
          {
            title: '4.3 Cómo Aprobar Cursos, Acumular Puntos y Canjear Premios',
            content_type: 'text',
            duration_mins: 6,
            points_reward: 20,
            is_required: true,
            order_index: 0,
            content_body: `# El Ecosistema de Formación e Incentivos

Aprender y cumplir los estándares en MediVisit Pro tiene recompensas tangibles.

### 🏆 Ciclo de Gamificación:
1. **Estudia las lecciones:** Marca cada lección como completada para desbloquear el examen.
2. **Rinde el examen de certificación:** Obtén el puntaje mínimo requerido (70%-80%).
3. **Suma puntos automáticamente:** Tu saldo de puntos en tu perfil se incrementa al instante.
4. **Visita la Tienda de Premios (/rewards):** Elige bonos de combustible, almuerzos VIP o días compensatorios y solicita tu canje.`
          }
        ]
      }
    ],
    quiz: {
      title: 'Examen de Certificación: Guía Universal de la App',
      passing_score: 75,
      max_attempts: 3,
      time_limit_mins: 15,
      questions: [
        {
          question_text: '¿Qué sucede cuando completas las lecciones y apruebas el examen de un curso en la Academia?',
          question_type: 'multiple_choice',
          points: 25,
          order_index: 0,
          options: [
            { label: 'Se acreditan puntos a tu saldo personal para canjear en la Tienda de Premios', value: 'opt_0' },
            { label: 'Se borra tu cuenta de usuario', value: 'opt_1' },
            { label: 'Te cobra una tarifa adicional', value: 'opt_2' },
            { label: 'No ocurre nada', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿La app MediVisit Pro permite realizar visitas y capturar firmas médicas sin conexión a internet?',
          question_type: 'true_false',
          points: 25,
          order_index: 1,
          options: [
            { label: 'Verdadero (Modo Offline transparente con sincronización automática)', value: 'true' },
            { label: 'Falso (Es imposible usar la app sin internet constante)', value: 'false' }
          ],
          correct_answer: 'true'
        },
        {
          question_text: '¿En qué sección de la plataforma puedes canjear tus puntos acumulados por beneficios reales?',
          question_type: 'multiple_choice',
          points: 25,
          order_index: 2,
          options: [
            { label: 'En el Catálogo de Premios e Incentivos (/rewards)', value: 'opt_0' },
            { label: 'En la papelera de reciclaje', value: 'opt_1' },
            { label: 'En la pantalla de inicio de sesión', value: 'opt_2' },
            { label: 'En la calculadora de combustible', value: 'opt_3' }
          ],
          correct_answer: 'opt_0'
        },
        {
          question_text: '¿La interfaz de MediVisit Pro se personaliza automáticamente de acuerdo al rol del usuario?',
          question_type: 'true_false',
          points: 25,
          order_index: 3,
          options: [
            { label: 'Verdadero (Cada rol tiene acceso a sus herramientas específicas)', value: 'true' },
            { label: 'Falso (Todos los usuarios ven exactamente lo mismo)', value: 'false' }
          ],
          correct_answer: 'true'
        }
      ]
    }
  }
];

/**
 * Seeds all master LMS courses, sections, lessons, quizzes and questions into Supabase
 */
export async function seedCompleteLmsDatabase(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    let seededCount = 0;

    for (const course of COMPLETE_LMS_COURSES) {
      // 1. Check or Upsert Course
      const { data: existingModules, error: findErr } = await supabase
        .from('training_modules')
        .select('id')
        .eq('title', course.title)
        .limit(1);

      let moduleId: string;

      if (existingModules && existingModules.length > 0) {
        moduleId = existingModules[0].id;
        await supabase
          .from('training_modules')
          .update({
            description: course.description,
            category: course.category,
            points_reward: course.points_reward,
            duration_mins: course.duration_mins,
            difficulty: course.difficulty,
            is_informative: course.is_informative,
            target_roles: course.target_roles,
            course_type: course.course_type,
            status: course.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', moduleId);
      } else {
        const { data: newMod, error: insertModErr } = await supabase
          .from('training_modules')
          .insert({
            title: course.title,
            description: course.description,
            category: course.category,
            points_reward: course.points_reward,
            duration_mins: course.duration_mins,
            difficulty: course.difficulty,
            is_informative: course.is_informative,
            target_roles: course.target_roles,
            course_type: course.course_type,
            status: course.status
          })
          .select('id')
          .single();

        if (insertModErr || !newMod) {
          console.warn('Error inserting module:', insertModErr);
          continue;
        }
        moduleId = newMod.id;
      }

      // 2. Sections and Lessons
      for (const section of course.sections) {
        const { data: existingSecs } = await supabase
          .from('course_sections')
          .select('id')
          .eq('module_id', moduleId)
          .eq('title', section.title)
          .limit(1);

        let sectionId: string;

        if (existingSecs && existingSecs.length > 0) {
          sectionId = existingSecs[0].id;
        } else {
          const { data: newSec, error: secErr } = await supabase
            .from('course_sections')
            .insert({
              module_id: moduleId,
              title: section.title,
              order_index: section.order_index
            })
            .select('id')
            .single();

          if (secErr || !newSec) continue;
          sectionId = newSec.id;
        }

        // Insert Lessons
        for (const lesson of section.lessons) {
          const { data: existingLessons } = await supabase
            .from('course_lessons')
            .select('id')
            .eq('section_id', sectionId)
            .eq('title', lesson.title)
            .limit(1);

          if (!existingLessons || existingLessons.length === 0) {
            await supabase.from('course_lessons').insert({
              section_id: sectionId,
              module_id: moduleId,
              title: lesson.title,
              content_type: lesson.content_type,
              content_body: lesson.content_body,
              video_url: lesson.video_url || null,
              duration_mins: lesson.duration_mins,
              points_reward: lesson.points_reward,
              is_required: lesson.is_required,
              order_index: lesson.order_index
            });
          } else {
            await supabase
              .from('course_lessons')
              .update({
                content_body: lesson.content_body,
                duration_mins: lesson.duration_mins,
                points_reward: lesson.points_reward,
                is_required: lesson.is_required
              })
              .eq('id', existingLessons[0].id);
          }
        }
      }

      // 3. Quizzes and Questions
      if (course.quiz) {
        const { data: existingQuizzes } = await supabase
          .from('course_quizzes')
          .select('id')
          .eq('module_id', moduleId)
          .limit(1);

        let quizId: string;

        if (existingQuizzes && existingQuizzes.length > 0) {
          quizId = existingQuizzes[0].id;
          await supabase
            .from('course_quizzes')
            .update({
              title: course.quiz.title,
              passing_score: course.quiz.passing_score,
              max_attempts: course.quiz.max_attempts,
              time_limit_mins: course.quiz.time_limit_mins
            })
            .eq('id', quizId);
        } else {
          const { data: newQuiz, error: qErr } = await supabase
            .from('course_quizzes')
            .insert({
              module_id: moduleId,
              title: course.quiz.title,
              passing_score: course.quiz.passing_score,
              max_attempts: course.quiz.max_attempts,
              time_limit_mins: course.quiz.time_limit_mins
            })
            .select('id')
            .single();

          if (qErr || !newQuiz) continue;
          quizId = newQuiz.id;
        }

        // Insert Quiz Questions
        for (const question of course.quiz.questions) {
          const { data: existingQs } = await supabase
            .from('quiz_questions')
            .select('id')
            .eq('quiz_id', quizId)
            .eq('question_text', question.question_text)
            .limit(1);

          if (!existingQs || existingQs.length === 0) {
            await supabase.from('quiz_questions').insert({
              quiz_id: quizId,
              question_text: question.question_text,
              question_type: question.question_type,
              options: question.options,
              correct_answer: question.correct_answer,
              points: question.points,
              order_index: question.order_index
            });
          }
        }
      }

      seededCount++;
    }

    // 4. Seed Rewards Catalog
    const defaultRewards = [
      { name: 'Bono Combustible $50', description: 'Tarjeta electrónica recargable para cobertura de visitas en campo', points_cost: 500, stock: 20, status: 'active' },
      { name: 'Almuerzo Ejecutivo VIP', description: 'Voucher gastronómico para restaurante de alta gama', points_cost: 800, stock: 15, status: 'active' },
      { name: 'Día Libre Remunerado', description: 'Permiso compensatorio remunerado de jornada completa', points_cost: 1500, stock: 5, status: 'active' },
      { name: 'Gift Card Tecnológica $100', description: 'Bono canjeable para accesorios y gadgets de productividad', points_cost: 1200, stock: 10, status: 'active' }
    ];

    for (const rew of defaultRewards) {
      const { data: existingR } = await supabase
        .from('rewards_catalog')
        .select('id')
        .eq('name', rew.name)
        .limit(1);

      if (!existingR || existingR.length === 0) {
        await supabase.from('rewards_catalog').insert(rew);
      }
    }

    return {
      success: true,
      message: `Se sembraron y sincronizaron ${seededCount} cursos completos con todas sus lecciones y exámenes en Supabase.`,
      count: seededCount
    };
  } catch (error: any) {
    console.error('Error seeding LMS database:', error);
    return {
      success: false,
      message: error.message || 'Error al sembrar cursos en la base de datos.',
      count: 0
    };
  }
}
