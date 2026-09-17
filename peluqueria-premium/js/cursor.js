/* Cursor personalizado sutil — unas tijeras que siguen al puntero,
   solo en escritorio con puntero fino */
(function () {
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsFinePointer) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const scissors = cursor.querySelector('.cursor__scissors');

  let mouseX = 0, mouseY = 0;
  let posX = 0, posY = 0;
  let scale = 1;
  let hovering = false;
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

  // Posición y escala se animan aquí, en un único bucle: si además hubiera
  // una transición CSS sobre "transform" compitiendo con esta actualización
  // 60 veces por segundo, el seguimiento del puntero iría a tirones.
  function loop() {
    posX += (mouseX - posX) * 0.22;
    posY += (mouseY - posY) * 0.22;
    scale += ((hovering ? 1.15 : 1) - scale) * 0.25;
    scissors.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%) scale(${scale})`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const interactive = 'a, button, input, select, textarea, [data-lightbox-trigger], [data-collection-trigger]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) { hovering = true; cursor.classList.add('is-hover'); }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) { hovering = false; cursor.classList.remove('is-hover'); }
  });

  // Pequeño gesto de corte al hacer clic
  let snipTimer;
  document.addEventListener('mousedown', () => {
    cursor.classList.add('is-snip');
    clearTimeout(snipTimer);
  });
  document.addEventListener('mouseup', () => {
    snipTimer = setTimeout(() => cursor.classList.remove('is-snip'), 90);
  });
})();
