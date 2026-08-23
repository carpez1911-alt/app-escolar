# AUDITORÍA REAL DE SUPABASE

**Estado:** instrumento preparado; resultados reales pendientes de ejecutar en Supabase.

**Fecha de preparación:** 2026-08-21

## Alcance

Esta auditoría todavía no modifica la base de datos. El script asociado solo contiene consultas de lectura sobre `information_schema`, `pg_catalog`, `pg_policies`, `pg_indexes` y las tablas prioritarias.

Archivo ejecutable: [sql/audit_supabase.sql](../sql/audit_supabase.sql)

No se han presentado como hechos columnas, relaciones, constraints, índices, policies o funciones que no hayan sido devueltos por Supabase.

## 1. Tablas encontradas

**Pendiente de evidencia.** Ejecutar las consultas 1 y 8 del script y pegar aquí el resultado.

Tablas prioritarias que el frontend actual intenta consultar:

- `configuracion_global`
- `estudiantes`
- `materias`
- `horario_semanal`
- `marcos_periodos`
- `tareas`
- `calificaciones`
- `asistencia`

Estas referencias provienen del código local, no constituyen confirmación del esquema real.

## 2. Columnas reales

**Pendiente de evidencia.** Usar la consulta de columnas de la sección 2 y la consulta específica de la sección 9.

La auditoría debe confirmar, entre otros datos:

- nombre exacto de la columna;
- tipo PostgreSQL;
- nulabilidad;
- valor por defecto;
- precisión numérica;
- columnas relacionadas con año, grado, grupo y periodo;
- columnas de fecha y hora.

## 3. Relaciones reales

**Pendiente de evidencia.** Usar la consulta de foreign keys.

Debe confirmarse especialmente:

```text
calificaciones.estudiante_id -> estudiantes.id
calificaciones.tarea_id -> tareas.id
calificaciones.materia_id -> materias.id
tareas.materia_id -> materias.id
asistencia.estudiante_id -> estudiantes.id
horario_semanal.materia_id -> materias.id
```

Estas relaciones son hipótesis derivadas del frontend hasta que aparezcan en `information_schema`.

## 4. Constraints reales

**Pendiente de evidencia.** Usar la consulta de constraints y checks.

Debe verificarse sin asumir:

- primary keys;
- foreign keys;
- unique de asistencia por fecha y estudiante;
- unique de calificación por estudiante, actividad y periodo;
- rango de notas;
- estados permitidos;
- restricciones de fechas;
- restricciones de porcentajes.

## 5. Índices reales

**Pendiente de evidencia.** Usar las consultas de `pg_indexes` y `pg_index`.

Después de recibir los resultados se clasificará cada índice como:

- necesario;
- útil;
- redundante;
- faltante;
- inválido.

No se crearán índices en esta etapa.

## 6. RLS real

**Pendiente de evidencia.** Usar la consulta de `pg_class`.

Resultado esperado por tabla:

| Tabla | RLS habilitado | RLS forzado |
|---|---:|---:|
| Pendiente | Pendiente | Pendiente |

No se modificará RLS durante esta auditoría.

## 7. Policies reales

**Pendiente de evidencia.** Usar la consulta de `pg_policies`.

Se debe documentar por tabla y operación:

| Tabla | Policy | Operación | Roles | USING | WITH CHECK |
|---|---|---|---|---|---|
| Pendiente | Pendiente | SELECT/INSERT/UPDATE/DELETE | Pendiente | Pendiente | Pendiente |

## 8. Triggers

**Pendiente de evidencia.** Usar las consultas de `information_schema.triggers` y `pg_trigger`.

Debe determinarse si existen triggers para:

- `updated_at`;
- validación de periodos;
- normalización de estados;
- auditoría;
- integridad de calificaciones;
- asistencia.

## 9. Functions/RPC

**Pendiente de evidencia.** Usar la consulta de `pg_proc`.

No se asumirán funciones como `guardar_calificacion()` o `calcular_promedio_periodo()` hasta que Supabase las devuelva.

## 10. Datos inconsistentes

El script incluye diagnósticos de lectura para:

### Estudiantes

- año, grado/grupo o nombre vacío;
- estados existentes;
- nombres duplicados;
- estudiantes inactivos.

### Tareas

- materia o periodo ausente;
- fecha ausente;
- tareas duplicadas;
- fechas fuera de `marcos_periodos`, si las columnas reales permiten evaluarlo.

### Calificaciones

- duplicados;
- notas nulas;
- notas fuera del rango actualmente usado por el frontend;
- estudiante inexistente;
- tarea inexistente;
- materia inexistente;
- materia o periodo distintos a los de la tarea.

