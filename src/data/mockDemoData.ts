/* ========================================================================
 MASTER FRAMEWORK - EMPRESA CA
 Copyright (c) 2026 César Ascanio. Todos los derechos reservados.

 Nivel de Acceso: CONFIDENCIAL / PROPIEDAD EXCLUSIVA
 Queda estrictamente prohibida la copia, modificación, distribución,
 ingeniería inversa o uso no autorizado de este código fuente.
 ======================================================================== */

/**
 * Mock Demo Data - Isolated from Supabase
 * This data is used when isDemo = true
 * 
 * IMPORTANT: Data structures must match Supabase response formats
 * for component compatibility
 */

// Demo User ID (fake but consistent)
export const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000-000000000001';
export const DEMO_ORG_ID = 'd3300000-0000-0000-0000-000000000001';

// Helpers
const formatDate = (daysAway: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAway);
    return date.toISOString().split('T')[0];
};

// ==================== PRODUCTS ====================
export const MOCK_PRODUCTS = [
    {
        id: 'prod-001',
        name: 'Atorvastatina 20mg',
        description: 'Estatina para el control del colesterol',
        category: 'Cardiovascular',
        therapeutic_area: 'Cardiología',
        dosage: '20mg',
        presentation: 'Caja x 30 tabletas',
        price: 25.50,
        is_sample: true,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: 'prod-002',
        name: 'Omeprazol 20mg',
        description: 'Inhibidor de bomba de protones',
        category: 'Gastrointestinal',
        therapeutic_area: 'Gastroenterología',
        dosage: '20mg',
        presentation: 'Caja x 14 cápsulas',
        price: 15.00,
        is_sample: true,
        created_at: '2025-01-02T10:00:00Z'
    },
    {
        id: 'prod-003',
        name: 'Losartán 50mg',
        description: 'Antagonista del receptor de angiotensina II',
        category: 'Cardiovascular',
        therapeutic_area: 'Cardiología',
        dosage: '50mg',
        presentation: 'Caja x 30 tabletas',
        price: 22.00,
        is_sample: true,
        created_at: '2025-01-03T10:00:00Z'
    },
    {
        id: 'prod-004',
        name: 'Metformina 850mg',
        description: 'Antidiabético oral',
        category: 'Endocrinología',
        therapeutic_area: 'Diabetes',
        dosage: '850mg',
        presentation: 'Caja x 30 tabletas',
        price: 12.50,
        is_sample: true,
        created_at: '2025-01-04T10:00:00Z'
    },
    {
        id: 'prod-launch-001',
        name: 'NeuroFortis Plus',
        description: 'Suplemento neuroprotector de alta potencia',
        category: 'Premium Launch',
        therapeutic_area: 'Neurología',
        dosage: '5mg/kg',
        presentation: 'Frasco 120ml',
        price: 45.00,
        is_sample: true,
        created_at: '2026-02-17T10:00:00Z',
        selling_points: {
            "Clínico": "Liberación controlada 24h",
            "Eficacia": "Mejora cognitiva en 14 días",
            "Seguridad": "Complejo B de grado médico",
            "Diferencial": "Sabor cereza natural"
        },
        dosage_config: {
            "default_dose_mg_kg": 5,
            "concentration_mg_ml": 50,
            "presentation_unit": "mL"
        }
    }
];

// ==================== MATERIAL POP ====================
export const MOCK_MATERIAL_POP = [
    {
        id: 'pop-001',
        name: 'Bolígrafo Corporativo',
        description: 'Bolígrafo azul con logo de la empresa',
        category: 'Escritura',
        quantity: 200,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: 'pop-002',
        name: 'Libreta de Notas',
        description: 'Libreta de tapa dura A5',
        category: 'Oficina',
        quantity: 100,
        created_at: '2025-01-01T10:00:00Z'
    }
];

