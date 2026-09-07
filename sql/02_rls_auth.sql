-- Migración: Seguridad RLS (Row Level Security) y Autenticación
-- Habilita RLS estricto para proteger la base de datos, restringiendo acceso solo a usuarios con sesión iniciada.

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.configuracion_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horario_semanal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcos_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia ENABLE ROW LEVEL SECURITY;

-- (Por si existe alguna otra tabla de entregas_tareas o registro_notas que vimos en la auditoria previa)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'entregas_tareas') THEN
        EXECUTE 'ALTER TABLE public.entregas_tareas ENABLE ROW LEVEL SECURITY;';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'registro_notas') THEN
        EXECUTE 'ALTER TABLE public.registro_notas ENABLE ROW LEVEL SECURITY;';
    END IF;
END $$;

-- 2. Eliminar políticas inseguras de desarrollo (si existen)
DROP POLICY IF EXISTS desarrollo_select_configuracion_global ON public.configuracion_global;
DROP POLICY IF EXISTS desarrollo_update_configuracion_global ON public.configuracion_global;
DROP POLICY IF EXISTS desarrollo_select_marcos_periodos ON public.marcos_periodos;
DROP POLICY IF EXISTS desarrollo_update_marcos_periodos ON public.marcos_periodos;
DROP POLICY IF EXISTS desarrollo_select_horario_semanal ON public.horario_semanal;
DROP POLICY IF EXISTS desarrollo_insert_horario_semanal ON public.horario_semanal;
DROP POLICY IF EXISTS desarrollo_delete_horario_semanal ON public.horario_semanal;
DROP POLICY IF EXISTS desarrollo_select_tareas ON public.tareas;
DROP POLICY IF EXISTS desarrollo_insert_tareas ON public.tareas;
DROP POLICY IF EXISTS desarrollo_select_calificaciones ON public.calificaciones;
DROP POLICY IF EXISTS desarrollo_insert_calificaciones ON public.calificaciones;
DROP POLICY IF EXISTS desarrollo_update_calificaciones ON public.calificaciones;

-- 3. Crear políticas seguras (Full Access) solo para el rol `authenticated`
-- En este modelo simple, todos los docentes (usuarios logueados) pueden gestionar los datos de la escuela.
-- Si en el futuro hay profesores con acceso limitado o estudiantes, se deben modificar estas políticas.

CREATE POLICY "acceso_autenticado_configuracion_global" ON public.configuracion_global FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso_autenticado_estudiantes" ON public.estudiantes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso_autenticado_materias" ON public.materias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso_autenticado_horario_semanal" ON public.horario_semanal FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso_autenticado_marcos_periodos" ON public.marcos_periodos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso_autenticado_tareas" ON public.tareas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso_autenticado_calificaciones" ON public.calificaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso_autenticado_asistencia" ON public.asistencia FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'entregas_tareas') THEN
        EXECUTE 'CREATE POLICY "acceso_autenticado_entregas_tareas" ON public.entregas_tareas FOR ALL TO authenticated USING (true) WITH CHECK (true);';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'registro_notas') THEN
        EXECUTE 'CREATE POLICY "acceso_autenticado_registro_notas" ON public.registro_notas FOR ALL TO authenticated USING (true) WITH CHECK (true);';
    END IF;
END $$;
