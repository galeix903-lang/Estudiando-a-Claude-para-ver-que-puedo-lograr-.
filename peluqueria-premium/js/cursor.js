/* Cursor personalizado — un punto y un anillo morado que siguen al
   puntero, solo en escritorio con puntero fino. Sustituye por completo
   al cursor nativo del sistema (ver la regla "html.has-custom-cursor"
   en css/base.css). */
(function () {
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsFinePointer) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

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
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
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
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) cursor.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) cursor.classList.remove('is-hover');
  });

  document.addEventListener('mousedown', () => { pressed = true; });
  document.addEventListener('mouseup', () => { pressed = false; });
})();
