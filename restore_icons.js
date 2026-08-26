const fs = require('fs');
const path = require('path');

function replaceIconsInFile(filepath, replacements) {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');

  // run common replacements from original update_icons.js
  content = content.replace('<div class="brand-mark">🎓</div>', '<i data-lucide="graduation-cap" class="brand-mark" style="color: var(--primary); width: 32px; height: 32px;"></i>');
  content = content.replace('<div class="brand-mark">⚙️</div>', '<i data-lucide="settings" class="brand-mark" style="color: var(--primary); width: 32px; height: 32px;"></i>');

  // Replace emojis in menu
  content = content.replace('🏠 Panel principal', '<i data-lucide="layout-dashboard" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Panel principal');
  content = content.replace('📋 Control de asistencia', '<i data-lucide="clipboard-check" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Control de asistencia');
  content = content.replace('📚 Gestionar actividades', '<i data-lucide="book-open" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Gestionar actividades');
  content = content.replace('📝 Calificaciones', '<i data-lucide="edit-3" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Calificaciones');
  content = content.replace('📈 Consolidado de Notas', '<i data-lucide="bar-chart-2" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Consolidado de Notas');
  content = content.replace('📊 Reportes y filtros', '<i data-lucide="pie-chart" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Reportes y filtros');
  content = content.replace('👥 Estudiantes y Materias', '<i data-lucide="users" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Estudiantes y Materias');
  content = content.replace('⚙️ Configuración', '<i data-lucide="settings" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Configuración');

  // specific replacements
  for (const r of replacements) {
    content = content.replaceAll(r[0], r[1]);
  }

  // add script if not exists
  if (!content.includes('unpkg.com/lucide@latest')) {
    content = content.replace(
      '</head>',
      '<script src="https://unpkg.com/lucide@latest"></script>\n</head>'
    );
  }

  if (!content.includes('lucide.createIcons()')) {
    if (content.includes('</body>')) {
      content = content.replace('</body>', '<script>lucide.createIcons();</script>\n</body>');
    }
  }

  fs.writeFileSync(filepath, content);
}

// replacements for dashboard
const dashboardRepl = [
  ['🏠 Panel', '<i data-lucide="home" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Panel'],
  ['📅 <span id="fecha">', '<i data-lucide="calendar-days" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> <span id="fecha">'],
  ['<div class="stat-label">👥 Estudiantes activos', '<div class="stat-label"><i data-lucide="users" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Estudiantes activos'],
  ['<div class="stat-label">📝 Tareas registradas', '<div class="stat-label"><i data-lucide="edit" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Tareas registradas'],
  ['<div class="stat-label">⚡ Acciones rápidas', '<div class="stat-label"><i data-lucide="zap" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Acciones rápidas'],
  ['<div class="toolbar-title">📝 Asignar Nueva', '<div class="toolbar-title"><i data-lucide="edit" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Asignar Nueva'],
  ['>💾 Guardar y Publicar', '><i data-lucide="save" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Guardar y Publicar'],
  ['<div class="toolbar-title">📌 Actividades Registradas', '<div class="toolbar-title"><i data-lucide="pin" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Actividades Registradas'],
  ["mostrarToast('⚠️ Completa los campos", "mostrarToast('<i data-lucide=\"alert-triangle\" style=\"width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;\"></i> Completa los campos"],
  ['<div class="empty-icon">🎉</div>', '<div class="empty-icon"><i data-lucide="party-popper" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i></div>'],
];

replaceIconsInFile(path.join(__dirname, 'dashboard.html'), dashboardRepl);

const configuracionRepl = [
  ['🏠 Panel', '<i data-lucide="home" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Panel'],
  ['<div class="toolbar-title">📅 Periodos y Año', '<div class="toolbar-title"><i data-lucide="calendar-days" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Periodos y Año'],
  ['>💾 Guardar Ajustes Generales', '><i data-lucide="save" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Guardar Ajustes Generales'],
  ['<div class="toolbar-title">📆 Marcos de periodos académicos', '<div class="toolbar-title"><i data-lucide="calendar" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Marcos de periodos académicos'],
  ['>💾 Guardar periodos', '><i data-lucide="save" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Guardar periodos'],
  ['<div class="toolbar-title">📊 Categorías de Calificación', '<div class="toolbar-title"><i data-lucide="bar-chart" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Categorías de Calificación'],
  ['>💾 Guardar %', '><i data-lucide="save" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Guardar %'],
  ['<div class="toolbar-title">⏰ Horario Semanal de Clases', '<div class="toolbar-title"><i data-lucide="clock" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Horario Semanal de Clases'],
  ['>💾 Guardar Horario', '><i data-lucide="save" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Guardar Horario'],
];

replaceIconsInFile(path.join(__dirname, 'configuracion.html'), configuracionRepl);

console.log('Restored icons in dashboard and configuracion.');
