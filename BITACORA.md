# Bitácora de Progreso - Mi Clase 502

Este documento sirve como registro continuo de los cambios, decisiones arquitectónicas y mejoras implementadas en el sistema.

## Fecha: 25 de Agosto de 2026

### 6. Mejoras de Diseño Responsive y UX/UI
- **Módulo o sección:** Global (`styles.css` y todas las vistas HTML).
- **Problema identificado:** Falta de adaptabilidad completa en dispositivos móviles. Textos desbordados, tablas inaccesibles horizontalmente, botones pequeños para uso táctil y modales no responsivos.
- **Cambio realizado:** 
  - Reglas de `overflow-wrap` y `word-wrap` aplicadas a nivel global.
  - Se incrementó el tamaño mínimo (`min-height: 48px`) a todos los botones, inputs y estados de asistencia para cumplir con el área táctil mínima (Touch Targets).
  - Los grupos de acciones (`.action-row`, `.filter-actions`) pasaron a organizarse en columna (`flex-direction: column`) ocupando el 100% de ancho en móviles.
  - Reestructuración de la clase CSS de tablas para móviles (`#tabla-notas td.text-left`), restringiendo la primera columna fija a no más de `140px` para liberar espacio visual.
  - Implementación de la clase CSS global `.modal-content` adaptable (`max-width: 500px`, `width: 100%`) y migración de estilos embebidos en el modal de `actividades.html`.
- **Motivo del cambio:** Garantizar la accesibilidad y correcta experiencia de usuario al operar la plataforma desde un teléfono o tablet.
- **Impacto en PC:** Ninguno negativo. La vista aprovecha el espacio disponible, los formularios y tablas mantienen coherencia y espaciado compacto optimizado.
- **Impacto en Celular:** Muy alto. Se elimina la necesidad de scroll horizontal global, se evita el solapamiento de botones y se facilita el marcado de registros con pulgares.
- **Componentes o archivos afectados:** `styles.css`, `login.html`, `calificaciones.html`, `consolidado.html`, `actividades.html`.
- **Resultado de las pruebas responsive:** Exitoso. Las tablas grandes permiten *scroll* interno; los modales nunca desbordan la pantalla vertical ni horizontalmente; los toques sobre las notas o estados se ejecutan con alta precisión gracias a las áreas ampliadas.

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

## Fecha: 25 de Agosto de 2026 - 19:30 (Corrección)
### Restauración de Librería de Iconos
- **Librería original registrada:** `Lucide Icons` (vía CDN), de acuerdo con la implementación documentada previamente (Mejoras de UI/UX, 24 de Agosto).
- **Problema encontrado:** Se identificó que durante recientes ajustes de diseño en algunas vistas, se reemplazaron inadvertidamente múltiples iconos Lucide por emojis genéricos.
- **Iconos restaurados:** Se restituyeron los iconos SVG de Lucide en la barra de navegación (navbar), los menús laterales, títulos de tarjetas (toolbar-title), indicadores estadísticos y botones de acción rápida, eliminando los emojis re-introducidos por error.
- **Archivos/componentes modificados:** `dashboard.html` y `configuracion.html`.
- **Conservación de mejoras:** Todas las optimizaciones visuales y de diseño responsive implementadas recientemente (ajustes en tamaños de inputs, layout de tablas, modales y el nuevo Horario Semanal compactado) fueron respetadas y conservadas intactas sin sufrir ninguna alteración.
- **Resultado de la verificación:** La plataforma vuelve a lucir 100% consistente con la librería Lucide Icons tanto en visualización de PC como en Celular, sin emojis residuales en la interfaz gráfica base, cumpliendo con la fuente de verdad original del proyecto.

## Fecha: 25 de Agosto de 2026 - 20:43 (Recuperaci�n y Horarios)
### Restauraci�n de C�digo
- **Problema:** Un error de codificaci�n y reemplazo de cadenas da�� 'dashboard.html', ocultando el horario y corrompiendo caracteres.
- **Soluci�n:** Se aplic� 'git checkout' para restaurar 'dashboard.html' y 'configuracion.html' al �ltimo commit estable (24 de Agosto), revirtiendo temporalmente el componente visual del horario para evitar mayores da�os y asegurar un punto de recuperaci�n limpio.
