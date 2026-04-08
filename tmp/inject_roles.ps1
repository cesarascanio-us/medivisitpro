$path = "src/pages/Dashboard.tsx"
$content = Get-Content $path
$newFunctions = @(
    '  const { user, role, isManager, isAdmin, isMaster, isCoordinator, isSupervisor, isTelemarketing, organizationName, organizationId } = useAuth();',
    '  const getDashboardTitle = () => {',
    '    if (isMaster || isAdmin) return "Consola de Mando Global";',
    '    if (isManager) return "Centro de Mando Gerencial";',
    '    if (isCoordinator || isSupervisor) return "Panel de Mando Estratégico";',
    '    if (isTelemarketing) return "Central de Operaciones TM";',
    '    return "Panel de Mando Táctico";',
    '  };',
    '',
    '  const getDashboardBadge = () => {',
    '    if (isMaster) return "Sovereign Master";',
    '    if (isAdmin) return "Admin Elite";',
    '    if (isManager) return "Gerencial CA";',
    '    if (isCoordinator) return "Coordinador";',
    '    if (isSupervisor) return "Supervisor";',
    '    if (isTelemarketing) return "Telemarketing";',
    '    return "Representante";',
    '  };',
    '',
    '  const getWelcomeName = () => {',
    "    return user?.email?.split('@')[0] || 'Representante';",
    '  };'
)

# Replace lines 33-34 with the new hierarchical logic
$content[32..33] = $newFunctions
$content | Set-Content $path
