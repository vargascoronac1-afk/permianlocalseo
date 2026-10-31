/* Visor de platos (Three.js r170, vendorizado). Dos modos:
   - GLB (si el stage tiene data-glb): modelo 3D real con textura, giro completo de 360 grados en Y al arrastrar (raton y tactil, con inercia),
     giro automatico lento en reposo (sin el con prefers-reduced-motion) y cabeceo de +-15 grados en X al arrastrar en vertical.
     El GLB se descarga solo cuando el plato entra en pantalla y de uno en uno. Si falla (red, parseo) cae al modo 2.5D.
   - 2.5D (respaldo): recorte de la foto + relieve ("almohada") + luz calida, arrastrar para girar (+-37 grados), balanceo suave.
   Uso: import('./3d/dish3d.js').then(m => m.mount(stageEl)); stage necesita data-src (webp con alpha) y data-depth (png 8 bit); opcional data-glb. */
import * as THREE from 'three';

const MAXY = 0.65, MAXX = 0.18, SEG = 90, RELIEF = 0.2;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MAXX_GLB = 15 * Math.PI / 180, TILT = 0.3, SPIN = 0.35;

/* cola: como mucho un GLB descargandose a la vez */
let glbChain = Promise.resolve();
function loadGlb(url) {
  /* el cargador GLTF solo se descarga si algun plato trae data-glb (el 2.5D no lo necesita) */
  const p = glbChain.then(() => import('three/addons/loaders/GLTFLoader.js')).then(({ GLTFLoader }) => new Promise((ok, ko) => new GLTFLoader().load(url, ok, undefined, ko)));
  glbChain = p.catch(() => {});
  return p;
}

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

  let glb = null;
  if (stage.dataset.glb) { try { glb = await loadGlb(stage.dataset.glb); } catch (e) { glb = null; } }

  const pivot = new THREE.Group(), scene = new THREE.Scene(); scene.add(pivot);
  let fitR = 0.5; const GLB_FIT = 0.46;
  if (glb) {
    const root = glb.scene, box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    /* platos redondos: radio = media diagonal de (mayor lado horizontal, alto), no la esfera de la caja (sobra ~30%) */
    const rad = Math.hypot(Math.max(size.x, size.z) / 2, size.y / 2);
    if (!(rad > 0)) glb = null;
    else {
      root.position.sub(center); fitR = GLB_FIT;
      const holder = new THREE.Group(); holder.add(root); holder.scale.setScalar(0.5 / rad); pivot.add(holder);
    }
  }
  if (!glb) {
    let img, dimg;
    try { [img, dimg] = await Promise.all([loadImg(src), loadImg(depthSrc)]); } catch (e) { renderer.dispose(); return; }
    const aspect = img.naturalHeight / img.naturalWidth;
    fitR = Math.max(0.5, aspect / 2);

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
    pivot.add(new THREE.Mesh(geo, mat));
  }

  const hemi = new THREE.HemisphereLight(0xfff6e6, 0xd09a62, glb ? 5.5 : 2.7); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe9c8, glb ? 4.5 : 1.5); key.position.set(-1.2, 1.6, 2.4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xf6c23e, 0.7); rim.position.set(2.2, 0.4, -1.5); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 20);
  stage.appendChild(canvas);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const vh = THREE.MathUtils.degToRad(camera.fov) / 2, hh = Math.atan(Math.tan(vh) * camera.aspect);
    /* que la tarjeta entre entera aunque gire: radio de la caja = media diagonal */
    const r = fitR * 1.12;
    camera.position.set(0, 0, r / Math.sin(Math.min(vh, hh)));
    camera.updateProjectionMatrix(); render();
  }
  function render() { renderer.render(scene, camera); }

  let tY = 0, tX = 0, cY = 0, cX = 0, dragging = false, sx = 0, sy = 0, bY = 0, bX = 0, idle = performance.now(), visible = true, raf = 0, t0 = performance.now(), lastW = 0;
  let vel = 0, lastMx = 0, lastMt = 0, lastF = performance.now();
  const maxY = glb ? Infinity : MAXY, maxX = glb ? MAXX_GLB : MAXX, gain = glb ? 0.012 : 0.011;
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => { dragging = true; sx = lastMx = e.clientX; sy = e.clientY; lastMt = e.timeStamp; vel = 0; bY = tY; bX = tX; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} stage.classList.add('is-drag'); stage.classList.add('is-touched'); start(); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    tY = clamp(bY + (e.clientX - sx) * gain, maxY); tX = clamp(bX + (e.clientY - sy) * 0.004, maxX);
    if (glb) { const dt = Math.max(1, e.timeStamp - lastMt); vel = vel * 0.5 + ((e.clientX - lastMx) * gain / dt * 16.7) * 0.5; lastMx = e.clientX; lastMt = e.timeStamp; }
  });
  const up = (e) => { if (!dragging) return; dragging = false; idle = performance.now(); stage.classList.remove('is-drag'); if (glb && e && e.timeStamp - lastMt > 90) vel = 0; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', () => {});

  function frame(now) {
    raf = 0; if (!visible || document.hidden) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastF) / 1000)); lastF = now;
    if (glb) {
      if (!dragging) {
        if (Math.abs(vel) > 0.0004) { tY += vel; vel *= Math.pow(0.93, dt * 60); }
        else { vel = 0; if (!reduce && now - idle > 1400) tY += SPIN * dt; }
        if (now - idle > 1400) tX += (0 - tX) * Math.min(1, dt * 2);
      }
    } else if (!dragging && !reduce && now - idle > 1400) {
      const t = (now - t0) / 1000; tY = Math.sin(t * 0.9) * 0.42; tX = Math.sin(t * 0.55 + 1) * 0.05;
    }
    cY += (tY - cY) * 0.14; cX += (tX - cX) * 0.14;
    pivot.rotation.y = cY; pivot.rotation.x = glb ? TILT + cX : cX;
    /* la luz "vive" en el mundo: al girar la tarjeta el brillo se desplaza por la superficie */
    if (!glb) key.position.set(-1.2 + Math.sin(cY * 1.4) * 0.6, 1.6, 2.4);
    stage.style.setProperty('--sx', (glb ? 0 : cY * -26).toFixed(1) + 'px');
    render();
    const settled = Math.abs(tY - cY) < 0.0005 && Math.abs(tX - cX) < 0.0005 && !dragging && reduce && (!glb || vel === 0);
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
