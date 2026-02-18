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
        description: 'Libreta A5 con portada corporativa',
        category: 'Papelería',
        quantity: 150,
        created_at: '2025-01-02T10:00:00Z'
    },
    {
        id: 'pop-003',
        name: 'Folleto Informativo',
        description: 'Folleto tríptico con información de productos',
        category: 'Impresiones',
        quantity: 500,
        created_at: '2025-01-03T10:00:00Z'
    }
];

// ==================== HEALTH CENTERS ====================
export const MOCK_HEALTH_CENTERS = [
    {
        id: 'hc-001',
        user_id: DEMO_USER_ID,
        name: 'Hospital Central de Caracas',
        type: 'hospital',
        address: 'Av. Libertador, Edificio Principal',
        city: 'Caracas',
        state: 'Distrito Capital',
        phone: '0212-666-6666',
        contact_name: 'Dr. Administrador',
        email: 'info@hospitalcentral.com',
        potential: 'Alto',
        status: 'active',
        doctors_count: 45,
        last_visit: '2026-01-08',
        latitude: 10.4925,
        longitude: -66.8787,
        created_at: '2025-05-01T10:00:00Z'
    },
    {
        id: 'hc-002',
        user_id: DEMO_USER_ID,
        name: 'Clínica Modelo Valencia',
        type: 'clinica',
        address: 'Urbanización El Bosque, Av. Principal',
        city: 'Valencia',
        state: 'Carabobo',
        phone: '0241-777-7777',
        contact_name: 'Lic. Coordinador',
        email: 'contacto@clinicamodelo.com',
        potential: 'Medio',
        status: 'active',
        doctors_count: 22,
        last_visit: '2026-01-05',
        latitude: 10.1579,
        longitude: -67.9969,
        created_at: '2025-05-15T11:00:00Z'
    },
    {
        id: 'hc-003',
        user_id: DEMO_USER_ID,
        name: 'Centro Médico La Trinidad',
        type: 'consultorio',
        address: 'Urb. La Trinidad, Centro Comercial',
        city: 'Caracas',
        state: 'Distrito Capital',
        phone: '0212-888-8888',
        contact_name: 'Admin. Mercedes',
        email: 'info@latrinidad.com',
        potential: 'Alto',
        status: 'active',
        doctors_count: 18,
        last_visit: '2026-01-10',
        latitude: 10.4680,
        longitude: -66.8960,
        created_at: '2025-06-01T09:00:00Z'
    },
    {
        id: 'hc-004',
        user_id: DEMO_USER_ID,
        name: 'Ambulatorio Municipal',
        type: 'ambulatorio',
        address: 'Calle Principal S/N',
        city: 'Maracaibo',
        state: 'Zulia',
        phone: '0261-555-5555',
        contact_name: 'Dr. Director',
        email: 'ambulatorio@salud.gob.ve',
        potential: 'Bajo',
        status: 'active',
        doctors_count: 8,
        last_visit: '2026-01-03',
        latitude: 10.6544,
        longitude: -71.6361,
        created_at: '2025-07-01T10:00:00Z'
    },
    {
        id: 'hc-005',
        user_id: DEMO_USER_ID,
        name: 'Policlínica Maracay',
        type: 'clinica',
        address: 'Av. Casanova Godoy con Av. Las Delicias',
        city: 'Maracay',
        state: 'Aragua',
        phone: '0243-555-4444',
        contact_name: 'Dr. Ricardo Sosa',
        email: 'info@policlinicamaracay.com',
        potential: 'Alto',
        status: 'active',
        doctors_count: 35,
        last_visit: '2026-01-11',
        latitude: 10.2542,
        longitude: -67.5922,
        created_at: '2025-08-01T10:00:00Z'
    }
];

