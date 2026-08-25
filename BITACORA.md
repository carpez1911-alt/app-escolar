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

### Siguientes pasos (Backlog / Ideas a futuro)
- Pruebas de regresión automatizadas (Playwright) ya estructuradas.
- Posibilidad de implementar arquitectura Offline-First (PWA / IndexedDB) si surgen necesidades de uso sin conexión.
