/* Animaciones de entrada al hacer scroll (fade + slide-up) */
(function () {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Stagger automático para elementos consecutivos dentro del mismo contenedor
  const groups = new Map();
  items.forEach((el) => {
    const parent = el.parentElement;
    const count = groups.get(parent) || 0;
    el.style.setProperty('--stagger', count);
    groups.set(parent, count + 1);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach((el) => observer.observe(el));
})();