// ==================== PHARMACIES ====================
export const MOCK_PHARMACIES = [
    {
        id: 'pharm-001',
        user_id: DEMO_USER_ID,
        name: 'Farmacia Demo Central',
        rif: 'J-12345678-0',
        address: 'Av. Principal #123, Centro Comercial Demo',
        city: 'Caracas',
        state: 'Distrito Capital',
        phone: '0212-555-0001',
        contact_name: 'Lic. María Pérez',
        email: 'central@farmaciademodemo.com',
        status: 'Activo',
        potential: 'Alto',
        priority: 'high',
        created_at: '2026-01-01T10:00:00Z',
        latitude: 10.4806,
        longitude: -66.9036
    },
    {
        id: 'pharm-002',
        user_id: DEMO_USER_ID,
        name: 'Farmacia Vida Salud',
        rif: 'J-87654321-0',
        address: 'Calle La Paz #45, Edificio Médico',
        city: 'Valencia',
        state: 'Carabobo',
        phone: '0241-555-0002',
        contact_name: 'Lic. Juan López',
        email: 'vidasalud@demo.com',
        status: 'Activo',
        potential: 'Medio',
        priority: 'medium',
        created_at: '2026-01-02T11:00:00Z',
        latitude: 10.1579,
        longitude: -67.9969
    },
    {
        id: 'pharm-003',
        user_id: DEMO_USER_ID,
        name: 'Botica Nueva',
        rif: 'J-11223344-0',
        address: 'Av. Bolívar #78, Esquina 2',
        city: 'Maracaibo',
        state: 'Zulia',
        phone: '0261-555-0003',
        contact_name: 'Lic. Ana Ruiz',
        email: 'boticaneva@demo.com',
        status: 'Activo',
        potential: 'Bajo',
        priority: 'low',
        created_at: '2026-01-03T09:00:00Z',
        latitude: 10.6544,
        longitude: -71.6361
    },
    {
        id: 'pharm-004',
        user_id: DEMO_USER_ID,
        name: 'Farmacia San José',
        rif: 'J-99887766-0',
        address: 'Centro Médico San José, Piso 1',
        city: 'Barquisimeto',
        state: 'Lara',
        phone: '0251-555-0004',
        contact_name: 'Lic. Carlos Martínez',
        email: 'sanjose@demo.com',
        status: 'Activo',
        potential: 'Alto',
        priority: 'high',
        created_at: '2026-01-04T14:00:00Z',
        latitude: 10.0678,
        longitude: -69.3474
    },
    {
        id: 'pharm-005',
        user_id: DEMO_USER_ID,
        name: 'Farmacia Automercado Maracay',
        rif: 'J-55443322-0',
        address: 'Av. Las Delicias, Centro Comercial Regional',
        city: 'Maracay',
        state: 'Aragua',
        phone: '0243-222-1111',
        contact_name: 'Lic. Elena Blanco',
        email: 'automercado_mcy@demo.com',
        status: 'Activo',
        potential: 'Alto',
        priority: 'high',
        created_at: '2026-01-05T10:00:00Z',
        latitude: 10.2742,
        longitude: -67.5822
    }
];

// ==================== DOCTORS ====================
export const MOCK_DOCTORS = [
    {
        id: 'doc-001',
        user_id: DEMO_USER_ID,
        name: 'Dr. Carlos Méndez',
        specialty: 'Cardiología',
        city: 'Caracas',
        state: 'Distrito Capital',
        phone: '0412-111-1111',
        email: 'cmendez@demo.com',
        status: 'Activo',
        address: 'Centro Médico La Trinidad, Consultorio 301',
        health_center_id: 'hc-003',
        potential: 'Alto',
        last_visit: '2026-01-08',
        latitude: 10.4806,
        longitude: -66.9036,
        created_at: '2025-06-15T10:00:00Z'
    },
    {
        id: 'doc-002',
        user_id: DEMO_USER_ID,
        name: 'Dra. Laura Gómez',
        specialty: 'Medicina Interna',
        city: 'Valencia',
        state: 'Carabobo',
        phone: '0414-222-2222',
        email: 'lgomez@demo.com',
        status: 'Activo',
        address: 'Clínica Modelo Valencia, Piso 2',
        health_center_id: 'hc-002',
        potential: 'Medio',
        last_visit: '2026-01-05',
        latitude: 10.1620,
        longitude: -68.0077,
        created_at: '2025-07-20T11:00:00Z'
    },
    {
        id: 'doc-003',
        user_id: DEMO_USER_ID,
        name: 'Dr. Roberto Fernández',
        specialty: 'Pediatría',
        city: 'Caracas',
        state: 'Distrito Capital',
        phone: '0416-333-3333',
        email: 'rfernandez@demo.com',
        status: 'Activo',
        address: 'Hospital Central de Caracas, Ala Norte',
        health_center_id: 'hc-001',
        potential: 'Alto',
        last_visit: '2026-01-10',
        latitude: 10.4906,
        longitude: -66.9136,
        created_at: '2025-08-10T09:00:00Z'
    },
    {
        id: 'doc-004',
        user_id: DEMO_USER_ID,
        name: 'Dra. Patricia Sánchez',
        specialty: 'Dermatología',
        city: 'Barquisimeto',
        state: 'Lara',
        phone: '0424-444-4444',
        email: 'psanchez@demo.com',
        status: 'Activo',
        address: 'Centro Dermatológico Lara, Consultorio Principal',
        potential: 'Medio',
        last_visit: '2026-01-03',
        latitude: 10.0678,
        longitude: -69.3474,
        created_at: '2025-09-05T14:00:00Z'
    },
    {
        id: 'doc-005',
        user_id: DEMO_USER_ID,
        name: 'Dr. Miguel Torres',
        specialty: 'Ginecología',
        city: 'Mérida',
        state: 'Mérida',
        phone: '0426-555-5555',
        email: 'mtorres@demo.com',
        status: 'Activo',
        address: 'Clínica Mérida, Torre Médica',
        potential: 'Alto',
        last_visit: '2026-01-07',
        latitude: 8.5912,
        longitude: -71.1449,
        created_at: '2025-10-01T10:00:00Z'
    },
    {
        id: 'doc-006',
        user_id: DEMO_USER_ID,
        name: 'Dr. Luis Beltrán',
        specialty: 'Traumatología',
        city: 'Maracay',
        state: 'Aragua',
        phone: '0424-444-4444',
        email: 'lbeltran@demo.com',
        status: 'Activo',
        address: 'Policlínica Maracay, Consultorio 105',
        health_center_id: 'hc-005',
        potential: 'Medio',
        last_visit: '2026-01-11',
        latitude: 10.2542,
        longitude: -67.5922,
        created_at: '2025-09-01T10:00:00Z'
    }
];

