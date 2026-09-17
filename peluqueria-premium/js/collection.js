/* Colección "Encuentra tu estilo": arrastre con ratón, flechas y detalle */
(function () {
  const track = document.querySelector('[data-collection-track]');
  if (!track) return;

  const prevBtn = document.querySelector('[data-collection-prev]');
  const nextBtn = document.querySelector('[data-collection-next]');
  const cards = Array.from(track.querySelectorAll('[data-collection-trigger]'));

  /* ---------- Arrastre con ratón (desktop) ---------- */
  // Nota: deliberadamente NO se usa setPointerCapture, porque en Chromium
  // retargeta también los eventos de ratón compatibles (incl. "click") al
  // elemento que capturó el puntero, y eso impedía que el clic llegara a
  // la tarjeta para abrir el detalle. En su lugar, se escucha el arrastre
  // en window mientras el botón del ratón está pulsado.
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return; // el táctil ya se gestiona de forma nativa
    isDown = true;
    dragged = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setAttribute('data-dragging', '');
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 4) dragged = true;
    track.scrollLeft = startScroll - delta;
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    track.removeAttribute('data-dragging');
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  /* Evita que un arrastre abra el detalle al soltar sobre una tarjeta */
  track.addEventListener('click', (e) => {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
      dragged = false;
    }
  }, true);

  /* ---------- Flechas laterales ---------- */
  function cardStep() {
    const first = track.querySelector('.collection__item');
    if (!first) return track.clientWidth * 0.8;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    return first.getBoundingClientRect().width + gap;
  }

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    const max = track.scrollWidth - track.clientWidth - 2;
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= max;
  }

  prevBtn?.addEventListener('click', () => {
    track.scrollBy({ left: -cardStep() * 2, behavior: 'smooth' });
  });
  nextBtn?.addEventListener('click', () => {
    track.scrollBy({ left: cardStep() * 2, behavior: 'smooth' });
  });
  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();

  /* ---------- Detalle del estilo ---------- */
  const detail = document.querySelector('[data-collection-detail]');
  if (!detail) return;

  const img = detail.querySelector('[data-collection-detail-img]');
  const nameEl = detail.querySelector('[data-collection-detail-name]');
  const colorEl = detail.querySelector('[data-collection-detail-color]');
  const descEl = detail.querySelector('[data-collection-detail-desc]');
  const closeEls = detail.querySelectorAll('[data-collection-detail-close]');
  let lastFocused = null;

  function openDetail(card) {
    lastFocused = document.activeElement;
    img.src = card.dataset.img;
    img.alt = `Peluca de estilo ${card.dataset.name}, ${card.dataset.color}`;
    nameEl.textContent = card.dataset.name;
    colorEl.textContent = card.dataset.color;
    descEl.textContent = card.dataset.desc;
    detail.setAttribute('data-open', '');
    detail.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    detail.querySelector('.collection-detail__close').focus();
  }

  function closeDetail() {
    detail.removeAttribute('data-open');
    detail.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (dragged) return;
      openDetail(card);
    });
  });

  closeEls.forEach((el) => el.addEventListener('click', closeDetail));

  detail.addEventListener('click', (e) => {
    if (e.target === detail) closeDetail();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detail.hasAttribute('data-open')) closeDetail();
  });
})();
