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
    configurarMenu();
    authGuard();
    initLucideObserver();
  }, { once: true });
} else {
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