// ==================== CONTACTS ====================
// Contacts combining doctors, pharmacies, and health centers for unified access
export const MOCK_CONTACTS = [
    {
        id: 'contact-001',
        user_id: DEMO_USER_ID,
        name: 'Dr. Carlos Méndez',
        specialty: 'Cardiología',
        contact_type: 'doctor',
        phone: '0412-111-1111',
        email: 'cmendez@demo.com',
        city: 'Caracas',
        address: 'Centro Médico La Trinidad, Consultorio 301',
        priority: 'high',
        latitude: 10.4806,
        longitude: -66.9036,
        created_at: '2025-05-01T10:00:00Z'
    },
    {
        id: 'contact-002',
        user_id: DEMO_USER_ID,
        name: 'Dra. Laura Gómez',
        specialty: 'Medicina Interna',
        contact_type: 'doctor',
        phone: '0414-222-2222',
        email: 'lgomez@demo.com',
        city: 'Valencia',
        address: 'Clínica Modelo Valencia, Piso 2',
        priority: 'medium',
        latitude: 10.1620,
        longitude: -68.0077,
        created_at: '2025-05-15T11:00:00Z'
    },
    {
        id: 'contact-003',
        user_id: DEMO_USER_ID,
        name: 'Farmacia Demo Central',
        specialty: 'Farmacia',
        contact_type: 'pharmacy',
        phone: '0212-555-0001',
        email: 'central@farmaciademodemo.com',
        city: 'Caracas',
        address: 'Av. Principal #123, Centro Comercial Demo',
        priority: 'high',
        latitude: 10.4706,
        longitude: -66.8936,
        created_at: '2025-06-01T09:00:00Z'
    },
    {
        id: 'contact-004',
        user_id: DEMO_USER_ID,
        name: 'Dr. Roberto Fernández',
        specialty: 'Pediatría',
        contact_type: 'doctor',
        phone: '0416-333-3333',
        email: 'rfernandez@demo.com',
        city: 'Caracas',
        address: 'Hospital Central de Caracas',
        priority: 'high',
        latitude: 10.4906,
        longitude: -66.9136,
        created_at: '2025-06-15T10:00:00Z'
    },
    {
        id: 'contact-005',
        user_id: DEMO_USER_ID,
        name: 'Farmacia Vida Salud',
        specialty: 'Farmacia',
        contact_type: 'pharmacy',
        phone: '0241-555-0002',
        email: 'vidasalud@demo.com',
        city: 'Valencia',
        address: 'Calle La Paz #45, Edificio Médico',
        priority: 'medium',
        created_at: '2025-07-01T10:00:00Z'
    }
];

