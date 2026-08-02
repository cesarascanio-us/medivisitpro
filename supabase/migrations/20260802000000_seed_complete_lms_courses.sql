-- ========================================================================
-- LMS COMPLETE COURSES & ROLE-BASED ONBOARDING SEEDING
-- MediVisit Pro - Empresa CA
-- ========================================================================

DO $$
DECLARE
  v_mod_rep_id uuid;
  v_mod_mgr_id uuid;
  v_mod_adm_id uuid;
  v_mod_uni_id uuid;

  v_sec_id uuid;
  v_quiz_id uuid;
BEGIN

  -- -------------------------------------------------------------
  -- 1. CURSO REPRESENTANTE: Mastery de Campo
  -- -------------------------------------------------------------
  INSERT INTO public.training_modules (
    title, description, category, points_reward, duration_mins, difficulty,
    is_informative, target_roles, course_type, status
  ) VALUES (
    'Mastery de Campo: Ejecución de Visita Médica y Muestras',
    'Capacitación obligatoria para Representantes de Ventas: planificación de agenda, check-in con Geo-Tagging GPS, ayudas visuales interactivas, entrega de muestras y firmas digitales.',
    'app_onboarding', 150, 35, 'beginner', false, ARRAY['representative'], 'platform', 'published'
  )
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_mod_rep_id FROM public.training_modules
  WHERE title = 'Mastery de Campo: Ejecución de Visita Médica y Muestras' LIMIT 1;

  IF v_mod_rep_id IS NOT NULL THEN
    -- Sección 1
    INSERT INTO public.course_sections (module_id, title, order_index)
    VALUES (v_mod_rep_id, 'Sección 1: Planificación y Ruteo Inteligente', 0)
    RETURNING id INTO v_sec_id;

    INSERT INTO public.course_lessons (section_id, module_id, title, content_type, content_body, duration_mins, points_reward, is_required, order_index)
    VALUES
      (v_sec_id, v_mod_rep_id, '1.1 Optimización de Ruta Diaria y Mapa de Cobertura', 'text',
       '# Optimización de Ruta Diaria y Mapa de Cobertura\n\nComo Representante Médico, la preparación previa de tu jornada es el 50% del éxito en ventas.\n\n### 📍 1. Uso del Mapa de Cobertura\n1. Accede al menú lateral y haz clic en **"Mapa Cobertura"** o **"Agenda"**.\n2. Filtra los facultativos por **Especialidad médica** y por **Categoría A/B/C**.\n3. El mapa agrupa los consultorios cercanos para minimizar tiempos de traslado.\n\n### 📅 2. Creación de Citas en la Agenda\n- Selecciona el médico en el mapa y presiona **"Agendar Visita"**.\n- El sistema te alertará si el médico tiene un horario de atención restringido o si ya fue visitado en el ciclo actual.\n- Las citas se sincronizan con tu dispositivo para que puedas consultarlas incluso sin internet.',
       6, 25, true, 0),
      (v_sec_id, v_mod_rep_id, '1.2 Auditoría de Fichero y Actualización de Contactos', 'text',
       '# Auditoría y Mantenimiento de Contactos\n\nUn fichero médico desactualizado genera visitas perdidas y reportes erróneos.\n\n### 📋 Pasos para Mantener tus Contactos al Día:\n1. En la vista de **Médicos / Contactos**, verifica el número de colegiado, teléfono y correo electrónico.\n2. Si el médico cambió de consultorio o clínica, actualiza la dirección y presiona **"Guardar Ubicación GPS"** cuando estés en el nuevo sitio.\n3. Si el médico no ejerce o se trasladó de ciudad, notifícalo a tu Gerente mediante el botón **"Solicitar Baja/Cambio de Fichero"**.',
       5, 25, true, 1);

    -- Sección 2
    INSERT INTO public.course_sections (module_id, title, order_index)
    VALUES (v_mod_rep_id, 'Sección 2: Ejecución de la Visita y Firma Digital', 1)
    RETURNING id INTO v_sec_id;

    INSERT INTO public.course_lessons (section_id, module_id, title, content_type, content_body, duration_mins, points_reward, is_required, order_index)
    VALUES
      (v_sec_id, v_mod_rep_id, '2.1 Check-In con Geo-Tagging GPS y Modo Offline', 'text',
       '# Check-In Presencial con Geo-Tagging GPS\n\n### 🛰️ ¿Cómo funciona el Check-In?\n1. Al llegar a la puerta del consultorio o clínica, abre la cita en la app y pulsa **"Iniciar Visita"**.\n2. La app validará tus coordenadas GPS contra la ubicación registrada del médico:\n   - **Verde (Radio < 150m):** Visita verificada exitosamente en sitio.\n   - **Ámbar (Radio > 150m):** La app te solicitará una justificación breve.\n3. **¿No tienes señal móvil?** No te preocupes: **MediVisit Pro funciona 100% Offline**.',
       7, 25, true, 0),
      (v_sec_id, v_mod_rep_id, '2.2 Ayudas Visuales y Captura de Firma Digital', 'text',
       '# Presentación Interactiva y Firma de Conformidad\n\n### 📊 Presentación de Productos\n- Durante la entrevista médica, utiliza la pestaña **"Material Promocional"** para mostrar estudios clínicos y posología.\n\n### ✍️ Captura de Firma Digital\n1. Al finalizar la entrevista, pasa a la pantalla de **"Firma Digital"**.\n2. Pídele al médico que firme directamente sobre la pantalla táctil de tu teléfono o tablet.\n3. La firma queda estampada con marca de tiempo UTC y hash criptográfico.',
       7, 25, true, 1);

    -- Sección 3
    INSERT INTO public.course_sections (module_id, title, order_index)
    VALUES (v_mod_rep_id, 'Sección 3: Muestras Médicas y Cierre de Visita', 2)
    RETURNING id INTO v_sec_id;

    INSERT INTO public.course_lessons (section_id, module_id, title, content_type, content_body, duration_mins, points_reward, is_required, order_index)
    VALUES
      (v_sec_id, v_mod_rep_id, '3.1 Descargo de Muestras Médicas y Material POP', 'text',
       '# Control Riguroso de Muestras Médicas\n\n### 📦 Procedimiento de Entrega:\n1. En la sección **"Muestras Entregadas"**, selecciona los productos de tu stock asignado.\n2. Ingresa la cantidad exacta entregada.\n3. Selecciona el **Lote** correspondiente.\n4. El inventario personal de tu maletín se descuenta en tiempo real.\n\n> 🔒 **Regla de Cumplimiento:** Toda entrega de muestras debe coincidir con la firma del médico.',
       5, 25, true, 0),
      (v_sec_id, v_mod_rep_id, '3.2 Cierre de Visita, Compromisos y Próximos Pasos', 'text',
       '# Cierre y Compromisos de Prescripción\n\n### 📝 Al pulsar "Finalizar Visita":\n- Registra el **Nivel de Aceptación** del médico (Alto, Medio, Bajo).\n- Anota las **Objeciones o Dudas** planteadas.\n- Programa el **Compromiso** para el próximo ciclo.\n- Presiona **"Guardar y Sincronizar"**.',
       5, 25, true, 1);

    -- Quiz
    INSERT INTO public.course_quizzes (module_id, title, passing_score, max_attempts, time_limit_mins)
    VALUES (v_mod_rep_id, 'Examen de Certificación: Ejecución de Visita Médica y Muestras', 80, 3, 15)
    RETURNING id INTO v_quiz_id;

    INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index)
    VALUES
      (v_quiz_id, '¿Qué ocurre si realizas el Check-in en un consultorio sin conexión a internet?', 'multiple_choice',
       '[{"label":"La app guarda los datos encriptados localmente y se sincronizan al volver la señal","value":"opt_0"},{"label":"La app bloquea el dispositivo y se pierde la visita","value":"opt_1"},{"label":"Se debe reiniciar el teléfono de inmediato","value":"opt_2"},{"label":"El médico debe firmar un papel físico obligatorio","value":"opt_3"}]'::jsonb,
       'opt_0', 20, 0),
      (v_quiz_id, '¿El descargo de muestras médicas actualiza el kardex e inventario del visitador en tiempo real?', 'true_false',
       '[{"label":"Verdadero (Se descuenta del stock personal inmediatamente)","value":"true"},{"label":"Falso (Solo se actualiza a fin de mes)","value":"false"}]'::jsonb,
       'true', 20, 1),
      (v_quiz_id, '¿Cuál es el radio GPS sugerido para que el Check-in se marque en estado Verde (verificado en sitio)?', 'multiple_choice',
       '[{"label":"Menor a 150 metros del consultorio","value":"opt_0"},{"label":"A más de 5 kilómetros de distancia","value":"opt_1"},{"label":"En cualquier parte de la ciudad sin restricción","value":"opt_2"},{"label":"Únicamente en la sede corporativa de la empresa","value":"opt_3"}]'::jsonb,
       'opt_0', 20, 2),
      (v_quiz_id, '¿Es obligatorio capturar la firma digital del médico para validar la entrega de muestras médicas?', 'true_false',
       '[{"label":"Verdadero (Requisito regulatorio y de auditoría interna)","value":"true"},{"label":"Falso (Es totalmente opcional y se puede omitir siempre)","value":"false"}]'::jsonb,
       'true', 20, 3),
      (v_quiz_id, '¿Qué acción clave se debe registrar al finalizar la visita médica en la app?', 'multiple_choice',
       '[{"label":"Nivel de aceptación, objeciones y compromisos de seguimiento","value":"opt_0"},{"label":"Borrar el contacto del médico","value":"opt_1"},{"label":"Cerrar la sesión de usuario y desinstalar la app","value":"opt_2"},{"label":"Enviar un correo manual al director general","value":"opt_3"}]'::jsonb,
       'opt_0', 20, 4);
  END IF;

  -- -------------------------------------------------------------
  -- 2. CURSO GERENTE: Supervisión Gerencial
  -- -------------------------------------------------------------
  INSERT INTO public.training_modules (
    title, description, category, points_reward, duration_mins, difficulty,
    is_informative, target_roles, course_type, status
  ) VALUES (
    'Supervisión Gerencial: Ciclos, Cobertura y Tablero de Control',
    'Capacitación obligatoria para Gerentes y Supervisores: diseño de ciclos promocionales, asignación de baremos, auditoría de rutas en vivo, transferencias de pedidos y canje de premios.',
    'management', 200, 40, 'intermediate', false, ARRAY['manager', 'gerente', 'admin'], 'platform', 'published'
  )
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_mod_mgr_id FROM public.training_modules
  WHERE title = 'Supervisión Gerencial: Ciclos, Cobertura y Tablero de Control' LIMIT 1;

  IF v_mod_mgr_id IS NOT NULL THEN
    INSERT INTO public.course_sections (module_id, title, order_index)
    VALUES (v_mod_mgr_id, 'Sección 1: Planificación de Ciclos y Territorios', 0)
    RETURNING id INTO v_sec_id;

    INSERT INTO public.course_lessons (section_id, module_id, title, content_type, content_body, duration_mins, points_reward, is_required, order_index)
    VALUES
      (v_sec_id, v_mod_mgr_id, '2.1 Creación de Ciclos Promocionales y Cuotas de Visita', 'text',
       '# Estructura de Ciclos Promocionales en MediVisit Pro\n\n### 🎯 Pasos para Crear un Ciclo:\n1. Navega a **"Ciclos Promocionales"** en el panel de Gestión.\n2. Define la fecha de inicio y fin.\n3. Configura la **Frecuencia de Visita** (Cat A: 2x ciclo, Cat B: 1x ciclo).\n4. Asigna las **Parrillas de Producto Prioritarias**.',
       8, 35, true, 0),
      (v_sec_id, v_mod_mgr_id, '2.2 Asignación de Baremos y Zonas Comerciales', 'text',
       '# Baremos y Distribución Territorial\n\n- Establece los topes de descuento autorizados para farmacias independientes vs cadenas.\n- Asigna las zonas geográficas a cada visitador para evitar solapamientos.\n- Define las cuotas de pedidos transfer.',
       7, 35, true, 1);

    INSERT INTO public.course_sections (module_id, title, order_index)
    VALUES (v_mod_mgr_id, 'Sección 2: Auditoría y Control en Tiempo Real', 1)
    RETURNING id INTO v_sec_id;

    INSERT INTO public.course_lessons (section_id, module_id, title, content_type, content_body, duration_mins, points_reward, is_required, order_index)
    VALUES
      (v_sec_id, v_mod_mgr_id, '2.3 Dashboard Gerencial y KPIs de Cobertura', 'text',
       '# Monitoreo del Tablero de Control Gerencial\n\n### 📊 Indicadores Críticos:\n1. **Cobertura de Fichero (%):** Porcentaje de médicos visitados.\n2. **Visitas Efectivas vs Desviadas:** Proporción de Check-ins con GPS validado.\n3. **Muestras Entregadas por Especialidad**.\n4. **Top Representantes del Ciclo**.',
       8, 40, true, 0),
      (v_sec_id, v_mod_mgr_id, '2.4 Gestión de Premios e Incentivos del Equipo', 'text',
       '# Aprobación de Canjes en la Tienda de Premios\n\n1. Ingresa a **"Gestión Academia & Premios"** > pestaña **"Solicitudes de Canje"** (o **/rewards**).\n2. Revisa el colaborador, fecha y puntos.\n3. Haz clic en **"Aprobar"** o **"Entregar"**.',
       7, 40, true, 1);

    INSERT INTO public.course_quizzes (module_id, title, passing_score, max_attempts, time_limit_mins)
    VALUES (v_mod_mgr_id, 'Examen de Certificación Gerencial: Ciclos, Cobertura y Auditoría', 80, 3, 15)
    RETURNING id INTO v_quiz_id;

    INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index)
    VALUES
      (v_quiz_id, '¿Cuál es la frecuencia de visita estándar recomendada para médicos de Categoría A en un ciclo promocional?', 'multiple_choice',
       '[{"label":"2 visitas por ciclo promocional","value":"opt_0"},{"label":"1 visita al año","value":"opt_1"},{"label":"Ninguna visita requerida","value":"opt_2"},{"label":"Solo llamada telefónica","value":"opt_3"}]'::jsonb,
       'opt_0', 20, 0),
      (v_quiz_id, '¿El Dashboard Gerencial permite auditar en tiempo real la cobertura efectiva de cada representante de campo?', 'true_false',
       '[{"label":"Verdadero (Muestra visitas realizadas vs planificadas y validación GPS)","value":"true"},{"label":"Falso (Solo muestra datos con 30 días de retraso)","value":"false"}]'::jsonb,
       'true', 20, 1),
      (v_quiz_id, '¿Dónde puede el Gerente aprobar o entregar los premios canjeados por los visitadores médicos?', 'multiple_choice',
       '[{"label":"En el módulo de Premios (/rewards) y Gestión Academia (/admin/academy)","value":"opt_0"},{"label":"Solo imprimiendo un formulario físico en papel","value":"opt_1"},{"label":"No se pueden gestionar premios en la plataforma","value":"opt_2"},{"label":"En la papelera de reciclaje del sistema","value":"opt_3"}]'::jsonb,
       'opt_0', 20, 2),
      (v_quiz_id, '¿Qué módulo de la plataforma se utiliza para configurar políticas de descuento y cuotas de transferencia?', 'multiple_choice',
       '[{"label":"Módulo de Baremos y Ciclos Promocionales","value":"opt_0"},{"label":"Módulo de Ayuda y FAQ","value":"opt_1"},{"label":"Configuración de tema visual","value":"opt_2"},{"label":"Calculadora de combustible","value":"opt_3"}]'::jsonb,
       'opt_0', 20, 3),
      (v_quiz_id, '¿Es posible rechazar una solicitud de canje si el colaborador no cumple los criterios de auditoría?', 'true_false',
       '[{"label":"Verdadero (El gerente tiene la potestad de aprobar o rechazar con motivo)","value":"true"},{"label":"Falso (Todos los canjes son automáticos e irreversibles)","value":"false"}]'::jsonb,
       'true', 20, 4);
  END IF;

  -- -------------------------------------------------------------
  -- 3. CURSO UNIVERSAL: Guía de la App por Roles
  -- -------------------------------------------------------------
  INSERT INTO public.training_modules (
    title, description, category, points_reward, duration_mins, difficulty,
    is_informative, target_roles, course_type, status
  ) VALUES (
    'Guía Universal de la App: Flujo Operativo según tu Rol',
    'Manual interactivo para todos los usuarios: cómo navegar tu panel de control, aprovechar el modo Offline en consultorios, acumular puntos y canjear premios.',
    'app_onboarding', 120, 30, 'beginner', false, ARRAY['representative', 'manager', 'admin'], 'platform', 'published'
  )
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_mod_uni_id FROM public.training_modules
  WHERE title = 'Guía Universal de la App: Flujo Operativo según tu Rol' LIMIT 1;

  IF v_mod_uni_id IS NOT NULL THEN
    INSERT INTO public.course_sections (module_id, title, order_index)
    VALUES (v_mod_uni_id, 'Sección 1: Tu Espacio de Trabajo Personalizado', 0)
    RETURNING id INTO v_sec_id;

    INSERT INTO public.course_lessons (section_id, module_id, title, content_type, content_body, duration_mins, points_reward, is_required, order_index)
    VALUES
      (v_sec_id, v_mod_uni_id, '4.1 Interfaz Adaptativa según tu Rol', 'text',
       '# Tu Espacio de Trabajo en MediVisit Pro\n\n### 👤 Si eres Visitador:\n- Agenda, Médicos, Farmacias, Muestras y Academia.\n\n### 👔 Si eres Gerente:\n- Dashboard, Ciclos, Baremos y Gestión Academia.',
       6, 20, true, 0),
      (v_sec_id, v_mod_uni_id, '4.2 Modo Offline y Resiliencia en Zonas sin Cobertura', 'text',
       '# ¿Cómo Trabajar sin Internet?\n\n- Puedes realizar Check-ins, mostrar ayudas visuales y capturar firmas normalmente.\n- Sincronización automática apenas recuperes conexión.',
       6, 20, true, 1);

    INSERT INTO public.course_sections (module_id, title, order_index)
    VALUES (v_mod_uni_id, 'Sección 2: Gamificación, Academia y Premios', 1)
    RETURNING id INTO v_sec_id;

    INSERT INTO public.course_lessons (section_id, module_id, title, content_type, content_body, duration_mins, points_reward, is_required, order_index)
    VALUES
      (v_sec_id, v_mod_uni_id, '4.3 Cómo Aprobar Cursos, Acumular Puntos y Canjear Premios', 'text',
       '# El Ecosistema de Formación e Incentivos\n\n1. Estudia las lecciones.\n2. Rinde el examen de certificación.\n3. Suma puntos automáticamente a tu perfil.\n4. Visita la Tienda de Premios (/rewards) y canjea tus recompensas.',
       6, 20, true, 0);

    INSERT INTO public.course_quizzes (module_id, title, passing_score, max_attempts, time_limit_mins)
    VALUES (v_mod_uni_id, 'Examen de Certificación: Guía Universal de la App', 75, 3, 15)
    RETURNING id INTO v_quiz_id;

    INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index)
    VALUES
      (v_quiz_id, '¿Qué sucede cuando completas las lecciones y apruebas el examen de un curso en la Academia?', 'multiple_choice',
       '[{"label":"Se acreditan puntos a tu saldo personal para canjear en la Tienda de Premios","value":"opt_0"},{"label":"Se borra tu cuenta de usuario","value":"opt_1"},{"label":"Te cobra una tarifa adicional","value":"opt_2"},{"label":"No ocurre nada","value":"opt_3"}]'::jsonb,
       'opt_0', 25, 0),
      (v_quiz_id, '¿La app MediVisit Pro permite realizar visitas y capturar firmas médicas sin conexión a internet?', 'true_false',
       '[{"label":"Verdadero (Modo Offline transparente con sincronización automática)","value":"true"},{"label":"Falso (Es imposible usar la app sin internet constante)","value":"false"}]'::jsonb,
       'true', 25, 1),
      (v_quiz_id, '¿En qué sección de la plataforma puedes canjear tus puntos acumulados por beneficios reales?', 'multiple_choice',
       '[{"label":"En el Catálogo de Premios e Incentivos (/rewards)","value":"opt_0"},{"label":"En la papelera de reciclaje","value":"opt_1"},{"label":"En la pantalla de inicio de sesión","value":"opt_2"},{"label":"En la calculadora de combustible","value":"opt_3"}]'::jsonb,
       'opt_0', 25, 2),
      (v_quiz_id, '¿La interfaz de MediVisit Pro se personaliza automáticamente de acuerdo al rol del usuario?', 'true_false',
       '[{"label":"Verdadero (Cada rol tiene acceso a sus herramientas específicas)","value":"true"},{"label":"Falso (Todos los usuarios ven exactamente lo mismo)","value":"false"}]'::jsonb,
       'true', 25, 3);
  END IF;

  -- -------------------------------------------------------------
  -- 4. REWARDS CATALOG INICIAL
  -- -------------------------------------------------------------
  INSERT INTO public.rewards_catalog (name, description, points_cost, stock, status)
  VALUES
    ('Bono Combustible $50', 'Tarjeta electrónica recargable para cobertura de visitas en campo', 500, 20, 'active'),
    ('Almuerzo Ejecutivo VIP', 'Voucher gastronómico para restaurante de alta gama', 800, 15, 'active'),
    ('Día Libre Remunerado', 'Permiso compensatorio remunerado de jornada completa', 1500, 5, 'active'),
    ('Gift Card Tecnológica $100', 'Bono canjeable para accesorios y gadgets de productividad', 1200, 10, 'active')
  ON CONFLICT DO NOTHING;

END $$;
