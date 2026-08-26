const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'dashboard.html');
let content = fs.readFileSync(dashboardPath, 'utf8');

const horarioHtml = `<!-- HORARIO DASHBOARD -->
<section class="card">
  <div class="toolbar">
    <div><div class="toolbar-title"><i data-lucide="calendar" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Mi Horario Semanal</div><div class="toolbar-meta">Clases programadas</div></div>
  </div>
  <div id="dashboard-horario" class="horario-dashboard">
    <div class="loading">Cargando horario...</div>
  </div>
</section>

<!-- ASIGNAR TAREA CON FECHA INTELIGENTE -->`;

content = content.replace('<!-- ASIGNAR TAREA CON FECHA INTELIGENTE -->', horarioHtml);

const jsRenderLogic = `
function renderizarHorarioDashboard() {
  const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const colores = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316'];
  const contHorario = document.getElementById('dashboard-horario');
  
  if (!horarios || !horarios.length) {
    contHorario.innerHTML = '<div class="empty" style="grid-column: 1 / -1;"><div class="empty-icon"><i data-lucide="calendar-x" style="width: 24px; height: 24px;"></i></div>No has configurado tu horario.</div>';
    if(window.lucide) lucide.createIcons();
    return;
  }

  contHorario.innerHTML = '';
  for(let d = 1; d <= 5; d++) {
    const diaDiv = document.createElement('div');
    diaDiv.className = 'horario-dia';
    diaDiv.innerHTML = \`<h4>\${diasNombres[d-1]}</h4>\`;
    
    const matDia = horarios.filter(h => h.dia_semana === d);
    if(matDia.length === 0) {
      diaDiv.innerHTML += \`<div class="horario-vacio">Libre</div>\`;
    } else {
      matDia.forEach(h => {
        const mat = materias.find(m => m.id === h.materia_id);
        if(mat) {
          const color = colores[(mat.id || 0) % colores.length];
          const item = document.createElement('div');
          item.className = 'horario-item';
          item.style.backgroundColor = color;
          item.textContent = mat.nombre_materia;
          diaDiv.appendChild(item);
        }
      });
    }
    contHorario.appendChild(diaDiv);
  }
}

cargarDatosIniciales();`;

content = content.replace('cargarDatosIniciales();', jsRenderLogic);

const renderCall = `  cargarDashboard();
  renderizarHorarioDashboard();
}

function cambiarPeriodoTarea() {`;

content = content.replace(`  cargarDashboard();
}

function cambiarPeriodoTarea() {`, renderCall);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('dashboard.html updated successfully.');
