/* Acordeón de preguntas frecuentes: altura animada, un panel a la vez,
   accesible por teclado (elementos <button> nativos). */
(function () {
  const items = document.querySelectorAll('[data-faq-item]');
  if (!items.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((item) => {
    const trigger = item.querySelector('[data-faq-trigger]');
    const answer = item.querySelector('[data-faq-answer]');
    if (!trigger || !answer) return;

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Solo un panel abierto a la vez.
      if (!isOpen) {
        items.forEach((other) => {
          if (other === item) return;
          closePanel(other);
        });
      }

      isOpen ? closePanel(item) : openPanel(item);
    });
  });

  function openPanel(item) {
    const trigger = item.querySelector('[data-faq-trigger]');
    const answer = item.querySelector('[data-faq-answer]');
    answer.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    if (reducedMotion) {
      answer.style.height = 'auto';
      return;
    }
    const target = answer.scrollHeight;
    answer.style.height = '0px';
    requestAnimationFrame(() => {
      answer.style.height = `${target}px`;
    });
    answer.addEventListener('transitionend', function onEnd() {
      answer.style.height = 'auto';
      answer.removeEventListener('transitionend', onEnd);
    });
  }

  function closePanel(item) {
    const trigger = item.querySelector('[data-faq-trigger]');
    const answer = item.querySelector('[data-faq-answer]');
    trigger.setAttribute('aria-expanded', 'false');
    if (reducedMotion) {
      answer.hidden = true;
      return;
    }
    const current = answer.scrollHeight;
    answer.style.height = `${current}px`;
    requestAnimationFrame(() => {
      answer.style.height = '0px';
    });
    answer.addEventListener('transitionend', function onEnd() {
      answer.hidden = true;
      answer.removeEventListener('transitionend', onEnd);
    });
  }
})();
