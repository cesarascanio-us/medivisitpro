-- Migración para añadir campos financieros a los eventos

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS investment NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS per_diem NUMERIC(10,2) DEFAULT 0;

-- Nota: end_date ya existía en la migración original, pero nos aseguramos por si acaso:
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