// ==================== PHARMACIES ====================
export const MOCK_PHARMACIES = [
    {
        id: 'pharm-001',
        name: 'Farmatodo Principal',
        rif: 'J-12345678-0',
        address: 'Av. Las Mercedes, Caracas',
        city: 'Caracas',
        state: 'Miranda',
        phone: '0212-9998877',
        email: 'mercedes@farmatodo.com',
        potential: 'Alto',
        status: 'Activo',
        last_visit: formatDate(-15)
    },
    {
        id: 'pharm-002',
        name: 'Locatel Chacao',
        rif: 'J-87654321-0',
        address: 'Calle Elice, Chacao',
        city: 'Caracas',
        state: 'Miranda',
        phone: '0212-2634455',
        email: 'chacao@locatel.com',
        potential: 'Medio',
        status: 'Activo',
        last_visit: formatDate(-30)
    }
];

// ==================== DOCTORS ====================
export const MOCK_DOCTORS = [
    {
        id: 'doc-001',
        name: 'Dr. Alejandro Pérez',
        specialty: 'Cardiología',
        specialty_id: 'spec-01',
        specialties: { name: 'Cardiología' },
        health_center: 'Clínica Metropolitana',
        city: 'Caracas',
        potential: 'Alto',
        status: 'Activo',
        phone: '0414-1112233',
        email: 'aperez@climetro.com'
    },
    {
        id: 'doc-002',
        name: 'Dra. María García',
        specialty: 'Pediatría',
        specialty_id: 'spec-02',
        specialties: { name: 'Pediatría' },
        health_center: 'Centro Médico Docente La Trinidad',
        city: 'Caracas',
        potential: 'Medio',
        status: 'Activo',
        phone: '0412-3334455',
        email: 'mgarcia@cmdlt.edu'
    }
];

// ==================== CONTACTS ====================
export const MOCK_CONTACTS = [
    {
        id: 'cont-001',
        name: 'Farmacia La Salud',
        type: 'Farmacia',
        address: 'Calle 1, Edif. 1',
        city: 'Caracas',
        email: 'contacto@lasalud.com'
    }
];

// ==================== COMMERCES ====================
export const MOCK_COMMERCES = [
    {
        id: 'comm-001',
        name: 'Bodegón Las Delicias',
        rif: 'J-44332211-0',
        address: 'Av. Principal de Las Mercedes',
        city: 'Caracas',
        potential: 'Alto',
        phone: '0212-9912233'
    },
    {
        id: 'comm-002',
        name: 'Automercados Plaza',
        rif: 'J-00998877-1',
        address: 'Centro Comercial Los Samanes',
        city: 'Caracas',
        potential: 'Muy Alto',
        phone: '0212-9445566'
    }
];

// ==================== DRUGSTORES ====================
export const MOCK_DRUGSTORES = [
    {
        id: 'ds-001',
        name: 'Droguería Nena',
        code: 'DR-001',
        contact_name: 'Juan Pérez',
        phone: '0212-5556677',
        email: 'jperez@nena.com'
    }
];

// ==================== INVENTORY ====================
export const MOCK_DRUGSTORE_INVENTORY = [
    {
        id: 'inv-ds-001',
        drugstore_id: 'ds-001',
        product_id: 'prod-001',
        quantity: 500,
        updated_at: formatDate(-2)
    }
];

// ==================== HEALTH CENTERS ====================
export const MOCK_HEALTH_CENTERS = [
    {
        id: 'hc-001',
        name: 'Clínica Metropolitana',
        type: 'Clínica',
        address: 'Calle A, Caurimare',
        city: 'Caracas',
        potential: 'Alto'
    },
    {
        id: 'hc-002',
        name: 'Hospital Universitario de Caracas',
        type: 'Hospital',
        address: 'Ciudad Universitaria',
        city: 'Caracas',
        potential: 'Medio'
    }
];

