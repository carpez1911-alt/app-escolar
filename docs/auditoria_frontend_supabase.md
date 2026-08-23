# AUDITORÍA FRONTEND ↔ SUPABASE

**Fecha:** 2026-08-21  
**Alcance:** inspección del frontend frente al esquema real proporcionado. No se modificaron tablas, datos, RLS ni constraints.

## Resumen ejecutivo

El frontend coincide parcialmente con Supabase para las operaciones básicas de materias, estudiantes, tareas, calificaciones, asistencia, configuración y horario. La planilla de calificaciones usa correctamente `tarea_id` y el `upsert` respeta la clave única confirmada.

Las principales incompatibilidades son:

- `asistencia` se guarda con `insert()` aunque la regla de negocio exige `UNIQUE(fecha, estudiante_id)` y actualización mediante `upsert()`.
- `index.html` todavía fija `año_lectivo = 2026`.
- `reportes.html` consulta/ordena columnas incorrectas: usa `fecha` y `created_at`, pero calificaciones tiene `fecha_registro` y asistencia tiene `fecha`.
- `configuracion.html` modifica `marcos_periodos`, pero también reemplaza todo el horario con `DELETE` + `INSERT` separados.
- `dashboard.html` no consulta festivos porque no existe una tabla `festivos` confirmada.
- `tareas`, `calificaciones` y `horario_semanal` no tienen año explícito, lo que impide aislar completamente varios años lectivos.
- Hay clientes Supabase y lógica de toast duplicados en algunas páginas.
- RLS está desactivado en `asistencia`, `estudiantes` y `materias`; varias operaciones dependen de policies que no fueron confirmadas.

## A. LO QUE YA FUNCIONA

### 🟢 CORRECTO: conexión compartida parcial

`app.js` crea `window.clienteSupabaseCompartido`, y varias páginas cargan `app.js`. `calificaciones.html`, `dashboard.html` y `configuracion.html` usan esa instancia.

**Limitación:** `index.html` y `actividades.html` todavía conservan declaraciones de claves duplicadas, aunque utilizan el cliente compartido. La duplicación debe retirarse en una limpieza posterior.

### 🟢 CORRECTO: materias y estudiantes

Las consultas cargan materias desde `materias` y estudiantes desde `estudiantes`; no se generan materias ficticias.

### 🟢 CORRECTO: calificaciones por actividad

`calificaciones.html` consulta `tareas` por `materia_id` y `periodo`, crea una celda por tarea y envía `tarea_id` en el guardado:

```text
estudiante_id
materia_id
periodo
tarea_id
nota
```

El `upsert` utiliza `estudiante_id, materia_id, periodo, tarea_id`, coincidiendo con la restricción UNIQUE confirmada.

### 🟢 CORRECTO: marcos de periodo

`configuracion.html` consulta `marcos_periodos` y permite editar `fecha_inicio` y `fecha_fin` por `id`, sin crear periodos nuevos ni borrar registros.

### 🟢 CORRECTO: horario vacío controlado

El dashboard consulta `horario_semanal`. Si una materia no tiene días, muestra que no existe horario configurado y no inventa un día.

## B. TABLAS USADAS CORRECTAMENTE

| Tabla | Uso frontend | Estado |
|---|---|---|
| `materias` | SELECT de materias | 🟢 Correcto funcionalmente |
| `estudiantes` | SELECT de estudiantes activos | 🟡 Filtrado por año fijo en asistencia |
| `tareas` | SELECT/INSERT/DELETE y relación con materias | 🟡 Funcional, sin contexto de año |
| `calificaciones` | SELECT y UPSERT por tarea | 🟢 Correcto en clave de negocio |
| `configuracion_global` | SELECT/UPSERT de configuración | 🟢 Coincide con columnas confirmadas |
| `marcos_periodos` | SELECT/UPDATE de fechas | 🟢 Compatible con columnas confirmadas |
| `horario_semanal` | SELECT/INSERT/DELETE por materia/día | 🟡 Solo soporta días, no bloques horarios |
| `asistencia` | INSERT de estado y fecha | 🔴 No usa UPSERT ni carga histórico |
| `entregas_tareas` | No utilizada | 🟡 Integración pendiente |
| `registro_notas` | No utilizada | 🟡 Función no integrada |

## C. TABLAS QUE FALTAN

