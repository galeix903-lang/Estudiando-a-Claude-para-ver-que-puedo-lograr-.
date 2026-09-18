/*
  "La experiencia": sección dirigida por scroll. En escritorio, la imagen
  de la derecha se queda fija (position: sticky, sin JS) mientras el
  usuario recorre los pasos de la izquierda; un IntersectionObserver
  nativo detecta qué paso cruza el centro de la pantalla y activa su
  imagen y su línea/número — sin scroll-jacking ni librerías externas.

  En móvil, o con "reducir movimiento" activado, la sección se muestra
  como una lista lineal normal (ver sections.css) y este script no hace
  nada: todos los pasos son igual de legibles sin depender del scroll.
*/
(function () {
  const steps = document.querySelectorAll('[data-experience-list] [data-exp-step]');
  const mediaItems = document.querySelectorAll('[data-experience-media] img');
  if (!steps.length || !mediaItems.length) return;

  const isDesktop = window.matchMedia('(min-width: 900px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isDesktop || reducedMotion) return;

  let activeIndex = 1;

  function setActive(index) {
    if (index === activeIndex) return;
    steps.forEach((step) => {
      const n = Number(step.dataset.expStep);
      step.classList.toggle('is-current', n === index);
      step.classList.toggle('is-done', n < index);
    });
    mediaItems.forEach((img, i) => {
      img.classList.toggle('is-active', i + 1 === index);
    });
    activeIndex = index;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(Number(entry.target.dataset.expStep));
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  steps.forEach((step) => observer.observe(step));
})();