// ==================== DRUGSTORES ====================
export const MOCK_DRUGSTORES = [
    {
        id: 'drug-001',
        user_id: DEMO_USER_ID,
        name: 'Droguería Nena',
        code: 'DRG-001',
        contact_name: 'Carlos Distribuidor',
        phone: '0414-000-0000',
        email: 'pedidos@nena.com',
        address: 'Zona Industrial, Galpón 12',
        city: 'Caracas',
        is_active: true,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: 'drug-002',
        user_id: DEMO_USER_ID,
        name: 'Droguería Central',
        code: 'DRG-002',
        contact_name: 'María Distribuidora',
        phone: '0412-111-1111',
        email: 'ventas@central.com',
        address: 'Centro Empresarial, Torre A',
        city: 'Valencia',
        is_active: true,
        created_at: '2025-02-01T10:00:00Z'
    }
];

// ==================== DRUGSTORE INVENTORY ====================
export const MOCK_DRUGSTORE_INVENTORY = [
    {
        id: 'dinv-001',
        drugstore_id: 'drug-001',
        product_id: 'prod-001',
        product_name: 'Atorvastatina 20mg',
        pharmacy_price: 28.50,
        stock: 150,
        status: 'Disponible'
    },
    {
        id: 'dinv-002',
        drugstore_id: 'drug-001',
        product_id: 'prod-002',
        product_name: 'Omeprazol 20mg',
        pharmacy_price: 16.50,
        stock: 200,
        status: 'Disponible'
    },
    {
        id: 'dinv-003',
        drugstore_id: 'drug-001',
        product_id: 'prod-003',
        product_name: 'Losartán 50mg',
        pharmacy_price: 24.00,
        stock: 100,
        status: 'Disponible'
    },
    {
        id: 'dinv-004',
        drugstore_id: 'drug-001',
        product_id: 'prod-004',
        product_name: 'Metformina 850mg',
        pharmacy_price: 14.00,
        stock: 180,
        status: 'Disponible'
    },
    {
        id: 'dinv-005',
        drugstore_id: 'drug-002',
        product_id: 'prod-001',
        product_name: 'Atorvastatina 20mg',
        pharmacy_price: 27.00,
        stock: 120,
        status: 'Disponible'
    },
    {
        id: 'dinv-006',
        drugstore_id: 'drug-002',
        product_id: 'prod-002',
        product_name: 'Omeprazol 20mg',
        pharmacy_price: 15.00,
        stock: 0,
        status: 'Agotado'
    }
];

// ==================== VISITS ====================
const today = new Date();
const formatDate = (daysOffset: number, hour: number = 10, minute: number = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
};

