/* Header dinámico, menú móvil, smooth-scroll con offset y año del footer */
(function () {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const mobileLinks = document.querySelectorAll('[data-mobile-link]');

  let menuOpen = false;

  function syncHeaderState() {
    if (!header) return;
    if (menuOpen || window.scrollY > 40) header.setAttribute('data-scrolled', '');
    else header.removeAttribute('data-scrolled');
  }
  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });

  function openMenu() {
    menuOpen = true;
    menu.setAttribute('data-open', '');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
    syncHeaderState();
  }
  function closeMenu() {
    menuOpen = false;
    menu.removeAttribute('data-open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
    syncHeaderState();
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    });
  }

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