// ==================== VISITS ====================
export const MOCK_VISITS = [
    // --- Visitas a Farmacias ---
    {
        id: 'vis-001',
        contact_id: 'pharm-001',
        status: 'completed',
        scheduled_date: formatDate(-5),
        visit_type: 'Farmacia',
        summary: 'Visita de seguimiento. Stock de Atorvastatina 20mg bajo (12 unidades). Se acordó reposición urgente vía Droguería Nena.',
        unified_contacts: { name: 'Farmatodo Principal', specialty: 'Farmacia', address: 'Av. Las Mercedes, Caracas' }
    },
    {
        id: 'vis-002',
        contact_id: 'pharm-002',
        status: 'completed',
        scheduled_date: formatDate(-18),
        visit_type: 'Farmacia',
        summary: 'Auditoría de anaquel. Producto bien exhibido. PVP alineado con política comercial. Sin novedades.',
        unified_contacts: { name: 'Locatel Chacao', specialty: 'Farmacia', address: 'Calle Elice, Chacao' }
    },
    // --- Visitas a Dr. Alejandro Pérez (doc-001) ---
    {
        id: 'vis-doc-001a',
        contact_id: 'doc-001',
        status: 'completed',
        scheduled_date: formatDate(-3),
        visit_type: 'Médico',
        summary: 'Presentación de NeuroFortis Plus. El doctor mostró interés en la liberación controlada 24h. Solicitó estudios clínicos de Fase III.',
        objective: 'Introducir NeuroFortis Plus en el portafolio prescriptivo del especialista.',
        unified_contacts: { name: 'Dr. Alejandro Pérez', specialty: 'Cardiología', address: 'Clínica Metropolitana' }
    },
    {
        id: 'vis-doc-001b',
        contact_id: 'doc-001',
        status: 'completed',
        scheduled_date: formatDate(-17),
        visit_type: 'Médico',
        summary: 'Seguimiento Atorvastatina 20mg. Doctor reporta buena adherencia de sus pacientes. Solicita 10 muestras adicionales para pacientes nuevos.',
        objective: 'Reforzar posicionamiento de Atorvastatina como primera línea de tratamiento.',
        unified_contacts: { name: 'Dr. Alejandro Pérez', specialty: 'Cardiología', address: 'Clínica Metropolitana' }
    },
    {
        id: 'vis-doc-001c',
        contact_id: 'doc-001',
        status: 'completed',
        scheduled_date: formatDate(-35),
        visit_type: 'Médico',
        summary: 'Primera visita del ciclo Q1. Se revisó portafolio completo. Doctor indica que usa Losartán 50mg de competencia; oportunidad de conversión.',
        objective: 'Mapeo terapéutico: identificar productos de competencia en el formulario del médico.',
        unified_contacts: { name: 'Dr. Alejandro Pérez', specialty: 'Cardiología', address: 'Clínica Metropolitana' }
    },
    {
        id: 'vis-doc-001d',
        contact_id: 'doc-001',
        status: 'scheduled',
        scheduled_date: formatDate(4),
        visit_type: 'Médico',
        summary: '',
        objective: 'Entrega de estudios clínicos NeuroFortis Plus solicitados en visita anterior.',
        unified_contacts: { name: 'Dr. Alejandro Pérez', specialty: 'Cardiología', address: 'Clínica Metropolitana' }
    },
    // --- Visitas a Dra. María García (doc-002) ---
    {
        id: 'vis-doc-002a',
        contact_id: 'doc-002',
        status: 'completed',
        scheduled_date: formatDate(-7),
        visit_type: 'Médico',
        summary: 'Visita en consultorio. Dra. García utiliza Omeprazol 20mg frecuentemente. Le interesa dosificación pediátrica de NeuroFortis. Se dejaron 5 muestras.',
        objective: 'Posicionar NeuroFortis en pediatría (uso off-label supervisado).',
        unified_contacts: { name: 'Dra. María García', specialty: 'Pediatría', address: 'Centro Médico Docente La Trinidad' }
    },
    {
        id: 'vis-doc-002b',
        contact_id: 'doc-002',
        status: 'completed',
        scheduled_date: formatDate(-28),
        visit_type: 'Médico',
        summary: 'Revisión de protocolo de Metformina pediátrica. La doctora prefiere presentación líquida. Oportunidad para futuro lanzamiento. Se entregó material POP.',
        objective: 'Fortalecer relación comercial y obtener feedback sobre presentaciones.',
        unified_contacts: { name: 'Dra. María García', specialty: 'Pediatría', address: 'Centro Médico Docente La Trinidad' }
    },
    {
        id: 'vis-doc-002c',
        contact_id: 'doc-002',
        status: 'scheduled',
        scheduled_date: formatDate(8),
        visit_type: 'Médico',
        summary: '',
        objective: 'Seguimiento de muestras NeuroFortis dejadas en visita anterior. Recopilar feedback de pacientes.',
        unified_contacts: { name: 'Dra. María García', specialty: 'Pediatría', address: 'Centro Médico Docente La Trinidad' }
    }
];

