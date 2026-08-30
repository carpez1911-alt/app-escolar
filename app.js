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

  // Inyectar únicamente el botón de abrir menú en la barra superior
  contenedor.innerHTML = `
    <button class="menu-btn" id="menuBtn" aria-label="Abrir menú" title="Abrir menú"><i data-lucide="menu" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i></button>
  `;

  // Crear e inyectar el menú lateral en el body si no existe aún
  if (!document.getElementById('sidebar-menu')) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar-menu';
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-mark"><i data-lucide="graduation-cap" style="width: 20px; height: 20px;"></i></div>
          <div class="brand-title">Mi Clase 502</div>
        </div>
        <button class="menu-btn" id="closeMenuBtn" aria-label="Cerrar menú"><i data-lucide="x" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i></button>
      </div>
      <div class="sidebar-nav">
        <a href="dashboard.html"><i data-lucide="layout-dashboard" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Panel principal</a>
        <a href="index.html"><i data-lucide="clipboard-check" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Control de asistencia</a>
        <a href="actividades.html"><i data-lucide="book-open" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Gestionar actividades</a>
        <a href="calificaciones.html"><i data-lucide="edit-3" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Calificaciones</a>
        <a href="consolidado.html"><i data-lucide="bar-chart-2" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Consolidado de Notas</a>
        <a href="reportes.html"><i data-lucide="pie-chart" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Reportes y filtros</a>
        <a href="directorio.html"><i data-lucide="users" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Estudiantes y Materias</a>
        <a href="configuracion.html"><i data-lucide="settings" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 12px;"></i> Configuración</a>
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
