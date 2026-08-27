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

## Fecha: 25 de Agosto de 2026 - 20:43 (Recuperación y Horarios)
### Restauración de Código
- **Problema:** Un error de codificación y reemplazo de cadenas dañó 'dashboard.html', ocultando el horario y corrompiendo caracteres.
- **Solución:** Se aplicó 'git checkout' para restaurar 'dashboard.html' y 'configuracion.html' al último commit estable (24 de Agosto), revirtiendo temporalmente el componente visual del horario para evitar mayores daños y asegurar un punto de recuperación limpio.

## Fecha: 26 de Agosto de 2026 - 18:00 (Mejoras en Reportes)
### Implementación de Reportes Consolidados y Corrección de Interfaz
- **Problema 1:** Los botones de "Enviar WhatsApp" en la tabla de calificaciones mostraban el código HTML puro de Lucide Icons debido a que se estaban insertando como 	extContent en lugar de innerHTML, provocando una visualización defectuosa y que el botón fuera inusualmente largo.
- **Problema 2:** En la vista de asistencia, el botón individual decía "Individual" ocupando mucho espacio.
- **Mejora solicitada:** Se requería un botón de "Reporte General" en calificaciones, similar al de asistencia, para poder notificar a coordinación o a los padres de familia sobre las notas definitivas de todo el grupo de forma masiva.
- **Solución implementada:**
  - Se corrigió el error de renderizado en calificaciones.html para el botón individual.
  - Se cambió el texto a "Enviar" en los botones individuales de calificaciones.html e index.html.
  - Se implementó la lógica enviarReporteGeneralCalificaciones() en calificaciones.html y se agregó un botón prominente junto a "Guardar notas".

### Regla Estricta de Diseño
> **Prohibido cambiar los iconos.** Teníamos todos los iconos estandarizados, eran minimalistas y se han modificado sin instrucción. Bajo ninguna circunstancia se debe volver a alterar la librería de Lucide Icons sin autorización explícita.

## Fecha: 26 de Agosto de 2026 - 19:00 (Fase 2: Dashboard y Descargas)
### Implementación del Nuevo Dashboard y Mejoras de Asistencia
- **Mejora en Asistencia (index.html):** Se modificó la lógica de conteo en la interfaz para mostrar dinámicamente los "Presentes" y "Ausentes" de la lista después de que se cargan los registros del día actual, brindando mejor visibilidad en tiempo real.
- **Mejora en Filtros de Asistencia (eportes.html):** Se integró un input type="date" (id="filtro-fecha") que funciona exclusivamente en la vista de reportes de asistencia, permitiendo filtrar inasistencias por días exactos (ideal para coincidir con horarios de materias).
- **Descargas en Consolidado (consolidado.html):** Se añadieron dos botones "Plantilla General" y "Plantilla Individual". Ambos generan y decargan un archivo .csv utilizando una función iteradora de la tabla DOM. 
- **Nuevo Dashboard (dashboard.html):** 
  - Se dividió la pantalla principal en dos columnas (main y side) con grid CSS.
  - Se añadió la lista resumen de materias contando actividades para los próximos 7 días, facilitando al docente saber qué clases tienen carga académica urgente.
  - Se implementó un "Mini Calendario" visual generado íntegramente con HTML/CSS/JS (sin librerías). Este calendario detecta el mes actual, marca el día actual, e inyecta la clase has-task a los días que tengan un echa_vencimiento registrado, mostrando un indicador visual amarillo.

## Fecha: 26 de Agosto de 2026 - 19:40 (Auditoría de Iconos y Refinamiento del Dashboard)
### Cambios Realizados
- **Auditoría de Iconos:** Se erradicaron todos los emojis estáticos (🏠, 📋, 📚, 📝, 📈, 📊, 👥, ⚙️, 📅, ⚡, 💾, 📌, 🎉) presentes en dashboard.html y se sustituyeron por <i data-lucide="..."></i> de la librería Lucide, logrando completa homogeneidad con el diseño del resto de las vistas. Se añadió lucide.createIcons() al final del archivo.
- **Actividades de la Semana (Dashboard):** Se modificó la lista de "Actividades Registradas" para llamarla "Actividades de la Semana". Ahora su comportamiento filtra estrictamente las actividades cuya fecha de vencimiento esté dentro de los próximos 7 días, y las **agrupa visualmente por materia** para mayor legibilidad.
- **Mini-Calendario Interactivo:** Se añadió interactividad a los días del calendario marcados con punto amarillo. Al hacer clic, se abre una alerta mostrando el detalle exacto (materia y título) de las actividades correspondientes a esa fecha.

### Auditoría Global de Iconos (26 de Agosto de 2026 - 19:45)
- Se ejecutó un script global que analizó cada archivo HTML (index.html, dashboard.html, calificaciones.html, consolidado.html, ctividades.html, eportes.html, configuracion.html, directorio.html) en busca de caracteres correspondientes a emojis.
- Se reemplazaron más de 80 instancias de emojis esparcidas por el sistema (incluyendo menús, botones, estados vacíos y notificaciones toast) asegurando que el 100% de la interfaz gráfica dependa exclusivamente de los vectores escalables de **Lucide Icons**.
- Las notificaciones de WhatsApp fueron saneadas para usar caracteres de texto ASCII y asteriscos, eliminando los emojis que rompían la URL paramétrica y previniendo el envío de etiquetas HTML en los mensajes de texto.

## Fecha: 26 de Agosto de 2026 - 20:50 (Modularización del Menú)
### Patrón DRY (Don't Repeat Yourself) Aplicado
- **Abstracción a pp.js:** Se eliminó el código duro del menú (<div class="nav-actions">...</div>) de los 8 archivos HTML principales.
- **Inyección Dinámica:** Se creó la función inyectarMenuGlobal() en pp.js que construye e inyecta el HTML del menú automáticamente en un contenedor vacío con el id contenedor-menu-global durante el evento DOMContentLoaded.
- **Beneficio:** A partir de ahora, el menú de navegación existe en un solo lugar (dentro de pp.js). Cualquier modificación futura en enlaces o iconos aplicará instantáneamente a todas las pantallas sin necesidad de editar HTML repetitivamente.

## Fecha: 26 de Agosto de 2026 - 20:55 (Auditoría de Menús)
- **Problema detectado:** Al navegar, en algunas pestañas el menú cargaba sin iconos y en otras con iconos, dando la impresión visual de que existían dos menús distintos.
- **Causa Raíz:** Una condición de carrera (*race condition*). La inyección del menú en el DOM (via pp.js) ocurría un milisegundo después de que el motor de iconos (lucide.createIcons()) ya había escaneado la página. Por ende, los iconos del menú inyectado quedaban en blanco a menos que la página tuviera elementos dinámicos que forzaran una re-renderización posterior.
- **Solución:** Se forzó explícitamente el llamado a window.lucide.createIcons() directamente dentro de la función inyectarMenuGlobal() de pp.js. De esta manera, tan pronto como el menú es creado en memoria, sus iconos son renderizados, garantizando estabilidad visual en el 100% de las páginas.
