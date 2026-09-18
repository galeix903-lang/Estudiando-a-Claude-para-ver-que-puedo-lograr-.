/* Cursor personalizado — un círculo relleno que sigue al puntero, solo
   en escritorio con puntero fino. Sustituye por completo al cursor
   nativo del sistema (ver la regla "html.has-custom-cursor" en
   css/base.css). Sobre la galería y la colección, se convierte en una
   pequeña píldora con una palabra ("Ver" / "Ver estilo"): un cursor
   minimalista tipo etiqueta, diseño propio. */
(function () {
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsFinePointer) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const ring = cursor.querySelector('.cursor__ring');
  const label = cursor.querySelector('[data-cursor-label]');

  // Solo ocultamos el cursor nativo una vez que el propio cursor
  // personalizado está listo para sustituirlo.
  document.documentElement.classList.add('has-custom-cursor');

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let scale = 1;
  let pressed = false;
  let active = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!active) {
      active = true;
      cursor.classList.add('is-active');
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  document.addEventListener('mouseenter', () => cursor.classList.add('is-active'));

  // Posición y gesto de clic del anillo se combinan aquí en un único
  // transform por frame: una transición CSS sobre "transform" compitiendo
  // con esta actualización 60 veces por segundo iría a tirones.
  function loop() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    scale += ((pressed ? 0.82 : 1) - scale) * 0.3;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${scale})`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const interactive = 'a, button, input, select, textarea, [data-lightbox-trigger], [data-collection-trigger]';
  const labelledTriggers = [
    { selector: '[data-lightbox-trigger]', text: 'Ver' },
    { selector: '[data-collection-trigger]', text: 'Ver estilo' },
  ];

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) cursor.classList.add('is-hover');
    const labelled = labelledTriggers.find((t) => e.target.closest(t.selector));
    if (labelled) {
      label.textContent = labelled.text;
      cursor.classList.add('is-label');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) cursor.classList.remove('is-hover');
    if (labelledTriggers.some((t) => e.target.closest(t.selector))) {
      cursor.classList.remove('is-label');
    }
  });

  document.addEventListener('mousedown', () => { pressed = true; });
  document.addEventListener('mouseup', () => { pressed = false; });
})();