### 🟡 Tablas referenciadas pero no confirmadas

El frontend actual no contiene referencias a tablas fuera del conjunto confirmado. Sin embargo, el objetivo funcional menciona festivos y seguimiento, y no existe una tabla confirmada para ellos.

| Entidad necesaria | Estado | Observación |
|---|---|---|
| `festivos` | 🟠 Importante | No existe entre las tablas confirmadas; no debe agregarse aún |
| seguimiento/observaciones | 🟠 Importante | No existe tabla confirmada |
| convivencia/compromisos | 🟠 Importante | No existe tabla confirmada |
| bloques horarios | 🟠 Importante | No existe una entidad confirmada para horas |

No se deben crear estas tablas hasta diseñar y aprobar una migración.

## D. COLUMNAS QUE FALTAN

### 🔴 CRÍTICO: contexto de año incompleto

| Tabla | El frontend necesita | Supabase confirmado |
|---|---|---|
| `tareas` | año para separar actividades por ciclo | No tiene `año_lectivo` confirmado |
| `calificaciones` | año para separar históricos | No tiene `año_lectivo` confirmado |
| `horario_semanal` | año/grupo para horarios futuros | Solo `materia_id`, `dia_semana` confirmados |
| `marcos_periodos` | año y periodo | Sí tiene ambos |
| `estudiantes` | año lectivo | Sí tiene `año_lectivo`, pero no relación histórica normalizada |

### 🔴 CRÍTICO: reportes usa columnas incorrectas

`reportes.html` consulta:

```javascript
calificaciones.order('fecha')
```

Pero la tabla confirmada tiene `fecha_registro`, no `fecha`.

También usa `created_at` como fallback, columna no confirmada en `calificaciones` ni `asistencia`.

### 🟠 IMPORTANTE: horario

El frontend no solicita `hora_inicio` ni `hora_fin`, y la estructura confirmada tampoco las contiene. Por tanto, hoy solo puede representar días, no bloques horarios.

### 🟠 IMPORTANTE: escala de notas

La interfaz valida `0–10`, pero `calificaciones` no tiene CHECK de rango confirmado. `registro_notas` sí limita `saber`, `hacer` y `ser` a `1–10`. La escala de `calificaciones` debe definirse antes de cambiar frontend o base.

## E. RELACIONES QUE FALTAN

Relaciones confirmadas y utilizadas correctamente:

```text
asistencia.estudiante_id -> estudiantes.id
calificaciones.estudiante_id -> estudiantes.id
calificaciones.materia_id -> materias.id
calificaciones.tarea_id -> tareas.id
tareas.materia_id -> materias.id
horario_semanal.materia_id -> materias.id
```

Relaciones funcionalmente faltantes para multi-año:

```text
tareas -> año/grupo
calificaciones -> año/grupo/periodo contextual
horario_semanal -> año/grupo
estudiantes -> relación histórica con grupo y año
```

No son ausencia de foreign keys confirmadas; son datos de contexto que hoy no están modelados en esas tablas.

## F. CONSULTAS DEL FRONTEND

