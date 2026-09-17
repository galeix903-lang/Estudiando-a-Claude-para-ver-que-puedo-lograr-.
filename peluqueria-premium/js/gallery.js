/* Galería con lightbox accesible */
(function () {
  const triggers = Array.from(document.querySelectorAll('[data-lightbox-trigger]'));
  const lightbox = document.querySelector('[data-lightbox]');
  if (!triggers.length || !lightbox) return;

  const img = lightbox.querySelector('[data-lightbox-img]');
  const btnClose = lightbox.querySelector('[data-lightbox-close]');
  const btnPrev = lightbox.querySelector('[data-lightbox-prev]');
  const btnNext = lightbox.querySelector('[data-lightbox-next]');

  let currentIndex = 0;
  let lastFocused = null;

  function show(index) {
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    img.src = trigger.dataset.full;
    img.alt = trigger.querySelector('img')?.alt || '';
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    lightbox.setAttribute('data-open', '');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lightbox.removeAttribute('data-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => open(index));
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(currentIndex - 1));
  btnNext.addEventListener('click', () => show(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.hasAttribute('data-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
})();
