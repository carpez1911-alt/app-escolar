-- 1. Añadir columnas a configuracion_global
ALTER TABLE public.configuracion_global 
ADD COLUMN IF NOT EXISTS nombre_clase VARCHAR(255) DEFAULT 'Mi Clase 502',
ADD COLUMN IF NOT EXISTS nombre_institucion VARCHAR(255) DEFAULT 'Institución Educativa';

-- 2. Añadir columna de horas de clase a horario_semanal
ALTER TABLE public.horario_semanal
ADD COLUMN IF NOT EXISTS horas_clase INT DEFAULT 1;
