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

  /* Panel de vista previa de servicios: al pasar el cursor por una fila
     se muestra la imagen asociada en el panel flotante. Solo en
     dispositivos con hover real (no táctiles). */
  const servicesPreview = document.querySelector('[data-services-preview]');
  const serviceItems = document.querySelectorAll('.services__item[data-preview]');
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (servicesPreview && serviceItems.length && supportsHover) {
    serviceItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const src = item.dataset.preview;
        if (!src) return;
        servicesPreview.style.backgroundImage = `url("${src}")`;
        const rect = item.getBoundingClientRect();
        const listRect = item.closest('.services__wrap').getBoundingClientRect();
        servicesPreview.style.top = `${rect.top - listRect.top + rect.height / 2}px`;
        servicesPreview.classList.add('is-visible');
      });
      item.addEventListener('mouseleave', () => {
        servicesPreview.classList.remove('is-visible');
      });
    });
  }

  /* Parallax muy sutil en la sección de impacto visual */
  const parallaxEl = document.querySelector('.impact__media');
  const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (parallaxEl && !reducedMotionMQ.matches) {
    let ticking = false;
    function updateParallax() {
      const rect = parallaxEl.parentElement.getBoundingClientRect();
      const progress = (rect.top) / window.innerHeight; // ~1 antes de entrar, ~0 centrado, negativo al salir
      const offset = progress * -30; // desplazamiento máximo muy contenido
      parallaxEl.style.transform = `translateY(${offset}px) scale(1.08)`;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }
})();
