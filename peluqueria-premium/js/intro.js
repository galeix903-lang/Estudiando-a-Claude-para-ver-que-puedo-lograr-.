/*
  Orquestador de la introducción 3D ("Entrar en la peluquería").

  Reglas que sigue, en este orden de prioridad:
  1. Si el usuario ya la vio (localStorage), o pide menos movimiento,
     no se muestra nunca: la web arranca directo en el Hero.
  2. Nunca bloquea: hay un límite de tiempo máximo, un botón "Saltar
     introducción" siempre visible y la tecla Escape, que funcionan
     de inmediato en cualquier momento de la secuencia.
  3. En móvil / gama baja / sin WebGL se usa una versión ligera en
     SVG + CSS con la misma idea (cabeza, cabello, tijeras que cortan
     al tocar). La escena 3D (js/intro-scene.js, ~165 KB) solo se
     descarga cuando de verdad se va a usar.
*/

const STORAGE_KEY = 'noir_intro_seen_v1';
const MAX_WAIT_MS = 7000; // nunca esperar más que esto sin interacción
const THREE_LOAD_TIMEOUT_MS = 2500; // si la escena 3D tarda, cae a la versión ligera

const intro = document.querySelector('[data-intro]');

if (intro) {
  const alreadySeen = localStorage.getItem(STORAGE_KEY) === '1';
  if (!alreadySeen) show();

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-intro-replay]');
    if (!trigger) return;
    e.preventDefault();
    localStorage.removeItem(STORAGE_KEY);
    show();
  });
}

function show() {
  intro.hidden = false;
  intro.classList.remove('is-cutting', 'is-exit', 'is-skip');
  document.documentElement.setAttribute('data-intro-active', '');
  requestAnimationFrame(runSequence);
}

function runSequence() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish(true);
    return;
  }

  const skipBtn = intro.querySelector('[data-intro-skip]');
  const canvas = intro.querySelector('[data-intro-canvas]');
  const liteEl = intro.querySelector('[data-intro-lite]');

  // Por si se trata de una repetición (botón "Ver introducción").
  canvas.removeAttribute('data-ready');
  liteEl.hidden = true;

  let phase = 'waiting'; // 'waiting' -> 'cutting' -> 'done'
  let cutTimer = null;
  const autoTimer = setTimeout(() => dismiss(false), MAX_WAIT_MS);

  skipBtn.addEventListener('click', onSkipClick);
  document.addEventListener('keydown', onKeydown);
  skipBtn.focus({ preventScroll: true });

  if (shouldUseThree()) {
    startThree();
  } else {
    startLite();
  }

  function startThree() {
    let fellBack = false;
    const fallbackTimer = setTimeout(() => {
      fellBack = true;
      startLite();
    }, THREE_LOAD_TIMEOUT_MS);

    import('./intro-scene.js')
      .then((mod) => {
        clearTimeout(fallbackTimer);
        if (fellBack) return;
        // La propia escena escucha click/arrastre/scroll sobre el canvas
        // y llama a onCutStart() en el momento exacto de la interacción.
        return mod.startScene(canvas, {
          onCutStart: onCut,
          onReady: () => canvas.setAttribute('data-ready', ''),
        });
      })
      .catch(() => {
        clearTimeout(fallbackTimer);
        if (!fellBack) startLite();
      });
  }

  function startLite() {
    liteEl.hidden = false;
    liteEl.addEventListener('click', onCut, { once: true });
    liteEl.addEventListener('touchend', onCut, { once: true });
  }

  function onCut() {
    if (phase !== 'waiting') return;
    phase = 'cutting';
    clearTimeout(autoTimer);
    intro.classList.add('is-cutting');
    cutTimer = setTimeout(() => dismiss(false), 720);
  }

  function onSkipClick() {
    dismiss(true);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') dismiss(true);
  }

  function dismiss(instant) {
    if (phase === 'done') return;
    phase = 'done';
    clearTimeout(autoTimer);
    clearTimeout(cutTimer);
    skipBtn.removeEventListener('click', onSkipClick);
    document.removeEventListener('keydown', onKeydown);
    finish(instant);
  }
}

function finish(instant) {
  intro.classList.add(instant ? 'is-skip' : 'is-exit');
  const wait = instant ? 320 : 900;
  setTimeout(() => {
    intro.hidden = true;
    intro.classList.remove('is-cutting', 'is-exit', 'is-skip');
    document.documentElement.removeAttribute('data-intro-active');
    localStorage.setItem(STORAGE_KEY, '1');
    replayHeroEntrance();
  }, wait);
}

/* Reinicia la animación de entrada del Hero justo cuando la intro se
   retira, para que la transición se sienta como una sola experiencia. */
function replayHeroEntrance() {
  document.querySelectorAll('.hero .reveal-in').forEach((el) => {
    el.style.animation = 'none';
    void el.offsetWidth; // fuerza reflow para poder reiniciar la animación
    el.style.animation = '';
  });
}

function shouldUseThree() {
  if (!supportsWebGL()) return false;
  if (window.matchMedia('(pointer: coarse)').matches) return false;
  if (window.innerWidth < 820) return false;
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === 'number' && cores <= 2) return false;
  const mem = navigator.deviceMemory;
  if (typeof mem === 'number' && mem <= 2) return false;
  return true;
}

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}
