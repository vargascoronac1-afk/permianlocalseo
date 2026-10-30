/* Visor 2.5D de platos (Three.js r170, vendorizado). Plan C del menu 3D: recorte de la foto + relieve ("almohada") + luz calida.
   Arrastrar para girar (+-37 grados), balanceo suave solo, brillo que se mueve con la luz. Sin modelo GLB: la foto es la unica fuente.
   Uso: import('./3d/dish3d.js').then(m => m.mount(stageEl)); stage necesita data-src (webp con alpha) y data-depth (png 8 bit). */
import * as THREE from 'three';

const MAXY = 0.65, MAXX = 0.18, SEG = 90, RELIEF = 0.2;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadImg(src) {
  return new Promise((ok, ko) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = ko; i.src = src; });
}

export async function mount(stage) {
  if (stage.__3d) return; stage.__3d = true;
  const src = stage.dataset.src, depthSrc = stage.dataset.depth;
  let renderer;
  const canvas = document.createElement('canvas');
  canvas.className = 'dish3d__cv'; canvas.setAttribute('aria-hidden', 'true');
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  let img, dimg;
  try { [img, dimg] = await Promise.all([loadImg(src), loadImg(depthSrc)]); } catch (e) { renderer.dispose(); return; }
  const aspect = img.naturalHeight / img.naturalWidth;

  /* relieve: muestrear el png de profundidad en la malla */
  const dc = document.createElement('canvas'); dc.width = dimg.naturalWidth; dc.height = dimg.naturalHeight;
  const dctx = dc.getContext('2d', { willReadFrequently: true }); dctx.drawImage(dimg, 0, 0);
  const dd = dctx.getImageData(0, 0, dc.width, dc.height).data;
  const sample = (u, v) => {
    const x = Math.min(dc.width - 1, Math.max(0, u * (dc.width - 1))), y = Math.min(dc.height - 1, Math.max(0, (1 - v) * (dc.height - 1)));
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(dc.width - 1, x0 + 1), y1 = Math.min(dc.height - 1, y0 + 1), fx = x - x0, fy = y - y0;
    const g = (xx, yy) => dd[(yy * dc.width + xx) * 4];
    return ((g(x0, y0) * (1 - fx) + g(x1, y0) * fx) * (1 - fy) + (g(x0, y1) * (1 - fx) + g(x1, y1) * fx) * fy) / 255;
  };
  const geo = new THREE.PlaneGeometry(1, aspect, SEG, Math.max(8, Math.round(SEG * aspect)));
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, (sample(uv.getX(i), uv.getY(i)) - 0.5) * RELIEF);
  geo.computeVertexNormals();

  const tex = new THREE.Texture(img); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
  const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, roughness: 0.55, metalness: 0, transparent: false });
  const mesh = new THREE.Mesh(geo, mat);
  const pivot = new THREE.Group(); pivot.add(mesh);
  const scene = new THREE.Scene(); scene.add(pivot);

  const hemi = new THREE.HemisphereLight(0xfff6e6, 0xd09a62, 2.7); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe9c8, 1.5); key.position.set(-1.2, 1.6, 2.4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xf6c23e, 0.7); rim.position.set(2.2, 0.4, -1.5); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 20);
  stage.appendChild(canvas);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const vh = THREE.MathUtils.degToRad(camera.fov) / 2, hh = Math.atan(Math.tan(vh) * camera.aspect);
    /* que la tarjeta entre entera aunque gire: radio de la caja = media diagonal */
    const r = Math.max(0.5, aspect / 2) * 1.12;
    camera.position.set(0, 0, r / Math.sin(Math.min(vh, hh)));
    camera.updateProjectionMatrix(); render();
  }
  function render() { renderer.render(scene, camera); }

  let tY = 0, tX = 0, cY = 0, cX = 0, dragging = false, sx = 0, sy = 0, bY = 0, bX = 0, idle = performance.now(), visible = true, raf = 0, t0 = performance.now(), lastW = 0;
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => { dragging = true; sx = e.clientX; sy = e.clientY; bY = tY; bX = tX; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} stage.classList.add('is-drag'); stage.classList.add('is-touched'); start(); });
  canvas.addEventListener('pointermove', (e) => { if (!dragging) return; tY = clamp(bY + (e.clientX - sx) * 0.011, MAXY); tX = clamp(bX + (e.clientY - sy) * 0.004, MAXX); });
  const up = () => { if (!dragging) return; dragging = false; idle = performance.now(); stage.classList.remove('is-drag'); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', () => {});

  function frame(now) {
    raf = 0; if (!visible || document.hidden) return;
    if (!dragging && !reduce && now - idle > 1400) {
      const t = (now - t0) / 1000; tY = Math.sin(t * 0.9) * 0.42; tX = Math.sin(t * 0.55 + 1) * 0.05;
    }
    cY += (tY - cY) * 0.14; cX += (tX - cX) * 0.14;
    pivot.rotation.y = cY; pivot.rotation.x = cX;
    /* la luz "vive" en el mundo: al girar la tarjeta el brillo se desplaza por la superficie */
    key.position.set(-1.2 + Math.sin(cY * 1.4) * 0.6, 1.6, 2.4);
    stage.style.setProperty('--sx', (cY * -26).toFixed(1) + 'px');
    render();
    const settled = Math.abs(tY - cY) < 0.0005 && Math.abs(tX - cX) < 0.0005 && !dragging && reduce;
    if (!settled) raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf) raf = requestAnimationFrame(frame); }
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start(); }, { rootMargin: '60px' }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  if (window.ResizeObserver) new ResizeObserver(() => { const w = stage.clientWidth; if (w !== lastW) { lastW = w; resize(); } }).observe(stage); else addEventListener('resize', resize);
  resize(); stage.classList.add('is-3d'); start();
  stage.dispatchEvent(new CustomEvent('dish3d-ready'));
}

/* monta cuando la tarjeta entra en pantalla; con ahorro de datos o red muy lenta espera a un toque */
export function lazyMountAll(root) {
  const stages = [...root.querySelectorAll('.dish3d__stage')];
  const c = navigator.connection || {};
  const slow = c.saveData || /(^|-)2g$/.test(c.effectiveType || '') || (navigator.deviceMemory && navigator.deviceMemory < 1);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); mount(e.target); } }), { rootMargin: '250px' });
  stages.forEach((s) => {
    if (slow) { const b = s.querySelector('.dish3d__go'); if (b) { b.hidden = false; b.addEventListener('click', () => { b.hidden = true; mount(s); }); } } else io.observe(s);
  });
}