| Archivo / función | Operación | Tabla | Columnas/filtros | Resultado | Problemas |
|---|---|---|---|---|---|
| `index.html` / `cargarEstudiantes` | SELECT | `estudiantes` | `*`, estado Activo, año 2026 | Lista de alumnos | 🔴 Año fijo; `select('*')` |
| `index.html` / `guardarAsistencia` | INSERT | `asistencia` | estudiante, estado, fecha | Guarda estados | 🔴 Debe usar UPSERT; no carga registros existentes; RLS OFF |
| `dashboard.html` / `cargarDatosIniciales` | SELECT | `materias` | id, nombre | Selector | 🟢 Compatible |
| `dashboard.html` / `cargarDatosIniciales` | SELECT | `horario_semanal` | id, materia_id, dia_semana | Días de clase | 🟡 No hay horas; RLS ON requiere SELECT policy |
| `dashboard.html` / `cargarDatosIniciales` | SELECT | `configuracion_global` | año_actual, periodo_actual | Contexto | 🟢 Compatible |
| `dashboard.html` / `cargarDatosIniciales` | SELECT | `marcos_periodos` | año, periodo, fechas | Validación de fecha | 🟢 Compatible |
| `dashboard.html` / `crearTarea` | SELECT | `configuracion_global` | periodo_actual | Periodo de actividad | 🟢 Compatible |
| `dashboard.html` / `crearTarea` | INSERT | `tareas` | materia, título, descripción, fecha, periodo | Crea tarea | 🟠 RLS ON; requiere INSERT policy; no valida año de la actividad |
| `dashboard.html` / `cargarDashboard` | SELECT | `estudiantes` | id, estado Activo | Métrica | 🟡 No filtra año/grupo |
| `dashboard.html` / `cargarDashboard` | SELECT | `tareas` | relación materia, fecha | Lista | 🟡 No filtra contexto actual |
| `actividades.html` / `inicializarFiltros` | SELECT | `configuracion_global` | cantidad, periodo | Filtros | 🟢 Compatible |
| `actividades.html` / `inicializarFiltros` | SELECT | `materias` | `*` | Materias | 🟡 Selección excesiva |
| `actividades.html` / `cargarActividades` | SELECT | `tareas` | `*`, relación materia | Lista filtrada | 🟡 Selección excesiva; sin año |
| `actividades.html` / `eliminarActividad` | DELETE | `tareas` | id | Elimina tarea | 🔴 Borrado físico con posibles calificaciones; RLS ON |
| `calificaciones.html` / `inicializarPlanilla` | SELECT | `configuracion_global` | cantidad, periodo | Selector | 🟢 Compatible |
| `calificaciones.html` / `inicializarPlanilla` | SELECT | `materias` | id, nombre | Selector | 🟢 Compatible |
| `calificaciones.html` / `cargarPlanilla` | SELECT | `estudiantes` | id, nombre, Activo | Filas | 🟡 Sin filtro de año/grupo |
| `calificaciones.html` / `cargarPlanilla` | SELECT | `tareas` | id, título, materia, periodo | Columnas | 🟢 Compatible |
| `calificaciones.html` / `cargarPlanilla` | SELECT | `calificaciones` | id, estudiante, materia, tarea, periodo, nota | Notas | 🟢 Compatible; RLS ON requiere SELECT policy |
| `calificaciones.html` / `guardarNotas` | UPSERT | `calificaciones` | clave compuesta + nota | Inserta/actualiza | 🟢 Coincide con UNIQUE; requiere INSERT/UPDATE policies |
| `configuracion.html` / `inicializar` | SELECT | `marcos_periodos` | id, año, periodo, fechas | Tabla editable | 🟢 Compatible; RLS ON requiere SELECT policy |
| `configuracion.html` / `guardarPeriodos` | UPDATE | `marcos_periodos` | fechas por id | Actualiza marcos | 🟠 Requiere UPDATE policy |
| `configuracion.html` / `guardarConfiguracion` | UPSERT | `configuracion_global` | id, año, periodo, cantidad | Configuración | 🟠 Requiere INSERT/UPDATE policies |
| `configuracion.html` / `guardarHorario` | DELETE | `horario_semanal` | todos los ids | Limpia horario | 🔴 Operación destructiva separada; requiere DELETE policy |
| `configuracion.html` / `guardarHorario` | INSERT | `horario_semanal` | materia, día | Guarda horario | 🟠 Requiere INSERT policy |
| `reportes.html` / `cargarDatos` | SELECT | `calificaciones` | `*`, relaciones, order fecha | Reporte | 🔴 `fecha` no existe; debe usar `fecha_registro` |
| `reportes.html` / `cargarDatos` | SELECT | `asistencia` | `*`, relación, order fecha | Reporte | 🟠 `*`; RLS OFF |

No se encontraron llamadas `supabase.rpc()`.

## G. ERRORES DE INTEGRACIÓN

### 🔴 CRÍTICO: asistencia duplicable

El frontend hace `INSERT` y no utiliza una clave única confirmada para actualizar. Registrar dos veces el mismo alumno en la misma fecha puede producir duplicados si la base no tiene la UNIQUE indicada por el requisito funcional.

### 🔴 CRÍTICO: reporte académico roto

`reportes.html` ordena calificaciones por `fecha`, pero la columna real es `fecha_registro`. Esa consulta puede devolver error y dejar el reporte académico vacío.

### 🔴 CRÍTICO: año codificado

`index.html` filtra estudiantes por `2026`, impidiendo cambiar de año desde configuración.

### 🟠 IMPORTANTE: policies de desarrollo abiertas

