-- PLAN DE CORRECCIONES NO DESTRUCTIVAS PARA SUPABASE
-- NO ejecutar sin revisar primero sql/audit_supabase.sql y los resultados.
-- Este archivo no contiene DROP, DELETE, TRUNCATE ni UPDATE masivo.
-- Las policies de ejemplo están comentadas porque USING true sería inseguro
-- cuando se active autenticación.

-- ================================================================
-- 1. PREVUELO: detectar duplicados antes de exigir unicidad
-- ================================================================
SELECT fecha, estudiante_id, COUNT(*) AS cantidad, ARRAY_AGG(id ORDER BY id) AS ids
FROM public.asistencia
GROUP BY fecha, estudiante_id
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

SELECT estudiante_id, materia_id, periodo, tarea_id, COUNT(*) AS cantidad, ARRAY_AGG(id ORDER BY id) AS ids
FROM public.calificaciones
GROUP BY estudiante_id, materia_id, periodo, tarea_id
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- Si la primera consulta no devuelve filas, la constraint recomendada para
-- asistencia puede crearse con seguridad. No se ejecuta automáticamente.
-- ALTER TABLE public.asistencia
--   ADD CONSTRAINT asistencia_fecha_estudiante_unique UNIQUE (fecha, estudiante_id);

-- La unicidad de calificaciones ya fue confirmada por la auditoría y debe
-- conservarse exactamente como está.

-- ================================================================
-- 2. VALIDACIONES DE REFERENCIAS ACTUALES
-- ================================================================
SELECT c.id, c.materia_id, c.tarea_id, c.periodo, t.materia_id AS tarea_materia, t.periodo AS tarea_periodo
FROM public.calificaciones c
JOIN public.tareas t ON t.id = c.tarea_id
WHERE c.materia_id IS DISTINCT FROM t.materia_id
   OR c.periodo IS DISTINCT FROM t.periodo;

SELECT t.id, t.materia_id
FROM public.tareas t
LEFT JOIN public.materias m ON m.id = t.materia_id
WHERE m.id IS NULL;

SELECT a.id, a.estudiante_id
FROM public.asistencia a
LEFT JOIN public.estudiantes e ON e.id = a.estudiante_id
WHERE e.id IS NULL;

-- ================================================================
-- 3. RLS: inspección de policies requeridas, sin crearlas
-- ================================================================
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'asistencia', 'calificaciones', 'configuracion_global', 'entregas_tareas',
    'estudiantes', 'horario_semanal', 'marcos_periodos', 'materias',
    'registro_notas', 'tareas'
  )
ORDER BY tablename, policyname;

-- ================================================================
-- 4. POLICIES TEMPORALES SOLO PARA DESARROLLO LOCAL
-- ================================================================
-- NO ejecutar en producción. Estas policies permiten acceso anónimo total
-- y solo sirven para confirmar que un 401/403 procede de RLS. Deben eliminarse
-- y sustituirse por policies basadas en auth.uid() antes de publicar.
--
-- CREATE POLICY desarrollo_select_configuracion_global ON public.configuracion_global
--   FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY desarrollo_update_configuracion_global ON public.configuracion_global
--   FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY desarrollo_select_marcos_periodos ON public.marcos_periodos
--   FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY desarrollo_update_marcos_periodos ON public.marcos_periodos
--   FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY desarrollo_select_horario_semanal ON public.horario_semanal
--   FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY desarrollo_insert_horario_semanal ON public.horario_semanal
--   FOR INSERT TO anon, authenticated WITH CHECK (true);
-- CREATE POLICY desarrollo_delete_horario_semanal ON public.horario_semanal
--   FOR DELETE TO anon, authenticated USING (true);
-- CREATE POLICY desarrollo_select_tareas ON public.tareas
--   FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY desarrollo_insert_tareas ON public.tareas
--   FOR INSERT TO anon, authenticated WITH CHECK (true);
-- CREATE POLICY desarrollo_select_calificaciones ON public.calificaciones
--   FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY desarrollo_insert_calificaciones ON public.calificaciones
--   FOR INSERT TO anon, authenticated WITH CHECK (true);
-- CREATE POLICY desarrollo_update_calificaciones ON public.calificaciones
--   FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
--
-- No crear policies para asistencia, estudiantes o materias mientras RLS esté OFF.
-- Primero debe definirse el modelo de autenticación y autorización.

-- ================================================================
-- 5. CAMBIOS ESTRUCTURALES FUTUROS, BLOQUEADOS INTENCIONALMENTE
-- ================================================================
-- No agregar todavía año_lectivo a tareas/calificaciones/horario_semanal.
-- No crear festivos, bloques horarios, seguimiento ni grupos sin migración.
-- No cambiar ON DELETE de tareas mientras existan entregas/calificaciones.
-- No activar Auth automáticamente desde este archivo.
