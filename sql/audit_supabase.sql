configuracion_global-- AUDITORIA SOLO LECTURA DE SUPABASE / POSTGRESQL
-- Ejecutar en el SQL Editor de Supabase con un rol que pueda leer pg_catalog.
-- Este script no contiene ALTER, CREATE, UPDATE, DELETE, DROP ni TRUNCATE.
-- Nota: los bloques de datos al final asumen los nombres de columnas usados por
-- el frontend actual. Si una consulta falla por una columna ausente, conservar
-- el resultado de metadatos y omitir solo esa consulta.

-- 1. Tablas y vistas del esquema public
SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_type, table_name;

SELECT table_schema, table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Columnas, tipos, nulabilidad y valores por defecto
SELECT
  c.table_name,
  c.ordinal_position,
  c.column_name,
  c.data_type,
  c.udt_schema,
  c.udt_name,
  c.is_nullable,
  c.column_default,
  c.character_maximum_length,
  c.numeric_precision,
  c.numeric_scale
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

-- 3. Primary keys, foreign keys, UNIQUE y CHECK constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  kcu.ordinal_position
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_schema = tc.constraint_schema
 AND kcu.constraint_name = tc.constraint_name
 AND kcu.table_name = tc.table_name
WHERE tc.constraint_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name, kcu.ordinal_position;

SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON cc.constraint_schema = tc.constraint_schema
 AND cc.constraint_name = tc.constraint_name
WHERE tc.constraint_schema = 'public'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;

-- Relaciones FK con tabla/columna referenciada
SELECT
  tc.table_name AS tabla,
  tc.constraint_name AS foreign_key,
  kcu.column_name AS columna,
  ccu.table_name AS tabla_referenciada,
  ccu.column_name AS columna_referenciada,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_schema = tc.constraint_schema
 AND kcu.constraint_name = tc.constraint_name
 AND kcu.table_name = tc.table_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_schema = tc.constraint_schema
 AND ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
  ON rc.constraint_schema = tc.constraint_schema
 AND rc.constraint_name = tc.constraint_name
WHERE tc.constraint_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name, kcu.ordinal_position;

-- 4. Indices reales y definiciones
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  i.relname AS index_name,
  ix.indisprimary AS is_primary,
  ix.indisunique AS is_unique,
  ix.indisvalid AS is_valid,
  pg_get_indexdef(i.oid) AS definition
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_index ix ON ix.indrelid = c.oid
JOIN pg_class i ON i.oid = ix.indexrelid
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
ORDER BY c.relname, i.relname;

-- 5. RLS y policies: una fila por tabla/policy
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
ORDER BY c.relname;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Triggers
SELECT
  event_object_schema AS schema_name,
  event_object_table AS table_name,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  action_orientation,
  action_condition
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name, event_manipulation;

-- Triggers con definición PostgreSQL completa
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  t.tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS definition,
  NOT t.tgenabled = 'D' AS enabled
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- 7. Functions / RPC disponibles
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type,
  l.lanname AS language,
  p.prosecdef AS security_definer,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_language l ON l.oid = p.prolang
WHERE n.nspname = 'public'
ORDER BY p.proname, arguments;

-- 8. Conteo aproximado y estadisticas de todas las tablas public.
-- No hace un COUNT(*) completo y por eso es seguro para una primera auditoria.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.reltuples::bigint AS estimated_rows,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
ORDER BY c.relname;

-- Conteos exactos de las tablas prioritarias.
SELECT 'configuracion_global' AS table_name, COUNT(*) AS row_count FROM public.configuracion_global;
SELECT 'estudiantes' AS table_name, COUNT(*) AS row_count FROM public.estudiantes;
SELECT 'materias' AS table_name, COUNT(*) AS row_count FROM public.materias;
SELECT 'horario_semanal' AS table_name, COUNT(*) AS row_count FROM public.horario_semanal;
SELECT 'marcos_periodos' AS table_name, COUNT(*) AS row_count FROM public.marcos_periodos;
SELECT 'tareas' AS table_name, COUNT(*) AS row_count FROM public.tareas;
SELECT 'calificaciones' AS table_name, COUNT(*) AS row_count FROM public.calificaciones;
SELECT 'asistencia' AS table_name, COUNT(*) AS row_count FROM public.asistencia;

-- 9. Diagnostico de columnas prioritarias.
-- Ejecutar esta consulta primero para decidir que diagnosticos opcionales aplican.
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'configuracion_global', 'estudiantes', 'materias', 'horario_semanal',
    'marcos_periodos', 'tareas', 'calificaciones', 'asistencia'
  )
ORDER BY table_name, ordinal_position;

-- ================================================================
-- DIAGNOSTICOS DE DATOS
-- ================================================================
-- Las siguientes consultas son intencionalmente transparentes y no mutan datos.
-- Si el esquema real usa otro nombre de columna, adaptar solo la consulta después
-- de revisar la sección 9. No ejecutar ALTER para hacerlas coincidir.

-- ESTUDIANTES: faltantes, nombres vacios, inactivos y duplicados.
SELECT * FROM public.estudiantes
WHERE NULLIF(BTRIM(nombre_completo), '') IS NULL
   OR año_lectivo IS NULL
   OR grado_grupo IS NULL;

SELECT estado, COUNT(*) AS cantidad
FROM public.estudiantes
GROUP BY estado
ORDER BY estado;

