/*
  Escena 3D de la introducción: un busto estilizado con cabello y unas
  tijeras, construidos con geometría procedural (sin modelos ni texturas
  externas, todo Three.js puro) para mantener la carga ligera.

  Este módulo solo se descarga cuando js/intro.js decide usar la versión
  3D (escritorio, con WebGL, sin "pointer: coarse", potencia suficiente).
*/
import * as THREE from './vendor/three.module.min.js';

const COLOR_HEAD = 0xf7f4ee; // ivory
const COLOR_HAIR = 0x171614; // carbon
const COLOR_METAL = 0xb49a72; // champagne
const COLOR_KEY_LIGHT = 0xfff8ea;
const COLOR_FILL_LIGHT = 0xe8e0d3; // warm beige
const COLOR_RIM_LIGHT = 0xb49a72; // champagne

const CUT_DURATION_MS = 700;

export function startScene(canvas, { onCutStart, onReady } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // sin WebGL de verdad disponible; js/intro.js ya tiene un timeout de seguridad
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.15, 6.4);
  camera.lookAt(0, 0.1, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ---------- Luz de estudio, cálida ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(COLOR_KEY_LIGHT, 1.15);
  key.position.set(2.4, 2.6, 3.2);
  scene.add(key);
  const fill = new THREE.DirectionalLight(COLOR_FILL_LIGHT, 0.55);
  fill.position.set(-3, 0.6, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(COLOR_RIM_LIGHT, 0.7);
  rim.position.set(-1, 2.4, -3);
  scene.add(rim);

  // ---------- Grupo principal (para el balanceo y el paralaje) ----------
  const rig = new THREE.Group();
  scene.add(rig);

  // ---------- Busto estilizado (geometría de revolución) ----------
  const profile = [
    [0.5, -1.55], [0.4, -1.28], [0.3, -1.0], [0.33, -0.62],
    [0.55, -0.12], [0.63, 0.22], [0.58, 0.58], [0.4, 0.9],
    [0.16, 1.1], [0.0, 1.18],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const headGeo = new THREE.LatheGeometry(profile, 56);
  const headMat = new THREE.MeshStandardMaterial({ color: COLOR_HEAD, roughness: 0.58, metalness: 0.02 });
  const head = new THREE.Mesh(headGeo, headMat);
  rig.add(head);

  // ---------- Cabello: mechones como tubos curvos, agrupados por pivote ----------
  const hairMat = new THREE.MeshStandardMaterial({ color: COLOR_HAIR, roughness: 0.38, metalness: 0.12 });
  const strandDefs = [
    { angle: -0.85, len: 1.55, bend: 0.28, y: 0.98 },
    { angle: -0.55, len: 1.85, bend: 0.22, y: 1.05 },
    { angle: -0.25, len: 2.05, bend: 0.14, y: 1.12 },
    { angle: 0.05, len: 2.15, bend: 0.02, y: 1.15 },
    { angle: 0.35, len: 2.0, bend: -0.12, y: 1.1 },
    { angle: 0.65, len: 1.7, bend: -0.22, y: 1.0 },
    { angle: 0.95, len: 1.35, bend: -0.3, y: 0.9 },
    { angle: -1.15, len: 1.15, bend: 0.32, y: 0.82 },
  ];
  const hairPivots = strandDefs.map((d, i) => {
    const r = 0.46;
    const x = Math.sin(d.angle) * r;
    const z = Math.cos(d.angle) * r * 0.85;
    const pivot = new THREE.Group();
    pivot.position.set(x, d.y, z);
    rig.add(pivot);

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(d.bend * 0.6, -d.len * 0.45, 0.05),
      new THREE.Vector3(d.bend, -d.len * 0.85, 0.06),
      new THREE.Vector3(d.bend * 1.15, -d.len, 0.04),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 18, 0.028 - i * 0.001, 6, false);
    const mesh = new THREE.Mesh(tubeGeo, hairMat);
    pivot.add(mesh);

    return { pivot, phase: i * 0.7, speed: 0.55 + (i % 3) * 0.08 };
  });

  // ---------- Tijeras: dos hojas procedurales pivotando sobre un eje ----------
  const metalMat = new THREE.MeshStandardMaterial({ color: COLOR_METAL, roughness: 0.32, metalness: 0.5 });
  function buildBlade(sign) {
    const g = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.82, 0.035), metalMat);
    blade.position.y = 0.46;
    g.add(blade);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.026, 10, 20), metalMat);
    ring.position.y = -0.28;
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    g.rotation.z = THREE.MathUtils.degToRad(11 * sign);
    return g;
  }
  const scissors = new THREE.Group();
  const bladeA = buildBlade(1);
  const bladeB = buildBlade(-1);
  scissors.add(bladeA, bladeB);
  scissors.position.set(0.92, -0.05, 0.7);
  scissors.rotation.z = THREE.MathUtils.degToRad(-24);
  scissors.rotation.y = THREE.MathUtils.degToRad(-12);
  scissors.scale.setScalar(0.6);
  rig.add(scissors);

  // ---------- Tamaño y responsive ----------
  function resize() {
    const box = canvas.parentElement.getBoundingClientRect();
    const size = Math.max(box.width, box.height) || 320;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.parentElement);

  // ---------- Interacción: mouse / drag / scroll / click / toque ----------
  let pointerX = 0;
  let pointerY = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragDelta = 0;
  let cutTriggered = false;

  function triggerCut() {
    if (cutTriggered) return;
    cutTriggered = true;
    cutStart = performance.now();
    cutting = true;
    if (typeof onCutStart === 'function') onCutStart();
  }

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    if (dragging) dragDelta = e.clientX - dragStartX;
  });
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    dragStartX = e.clientX;
  });
  window.addEventListener('pointerup', () => {
    if (dragging && Math.abs(dragDelta) > 18) triggerCut();
    dragging = false;
    dragDelta = 0;
  });
  canvas.addEventListener('click', triggerCut);
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      triggerCut();
    },
    { passive: false }
  );
  canvas.addEventListener(
    'touchstart',
    (e) => {
      dragStartX = e.touches[0].clientX;
    },
    { passive: true }
  );
  canvas.addEventListener(
    'touchend',
    (e) => {
      triggerCut();
    },
    { passive: true }
  );

  // ---------- Bucle de animación ----------
  let cutting = false;
  let cutStart = 0;
  const clock = new THREE.Clock();
  let rafId;
  let stopped = false;

  function animate() {
    if (stopped) return;
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    rig.rotation.y = Math.sin(t * 0.28) * 0.12 + pointerX * 0.18;
    rig.rotation.x = pointerY * -0.06;

    hairPivots.forEach(({ pivot, phase, speed }) => {
      const sway = Math.sin(t * speed + phase) * 0.05;
      let flutter = 0;
      if (cutting) {
        const p = Math.min((performance.now() - cutStart) / CUT_DURATION_MS, 1);
        flutter = Math.sin(p * Math.PI * 3) * 0.14 * (1 - p);
      }
      pivot.rotation.z = sway + flutter;
    });

    if (cutting) {
      const p = Math.min((performance.now() - cutStart) / CUT_DURATION_MS, 1);
      const close = Math.sin(p * Math.PI); // abre -> cierra -> abre
      bladeA.rotation.z = THREE.MathUtils.degToRad(11 - 24 * close);
      bladeB.rotation.z = THREE.MathUtils.degToRad(-11 + 24 * close);
      if (p >= 1) cutting = false;
    }

    renderer.render(scene, camera);
  }

  animate();
  if (typeof onReady === 'function') requestAnimationFrame(onReady);

  // Se limpia sola cuando la intro se retira del DOM (evita fugas de memoria
  // si el usuario repite la introducción varias veces desde el footer).
  const cleanupObserver = new MutationObserver(() => {
    if (canvas.closest('[hidden]')) {
      stopped = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      cleanupObserver.disconnect();
      renderer.dispose();
    }
  });
  const introRoot = canvas.closest('[data-intro]');
  if (introRoot) cleanupObserver.observe(introRoot, { attributes: true, attributeFilter: ['hidden'] });
}