### Asistencia

- duplicados por fecha y estudiante;
- estudiante inexistente;
- fecha nula;
- estados distintos de `P`, `E`, `T`, `A` y sus nombres completos.

### Periodos

- marcos superpuestos;
- fechas nulas;
- fecha inicial posterior a fecha final;
- periodos duplicados por año.

### Horario

- materias inexistentes;
- días inválidos;
- registros duplicados;
- bloques superpuestos cuando existan columnas horarias.

**Resultados reales:** pendientes de ejecutar y pegar desde Supabase.

## 11. Riesgos

1. El frontend actual crea clientes Supabase duplicados en varias páginas.
2. El frontend utiliza `select('*')` en varias consultas.
3. `index.html` filtra estudiantes con el año `2026` codificado.
4. La asistencia usa `insert()` y no carga registros existentes para editarlos.
5. `configuracion.html` reemplaza el horario mediante eliminación e inserción separadas.
6. `dashboard.html` contiene festivos codificados, no una tabla consultada.
7. Las actividades se eliminan físicamente desde `actividades.html`.
8. La validación de fechas de actividades contra periodos no está protegida por base de datos.
9. No se conoce el estado real de RLS.
10. No se conoce la constraint real de unicidad de calificaciones.
11. No se conoce si `marcos_periodos` ya cubre correctamente los periodos.
12. No existen SQL locales para reproducir constraints, índices, triggers o policies.

Estos son riesgos observados en el código o desconocimientos de auditoría, no resultados confirmados del esquema.

## 12. Qué conservar

Hasta obtener evidencia real, no debe eliminarse:

- `estudiantes`;
- `asistencia`;
- `tareas`;
- `calificaciones`;
- `materias`;
- `horario_semanal`;
- `marcos_periodos`;
- `configuracion_global`.

También debe conservarse el contexto actual de trabajo informado por el usuario:

```text
Año 2026 · Grado 5.º · Grupo 502 · Periodo 3
```

Este contexto debe tratarse como configuración actual, no como regla permanente del frontend.

## 13. Qué ampliar

No se decide ninguna ampliación hasta revisar:

- columnas reales;
- relaciones existentes;
- duplicados;
- datos nulos;
- estructura de `marcos_periodos`;
- estructura de `horario_semanal`;
- policies de RLS.

La opción preferida será una migración evolutiva y no destructiva sobre las tablas actuales.

## 14. Qué crear

No se crearán tablas durante esta etapa.

Después de la auditoría podría evaluarse, según evidencia:

- tablas normalizadas de grados y grupos;
- festivos;
- bloques horarios;
- seguimiento formativo;
- convivencia;
- observaciones;
- compromisos;
- acciones.

No se debe crear una tabla `periodos` si `marcos_periodos` ya cumple correctamente esa función.

No se debe crear `actividades` si `tareas` puede evolucionar sin pérdida de datos.

## 15. Qué NO debe modificarse

Durante esta etapa no debe ejecutarse:

- `ALTER TABLE`;
- `CREATE TABLE`;
- `CREATE INDEX`;
- `CREATE FUNCTION`;
- `CREATE TRIGGER`;
- `CREATE POLICY`;
- `DROP`;
- `DELETE`;
- `UPDATE` masivo;
- `TRUNCATE`.

Tampoco se modificaron archivos de aplicación en esta etapa.

## 16. Propuesta de arquitectura definitiva

La arquitectura definitiva se decidirá después de obtener los resultados reales. Como dirección inicial, se recomienda:

1. Un único cliente Supabase compartido.
2. Un contexto académico global con año, grado, grupo y periodo.
3. Reutilización evolutiva de `marcos_periodos` y `tareas` si sus estructuras lo permiten.
4. Calificaciones relacionadas con estudiante, tarea, materia, periodo y año.
5. Asistencia con unicidad por fecha y estudiante.
6. Validaciones críticas protegidas en PostgreSQL.
7. RLS verificado antes de exponer nuevos módulos.
8. Promedios centralizados y ponderación definida por configuración.
9. Eliminación lógica de actividades y registros pedagógicos con historial.
10. Módulos frontend separados por dominio, con utilidades comunes de fechas, contexto, validación y UI.

## Próximo paso

1. Ejecutar `sql/audit_supabase.sql` en el SQL Editor de Supabase.
2. Exportar o copiar los resultados de cada sección.
3. Completar este documento con evidencia real.
4. Diseñar la migración únicamente después de revisar esa evidencia.