// ==================== OBJECTIVES ====================
export const MOCK_OBJECTIVES = [
    {
        id: 'obj-001',
        title: 'Lanzamiento NeuroFortis',
        target_value: 100,
        current_value: 45,
        status: 'in_progress'
    }
];

// ==================== CYCLES & PLANS ====================
export const MOCK_CYCLES = [
    {
        id: 'cyc-01',
        name: 'Ciclo Q1 - 2025',
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        is_active: true
    }
];

export const MOCK_WEEKLY_PLANS = [
    {
        id: 'wp-01',
        cycle_id: 'cyc-01',
        week_number: 7,
        status: 'active'
    }
];

export const MOCK_PLAN_DETAILS = [
    {
        id: 'pd-01',
        weekly_plan_id: 'wp-01',
        day_of_week: 'Lunes',
        scheduled_date: formatDate(0),
        date: formatDate(0),
        status: 'scheduled',
        directory_item: {
            id: 'doc-001',
            name: 'Dr. Alejandro Pérez',
            address: 'Clínica Metropolitana',
            city: 'Caracas',
            entity_type: 'doctor'
        }
    },
    {
        id: 'pd-02',
        weekly_plan_id: 'wp-01',
        day_of_week: 'Martes',
        scheduled_date: formatDate(1),
        date: formatDate(1),
        status: 'scheduled',
        directory_item: {
            id: 'pharm-001',
            name: 'Farmatodo Principal',
            address: 'Av. Las Mercedes, Caracas',
            city: 'Caracas',
            entity_type: 'pharmacy'
        }
    },
    {
        id: 'pd-03',
        weekly_plan_id: 'wp-01',
        day_of_week: 'Miércoles',
        scheduled_date: formatDate(2),
        date: formatDate(2),
        status: 'scheduled',
        directory_item: {
            id: 'comm-001',
            name: 'Bodegón Las Delicias',
            address: 'Av. Principal de Las Mercedes',
            city: 'Caracas',
            entity_type: 'commerce'
        }
    }
];

// ==================== DASHBOARD STATS ====================
export const MOCK_DASHBOARD_STATS = {
    total_visits: 125,
    coverage: 85.5,
    total_sales: 12500,
    active_doctors: 45,
    active_pharmacies: 22
};

// ==================== SAMPLE BANKS & MOVEMENTS ====================
export const MOCK_SAMPLE_BANKS = [
    {
        id: 'bank-01',
        name: 'Almacén Central',
        type: 'Principal'
    }
];

// ==================== BANK INVENTORY ====================
export const MOCK_BANK_INVENTORY = [
    {
        bank_id: 'bank-01',
        product_id: 'prod-001',
        quantity: 1000
    }
];

