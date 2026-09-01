
    const clienteSupabase = window.clienteSupabaseCompartido;
    const toast = mostrarToast;

    let estudiantes = [];
    let materias = [];
    let configuracion = {};

    window.addEventListener('DOMContentLoaded', async () => {
      // Fetch dynamic data
      const [resCfg, resEst, resMat] = await Promise.all([
        clienteSupabase.from('configuracion_global').select('*').limit(1).single(),
        clienteSupabase.from('estudiantes').select('id, nombre_completo, documento_identidad').eq('estado', 'Activo').order('nombre_completo'),
        clienteSupabase.from('materias').select('id, nombre_materia').order('nombre_materia')
      ]);

      if (resCfg.data) configuracion = resCfg.data;
      if (resEst.data) estudiantes = resEst.data;
      if (resMat.data) materias = resMat.data;

      // Populate Institution Info
      const instName = configuracion.nombre_institucion || 'INSTITUCIÓN EDUCATIVA';
      const docName = configuracion.nombre_docente || 'Docente Titular';
      const instYear = configuracion.año_actual || new Date().getFullYear();

      document.querySelector('.inst-title-box h1').textContent = instName.toUpperCase();
      document.querySelector('.inst-meta-box div:nth-child(1) strong').textContent = instYear;
      document.getElementById('docente-nombre').textContent = docName;
      document.getElementById('preview-docente-nombre').textContent = docName;

      // Populate Students Dropdown
      const selEst = document.getElementById('selEstudiante');
      selEst.innerHTML = '<option value="">-- Selecciona un estudiante --</option>';
      estudiantes.forEach((e) => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = `${e.nombre_completo}`;
        selEst.appendChild(opt);
      });

      // Populate Subjects Dropdown
      const selAsig = document.getElementById('selAsignatura');
      selAsig.innerHTML = '<option value="">-- Selecciona una asignatura --</option>';
      materias.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m.nombre_materia;
        opt.textContent = m.nombre_materia;
        selAsig.appendChild(opt);
      });
      
      // Auto-set Date and Time
      const now = new Date();
      document.getElementById('txtFecha').value = now.toISOString().split('T')[0];
      document.getElementById('txtHora').value = now.toTimeString().slice(0, 5);
      
      // Update Title Tag
      if (configuracion.nombre_clase) {
        document.getElementById('app-title-tag').textContent = 'Observador Estudiantil — ' + configuracion.nombre_clase;
      }

      onCambioTipo();
    });

    function getEstudianteSeleccionado() {
      const id = document.getElementById('selEstudiante').value;
      return estudiantes.find(e => String(e.id) === String(id));
    }

    const CATALOGO_SITUACIONES = {
      'T1': [
        {
          texto: "1. Interrupción constante de la explicación de clase (levantarse sin permiso, ruido)",
          acciones: [
            "Se realizó una pausa pedagógica y se dio una instrucción clara, privada y objetiva sobre la conducta esperada.",
            "Se indagaron las causas de la distracción y se registró la versión del estudiante en sus propias palabras.",
            "Se otorgó un rol activo en el aula para canalizar la atención y energía del estudiante.",
            "Se anotaron los hechos específicos y los llamados de atención, junto con la versión del estudiante.",
            "Se fijó una fecha de revisión del compromiso en 8 días y se informó al acudiente sobre la conducta."
          ]
        },
        {
          texto: "2. Uso no autorizado de celulares o dispositivos distractores durante la sesión",
          acciones: [
            "Se solicitó el guardado del dispositivo de manera serena, evitando confrontaciones en público.",
            "Se conversó sobre el impacto del distractor en el ritmo de aprendizaje del estudiante y el de sus compañeros.",
            "Se permitió que el estudiante expresara el motivo de uso del dispositivo y se consignó su respuesta.",
            "Se acordó que el dispositivo permanecerá en la mochila o en la mesa del docente durante la clase.",
            "Se envió un reporte breve al acudiente para alinear pautas de uso responsable en casa."
          ]
        },
        {
          texto: "3. Discusiones o altercados verbales por puestos, turnos o útiles escolares",
          acciones: [
            "Se separó a los estudiantes involucrados temporalmente para reducir la tensión emocional.",
            "Se recibieron los descargos e impresiones de cada estudiante de forma independiente.",
            "Se facilitó un espacio de diálogo dirigido a la concertación de acuerdos de respeto mutuo.",
            "Se registró el hecho en el observador tipificándolo como Tipo I, con sus respectivos acuerdos.",
            "Se programó un seguimiento al cumplimiento de lo pactado en un plazo de 15 días."
          ]
        },
        {
          texto: "4. Lenguaje inapropiado o burlas esporádicas hacia compañeros de clase",
          acciones: [
            "Se frenó la interacción de inmediato señalando la incorrección del lenguaje utilizado.",
            "Se reflexionó en privado con el estudiante sobre el efecto de las palabras en la convivencia escolar.",
            "Se promovió una disculpa consciente o una acción reparadora hacia el compañero afectado.",
            "Se documentó la versión del estudiante y su compromiso escrito de respetarse con sus pares.",
            "Se programó un taller reflexivo en la hora de dirección de grupo sobre comunicación asertiva."
          ]
        },
        {
          texto: "5. Lanzamiento o deterioro menor e involuntario de material educativo de pares",
          acciones: [
            "Se detuvo el lanzamiento de objetos y se verificó que ningún estudiante haya resultado lastimado.",
            "Se escuchó la explicación del estudiante sobre cómo y por qué ocurrieron los hechos.",
            "Se acordó la reparación, ordenamiento o reposición del bien o material dañado.",
            "Se anotó detalladamente el hecho en el observador, especificando el acuerdo reparador.",
            "Se comunicó al acudiente lo sucedido y el compromiso asumido por su acudido."
          ]
        },
        {
          texto: "6. Llegadas tardías reiteradas al aula de clase o a la jornada escolar",
          acciones: [
            "Se permitió el ingreso al aula sin interrumpir la clase, registrando la hora exacta de llegada.",
            "Se indagaron los motivos de la impuntualidad (transporte, rutinas de sueño o situaciones familiares).",
            "Se registraron los motivos expresados por el estudiante en la ficha de seguimiento.",
            "Se diseñó conjuntamente una estrategia de gestión del tiempo y preparación previa.",
            "Se notificó al padre de familia para coordinar el cumplimiento de los horarios desde el hogar."
          ]
        },
        {
          texto: "7. Incumplimiento de las pautas de presentación personal o uniforme establecidas",
          acciones: [
            "Se abordó al estudiante en privado para no exponerlo frente al grupo.",
            "Se verificó si existen dificultades socioeconómicas, climáticas o familiares para el cumplimiento.",
            "Se consignaron las razones del incumplimiento expresadas por el estudiante.",
            "Se estableció un plazo razonable para la normalización de la presentación personal.",
            "Se reportó a bienestar escolar al identificarse una posible situación de desprotección o vulnerabilidad."
          ]
        }
      ],
      'T2': [
        {
          texto: "8. Agresión física leve (empujones, jaloneos) que no genera incapacidad médica",
          acciones: [
            "Se intervino inmediatamente para separar a los estudiantes y salvaguardar su integridad.",
            "Se remitió al servicio de salud escolar para verificar que no existan lesiones ocultas.",
            "Se tomó la versión escrita individual de cada uno de los involucrados.",
            "Se documentó la falta como Tipo II y se convocó con urgencia a los acudientes.",
            "Se remitió al Comité de Convivencia y Orientación Escolar con acta de compromiso no agresivo."
          ]
        },
        {
          texto: "9. Burlas u hostigamiento sistemático y repetido hacia un compañero (Acoso escolar / Bullying)",
          acciones: [
            "Se brindó un espacio seguro, apoyo emocional y contención inmediata al estudiante afectado.",
            "Se revisaron las anotaciones previas en el observador para verificar la sistematicidad de la conducta.",
            "Se recibió la versión escrita oficial tanto del estudiante agresor como de los testimonios.",
            "Se notificó formalmente a los acudientes de las partes y se informó a Coordinación y Orientación.",
            "Se establecieron compromisos pedagógicos estrictos de no agresión con fechas de seguimiento semanal."
          ]
        },
        {
          texto: "10. Difusión de comentarios difamatorios o burlas a través de redes sociales (Ciberacoso)",
          acciones: [
            "Se solicitó al acudiente/víctima guardar evidencia digital sin revictimizar al menor.",
            "Se requirió al estudiante señalado y se registró su versión sobre la creación o difusión de la publicación.",
            "Se convocó a reunión urgente con los padres de familia para exponer la gravedad del hecho.",
            "Se reportó el caso formalmente para aplicar el procedimiento del Manual de Convivencia.",
            "Se firmó un acuerdo pedagógico sobre uso ético de la tecnología con revisión a 15 días."
          ]
        },
        {
          texto: "11. Expresiones irrespetuosas u ofensas verbales severas hacia docentes o directivos",
          acciones: [
            "Se mantuvo la calma, evitando discusiones acaloradas, y se remitió al estudiante a coordinación.",
            "Se permitió un espacio de enfriamiento y se tomó la declaración escrita del estudiante.",
            "Se redactaron de forma objetiva las frases o conductas manifestadas, sin adjetivos subjetivos.",
            "Se citó obligatoriamente a la familia para revisar la falta y acordar medidas reparadoras.",
            "Se remitió a Orientación Escolar para trabajar aspectos de autorregulación y respeto a la autoridad."
          ]
        },
        {
          texto: "12. Daño intencional a la infraestructura, muebles o equipos del establecimiento educativo",
          acciones: [
            "Se detuvo la acción inmediatamente, se aseguró el área y se notificó a la administración del colegio.",
            "Se registró en el observador la explicación del estudiante sobre los motivos del hecho.",
            "Se formuló el reporte especificando el bien afectado, la fecha, la hora y los involucrados.",
            "Se acordó con el acudiente el plan de reparación o restitución del bien dañado.",
            "Se asignó una actividad de servicio escolar relacionada con el cuidado de los bienes comunes."
          ]
        }
      ],
      'T3': [
        {
          texto: "16. Presunta comisión de un delito (Tipo III) según la Ley 1620",
          acciones: [
            "Se garantizó la protección inmediata de los involucrados y se informó a la rectoría.",
            "Se notificó de forma inmediata a la Policía de Infancia y Adolescencia.",
            "Se citó de carácter urgente a los acudientes de los estudiantes implicados.",
            "Se reportó el caso en el Sistema de Información Unificado de Convivencia Escolar (SIUCE).",
            "Se remitió a las autoridades competentes y se inició el debido proceso disciplinario interno."
          ]
        }
      ],
      'PIAR': [
        {
          texto: "13. Incumplimiento reiterado en la entrega de tareas o talleres por falta de organización",
          acciones: [
            "Se indagó si la causa del incumplimiento es conceptual, de organización o familiar.",
            "Se consignó la justificación dada por el estudiante al ser indagado sobre las tareas faltantes.",
            "Se estableció flexibilización de fechas o ajustes razonables ante posibles barreras de aprendizaje.",
            "Se definió un cronograma de entregas pendientes con fechas y horas límite.",
            "Se informó al acudiente sobre el plan de apoyo para que realice seguimiento en el hogar."
          ]
        },
        {
          texto: "14. Bajo rendimiento persistente acompañado de apatía o desinterés académico",
          acciones: [
            "Se dialogó en privado para identificar posibles bloqueos emocionales o académicos.",
            "Se identificaron las áreas de mayor interés del estudiante para vincularlas a la asignatura.",
            "Se registró la percepción del estudiante sobre su desempeño y sus necesidades de apoyo.",
            "Se asignó un compañero tutor para reforzar los temas de mayor dificultad.",
            "Se acordó un plan de mejora con la familia y se fijó fecha de revisión en 15 días."
          ]
        },
        {
          texto: "15. Reconocimiento por avance significativo, liderazgo o superación de dificultades",
          acciones: [
            "Se felicitó al estudiante resaltando las acciones y el esfuerzo específico que demostró.",
            "Se consignó el logro, felicitación o avance destacado en la ficha de seguimiento.",
            "Se invitó al estudiante a apoyar la monitoría del curso o liderar proyectos del aula.",
            "Se envió una nota al acudiente destacando el avance significativo del estudiante.",
            "Se acordaron nuevas metas académicas o convivenciales para mantener su motivación."
          ]
        }
      ]
    };

    function onCambioTipo() {
      const tipo = document.getElementById('selTipo').value;
      const selSit = document.getElementById('selSituacionCatalogo');
      selSit.innerHTML = '';
      
      const situaciones = CATALOGO_SITUACIONES[tipo] || [];
      
      situaciones.forEach((sit, index) => {
        const opt = document.createElement('option');
        opt.value = index; 
        opt.textContent = sit.texto;
        selSit.appendChild(opt);
      });
      
      const optOtro = document.createElement('option');
      optOtro.value = 'otro'; 
      optOtro.textContent = '✏️ Otro caso / Redacción manual personalizada...';
      selSit.appendChild(optOtro);
      
      onCambioSituacion();
    }

    function onCambioSituacion() {
      const tipo = document.getElementById('selTipo').value;
      const situacionIndex = document.getElementById('selSituacionCatalogo').value;
      const selAcc = document.getElementById('selAccionDocente');
      selAcc.innerHTML = '';
      
      let acciones = [];
      if (situacionIndex === 'otro' || !CATALOGO_SITUACIONES[tipo] || !CATALOGO_SITUACIONES[tipo][situacionIndex]) {
        acciones = [
          "Se realizó un diálogo reflexivo y se establecieron acuerdos de mejora.",
          "Se notificó al acudiente para realizar seguimiento en casa.",
          "Se remitió el caso a Orientación Escolar para acompañamiento.",
          "Se aplicó una acción pedagógica restaurativa según el manual de convivencia."
        ];
      } else {
        acciones = CATALOGO_SITUACIONES[tipo][situacionIndex].acciones;
      }
      
      acciones.forEach((txt, i) => {
        const opt = document.createElement('option');
        opt.value = i; 
        opt.textContent = txt;
        selAcc.appendChild(opt);
      });
      
      reaplicarConectores();
    }

    function onCambioAccionDocente() { reaplicarConectores(); }
    
    function onSeleccionarEstudiante() {
      const est = getEstudianteSeleccionado();
      if(est) {
        document.getElementById('txtDocEstudiante').value = est.documento_identidad || '';
      } else {
        document.getElementById('txtDocEstudiante').value = '';
      }
      reaplicarConectores();
    }

    function reaplicarConectores() {
      const est = getEstudianteSeleccionado();
      const nombreEst = est ? est.nombre_completo : '[ESTUDIANTE]';
      const fechaRaw = document.getElementById('txtFecha').value;
      const fecha = fechaRaw ? fechaRaw.split('-').reverse().join('/') : '';
      const horaRaw = document.getElementById('txtHora').value;
      let hora = horaRaw;
      if (horaRaw) {
        const [h, m] = horaRaw.split(':');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        hora = `${h12}:${m} ${ampm}`;
      }
      const asig = document.getElementById('selAsignatura').value || '[ASIGNATURA]';
      const docName = configuracion.nombre_docente || 'Docente Titular';
      const tipo = document.getElementById('selTipo').value;
      
      const selSitText = document.getElementById('selSituacionCatalogo').options[document.getElementById('selSituacionCatalogo').selectedIndex]?.text || '';
      const selAccText = document.getElementById('selAccionDocente').options[document.getElementById('selAccionDocente').selectedIndex]?.text || '';
      
      let baseHechos = `El día ${fecha}, siendo aproximadamente las ${hora}, en el espacio pedagógico de ${asig} (Grado ${configuracion.grado || '5°02'}), se constató que el estudiante ${nombreEst} incurrió en una conducta que amerita intervención. `;
      if (document.getElementById('selSituacionCatalogo').value !== 'otro') {
          baseHechos += `Situación observada: ${selSitText}. `;
      }
      baseHechos += `Ante los hechos observados, el docente titular ${docName} procedió conforme al manual de convivencia y la Ley 1620 de 2013.`;
      
      document.getElementById('txtHechosEditor').value = baseHechos;
      document.getElementById('txtDescargosEditor').value = `"El estudiante ${nombreEst}, en ejercicio pleno de su garantía constitucional al debido proceso (Art. 29 C.P.), manifiesta en su versión libre: 'Reconozco lo ocurrido y manifiesto mi compromiso de mejora'."`;
      
      let baseCompromisos = `1. ACCIÓN PEDAGÓGICA ADOPTADA POR EL DOCENTE:
   • ${selAccText}.
2. COMPROMISOS ASUMIDOS POR EL ESTUDIANTE:
   • El estudiante ${nombreEst} se compromete a respetar los acuerdos establecidos.
3. CORRESPONSABILIDAD FAMILIAR:
   • El acudiente realizará seguimiento en casa.
FECHA DE PRÓXIMA REVISIÓN: A definir.`;
      
      document.getElementById('txtCompromisosEditor').value = baseCompromisos;
      actualizarVistaPrevia();
    }

    function actualizarVistaPrevia() {
      const est = getEstudianteSeleccionado();
      const nombreEst = est ? est.nombre_completo : 'Nombre del Estudiante';
      const docEst = document.getElementById('txtDocEstudiante').value || '-';
      const tipo = document.getElementById('selTipo').value;
      const docName = configuracion.nombre_docente || 'Docente Titular';

      document.getElementById('previewNombreEstudiante').textContent = nombreEst;
      document.getElementById('previewDocEstudiante').textContent = docEst;
      
      document.title = nombreEst !== 'Nombre del Estudiante' ? `Observador - ${nombreEst}` : 'Observador Estudiantil';
      
      const fechaRaw = document.getElementById('txtFecha').value;
      document.getElementById('previewFecha').textContent = fechaRaw ? fechaRaw.split('-').reverse().join('/') : '';
      
      const horaRaw = document.getElementById('txtHora').value;
      let horaFormat = horaRaw;
      if (horaRaw) {
        const [h, m] = horaRaw.split(':');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        horaFormat = `${h12}:${m} ${ampm}`;
      }
      document.getElementById('previewHora').textContent = horaFormat;
      document.getElementById('previewAsignatura').textContent = document.getElementById('selAsignatura').value || '-';

      document.getElementById('chkTipo1').className = 'class-checkbox ' + (tipo === 'T1' ? 'checked' : '');
      document.getElementById('chkTipo2').className = 'class-checkbox ' + (tipo === 'T2' ? 'checked' : '');
      document.getElementById('chkTipo3').className = 'class-checkbox ' + (tipo === 'T3' ? 'checked' : '');
      document.getElementById('chkTipoPIAR').className = 'class-checkbox ' + (tipo === 'PIAR' ? 'checked' : '');

      document.getElementById('previewHechos').innerHTML = document.getElementById('txtHechosEditor').value.replace(/\\n/g, '<br>');
      document.getElementById('previewDescargos').innerHTML = document.getElementById('txtDescargosEditor').value.replace(/\\n/g, '<br>');
      document.getElementById('previewCompromisos').innerHTML = document.getElementById('txtCompromisosEditor').value.replace(/\\n/g, '<br>');

      const grid = document.getElementById('previewGridFirmas');
      grid.innerHTML = `
        <div class="signature-item"><div class="sig-line"></div><div class="sig-name">${nombreEst}</div><div class="sig-role">Estudiante (Grado ${configuracion.grado || '5°02'})</div></div>
        <div class="signature-item"><div class="sig-line"></div><div class="sig-name">Padre de Familia / Acudiente</div><div class="sig-role">C.C. ___________________</div></div>
        <div class="signature-item"><div class="sig-line"></div><div class="sig-name" id="preview-docente-firma">${docName}</div><div class="sig-role">Docente Titular / Registra</div></div>
        <div class="signature-item"><div class="sig-line"></div><div class="sig-name">Coordinación de Convivencia</div><div class="sig-role">Seguimiento Institucional</div></div>
      `;
    }

  
