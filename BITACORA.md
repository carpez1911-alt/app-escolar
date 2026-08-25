# Bitácora de Progreso - Mi Clase 502

Este documento sirve como registro continuo de los cambios, decisiones arquitectónicas y mejoras implementadas en el sistema.

## Fecha: 24 de Agosto de 2026

### 1. Auditoría y Refactorización de Reglas de Negocio
- **Problema:** La lógica de cálculo de promedios (Definitiva) y la validación de notas (0 a 10) se hacían en el frontend (JavaScript), lo cual era vulnerable a manipulaciones y desincronización de datos.
- **Solución:** Se trasladó la lógica de negocio a la base de datos (PostgreSQL).
- **Entregables:**
  - Script SQL (`sql/01_refactor_calificaciones.sql`) con Constraints (Check de notas), Triggers (validación de tareas vs materias/periodos) y una Vista (`v_promedios_estudiantes`) para el cálculo de promedios.
  - Actualización de `calificaciones.html` para consultar directamente la base de datos en lugar de calcular promedios en memoria.

### 2. Implementación de Autenticación y Seguridad (RLS)
- **Problema:** La base de datos era de acceso público (cualquiera con el enlace podía leer/escribir) al usar políticas `USING (true)` para el rol `anon`.
- **Solución:** Implementación de Supabase Auth y bloqueo por Row Level Security (RLS).
- **Entregables:**
  - Script SQL (`sql/02_rls_auth.sql`) que restringe todas las tablas para que solo el rol `authenticated` (usuarios con sesión) tenga permisos.
  - Creación de `login.html` como puerta de entrada segura.
  - Modificación de `app.js` añadiendo un *Auth Guard* (Redirige a login si no hay sesión activa) y la función de Cerrar Sesión.

### 3. Mejoras de UI/UX
- **Problema:** El uso de emojis en los menús restaba consistencia y profesionalismo visual a la plataforma.
- **Solución:** Migración a iconos SVG minimalistas.
- **Entregables:**
  - Integración de **Lucide Icons** vía CDN en todos los archivos HTML.
  - Reemplazo de los emojis del menú lateral y navbar por iconos.
  - Botón rojo funcional de "Cerrar Sesión" en el menú lateral.

### 4. Resolución de Errores (Bugs)
- **Problema:** Ocurría un error "Error al cargar la planilla" en la vista de calificaciones al intentar obtener los datos.
- **Solución:** Se corrigió un desajuste en el nombre de la columna retornada por la vista de Supabase. El código front-end pedía `promedio_definitiva` cuando la base de datos tenía `promedio_definitivo`.
- **Entregables:** Actualización en `calificaciones.html` y script SQL para asegurar coherencia entre front-end y base de datos.

### 5. Mejoras Funcionales y Experiencia de Usuario (UX)
- **Ocultamiento de actividades calificadas:** En la vista "Calificar Actividades", las tareas para las cuales todos los estudiantes ya cuentan con una nota ahora desaparecen del menú desplegable automáticamente. Esto mantiene la lista limpia.
- **Leyendas emergentes (Tooltips):** Al pasar el cursor sobre la cabecera de la actividad en la tabla de calificaciones, ahora se despliega un cuadro emergente mostrando el título y la descripción completa de la actividad.
- **Depuración total de iconos:** Se reemplazaron de manera automatizada y segura todos los emojis restantes en las interfaces HTML por `Lucide Icons` para darle un diseño 100% profesional.
  - Se resguardó la lógica para no afectar notificaciones *toast* ni mensajes de WhatsApp.
  - Se implementó un `MutationObserver` en `app.js` que escucha los cambios del DOM para renderizar automáticamente los iconos `Lucide` cuando se inyecta HTML dinámico.

### Siguientes pasos (Backlog / Ideas a futuro)
- Pruebas de regresión automatizadas (Playwright) ya estructuradas.
- Posibilidad de implementar arquitectura Offline-First (PWA / IndexedDB) si surgen necesidades de uso sin conexión.