export const MOCK_VISITS = [
    {
        id: 'visit-001',
        user_id: DEMO_USER_ID,
        contact_id: 'contact-001',
        scheduled_date: formatDate(0, 9, 0), // Today 9:00 AM
        status: 'scheduled',
        visit_type: 'doctor',
        objective: 'Presentación de nuevo producto cardiovascular',
        notes: 'Llevar muestras de Atorvastatina',
        created_at: formatDate(-5),
        // Joined contact data (simulating Supabase join)
        contacts: {
            name: 'Dr. Carlos Méndez',
            specialty: 'Cardiología',
            address: 'Centro Médico La Trinidad, Consultorio 301',
            email: 'cmendez@demo.com',
            phone: '0412-111-1111'
        }
    },
    {
        id: 'visit-002',
        user_id: DEMO_USER_ID,
        contact_id: 'contact-002',
        scheduled_date: formatDate(0, 11, 30), // Today 11:30 AM
        status: 'scheduled',
        visit_type: 'doctor',
        objective: 'Seguimiento de prescripciones anteriores',
        notes: 'Consultar sobre resultados con Omeprazol',
        created_at: formatDate(-3),
        contacts: {
            name: 'Dra. Laura Gómez',
            specialty: 'Medicina Interna',
            address: 'Clínica Modelo Valencia, Piso 2',
            email: 'lgomez@demo.com',
            phone: '0414-222-2222'
        }
    },
    {
        id: 'visit-003',
        user_id: DEMO_USER_ID,
        contact_id: 'contact-003',
        scheduled_date: formatDate(1, 10, 0), // Tomorrow 10:00 AM
        status: 'scheduled',
        visit_type: 'pharmacy',
        objective: 'Verificar niveles de stock',
        notes: 'Revisar pedido pendiente',
        created_at: formatDate(-2),
        contacts: {
            name: 'Farmacia Demo Central',
            specialty: 'Farmacia',
            address: 'Av. Principal #123, Centro Comercial Demo',
            email: 'central@farmaciademodemo.com',
            phone: '0212-555-0001'
        }
    },
    {
        id: 'visit-004',
        user_id: DEMO_USER_ID,
        contact_id: 'contact-004',
        scheduled_date: formatDate(-1, 14, 0), // Yesterday 2:00 PM
        status: 'completed',
        visit_type: 'doctor',
        objective: 'Primera visita - Establecer relación',
        notes: 'Excelente recepción, interesado en muestras pediátricas',
        actual_start_time: formatDate(-1, 14, 5),
        actual_end_time: formatDate(-1, 14, 35),
        created_at: formatDate(-7),
        contacts: {
            name: 'Dr. Roberto Fernández',
            specialty: 'Pediatría',
            address: 'Hospital Central de Caracas',
            email: 'rfernandez@demo.com',
            phone: '0416-333-3333'
        }
    },
    {
        id: 'visit-005',
        user_id: DEMO_USER_ID,
        contact_id: 'contact-005',
        scheduled_date: formatDate(-3, 9, 30), // 3 days ago
        status: 'completed',
        visit_type: 'pharmacy',
        objective: 'Entrega de material promocional',
        notes: 'Farmacéutica muy receptiva, solicitó folletos adicionales',
        actual_start_time: formatDate(-3, 9, 35),
        actual_end_time: formatDate(-3, 10, 0),
        created_at: formatDate(-10),
        contacts: {
            name: 'Farmacia Vida Salud',
            specialty: 'Farmacia',
            address: 'Calle La Paz #45, Edificio Médico',
            email: 'vidasalud@demo.com',
            phone: '0241-555-0002'
        }
    },
    {
        id: 'visit-006',
        user_id: DEMO_USER_ID,
        contact_id: 'contact-001',
        scheduled_date: formatDate(2, 15, 0), // 2 days from now
        status: 'scheduled',
        visit_type: 'doctor',
        objective: 'Seguimiento de muestra entregada',
        notes: 'Verificar feedback sobre Atorvastatina',
        created_at: formatDate(-1),
        contacts: {
            name: 'Dr. Carlos Méndez',
            specialty: 'Cardiología',
            address: 'Centro Médico La Trinidad, Consultorio 301',
            email: 'cmendez@demo.com',
            phone: '0412-111-1111'
        }
    }
];

// ==================== REP INVENTORY (Maletín) ====================
// This matches the structure expected by InventoryDashboard
export const MOCK_INVENTORY = [
    {
        id: 'inv-001',
        user_id: DEMO_USER_ID,
        product_id: 'prod-001',
        quantity: 50,
        // Joined product data (simulating Supabase join)
        products: {
            name: 'Atorvastatina 20mg',
            presentation: 'Caja x 30 tabletas'
        }
    },
    {
        id: 'inv-002',
        user_id: DEMO_USER_ID,
        product_id: 'prod-002',
        quantity: 35,
        products: {
            name: 'Omeprazol 20mg',
            presentation: 'Caja x 14 cápsulas'
        }
    },
    {
        id: 'inv-003',
        user_id: DEMO_USER_ID,
        product_id: 'prod-003',
        quantity: 45,
        products: {
            name: 'Losartán 50mg',
            presentation: 'Caja x 30 tabletas'
        }
    },
    {
        id: 'inv-004',
        user_id: DEMO_USER_ID,
        product_id: 'prod-004',
        quantity: 12,
        products: {
            name: 'Metformina 850mg',
            presentation: 'Caja x 30 tabletas'
        }
    }
];

