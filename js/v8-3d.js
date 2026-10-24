/* Permian Local v8 - Silverado 3D (Three.js r170; modelo Ddiaz Design, Sketchfab, CC BY). Se importa bajo demanda desde v8.js.
   Patron de demos/taller/3d-sketchfab.html: scroll acumulado (nunca retrocede) + lerp. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const MODEL = '/demos/taller/3d/silverado-opt.glb';

export function init(stage, canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const sun = new THREE.DirectionalLight(0xffd2a0, 3.2); sun.position.set(4, 6, 5); scene.add(sun); scene.add(sun.target);
  const rim = new THREE.DirectionalLight(0x7fb59a, 1.0); rim.position.set(-5, 2, -4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffe6cc, 0x14201b, 0.5));
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const glint = new THREE.PointLight(0xfff1dd, 0, 14, 1.6); scene.add(glint);

  function shadowTexture() {
    const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d'), grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(0,0,0,.85)'); grd.addColorStop(0.5, 'rgba(0,0,0,.45)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.scale.setScalar(5.2); scene.add(shadow);

  const pivot = new THREE.Group(); scene.add(pivot);
  let baseDist = 9, fitR = 3, cy = 0.8, ready = false, visible = false, raf = 0;
  let acum = 0, smooth = 0, lastY = window.scrollY;
  const ROT_PER_PX = 0.005, PAINT = 0xc8102e;

  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(MODEL, (gltf) => {
    const root = gltf.scene; pivot.add(root);
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const sz = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const k = 5 / Math.max(sz.x, sz.z); root.scale.setScalar(k);
    root.position.set(-ctr.x * k, -box.min.y * k, -ctr.z * k);
    cy = sz.y * k / 2;
    /* esfera envolvente centrada en el modelo: entra entera en cualquier angulo del giro */
    fitR = Math.hypot(sz.x, sz.y, sz.z) * k / 2;
    shadow.position.y = 0.01; shadow.scale.set(sz.x * k * 1.25, sz.z * k * 1.25, 1);
    const paint = new Set(), glass = new Set();
    root.traverse((o) => {
      if (!o.isMesh) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.name === 'Carpaint') paint.add(m); else if (/^Glass/.test(m.name)) glass.add(m);
        if (m.envMapIntensity !== undefined) m.envMapIntensity = 1.4;
        for (const t of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) if (m[t]) m[t].anisotropy = 8;
      });
    });
    paint.forEach((m) => { m.map = null; m.color.set(PAINT); m.clearcoat = 1; m.clearcoatRoughness = 0.05; m.envMap = scene.environment; m.envMapIntensity = 0.85; m.needsUpdate = true; });
    glass.forEach((m) => { m.envMap = scene.environment; m.envMapIntensity = 3.2; m.needsUpdate = true; });
    ready = true; resize(); draw();
    stage.classList.add('is-3d');
    if (visible) start();
  }, undefined, () => { /* si falla, se queda la imagen */ });

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    /* distancia a la que la esfera (radio fitR) cabe en el menor de los dos semicampos, con 14 % de margen (el zoom acerca como mucho 6 %) */
    const vh = THREE.MathUtils.degToRad(camera.fov) / 2, hh = Math.atan(Math.tan(vh) * camera.aspect);
    baseDist = fitR * 1.14 / Math.sin(Math.min(vh, hh)) / 1.031; camera.updateProjectionMatrix();
    if (ready) draw();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);

  /* Scroll acumulado: solo suma, y solo mientras la escena esta cerca de la pantalla */
  window.addEventListener('scroll', () => {
    const y = window.scrollY, d = Math.abs(y - lastY); lastY = y;
    if (visible) acum += Math.min(d, 400);
  }, { passive: true });

  function draw() {
    pivot.rotation.y = smooth * ROT_PER_PX + 0.6; /* frente 3/4 izquierdo */
    const zoom = 1 - 0.06 * Math.sin(Math.min(1, smooth / 2400) * Math.PI / 2);
    const dist = baseDist * zoom;
    camera.position.set(0, cy + dist * 0.25, dist); camera.lookAt(0, cy, 0);
    const ang = 0.9 + smooth / 650;
    sun.position.set(Math.cos(ang) * 6.5, 4.2 + 1.6 * Math.sin(ang * 0.7), Math.sin(ang) * 6.5);
    sun.intensity = 2.6; sun.target.position.set(0, cy, 0);
    const sweep = (smooth / 900) % 1, env = Math.sin(sweep * Math.PI);
    glint.position.set(-2.6 + sweep * 5.2, 1.9, 1.6); glint.intensity = 38 * env;
    scene.environmentIntensity = 0.85 + 0.35 * env;
    renderer.render(scene, camera);
  }
  function frame() {
    smooth += (acum - smooth) * 0.08;
    draw();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && ready) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  /* captura para la imagen de reserva (movil / reduced-motion) */
  window.__truck3dSnap = (s, z) => { const p = smooth, b = baseDist; smooth = s || 0; baseDist = b * (z || 1); draw(); const u = renderer.domElement.toDataURL('image/png'); smooth = p; baseDist = b; draw(); return u; };

  /* captura de la serie de 36 vistas: angulo directo (grados), luz fija, tamano forzado; no afecta al render normal */
  window.__truck3dFrame = (deg, W, H) => {
    const ps = renderer.getPixelRatio(), pr = pivot.rotation.y, cp = camera.position.clone(), sp = sun.position.clone(), gi = glint.intensity, ei = scene.environmentIntensity;
    renderer.setPixelRatio(1); renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    const vh = THREE.MathUtils.degToRad(camera.fov) / 2, dist = fitR * 1.1 / Math.sin(vh);
    pivot.rotation.y = THREE.MathUtils.degToRad(deg) + 0.6;
    camera.position.set(0, cy + dist * 0.25, dist); camera.lookAt(0, cy, 0);
    sun.position.set(Math.cos(0.9) * 6.5, 4.2 + 1.6 * Math.sin(0.63), Math.sin(0.9) * 6.5); sun.intensity = 2.6; sun.target.position.set(0, cy, 0);
    glint.intensity = 0; scene.environmentIntensity = 0.95;
    renderer.render(scene, camera);
    const u = renderer.domElement.toDataURL('image/png');
    renderer.setPixelRatio(ps); pivot.rotation.y = pr; glint.intensity = gi; scene.environmentIntensity = ei; sun.position.copy(sp); camera.position.copy(cp); resize();
    return u;
  };

  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    lastY = window.scrollY;
    if (visible) start(); else stop();
  }, { rootMargin: '10% 0px 10% 0px' }).observe(stage);
}
