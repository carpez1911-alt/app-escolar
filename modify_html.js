const fs = require('fs');
let content = fs.readFileSync('calificaciones.html', 'utf8');

// Normalize line endings to LF for easier regex
content = content.replace(/\r\n/g, '\n');

content = content.replace('let notasCargadas = [];', 'let notasCargadas = [];\nlet promediosCargados = [];');

content = content.replace(/function actualizarPromedios\(fila\) \{[\s\S]*?\n\}/, `function actualizarPromedios(fila) {
  // El cálculo se movió a la vista en BD. Solo recargar al guardar.
}`);

content = content.replace(
  "clienteSupabase.from('calificaciones').select('id, estudiante_id, materia_id, tarea_id, periodo, nota').eq('materia_id', materiaId).eq('periodo', periodo)",
  "clienteSupabase.from('calificaciones').select('id, estudiante_id, materia_id, tarea_id, periodo, nota').eq('materia_id', materiaId).eq('periodo', periodo),\n    clienteSupabase.from('v_promedios_estudiantes').select('estudiante_id, promedio_definitiva').eq('materia_id', materiaId).eq('periodo', periodo)"
);

content = content.replace(
  "const [resEst, resTareas, resNotas] = await Promise.all([",
  "const [resEst, resTareas, resNotas, resPromedios] = await Promise.all(["
);

content = content.replace(
  "if (resEst.error || resTareas.error || resNotas.error) { toast('Error al cargar la planilla'); return; }",
  "if (resEst.error || resTareas.error || resNotas.error || resPromedios?.error) { toast('Error al cargar la planilla'); return; }"
);

content = content.replace(
  "notasCargadas = resNotas.data || [];",
  "notasCargadas = resNotas.data || [];\n  promediosCargados = resPromedios?.data || [];"
);

content = content.replace(
  "const promedioMateria = crearCelda('td', '-', 'promedio-col promedio-materia');",
  "const pro = promediosCargados.find(p => String(p.estudiante_id) === String(estudiante.id));\n    const promedioMateria = crearCelda('td', pro ? pro.promedio_definitiva : '-', 'promedio-col promedio-materia');"
);

content = content.replace(
  "fila.appendChild(crearCelda('td', '-', 'promedio-col promedio-general'));",
  "fila.appendChild(crearCelda('td', pro ? pro.promedio_definitiva : '-', 'promedio-col promedio-general'));"
);

content = content.replace(
  /if \(error\) \{\n\s*console\.error\('Error al guardar calificaciones:', error\);\n\s*toast\('No fue posible guardar las calificaciones\.'\);/,
  "if (error) {\n        console.error('Error al guardar calificaciones:', error);\n        toast('Error DB: ' + (error.message || 'No fue posible guardar las calificaciones.'));"
);

fs.writeFileSync('calificaciones.html', content);
