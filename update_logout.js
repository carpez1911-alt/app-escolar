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

  // Add logout button if not there
  if (!content.includes('cerrarSesion()')) {
    const configLink = '<a href="configuracion.html"><i data-lucide="settings" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Configuración</a>';
    
    if (content.includes(configLink)) {
      content = content.replace(
        configLink,
        configLink + '\n        <hr style="margin: 10px 0; border: 0; border-top: 1px solid var(--border);">\n        <a href="#" onclick="cerrarSesion(); return false;" style="color: #ef4444;"><i data-lucide="log-out" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Cerrar Sesión</a>'
      );
    }
  }
  
  fs.writeFileSync(filepath, content);
});
console.log('Botón logout añadido.');