// ==================== OBJECTIVES ====================
export const MOCK_OBJECTIVES = [
    {
        id: 'obj-001',
        user_id: DEMO_USER_ID,
        title: 'Visitas Mensuales',
        description: 'Completar 60 visitas médicas este mes',
        metric_type: 'visits',
        target_value: 60,
        current_value: 47,
        status: 'active',
        start_date: '2026-01-01',
        end_date: '2026-01-31'
    },
    {
        id: 'obj-002',
        user_id: DEMO_USER_ID,
        title: 'Cobertura Territorial',
        description: 'Contactar al 90% de médicos asignados',
        metric_type: 'coverage',
        target_value: 40,
        current_value: 34,
        status: 'active',
        start_date: '2026-01-01',
        end_date: '2026-01-31'
    },
    {
        id: 'obj-003',
        user_id: DEMO_USER_ID,
        title: 'Distribución de Muestras',
        description: 'Distribuir 500 unidades de muestras médicas',
        metric_type: 'samples',
        target_value: 500,
        current_value: 450,
        status: 'active',
        start_date: '2026-01-01',
        end_date: '2026-01-31'
    }
];

// ==================== CYCLES (for Weekly Scheduler) ====================
const currentYear = new Date().getFullYear();
export const MOCK_CYCLES = [
    {
        id: 'cycle-001',
        user_id: DEMO_USER_ID,
        name: 'Ciclo Enero 2026',
        start_date: `${currentYear}-01-01`,
        end_date: `${currentYear}-01-31`,
        status: 'active',
        created_at: '2026-01-01T00:00:00Z'
    },
    {
        id: 'cycle-002',
        user_id: DEMO_USER_ID,
        name: 'Ciclo Febrero 2026',
        start_date: `${currentYear}-02-01`,
        end_date: `${currentYear}-02-28`,
        status: 'scheduled',
        created_at: '2026-01-01T00:00:00Z'
    }
];

