const APP_SUPABASE_URL = 'https://qmgyobgahiyvgysjjhax.supabase.co';
const APP_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZ3lvYmdhaGl5dmd5c2pqaGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNTU2OTcsImV4cCI6MjEwMjgzMTY5N30._o-3AMi4xzfYBVNAeUMpxX3rBL-qfXoFCuD6H_fQ1s0';
window.clienteSupabaseCompartido = supabase.createClient(APP_SUPABASE_URL, APP_SUPABASE_KEY);

function mostrarToast(mensaje, tipo = 'success') {
  const elemento = document.getElementById('toast');
  if (!elemento) return;
  
  elemento.classList.remove('toast-success', 'toast-error');
  let textoLimpio = mensaje.replace(/<[^>]*>?/gm, '').trim();

  if (tipo === 'error' || textoLimpio.toLowerCase().includes('error') || textoLimpio.toLowerCase().includes('completa correctamente') || textoLimpio.toLowerCase().includes('obligatorio') || textoLimpio.toLowerCase().includes('revisa')) {
    elemento.classList.add('toast-error');
    elemento.innerHTML = `<div style="display:flex; align-items:center;"><i data-lucide="alert-circle" style="width:18px;height:18px;margin-right:8px;"></i> <span>${textoLimpio}</span></div>`;
  } else {
    elemento.classList.add('toast-success');
    if (textoLimpio.toLowerCase().includes('actualizad') || textoLimpio.toLowerCase().includes('guardad')) {
      textoLimpio = 'Guardado exitosamente';
    }
    elemento.innerHTML = `<div style="display:flex; align-items:center;"><i data-lucide="check-circle" style="width:18px;height:18px;margin-right:8px;"></i> <span>${textoLimpio}</span></div>`;
  }
  
  if (window.lucide) window.lucide.createIcons();

  elemento.style.display = 'block';
  clearTimeout(window.temporizadorToast);
  window.temporizadorToast = setTimeout(() => { elemento.style.display = 'none'; }, 4000);
}

function inyectarMenuGlobal() {
  const contenedor = document.getElementById('contenedor-menu-global');
  // Evitar inyectar en la vista de login o si el contenedor no existe
  if (!contenedor) return;

  // Inyectar únicamente el botón de abrir menú en la barra superior
  contenedor.innerHTML = `
    <button class="menu-btn" id="menuBtn" aria-label="Abrir menú" title="Abrir menú"><i data-lucide="menu" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i></button>
  `;

  // Crear e inyectar el menú lateral en el body si no existe aún
  if (!document.getElementById('sidebar-menu')) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    
    const curPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const isAct = (page) => (curPage === page || (curPage === '' && page === 'dashboard.html')) ? 'active' : '';

    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar-menu';
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-mark"><i data-lucide="graduation-cap" style="width: 20px; height: 20px;"></i></div>
          <div>
            <div class="brand-title">Mi Clase 502</div>
            <div style="font-size: 10px; color: var(--text-secondary); max-width: 170px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">I.E. Nuestra Señora del Pilar</div>
          </div>
        </div>
        <button class="menu-btn" id="closeMenuBtn" aria-label="Cerrar menú"><i data-lucide="x" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i></button>
      </div>
      <div class="sidebar-nav">
        <a href="dashboard.html" class="${isAct('dashboard.html')}"><i data-lucide="layout-dashboard" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Panel principal</a>
        <a href="index.html" class="${isAct('index.html')}"><i data-lucide="clipboard-check" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Control de asistencia</a>
        <a href="actividades.html" class="${isAct('actividades.html')}"><i data-lucide="book-open" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Gestionar actividades</a>
        <a href="calificaciones.html" class="${isAct('calificaciones.html')}"><i data-lucide="edit-3" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Calificaciones</a>
        <a href="consolidado.html" class="${isAct('consolidado.html')}"><i data-lucide="bar-chart-2" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Consolidado de Notas</a>
        <a href="reportes.html" class="${isAct('reportes.html')}"><i data-lucide="pie-chart" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Reportes y filtros</a>
        <a href="directorio.html" class="${isAct('directorio.html')}"><i data-lucide="users" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Estudiantes y Materias</a>
        <a href="observador.html" class="${isAct('observador.html')}"><i data-lucide="file-text" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Observador Estudiantil</a>
        <a href="configuracion.html" class="${isAct('configuracion.html')}"><i data-lucide="settings" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Configuración</a>
      </div>
      <div class="sidebar-footer">
        <a href="#" onclick="cerrarSesion(); return false;" class="logout-link"><i data-lucide="log-out" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Cerrar Sesión</a>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);
  }
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function configurarMenu() {
  const openBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('closeMenuBtn');
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (!openBtn || !sidebar || !overlay) return;
  if (openBtn.dataset.menuConfigurado === 'true') return;
  openBtn.dataset.menuConfigurado = 'true';
  
  function openMenu() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevenir scroll de fondo
  }
  
  function closeMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
}

