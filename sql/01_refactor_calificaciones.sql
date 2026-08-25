-- Migración: Refactorización de Calificaciones y Reglas de Negocio
-- Este script mueve la lógica de negocio (promedios, validación de rango y consistencia relacional) a la base de datos.

-- 1. Agregar restricción CHECK para validar que la nota está entre 0 y 10
ALTER TABLE public.calificaciones
DROP CONSTRAINT IF EXISTS nota_rango;

ALTER TABLE public.calificaciones
ADD CONSTRAINT nota_rango CHECK (nota >= 0 AND nota <= 10);


-- 2. Función y Trigger para garantizar consistencia lógica entre Calificaciones y Tareas
-- Evita que una calificación se guarde con una materia_id o periodo distinto al de la tarea.
CREATE OR REPLACE FUNCTION public.fn_verificar_integridad_calificacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_materia_id integer;
  v_periodo integer;
BEGIN
  -- Obtener la materia_id y periodo de la tarea asociada
  SELECT materia_id, periodo INTO v_materia_id, v_periodo
  FROM public.tareas
  WHERE id = NEW.tarea_id;

  -- Verificar que existan (por si acaso la FK no estuviera actuando)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'La tarea con ID % no existe.', NEW.tarea_id;
  END IF;

  -- Validar consistencia
  IF NEW.materia_id IS DISTINCT FROM v_materia_id THEN
    RAISE EXCEPTION 'Inconsistencia: materia_id (%) no coincide con la materia de la tarea (%).', NEW.materia_id, v_materia_id;
  END IF;

  IF NEW.periodo IS DISTINCT FROM v_periodo THEN
    RAISE EXCEPTION 'Inconsistencia: periodo (%) no coincide con el periodo de la tarea (%).', NEW.periodo, v_periodo;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_verificar_integridad_calificacion ON public.calificaciones;

CREATE TRIGGER tr_verificar_integridad_calificacion
BEFORE INSERT OR UPDATE ON public.calificaciones
FOR EACH ROW
EXECUTE FUNCTION public.fn_verificar_integridad_calificacion();


-- 3. Vista para calcular promedios directamente en la base de datos
-- Reemplaza la lógica (valores.reduce...) que estaba en JavaScript
CREATE OR REPLACE VIEW public.v_promedios_estudiantes AS
SELECT
    estudiante_id,
    materia_id,
    periodo,
    ROUND(AVG(nota)::numeric, 2) AS promedio_definitiva
FROM
    public.calificaciones
GROUP BY
    estudiante_id,
    materia_id,
    periodo;

-- Nota: Recordar dar permisos de lectura sobre la vista a los roles adecuados (e.g. anon, authenticated)
GRANT SELECT ON public.v_promedios_estudiantes TO authenticated, anon;
