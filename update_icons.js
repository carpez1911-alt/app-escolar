const fs = require('fs');
const path = require('path');

const files = [
  'index.html', 'dashboard.html', 'actividades.html', 
  'calificaciones.html', 'consolidado.html', 'reportes.html', 
  'directorio.html', 'configuracion.html'
];

files.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');

  // Add Lucide script in head if not exists
  if (!content.includes('unpkg.com/lucide@latest')) {
    content = content.replace(
      '</head>',
      '<script src="https://unpkg.com/lucide@latest"></script>\n</head>'
    );
  }

  // Replace emojis in brand
  content = content.replace('<div class="brand-mark">🎓</div>', '<i data-lucide="graduation-cap" class="brand-mark" style="color: var(--primary); width: 32px; height: 32px;"></i>');

  // Replace emojis in menu
  content = content.replace('🏠 Panel principal', '<i data-lucide="layout-dashboard" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Panel principal');
  content = content.replace('📋 Control de asistencia', '<i data-lucide="clipboard-check" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Control de asistencia');
  content = content.replace('📚 Gestionar actividades', '<i data-lucide="book-open" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Gestionar actividades');
  content = content.replace('📝 Calificaciones', '<i data-lucide="edit-3" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Calificaciones');
  content = content.replace('📈 Consolidado de Notas', '<i data-lucide="bar-chart-2" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Consolidado de Notas');
  content = content.replace('📊 Reportes y filtros', '<i data-lucide="pie-chart" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Reportes y filtros');
  content = content.replace('👥 Estudiantes y Materias', '<i data-lucide="users" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Estudiantes y Materias');
  content = content.replace('⚙️ Configuración', '<i data-lucide="settings" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Configuración');

  // Add logout button to menu if not exists
  if (!content.includes('cerrarSesion()')) {
    content = content.replace(
      '</div>\n    </div>',
      '  <hr style="margin: 10px 0; border: 0; border-top: 1px solid var(--border);">\n        <a href="#" onclick="cerrarSesion(); return false;" style="color: #ef4444;"><i data-lucide="log-out" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Cerrar Sesión</a>\n      </div>\n    </div>'
    );
  }

  // Call lucide.createIcons() at the end
  if (!content.includes('lucide.createIcons()')) {
    if (content.includes('</body>')) {
      content = content.replace('</body>', '<script>lucide.createIcons();</script>\n</body>');
    }
  }

  fs.writeFileSync(filepath, content);
});
console.log('Archivos HTML actualizados con Lucide Icons y botón de Logout.');