function fechaLocalISO(fecha = new Date()) {
  const desfase = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - desfase).toISOString().slice(0, 10);
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha';
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatearFechaCorta(fecha) {
  if (!fecha) return 'Sin fecha';
  const partes = String(fecha).slice(0, 10).split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : 'Sin fecha';
}

function getColorMateria(nombreMateria) {
  if(!nombreMateria) return 'var(--primary)';
  const nombre = nombreMateria.toLowerCase();
  if(nombre.includes('matemática')) return '#ef4444'; // Rojo
  if(nombre.includes('lenguaje') || nombre.includes('español')) return '#3b82f6'; // Azul
  if(nombre.includes('ciencia') || nombre.includes('naturales')) return '#10b981'; // Verde
  if(nombre.includes('sociales') || nombre.includes('historia')) return '#f59e0b'; // Amarillo
  if(nombre.includes('artística') || nombre.includes('arte')) return '#d946ef'; // Fucsia
  if(nombre.includes('física') || nombre.includes('deporte')) return '#f97316'; // Naranja
  if(nombre.includes('inglés') || nombre.includes('idioma')) return '#8b5cf6'; // Violeta
  if(nombre.includes('ética') || nombre.includes('valores')) return '#14b8a6'; // Teal
  if(nombre.includes('religión')) return '#06b6d4'; // Cyan
  if(nombre.includes('tecnología') || nombre.includes('informática')) return '#64748b'; // Gris azulado
  return 'var(--primary)'; // Default
}

async function cerrarSesion() {
  localStorage.removeItem('dev_bypass');
  try {
    await window.clienteSupabaseCompartido.auth.signOut();
  } catch (e) {
    console.warn('Error al cerrar sesión:', e);
  }
  window.location.href = 'login.html';
}

async function authGuard() {
  // Ignorar en la página de login
  if (window.location.pathname.endsWith('login.html')) return;

  // Permitir modo bypass para desarrollo/inspección controlada
  const params = new URLSearchParams(window.location.search);
  if (params.get('bypass') === 'true') {
    localStorage.setItem('dev_bypass', 'true');
  }
  if (localStorage.getItem('dev_bypass') === 'true') {
    return;
  }

  try {
    const { data: { session }, error } = await window.clienteSupabaseCompartido.auth.getSession();
    if (error || !session) {
      window.location.href = 'login.html';
    }
  } catch (e) {
    console.warn('Error verificando sesión en authGuard:', e);
    window.location.href = 'login.html';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    inyectarMenuGlobal();
    configurarMenu();
    authGuard();
    initLucideObserver();
    aplicarConfiguracionGlobal();
  }, { once: true });
} else {
  inyectarMenuGlobal();
  configurarMenu();
  authGuard();
  initLucideObserver();
  aplicarConfiguracionGlobal();
}

async function aplicarConfiguracionGlobal() {
  try {
    const { data } = await window.clienteSupabaseCompartido
      .from('configuracion_global')
      .select('nombre_clase')
      .limit(1).single();
    
    if (data && data.nombre_clase) {
      document.title = document.title.replace('Mi Clase 502', data.nombre_clase);
      const titleEls = document.querySelectorAll('.brand-title');
      titleEls.forEach(el => el.textContent = data.nombre_clase);
    }
  } catch (error) {
    console.error('Error cargando nombre de clase:', error);
  }
}

function initLucideObserver() {
  if (window.lucide) {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (let m of mutations) {
        if (m.addedNodes.length > 0) {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) {
        clearTimeout(window.lucideTimeout);
        window.lucideTimeout = setTimeout(() => window.lucide.createIcons(), 50);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