// ==================== SAMPLE MOVEMENTS ====================
export const MOCK_SAMPLE_MOVEMENTS = [
    {
        id: 'mov-01',
        type: 'entry',
        quantity: 500,
        product_name: 'Losartán 50mg'
    }
];

// ==================== INVENTORY ====================
export const MOCK_INVENTORY = [
    {
        id: 'inv-01',
        product_id: 'prod-001',
        quantity: 50
    }
];

// ==================== EVENTS ====================
export const MOCK_EVENTS = [
    {
        id: 'ev-01',
        title: 'Congreso de Cardiología',
        scheduled_date: formatDate(5),
        description: 'Evento de cardiología regional con enfoque en nuevos tratamientos.',
        event_type: 'conference',
        location: 'Hotel Eurobuilding Caracas',
        status: 'scheduled',
        attendees_count: 150,
        notes: 'Protocolo de alta visibilidad académica.',
        end_date: null
    }
];

// ==================== PHARMACY INVENTORY ====================
export const MOCK_PHARMACY_INVENTORY = [
    {
        pharmacy_id: 'pharm-001',
        producto_id: 'prod-001',
        product_name: 'Atorvastatina 20mg',
        tiene_stock: true,
        pvp: 28.50,
        last_audit_date: formatDate(-5),
        audit_id: 'audit-ph-001'
    }
];

// ==================== TRANSFERS & HISTORY ====================
export const MOCK_TRANSFERS = [
    {
        id: 'trans-001',
        order_number: 'TR-2025-001',
        pharmacy_name: 'Farmatodo Principal',
        pharmacy_address: 'Av. Las Mercedes, Caracas',
        pharmacy_phone: '0212-9998877',
        drugstore_name: 'Droguería Nena',
        drugstore_code: 'DR-001',
        drugstore_id: 'ds-001',
        products: [
            { id: 'prod-001', name: 'Atorvastatina 20mg', quantity: 50, unit_price: 25.50 }
        ],
        subtotal: 1275.00,
        tax: 204.00,
        total: 1479.00,
        status: 'confirmed',
        order_type: 'transfer',
        order_date: '2025-02-10T10:00:00Z',
        delivery_date: '2025-02-12T10:00:00Z',
        notes: 'Pedido mensual estándar',
        document_generated: true,
        document_url: null,
        created_at: '2025-02-10T10:00:00Z'
    }
];

export const MOCK_TRANSFER_HISTORY = [
    {
        id: 'hist-001',
        transfer_order_id: 'trans-001',
        action: 'created',
        changes_description: 'Pedido inicial creado por el representante',
        created_at: '2025-02-10T10:00:00Z'
    }
];

// ==================== EXPORT ALL ====================
export const MOCK_DATA = {
    pharmacies: MOCK_PHARMACIES,
    doctors: MOCK_DOCTORS,
    contacts: MOCK_CONTACTS,
    commerces: MOCK_COMMERCES,
    drugstores: MOCK_DRUGSTORES,
    drugstoreInventory: MOCK_DRUGSTORE_INVENTORY,
    healthCenters: MOCK_HEALTH_CENTERS,
    products: MOCK_PRODUCTS,
    materialPop: MOCK_MATERIAL_POP,
    visits: MOCK_VISITS,
    inventory: MOCK_INVENTORY,
    objectives: MOCK_OBJECTIVES,
    dashboardStats: MOCK_DASHBOARD_STATS,
    cycles: MOCK_CYCLES,
    weeklyPlans: MOCK_WEEKLY_PLANS,
    planDetails: MOCK_PLAN_DETAILS,
    sampleBanks: MOCK_SAMPLE_BANKS,
    bankInventory: MOCK_BANK_INVENTORY,
    events: MOCK_EVENTS,
    sampleMovements: MOCK_SAMPLE_MOVEMENTS,
    pharmacyInventory: MOCK_PHARMACY_INVENTORY,
    transfers: MOCK_TRANSFERS,
    transferHistory: MOCK_TRANSFER_HISTORY
};
