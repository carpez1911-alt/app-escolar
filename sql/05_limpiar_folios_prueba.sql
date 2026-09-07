-- ==========================================================
-- SCRIPT DE LIMPIEZA DE FOLIOS DE PRUEBA (OBSERVADOR ESCOLAR)
-- I.E. NUESTRA SEÑORA DEL PILAR - GRADO 5°02
-- ==========================================================
-- Este script elimina los folios generados durante las pruebas
-- y reinicia los contadores para que el primer folio real sea OBS-2026-0001.

-- 1. Vaciar las actas de observador
DELETE FROM public.registros_observador;

-- 2. Reiniciar el generador consecutivo de folios a 1
ALTER SEQUENCE IF EXISTS public.seq_observador_folio RESTART WITH 1;

-- 3. Reiniciar el ID autoincremental de la tabla
ALTER SEQUENCE IF EXISTS public.registros_observador_id_seq RESTART WITH 1;

-- 4. Comprobación final: debe arrojar 0
SELECT COUNT(*) AS total_actas_restantes FROM public.registros_observador;
