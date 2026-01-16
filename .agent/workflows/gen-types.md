---
description: Regenerar tipos de TypeScript desde Supabase
---

# Regenerar Tipos de Supabase

Ejecuta este workflow cuando agregues nuevas tablas, columnas o cambies el schema en Supabase.

## Pasos

// turbo
1. Ejecutar el comando de generación de tipos:
```bash
npm run gen:types
```

2. Verificar que el archivo `src/integrations/supabase/types.ts` se actualizó correctamente.

## Notas

- **Requisito**: Debes tener una sesión activa de Supabase CLI o usar `npx`.
- **Project ID**: `enmtiroqsgduhiopgtze`
- Si el comando falla, asegúrate de estar autenticado con:
```bash
npx supabase login
```