La evidencia actual de Supabase confirma policies para las operaciones principales:

- `calificaciones`: SELECT, INSERT y UPDATE para `anon` y `authenticated`.
- `configuracion_global`: SELECT y UPDATE para `anon` y `authenticated`.
- `horario_semanal`: SELECT, INSERT y DELETE para `anon` y `authenticated`.
- `marcos_periodos`: SELECT y UPDATE para `anon` y `authenticated`.
- `tareas`: ALL para `public`.

Todas usan expresiones `true`, por lo que permiten acceso sin restricción de contexto. Son adecuadas para probar el prototipo local, pero inseguras para producción.

### 🟠 IMPORTANTE: `upsert` de configuración

`configuracion.html` utiliza `upsert()` sobre `configuracion_global`, pero la matriz no muestra una policy `INSERT` para esa tabla. Aunque existe una fila con `id = 1`, el `upsert` puede requerir autorización de INSERT por su semántica de PostgreSQL/PostgREST. Debe probarse el guardado; si falla, será necesario añadir una policy INSERT temporal o cambiar el frontend a UPDATE sobre la fila existente.

### 🟠 IMPORTANTE: eliminación física de tareas

`actividades.html` usa `DELETE` aunque una tarea puede tener calificaciones o entregas. La FK de `calificaciones.tarea_id` y `entregas_tareas.tarea_id` puede bloquear el borrado o provocar una política de cascada no deseada.

### 🟠 IMPORTANTE: horario no equivale a bloques

El frontend sugiere fecha por día, pero no puede sugerir hora porque Supabase solo confirma `dia_semana`.

### 🟡 MEJORABLE: duplicación de clientes y toasts

`app.js` crea el cliente compartido, pero algunas páginas todavía declaran claves y funciones de toast locales.

## H. PROBLEMAS DE MULTI-AÑO

### 🔴 CRÍTICO

- `index.html` fija el año 2026.
- `dashboard.html` lista tareas de todos los años porque `tareas` no tiene año.
- `calificaciones.html` consulta estudiantes activos sin año/grupo.
- `calificaciones` no distingue inequívocamente registros de años distintos.
- `horario_semanal` no diferencia años ni grupos.

### 🟠 IMPORTANTE

`estudiantes.año_lectivo` y `grado_grupo` describen el estado del estudiante, pero no garantizan historial de matrícula. Cambiar esos valores puede mezclar o perder el contexto histórico.

### 🟡 MEJORABLE

La configuración global tiene un solo registro y no existe una entidad confirmada para múltiples docentes, instituciones o grupos activos.

## I. PROBLEMAS DE RLS

| Tabla | RLS | Operaciones frontend | Riesgo |
|---|---|---|---|
| `asistencia` | OFF | SELECT/INSERT | 🔴 Datos expuestos y sin políticas |
| `estudiantes` | OFF | SELECT | 🔴 Datos expuestos |
| `materias` | OFF | SELECT | 🟠 Datos expuestos |
| `calificaciones` | ON | SELECT/UPSERT | 🟢 Tiene SELECT, INSERT y UPDATE para anon/authenticated |
| `configuracion_global` | ON | SELECT/UPSERT | 🟠 Tiene SELECT/UPDATE; falta confirmar INSERT para `upsert` |
| `entregas_tareas` | ON | No usado | 🟡 Integración futura |
| `horario_semanal` | ON | SELECT/INSERT/DELETE | 🟢 Tiene las tres policies necesarias |
| `marcos_periodos` | ON | SELECT/UPDATE | 🟢 Tiene ambas policies necesarias |
| `registro_notas` | ON | No usado | 🟡 Pendiente de definir |
| `tareas` | ON | SELECT/INSERT/DELETE | 🟠 Tiene `ALL` para `public`, pero es demasiado amplia |

No se debe activar Auth ni cambiar policies todavía en esta etapa.

## J. DUPLICIDAD / POSIBLE CONFLICTO ENTRE TABLAS

### `calificaciones` vs `registro_notas`

No hay referencias frontend a `registro_notas`, por lo que no se puede afirmar su uso operativo actual.

Por estructura:

- `calificaciones` representa evaluación por actividad/tarea, vinculada a periodo y tarea.
- `registro_notas` representa una valoración por dimensiones `saber`, `hacer`, `ser`, con `nota_definitiva` y observaciones.

