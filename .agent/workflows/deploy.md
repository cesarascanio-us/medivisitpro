---
description: Guía paso a paso para desplegar MediVisitPro a producción en Vercel
---

# 🚀 Despliegue a Producción - MediVisitPro

## Pre-requisitos
- ✅ Cuenta de GitHub (ya tienes)
- ✅ Cuenta de Supabase (ya tienes)
- ⬜ Cuenta de Vercel (gratuita)

---

## Paso 1: Crear Cuenta en Vercel

1. Ir a https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Autorizar acceso a tu cuenta de GitHub

---

## Paso 2: Subir Código a GitHub

// turbo
```bash
cd C:\Users\cesar\Downloads\MediVisitPro\MedVisitPro
git init
git add .
git commit -m "MediVisitPro v1.0 - Production Ready"
```

Luego crear repositorio en GitHub:
```bash
gh repo create MediVisitPro --private --source=. --push
```

**Si no tienes `gh` CLI:** Crear repo manualmente en github.com y hacer push:
```bash
git remote add origin https://github.com/TU_USUARIO/MediVisitPro.git
git branch -M main
git push -u origin main
```

---

## Paso 3: Configurar Variables de Entorno en Supabase

1. Ir a tu proyecto en https://supabase.com/dashboard
2. Click "Settings" → "API"
3. Copiar:
   - **Project URL** (ej: `https://xxx.supabase.co`)
   - **anon public key** (ej: `eyJhbGciOi...`)

---

## Paso 4: Desplegar en Vercel

1. Ir a https://vercel.com/new
2. Click "Import" en tu repositorio MediVisitPro
3. **Framework Preset:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Click "Environment Variables" y agregar:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |

7. Click **"Deploy"**

---

## Paso 5: Configurar Dominio Personalizado (Opcional)

1. En Vercel → tu proyecto → "Settings" → "Domains"
2. Agregar tu dominio (ej: `app.medivisitpro.com`)
3. Configurar DNS según instrucciones de Vercel

---

## Paso 6: Configurar Supabase para Producción

1. En Supabase → "Authentication" → "URL Configuration"
2. Agregar tu URL de Vercel a:
   - **Site URL:** `https://mediVisitpro.vercel.app`
   - **Redirect URLs:** `https://mediVisitpro.vercel.app/**`

---

## ✅ Verificación Final

Después del despliegue, verificar:
- [ ] La app carga correctamente
- [ ] Login/Logout funciona
- [ ] Las consultas a Supabase funcionan
- [ ] PWA se puede instalar en móvil

---

## 🔄 Actualizaciones Futuras

Cuando hagas cambios, solo necesitas:
```bash
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detectará el push y desplegará automáticamente.
