/*
  Componente reutilizable "antes / después" de la sección Resultados: un
  frame con dos fotografías superpuestas y una línea divisoria que se
  arrastra en horizontal. Funciona con ratón, trackpad y pantalla táctil
  (Pointer Events unifica los tres) y es accesible por teclado (flechas,
  Inicio, Fin) al estar implementado como un slider ARIA.

  Nota: se usan listeners de pointermove/pointerup en window en vez de
  setPointerCapture — en Chromium, setPointerCapture también retargeta
  los eventos de ratón de compatibilidad y puede romper el foco/click de
  elementos vecinos. Ver el mismo criterio aplicado en intro-scene.js.
*/
(function () {
  const frames = document.querySelectorAll('[data-compare]');
  if (!frames.length) return;

  frames.forEach(initCompare);

  function initCompare(frame) {
    const wrap = frame.querySelector('[data-compare-before-wrap]');
    const handle = frame.querySelector('[data-compare-handle]');
    const grip = frame.querySelector('.compare__handle-grip');
    if (!wrap || !handle || !grip) return;

    let pct = 50;
    let dragging = false;

    function setFrameWidth() {
      frame.style.setProperty('--frame-w', `${frame.getBoundingClientRect().width}px`);
    }
    setFrameWidth();
    const resizeObserver = new ResizeObserver(setFrameWidth);
    resizeObserver.observe(frame);

    function setPct(value) {
      pct = Math.min(100, Math.max(0, value));
      wrap.style.width = `${pct}%`;
      handle.style.left = `${pct}%`;
      frame.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
    setPct(50);

    function pctFromClientX(clientX) {
      const rect = frame.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    frame.addEventListener('pointerdown', (e) => {
      // En táctil, solo empieza a arrastrar si el gesto arranca en el
      // asa: así el resto de la fotografía sigue permitiendo el scroll
      // vertical normal de la página.
      if (e.pointerType === 'touch' && !grip.contains(e.target)) return;
      dragging = true;
      setPct(pctFromClientX(e.clientX));
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setPct(pctFromClientX(e.clientX));
    });
    window.addEventListener('pointerup', () => { dragging = false; });
    window.addEventListener('pointercancel', () => { dragging = false; });

    frame.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft') { setPct(pct - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setPct(pct + step); e.preventDefault(); }
      else if (e.key === 'Home') { setPct(0); e.preventDefault(); }
      else if (e.key === 'End') { setPct(100); e.preventDefault(); }
    });
  }
})();