**Conclusión:** parecen conceptos diferentes, no deben fusionarse ni eliminarse. La primera es calificación sumativa por actividad; la segunda parece evaluación formativa o consolidado por dimensiones. Debe definirse en UX si `registro_notas` alimentará reportes finales o permanecerá como módulo separado.

### `entregas_tareas`

Representa entrega/no entrega por estudiante y tarea. Es funcionalmente distinta de la calificación y debe conservarse.

## K. CAMBIOS NECESARIOS EN FRONTEND

1. Corregir `reportes.html` para usar `fecha_registro` en calificaciones.
2. Cambiar asistencia a flujo seleccionar fecha → cargar registros → editar → `upsert`.
3. Centralizar completamente el cliente Supabase y toast.
4. Eliminar filtros fijos de año y usar configuración global.
5. Reducir `select('*')` a columnas necesarias.
6. Manejar estados de carga, error y vacío de forma uniforme.
7. Evitar `DELETE` físico de actividades con historial.
8. Validar fechas de tareas contra `marcos_periodos`.
9. Reconocer que el horario actual solo contiene días, no horas.
10. Centralizar el cálculo de promedios y decidir si será uniforme o ponderado.

## L. CAMBIOS NECESARIOS EN SUPABASE

Estos son diagnósticos, no instrucciones para ejecutar todavía:

1. Definir estrategia de año/grupo para `tareas`, `calificaciones` y `horario_semanal`.
2. Confirmar o crear, mediante migración aprobada, unicidad de asistencia por fecha/estudiante.
3. Definir constraints de notas según la escala institucional.
4. Revisar foreign keys y comportamiento `ON DELETE` de tareas con calificaciones/entregas.
5. Sustituir eventualmente la policy abierta de `tareas` por policies asociadas al docente/contexto.
6. Diseñar RLS para tablas actualmente públicas.
7. Evaluar entidades de festivos, bloques horarios y seguimiento solo cuando se apruebe el modelo.
8. Confirmar si `marcos_periodos` será la única fuente de periodos.

## M. CAMBIOS QUE NO DEBEN HACERSE TODAVÍA

- No eliminar `registro_notas`.
- No eliminar `entregas_tareas`.
- No reemplazar `tareas` por otra tabla sin migración.
- No agregar `año_lectivo` a tablas sin diseño de migración y revisión de datos.
- No activar Auth todavía.
- No cambiar RLS sin probar policies por operación.
- No agregar festivos, bloques horarios o seguimiento sin modelo aprobado.
- No ejecutar `DROP`, `DELETE` masivo, `TRUNCATE`, `ALTER` ni migraciones estructurales.

## N. PLAN DE IMPLEMENTACIÓN

### Fase 1: correcciones frontend de bajo riesgo

- Corregir el reporte de `fecha` a `fecha_registro`.
- Centralizar cliente y utilidades.
- Mejorar estados de carga/error.
- Migrar asistencia a edición y `upsert`, una vez confirmada la constraint real.

### Fase 2: validación funcional

- Probar lectura y guardado con RLS existente.
- Probar edición de una nota sin duplicarla.
- Probar dos registros de asistencia del mismo estudiante y fecha.
- Probar fechas dentro y fuera de periodo.
- Probar horario vacío.

### Fase 3: modelo multi-año

- Diseñar contexto académico y matrícula histórica.
- Mapear datos existentes antes de cualquier cambio estructural.
- Diseñar migración no destructiva y constraints.

### Fase 4: seguridad

- Revisar policies actuales.
- Asociar acceso al usuario/docente cuando se implemente Auth.
- Probar SELECT/INSERT/UPDATE/DELETE por rol.

### Fase 5: módulos posteriores

- Festivos.
- Bloques horarios.
- Entregas.
- Registro formativo.
- Convivencia.
- Reportes avanzados.

## Conclusión

El frontend es funcional para un único grupo y ciclo, especialmente en materias, tareas, calificaciones por actividad y configuración de periodos. No es todavía coherente con una aplicación multi-año ni con una política de seguridad estable.

La corrección inmediata de menor riesgo es frontend: reparar `reportes.html`, eliminar el año fijo, y hacer asistencia editable mediante `upsert`. Las ampliaciones de Supabase deben esperar a un diseño de migración basado en datos existentes y en la revisión de las policies reales.