SELECT LOWER(BTRIM(nombre_completo)) AS nombre_normalizado, COUNT(*) AS cantidad, ARRAY_AGG(id ORDER BY id) AS ids
FROM public.estudiantes
GROUP BY LOWER(BTRIM(nombre_completo))
HAVING COUNT(*) > 1
ORDER BY cantidad DESC, nombre_normalizado;

-- TAREAS: relaciones faltantes, fechas y duplicados.
SELECT * FROM public.tareas
WHERE materia_id IS NULL OR periodo IS NULL;

SELECT * FROM public.tareas
WHERE fecha_vencimiento IS NULL;

SELECT titulo, materia_id, periodo, fecha_vencimiento, COUNT(*) AS cantidad, ARRAY_AGG(id ORDER BY id) AS ids
FROM public.tareas
GROUP BY titulo, materia_id, periodo, fecha_vencimiento
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- Si marcos_periodos contiene las columnas esperadas, estas consultas detectan
-- fechas fuera de marco y marcos invalidos. Revisar primero los nombres reales.
SELECT * FROM public.marcos_periodos
WHERE fecha_inicio IS NULL
   OR fecha_fin IS NULL
   OR fecha_inicio > fecha_fin;

SELECT a.*
FROM public.tareas a
LEFT JOIN public.marcos_periodos p
  ON p.periodo = a.periodo
 AND (p.año = a.año_lectivo OR p.año IS NULL)
WHERE p.id IS NULL
   OR a.fecha_vencimiento < p.fecha_inicio
   OR a.fecha_vencimiento > p.fecha_fin;

-- CALIFICACIONES: duplicados, nulos, rango y relaciones faltantes.
SELECT estudiante_id, materia_id, periodo, tarea_id, COUNT(*) AS cantidad, ARRAY_AGG(id ORDER BY id) AS ids
FROM public.calificaciones
GROUP BY estudiante_id, materia_id, periodo, tarea_id
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

SELECT * FROM public.calificaciones WHERE nota IS NULL;
SELECT * FROM public.calificaciones WHERE nota < 0 OR nota > 10;

SELECT c.*
FROM public.calificaciones c
LEFT JOIN public.estudiantes e ON e.id = c.estudiante_id
WHERE e.id IS NULL;

SELECT c.*
FROM public.calificaciones c
LEFT JOIN public.tareas t ON t.id = c.tarea_id
WHERE t.id IS NULL;

SELECT c.*
FROM public.calificaciones c
LEFT JOIN public.materias m ON m.id = c.materia_id
WHERE m.id IS NULL;

SELECT c.*, t.materia_id AS tarea_materia_id, t.periodo AS tarea_periodo
FROM public.calificaciones c
JOIN public.tareas t ON t.id = c.tarea_id
WHERE c.materia_id IS DISTINCT FROM t.materia_id
   OR c.periodo IS DISTINCT FROM t.periodo;

-- ASISTENCIA: duplicados, estudiantes inexistentes, fechas y estados.
SELECT fecha, estudiante_id, COUNT(*) AS cantidad, ARRAY_AGG(id ORDER BY id) AS ids
FROM public.asistencia
GROUP BY fecha, estudiante_id
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

SELECT a.*
FROM public.asistencia a
LEFT JOIN public.estudiantes e ON e.id = a.estudiante_id
WHERE e.id IS NULL;

SELECT * FROM public.asistencia
WHERE fecha IS NULL;

SELECT estado, COUNT(*) AS cantidad
FROM public.asistencia
GROUP BY estado
ORDER BY estado;

SELECT * FROM public.asistencia
WHERE estado IS NULL OR estado NOT IN ('PRESENTE', 'EXCUSA', 'TARDANZA', 'AUSENTE', 'P', 'E', 'T', 'A');

-- PERIODOS: superposiciones y duplicados.
SELECT p1.*, p2.id AS overlapping_id
FROM public.marcos_periodos p1
JOIN public.marcos_periodos p2
  ON p1.id < p2.id
 AND p1.año = p2.año
 AND p1.fecha_inicio <= p2.fecha_fin
 AND p2.fecha_inicio <= p1.fecha_fin;

SELECT año, periodo, COUNT(*) AS cantidad, ARRAY_AGG(id ORDER BY id) AS ids
FROM public.marcos_periodos
GROUP BY año, periodo
HAVING COUNT(*) > 1
ORDER BY año, periodo;

-- HORARIO: materias inexistentes, dias y duplicados.
SELECT h.*
FROM public.horario_semanal h
LEFT JOIN public.materias m ON m.id = h.materia_id
WHERE m.id IS NULL;

SELECT * FROM public.horario_semanal
WHERE dia_semana IS NULL OR dia_semana NOT BETWEEN 1 AND 7;

SELECT materia_id, dia_semana, COUNT(*) AS cantidad, ARRAY_AGG(id ORDER BY id) AS ids
FROM public.horario_semanal
GROUP BY materia_id, dia_semana
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- Si existen horas, detectar bloques superpuestos por materia y dia.
SELECT h1.id AS bloque_1, h2.id AS bloque_2, h1.materia_id, h1.dia_semana
FROM public.horario_semanal h1
JOIN public.horario_semanal h2
  ON h1.id < h2.id
 AND h1.materia_id = h2.materia_id
 AND h1.dia_semana = h2.dia_semana
 AND h1.hora_inicio < h2.hora_fin
 AND h2.hora_inicio < h1.hora_fin;

-- FIN: no hay operaciones de escritura en este archivo.
