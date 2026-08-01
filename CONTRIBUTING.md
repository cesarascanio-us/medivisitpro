# Guía de Contribución - MediVisitPro

¡Gracias por tu interés en contribuir a MediVisitPro! Esta guía te ayudará a empezar.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Setup de Desarrollo](#setup-de-desarrollo)
- [Workflow de Git](#workflow-de-git)
- [Convenciones de Código](#convenciones-de-código)
- [Testing](#testing)
- [Pull Requests](#pull-requests)

---

## Código de Conducta

Este proyecto sigue un código de conducta profesional. Se espera que todos los contribuidores:

- Sean respetuosos y constructivos en las discusiones
- Acepten críticas constructivas
- Se enfoquen en lo que es mejor para la comunidad
- Muestren empatía hacia otros miembros

---

## Cómo Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado previamente en [Issues](https://github.com/yourorg/medivisitpro/issues)
2. Abre un nuevo issue con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (navegador, OS, etc.)

### Sugerir Features

1. Abre un issue con el tag `enhancement`
2. Describe claramente:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas

### Contribuir Código

1. Busca un issue existente o crea uno nuevo
2. Comenta en el issue que trabajarás en él
3. Fork el proyecto y crea una branch
4. Implementa los cambios
5. Crea un Pull Request

---

## Setup de Desarrollo

### Prerequisitos

```bash
# Node.js >= 18
node --version

# npm >= 9
npm --version

# Git
git --version
```

### Instalación

```bash
# 1. Fork y clona el repo
git clone https://github.com/YOUR-USERNAME/MediVisitPro.git
cd MediVisitPro

# 2. Agrega el remote upstream
git remote add upstream https://github.com/yourorg/MediVisitPro.git

# 3. Instala dependencias
npm install

# 4. Copia y configura variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales Supabase

# 5. Inicia el servidor de desarrollo
npm run dev
```

### Herramientas Recomendadas

- **VS Code** con extensiones:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
- **React Developer Tools** (extensión de navegador)
- **Supabase CLI** (opcional, para desarrollo de BD local)

---

## Workflow de Git

### Branches

Usamos el modelo de Gitflow simplificado:

- `main`: Código en producción
- `develop`: Código en desarrollo (próximo release)
- `feature/*`: Nuevas funcionalidades
- `fix/*`: Correcciones de bugs
- `hotfix/*`: Correcciones urgentes en producción

### Crear una Branch

```bash
# Sincronizar con upstream
git checkout main
git pull upstream main

# Crear branch de feature
git checkout -b feature/nombre-descriptivo

# O branch de fix
git checkout -b fix/nombre-del-bug
```

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Tipos permitidos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactoring de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
git commit -m "feat(visits): add signature capture in visit execution"
git commit -m "fix(auth): resolve infinite loop in role loading"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(components): extract PharmacyCard component"
```

### Mantener tu Branch Actualizada

```bash
# Sincronizar con upstream
git checkout main
git pull upstream main

# Rebase tu feature branch
git checkout feature/tu-feature
git rebase main

# Si hay conflictos, resuélvelos y continúa
git add .
git rebase --continue
```

---

## Convenciones de Código

### TypeScript

```typescript
// ✅ CORRECTO: Tipos explícitos
interface User {
  id: string;
  email: string;
  role: UserRole;
}

function getUser(id: string): User | null {
  // ...
}

// ❌ INCORRECTO: Uso de 'any'
function getUser(id: any): any {
  // ...
}
```

### React Components

```tsx
// ✅ CORRECTO: Functional component con tipos
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn('btn', `btn-${variant}`)}>
      {label}
    </button>
  );
}

// ❌ INCORRECTO: Props sin tipos
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Naming Conventions

```typescript
// Componentes: PascalCase
export const UserProfile = () => { };

// Hooks: camelCase con prefijo 'use'
export const useAuth = () => { };

// Constantes: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;

// Variables y funciones: camelCase
const userName = 'John';
function getUserById(id: string) { }

// Tipos e interfaces: PascalCase
type UserRole = 'admin' | 'user';
interface UserProfile { }

// Archivos de componentes: PascalCase.tsx
// UserProfile.tsx

// Archivos de utils: camelCase.ts
// formatDate.ts
```

### Estructura de Archivos

```typescript
// ✅ CORRECTO: Imports organizados
// 1. Librerías externas
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports internos (components, hooks, utils)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 3. Tipos
import type { User } from '@/types/user';

// 4. Estilos (si aplica)
import './styles.css';
```

### CSS/Tailwind

```tsx
// ✅ CORRECTO: Usar cn() para conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'primary-variant' : 'secondary-variant'
)} />

// ✅ CORRECTO: Responsive design con Tailwind
<div className="w-full md:w-1/2 lg:w-1/3" />

// ❌ EVITAR: Inline styles cuando Tailwind tiene la utilidad
<div style={{ padding: '16px' }} /> // Usar p-4 en su lugar
```

---

## Testing

### Unit Tests (Pendiente de implementar)

```typescript
// ejemplo: useAuth.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should return null when not authenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });
});
```

### E2E Tests (Pendiente de implementar)

```typescript
// ejemplo: login.spec.ts
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('text=Iniciar Sesión');
  // ...
});
```

### Manual Testing Checklist

Antes de enviar un PR, verifica:

- [ ] La aplicación corre sin errores en consola
- [ ] Los cambios funcionan en Chrome, Firefox y Safari
- [ ] Los cambios funcionan en móvil (responsive)
- [ ] No hay errores de TypeScript (`npm run type-check`)
- [ ] No hay errores de ESLint (`npm run lint`)
- [ ] El build de producción funciona (`npm run build`)

---

## Pull Requests

### Antes de Crear un PR

```bash
# 1. Asegúrate de que tu código compila
npm run type-check

# 2. Ejecuta el linter
npm run lint:fix

# 3. Haz build de producción
npm run build

# 4. Prueba la aplicación localmente
npm run dev
```

### Template de PR

Cuando crees un PR, incluye:

```markdown
## Descripción

Breve descripción de los cambios

## Tipo de cambio

- [ ] Bug fix (cambio no breaking que arregla un issue)
- [ ] Nueva funcionalidad (cambio no breaking que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causa que funcionalidad existente no funcione como antes)
- [ ] Documentación

## ¿Cómo se probó?

Describe los tests que ejecutaste

## Checklist

- [ ] Mi código sigue las convenciones del proyecto
- [ ] He comentado código complejo
- [ ] He actualizado la documentación relevante
- [ ] Mis cambios no generan warnings
- [ ] He probado en múltiples navegadores
- [ ] He verificado responsive design

## Screenshots (si aplica)

Agrega screenshots que muestren los cambios visuales
```

### Code Review

- Cada PR requiere al menos 1 aprobación
- Los reviewers deben:
  - Verificar que sigue las convenciones
  - Probar los cambios localmente
  - Sugerir mejoras constructivamente
- El autor debe:
  - Responder a todos los comentarios
  - Hacer los cambios solicitados
  - Re-solicitar review después de cambios

### Merge

- Solo se puede hacer merge después de approval
- Preferir "Squash and merge" para mantener historial limpio
- Borrar la branch después de merge

---

## Preguntas Frecuentes

### ¿Puedo trabajar en múltiples issues simultáneamente?

Sí, pero te recomendamos enfocarte en uno a la vez. Crea branches separadas para cada issue.

### ¿Qué hago si mi branch está desactualizada?

```bash
git checkout main
git pull upstream main
git checkout tu-branch
git rebase main
```

### ¿Cómo manejo conflictos de merge?

1. Resuelve los conflictos en tu editor
2. Marca como resueltos: `git add <archivo>`
3. Continúa el rebase: `git rebase --continue`
4. Si necesitas abortar: `git rebase --abort`

### ¿Necesito agregar tests?

Actualmente el proyecto no tiene suite de tests, pero se espera implementarlos pronto. Mientras tanto, prueba manualmente tus cambios.

---

## Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## Contacto

- **Issues**: [GitHub Issues](https://github.com/yourorg/medivisitpro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourorg/medivisitpro/discussions)
- **Email**: <dev@medivisitpro.com>

---

**¡Gracias por contribuir a MediVisitPro! 🎉**
