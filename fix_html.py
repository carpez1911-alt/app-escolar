import re

with open('dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

correct_html = """</section>

<div class="dashboard-columns">
  <div class="col-main">
    <!-- ASIGNAR TAREA CON FECHA INTELIGENTE -->
    <section class="card">
      <div class="toolbar">
        <div><div class="toolbar-title"><i data-lucide="edit" style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Asignar Nueva Actividad</div></div>
      </div>
      <div class="form-content">
          <div class="form-group">
              <label for="materia-tarea">Materia:</label>
              <select id="materia-tarea" class="form-control" onchange="sugerirFechaClase()">
                  <option value="">Seleccione una materia...</option>
              </select>
          </div>
              <div class="form-group">
                <label for="periodo-tarea">Periodo académico:</label>
                <select id="periodo-tarea" class="form-control" onchange="cambiarPeriodoTarea()"></select>
              </div>
          <div class="form-group">
              <label for="categoria-tarea">Categoría de Actividad:</label>
              <select id="categoria-tarea" class="form-control">
                  <option value="">Seleccione una categoría...</option>
              </select>
          </div>
          <div class="form-group">
              <label for="titulo-tarea">Título de la Actividad:</label>
              <input type="text" id="titulo-tarea" class="form-control" placeholder="Ej. Taller de Fracciones">
          </div>
          <div class="form-group">
              <label for="desc-tarea">Descripción:</label>
              <textarea id="desc-tarea" rows="2" class="form-control" placeholder="Instrucciones de la actividad"></textarea>
          </div>
          <div class="form-group">
              <label for="fecha-tarea">Fecha de Entrega / Clase:</label>
              <input type="date" id="fecha-tarea" class="form-control">
              <small id="sugerencia-nota" style="color: var(--muted); margin-top: 4px; display: block;"></small>
          </div>
          <button class="primary-btn" onclick="crearTarea()"><i data-lucide="save" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Guardar y Publicar</button>

      </div>
    </section>

    <section class="card task-card">
      <div class="toolbar">
        <div><div class="toolbar-title"><i data-lucide="pin" style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Actividades de la Semana</div><div class="toolbar-meta">Agrupadas por materia</div></div>
      </div>
      <div class="task-list" id="contenedor-tareas"><div class="loading">Cargando actividades…</div></div>
    </section>
  </div>

  <div class="col-side">
    <section class="card">
      <div class="toolbar" style="margin-bottom: 10px;">
        <div><div class="toolbar-title">Próximos 7 Días</div></div>
      </div>
      <div id="resumen-materias" class="subject-summary">
        <div class="loading">Cargando resumen...</div>
      </div>
      <div id="mini-calendario" class="mini-calendar"></div>
    </section>
  </div>
</div>
</main>"""

start_idx = text.find('</section>\n\n<div class="dashboard-columns">')
end_idx = text.find('</main>')

if start_idx != -1 and end_idx != -1:
    new_text = text[:start_idx] + correct_html + text[end_idx+7:]
    with open('dashboard.html', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print('Fixed successfully!')
else:
    print('Could not find start or end markers.')
