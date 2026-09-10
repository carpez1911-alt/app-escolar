-- ==========================================================
-- TABLA Y ACTUALIZACIÓN DE OBSERVADOR ESTUDIANTIL (MIGRACIÓN SEGURA)
-- LEY 1620 DE 2013 / DECRETO 1965 / DEBIDO PROCESO ART 29 CP
-- ==========================================================

-- 1. Crear secuencia si no existe
CREATE SEQUENCE IF NOT EXISTS seq_observador_folio START 1;

-- 2. Crear tabla base si no existe
CREATE TABLE IF NOT EXISTS public.registros_observador (
  id BIGSERIAL PRIMARY KEY
);

-- Limpieza de columna obsoleta previa si existiera
ALTER TABLE public.registros_observador DROP COLUMN IF EXISTS solicitud_id;

-- 3. Asegurar que todas las columnas existan (sin borrar datos previos)
ALTER TABLE public.registros_observador 
  ADD COLUMN IF NOT EXISTS folio TEXT,
  ADD COLUMN IF NOT EXISTS fecha DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS hora TIME DEFAULT CURRENT_TIME,
  ADD COLUMN IF NOT EXISTS asignatura TEXT,
  ADD COLUMN IF NOT EXISTS estudiante_id BIGINT REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS estudiante_afectado_id BIGINT REFERENCES public.estudiantes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS modalidad TEXT DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS tipo_falta TEXT DEFAULT 'T1',
  ADD COLUMN IF NOT EXISTS codigo_situacion TEXT,
  ADD COLUMN IF NOT EXISTS hechos TEXT,
  ADD COLUMN IF NOT EXISTS descargos TEXT,
  ADD COLUMN IF NOT EXISTS compromisos TEXT,
  ADD COLUMN IF NOT EXISTS docente TEXT,
  ADD COLUMN IF NOT EXISTS reincidencia_conteo INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS remitido_coordinacion BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS motivo_remision TEXT,
  ADD COLUMN IF NOT EXISTS motivo_edicion TEXT,
  ADD COLUMN IF NOT EXISTS historial_ediciones JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Firmas digitales presenciales (imagen PNG en base64 capturada con signature_pad)
  ADD COLUMN IF NOT EXISTS firma_docente TEXT,
  ADD COLUMN IF NOT EXISTS firma_estudiante TEXT,
  ADD COLUMN IF NOT EXISTS firma_acudiente TEXT,
  ADD COLUMN IF NOT EXISTS firma_coordinador TEXT;

-- 4. Crear índices ahora que las columnas existen
CREATE INDEX IF NOT EXISTS idx_obs_estudiante ON public.registros_observador(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_obs_estudiante_afectado ON public.registros_observador(estudiante_afectado_id);
CREATE INDEX IF NOT EXISTS idx_obs_fecha ON public.registros_observador(fecha);
CREATE INDEX IF NOT EXISTS idx_obs_folio ON public.registros_observador(folio);

-- 5. Trigger y función para folio automático si no viene asignado (OBS-AÑO-XXXX)
CREATE OR REPLACE FUNCTION public.generar_folio_observador()
RETURNS TRIGGER AS $$
DECLARE
  año_txt TEXT;
  num_txt TEXT;
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    año_txt := TO_CHAR(CURRENT_DATE, 'YYYY');
    num_txt := LPAD(nextval('seq_observador_folio')::TEXT, 4, '0');
    NEW.folio := 'OBS-' || año_txt || '-' || num_txt;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generar_folio_observador ON public.registros_observador;
CREATE TRIGGER trg_generar_folio_observador
BEFORE INSERT ON public.registros_observador
FOR EACH ROW
EXECUTE FUNCTION public.generar_folio_observador();

-- 6. Habilitar seguridad RLS
ALTER TABLE public.registros_observador ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de acceso permisivas
DROP POLICY IF EXISTS "Permitir select para observador" ON public.registros_observador;
CREATE POLICY "Permitir select para observador"
ON public.registros_observador FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Permitir insert para observador" ON public.registros_observador;
CREATE POLICY "Permitir insert para observador"
ON public.registros_observador FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update para observador" ON public.registros_observador;
CREATE POLICY "Permitir update para observador"
ON public.registros_observador FOR UPDATE
USING (true)
WITH CHECK (true);