// ==================== WEEKLY PLANS ====================
const currentWeek = Math.ceil((new Date().getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
export const MOCK_WEEKLY_PLANS = [
    {
        id: 'wplan-001',
        user_id: DEMO_USER_ID,
        cycle_id: 'cycle-001',
        week_number: currentWeek,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_at: '2026-01-06T00:00:00Z'
    }
];

// ==================== PLAN DETAILS (for Weekly Scheduler grid) ====================
// Helper: Get date for a specific day of the CURRENT week (0=Monday, 1=Tuesday, etc.)
const getWeekDayDate = (dayIndex: number): string => {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sunday, 1=Monday...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Days to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setDate(monday.getDate() + dayIndex);
    return monday.toISOString().split('T')[0];
};

export const MOCK_PLAN_DETAILS = [
    {
        id: 'detail-001',
        weekly_plan_id: 'wplan-001',
        day_of_week: 'monday',
        date: getWeekDayDate(0), // Monday
        turn: 'AM',
        directory_item_id: 'contact-001',
        visit_order: 1,
        status: 'planned',
        directory_item: {
            id: 'contact-001',
            name: 'Dr. Carlos Méndez',
            entity_type: 'doctor',
            city: 'Caracas',
            address: 'Centro Médico La Trinidad'
        }
    },
    {
        id: 'detail-002',
        weekly_plan_id: 'wplan-001',
        day_of_week: 'monday',
        date: getWeekDayDate(0), // Monday
        turn: 'PM',
        directory_item_id: 'contact-002',
        visit_order: 1,
        status: 'planned',
        directory_item: {
            id: 'contact-002',
            name: 'Dra. Laura Gómez',
            entity_type: 'doctor',
            city: 'Valencia',
            address: 'Clínica Modelo'
        }
    },
    {
        id: 'detail-003',
        weekly_plan_id: 'wplan-001',
        day_of_week: 'tuesday',
        date: getWeekDayDate(1), // Tuesday
        turn: 'AM',
        directory_item_id: 'contact-003',
        visit_order: 1,
        status: 'planned',
        directory_item: {
            id: 'contact-003',
            name: 'Farmacia Demo Central',
            entity_type: 'pharmacy',
            city: 'Caracas',
            address: 'Av. Principal #123'
        }
    },
    {
        id: 'detail-004',
        weekly_plan_id: 'wplan-001',
        day_of_week: 'wednesday',
        date: getWeekDayDate(2), // Wednesday
        turn: 'AM',
        directory_item_id: 'contact-004',
        visit_order: 1,
        status: 'planned',
        directory_item: {
            id: 'contact-004',
            name: 'Dr. Roberto Fernández',
            entity_type: 'doctor',
            city: 'Caracas',
            address: 'Hospital Central'
        }
    },
    {
        id: 'detail-005',
        weekly_plan_id: 'wplan-001',
        day_of_week: 'thursday',
        date: getWeekDayDate(3), // Thursday
        turn: 'PM',
        directory_item_id: 'contact-005',
        visit_order: 1,
        status: 'planned',
        directory_item: {
            id: 'contact-005',
            name: 'Farmacia Vida Salud',
            entity_type: 'pharmacy',
            city: 'Valencia',
            address: 'Calle La Paz #45'
        }
    },
    {
        id: 'detail-006',
        weekly_plan_id: 'wplan-001',
        day_of_week: 'friday',
        date: getWeekDayDate(4), // Friday
        turn: 'AM',
        directory_item_id: 'contact-001',
        visit_order: 1,
        status: 'completed',
        directory_item: {
            id: 'contact-001',
            name: 'Dr. Carlos Méndez',
            entity_type: 'doctor',
            city: 'Caracas',
            address: 'Centro Médico La Trinidad'
        }
    }
];

// ==================== DASHBOARD STATS ====================
export const MOCK_DASHBOARD_STATS = {
    visitsToday: 2,
    visitsTodayConfirmed: 2,
    doctorsContactedWeek: 5,
    reportsCompletedMonth: 47,
    monthlyGoal: 78
};

// ==================== SAMPLE BANKS ====================
export const MOCK_SAMPLE_BANKS = [
    {
        id: 'bank-001',
        name: 'Banco de Muestras - Cardiología',
        service_name: 'Cardiología Intervencionista',
        health_center_id: 'hc-003',
        last_audit_date: formatDate(-15),
        health_centers: { name: 'Centro Médico La Trinidad' }
    },
    {
        id: 'bank-002',
        name: 'Banco Piso 4 - Medicina Interna',
        service_name: 'Medicina Interna B',
        health_center_id: 'hc-002',
        last_audit_date: formatDate(-30),
        health_centers: { name: 'Clínica Modelo Valencia' }
    }
];

// ==================== BANK INVENTORY ====================
export const MOCK_BANK_INVENTORY = [
    {
        id: 'binv-001',
        bank_id: 'bank-001',
        product_id: 'prod-001',
        quantity: 25,
        min_stock_alert: 5,
        products: { name: 'Atorvastatina 20mg' }
    },
    {
        id: 'binv-002',
        bank_id: 'bank-001',
        product_id: 'prod-003',
        quantity: 15,
        min_stock_alert: 5,
        products: { name: 'Losartán 50mg' }
    }
];

// ==================== EVENTS ====================
export const MOCK_EVENTS = [
    {
        id: 'event-001',
        title: 'Jornada Médica - Hospital Central',
        description: 'Operativo de despistaje de hipertensión y entrega de muestras.',
        event_type: 'jornada',
        location: 'Hospital Central de Caracas - Planta Baja',
        scheduled_date: formatDate(0, 8, 0),
        end_date: formatDate(0, 16, 0),
        date: formatDate(0),
        status: 'in_progress',
        attendees_count: 50,
        notes: 'Coordinado con el Dr. Fernández'
    },
    {
        id: 'event-002',
        title: 'Simposio de Cardiología',
        description: 'Actualización en terapias para insuficiencia cardíaca.',
        event_type: 'conference',
        location: 'Hotel Eurobuilding - Caracas',
        scheduled_date: formatDate(5, 18, 0),
        end_date: formatDate(5, 21, 0),
        date: formatDate(5),
        status: 'scheduled',
        attendees_count: 120,
        notes: 'Patrocinio de stand principal'
    }
];

// ==================== SAMPLE MOVEMENTS ====================
export const MOCK_SAMPLE_MOVEMENTS = [
    {
        id: 'mov-001',
        product_id: 'prod-001',
        quantity: 2,
        created_at: formatDate(0, 9, 15),
        notes: 'Patología: Hipertensión Primaria',
        movement_type: 'treatment_start',
        event_id: 'event-001',
        products: { name: 'Atorvastatina 20mg' }
    },
    {
        id: 'mov-002',
        product_id: 'prod-003',
        quantity: 1,
        created_at: formatDate(0, 9, 45),
        notes: 'Patología: Prevención Secundaria',
        movement_type: 'treatment_start',
        event_id: 'event-001',
        products: { name: 'Losartán 50mg' }
    }
];

// ==================== EXPORT ALL ====================
export const MOCK_DATA = {
    pharmacies: MOCK_PHARMACIES,
    doctors: MOCK_DOCTORS,
    contacts: MOCK_CONTACTS,
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
    sampleMovements: MOCK_SAMPLE_MOVEMENTS
};
