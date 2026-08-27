const APP_SUPABASE_URL = 'https://qmgyobgahiyvgysjjhax.supabase.co';
const APP_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZ3lvYmdhaGl5dmd5c2pqaGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNTU2OTcsImV4cCI6MjEwMjgzMTY5N30._o-3AMi4xzfYBVNAeUMpxX3rBL-qfXoFCuD6H_fQ1s0';
window.clienteSupabaseCompartido = supabase.createClient(APP_SUPABASE_URL, APP_SUPABASE_KEY);

function mostrarToast(mensaje) {
  const elemento = document.getElementById('toast');
  if (!elemento) return;
  elemento.textContent = mensaje;
  elemento.style.display = 'block';
  clearTimeout(window.temporizadorToast);
  window.temporizadorToast = setTimeout(() => { elemento.style.display = 'none'; }, 3200);
}

function inyectarMenuGlobal() {
  const contenedor = document.getElementById('contenedor-menu-global');
  // Evitar inyectar en la vista de login o si el contenedor no existe
  if (!contenedor) return;

  contenedor.innerHTML = `
    <a class="nav-btn" href="dashboard.html"><i data-lucide="home" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Panel</a>
    <div class="menu-wrap" id="menuWrap">
      <button class="menu-btn" id="menuBtn" aria-label="Abrir menú" title="Abrir menú"><i data-lucide="menu" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i></button>
      <div class="menu-panel">
        <a href="dashboard.html"><i data-lucide="layout-dashboard" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Panel principal</a>
        <a href="index.html"><i data-lucide="clipboard-check" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Control de asistencia</a>
        <a href="actividades.html"><i data-lucide="book-open" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Gestionar actividades</a>
        <a href="calificaciones.html"><i data-lucide="edit-3" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Calificaciones</a>
        <a href="consolidado.html"><i data-lucide="bar-chart-2" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Consolidado de Notas</a>
        <a href="reportes.html"><i data-lucide="pie-chart" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Reportes y filtros</a>
        <a href="directorio.html"><i data-lucide="users" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Estudiantes y Materias</a>
        <a href="configuracion.html"><i data-lucide="settings" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Configuración</a>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid var(--border);">
        <a href="#" onclick="cerrarSesion(); return false;" style="color: #ef4444;"><i data-lucide="log-out" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Cerrar Sesión</a>
      </div>
    </div>
  `;
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function configurarMenu() {
  const boton = document.getElementById('menuBtn');
  const envoltura = document.getElementById('menuWrap');
  if (!boton || !envoltura) return;
  if (boton.dataset.menuConfigurado === 'true') return;
  boton.dataset.menuConfigurado = 'true';
  boton.addEventListener('click', () => envoltura.classList.toggle('open'));
  document.addEventListener('click', evento => {
    if (!envoltura.contains(evento.target)) envoltura.classList.remove('open');
  });
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

async function cerrarSesion() {
  await window.clienteSupabaseCompartido.auth.signOut();
  window.location.href = 'login.html';
}

async function authGuard() {
  // Ignorar en la página de login
  if (window.location.pathname.endsWith('login.html')) return;

  const { data: { session } } = await window.clienteSupabaseCompartido.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    inyectarMenuGlobal();
    configurarMenu();
    authGuard();
    initLucideObserver();
  }, { once: true });
} else {
  inyectarMenuGlobal();
  configurarMenu();
  authGuard();
  initLucideObserver();
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
