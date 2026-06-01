export const SYSTEM_MODULES = [
  // Módulos base (todos los planes)
  { key: 'visits',          name: 'Visitas Médicas',        tier: 'base',     icon: 'MapPin'    },
  { key: 'doctors',         name: 'Directorio Médico',      tier: 'base',     icon: 'User'      },
  { key: 'pharmacies',      name: 'Farmacias y POS',        tier: 'base',     icon: 'Store'     },
  { key: 'agenda',          name: 'Agenda de Visitas',      tier: 'base',     icon: 'Calendar'  },
  { key: 'contacts',        name: 'Contactos',              tier: 'base',     icon: 'Users'     },

  // Módulos Pro
  { key: 'transfers',       name: 'Transferencias',         tier: 'pro',      icon: 'Package'   },
  { key: 'sample_banks',    name: 'Banco de Muestras',      tier: 'pro',      icon: 'Pill'      },
  { key: 'objectives',      name: 'Metas y Objetivos',      tier: 'pro',      icon: 'Target'    },
  { key: 'reports',         name: 'Reportería Avanzada',    tier: 'pro',      icon: 'BarChart3' },
  { key: 'cycles',          name: 'Ciclos Promocionales',   tier: 'pro',      icon: 'RefreshCw' },
  { key: 'zones',           name: 'Territorios y Zonas',    tier: 'pro',      icon: 'Map'       },
  { key: 'expenses',        name: 'Gastos y Viáticos',      tier: 'pro',      icon: 'Receipt'   },

  // Módulos Team / Enterprise
  { key: 'coverage_map',    name: 'Mapa de Cobertura GPS',  tier: 'team',     icon: 'Globe'     },
  { key: 'finance',         name: 'Monitor Financiero',     tier: 'team',     icon: 'DollarSign'},
  { key: 'smart_assistant', name: 'Asistente IA',           tier: 'team',     icon: 'Bot'       },
  { key: 'hr',              name: 'Capital Humano',         tier: 'team',     icon: 'Shield'    },
  { key: 'sales_pipeline',  name: 'Seguimiento Comercial',  tier: 'team',     icon: 'TrendingUp'},
  { key: 'pmbok',           name: 'Gestión de Proyectos',   tier: 'enterprise',icon: 'Layers'   },
  { key: 'documents',       name: 'Centro de Documentos',   tier: 'enterprise',icon: 'FileText' },
  { key: 'custom_roles',    name: 'Roles Personalizados',   tier: 'enterprise',icon: 'Key'      },
  { key: 'api_access',      name: 'Acceso API',             tier: 'enterprise',icon: 'Code'     },
  { key: 'white_label',     name: 'Marca Blanca',           tier: 'enterprise',icon: 'Palette'  },
] as const

export type ModuleKey = typeof SYSTEM_MODULES[number]['key']

// Planes predefinidos con sus módulos por defecto
export const DEFAULT_PLAN_MODULES: Record<string, ModuleKey[]> = {
  starter:    ['visits','doctors','pharmacies','agenda','contacts'],
  pro:        ['visits','doctors','pharmacies','agenda','contacts',
               'transfers','sample_banks','objectives','reports','cycles','zones','expenses'],
  team:       ['visits','doctors','pharmacies','agenda','contacts',
               'transfers','sample_banks','objectives','reports','cycles','zones','expenses',
               'coverage_map','finance','smart_assistant','hr','sales_pipeline'],
  enterprise: ['visits','doctors','pharmacies','agenda','contacts',
               'transfers','sample_banks','objectives','reports','cycles','zones','expenses',
               'coverage_map','finance','smart_assistant','hr','sales_pipeline',
               'pmbok','documents','custom_roles','api_access','white_label'],
}
