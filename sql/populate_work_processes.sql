-- 1. Limpiar intentos previos (start fresh)
DELETE FROM public.work_processes;

-- 2. Insertar SOPs correctamente vinculados
INSERT INTO public.work_processes (
    user_id,
    name, description, department, responsible_person, objectives, scope, risks, diagram_nodes, diagram_edges, updated_at
)
SELECT 
    -- Búsqueda robusta del Dueño (Master)
    COALESCE(
        auth.uid(), 
        (SELECT user_id FROM public.user_roles WHERE role IN ('master', 'admin') LIMIT 1),
        (SELECT id FROM auth.users WHERE email ILIKE '%cesar%' LIMIT 1)
    ) as target_user_id,
    name, description, department, responsible_person, objectives, scope, risks::jsonb, diagram_nodes::jsonb, diagram_edges::jsonb, now()
FROM (VALUES 
    (
        'SOP-001: Ciclo de Pedido Triangulado',
        'Gestión de pedidos vía droguería sin facturación directa.',
        'Comercial', 'Gerente de Ventas',
        'Regular la toma de pedidos y validar stock.', 'Fuerza de Ventas',
        '[{"description": "Facturación directa prohibida", "severity": "High", "probability": "Low", "mitigation": "Bloqueo App"}]',
        -- Diagrama:
        '[
            {"id": "1", "type": "input", "data": {"label": "Inicio: Visita"}, "position": {"x": 250, "y": 0}},
            {"id": "2", "data": {"label": "Toma Inventario"}, "position": {"x": 250, "y": 100}},
            {"id": "3", "data": {"label": "Generar Pedido"}, "position": {"x": 250, "y": 200}},
            {"id": "4", "data": {"label": "Sel. Droguería"}, "position": {"x": 250, "y": 300}},
            {"id": "5", "type": "output", "data": {"label": "Fin: Despacho"}, "position": {"x": 250, "y": 400}}
        ]',
        '[
            {"id": "e1-2", "source": "1", "target": "2", "animated": true},
            {"id": "e2-3", "source": "2", "target": "3"},
            {"id": "e3-4", "source": "3", "target": "4"},
            {"id": "e4-5", "source": "4", "target": "5", "animated": true}
        ]'
    ),
    (
        'SOP-002: Control de Muestras Médicas',
        'Normativa para manejo y auditoría de muestras (MM).',
        'Auditoría', 'Gerente de Procesos',
        'Evitar inventarios negativos.', 'Todos los Reps',
        '[{"description": "Pérdida de Inventario", "severity": "High", "probability": "Low", "mitigation": "Auditoría Mensual"}]',
        '[]', '[]'
    ),
    (
        'SOP-003: Jornadas y Eventos Especiales',
        'Protocolo para eventos masivos.',
        'Marketing', 'Gerente Marketing',
        'Controlar salida de producto.', 'Marketing y Ventas',
        '[{"description": "Consumo no autorizado", "severity": "Medium", "probability": "Medium", "mitigation": "Vinculación a Evento"}]',
        '[]', '[]'
    ),
    (
        'POL-001: Políticas de Uso y Gobernanza',
        'Reglas sobre GPS y activos digitales.',
        'RRHH / Legal', 'Director RRHH',
        'Marco ético de la App.', 'Todos los empleados',
        '[{"description": "Violación Privacidad GPS", "severity": "High", "probability": "Low", "mitigation": "No-Rastreo fuera de horario"}]',
        '[]', '[]'
    )
) AS t(name, description, department, responsible_person, objectives, scope, risks, diagram_nodes, diagram_edges);
