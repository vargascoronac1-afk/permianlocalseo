/* Permian Local v8 - camioneta 3D (Three.js r170). Se importa bajo demanda desde v8.js.
   Patron de demos/taller/3d-sketchfab.html: scroll acumulado (nunca retrocede) + lerp. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const MODEL = '/demos/taller/3d/camioneta-higgsfield-opt.glb';

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
  const rim = new THREE.DirectionalLight(0x4fd6e0, 1.4); rim.position.set(-5, 2, -4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffe6cc, 0x1a0c08, 0.5));
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
  let baseDist = 7.2, fitR = 2.7, ready = false, visible = false, raf = 0;
  let acum = 0, smooth = 0, lastY = window.scrollY;
  const ROT_PER_PX = 0.005;

  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(MODEL, (gltf) => {
    const root = gltf.scene; pivot.add(root);
    root.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(root);
    const sz = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const k = 5 / Math.max(sz.x, sz.z); root.scale.setScalar(k); fitR = Math.hypot(sz.x, sz.z) * k / 2;
    root.position.set(-ctr.x * k, -box.min.y * k, -ctr.z * k);
    root.traverse((o) => {
      if (!o.isMesh) return;
      const old = o.material;
      const mat = new THREE.MeshPhysicalMaterial({ map: old.map, color: 0xffffff, metalness: 0.15, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.9 });
      if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
      o.material = mat;
    });
    ready = true; resize(); draw();
    stage.classList.add('is-3d');
    if (visible) start();
  }, undefined, () => { /* si falla, se queda la imagen */ });

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    /* distancia que deja entera la camioneta girando (radio fitR) en el ancho del lienzo, con margen de perspectiva */
    baseDist = Math.min(18, Math.max(7.2, fitR * 1.1 / (0.2867 * Math.max(camera.aspect, 0.5)))); camera.updateProjectionMatrix();
    if (ready) draw();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);

  /* Scroll acumulado: solo suma, y solo mientras la escena esta cerca de la pantalla */
  window.addEventListener('scroll', () => {
    const y = window.scrollY, d = Math.abs(y - lastY); lastY = y;
    if (visible) acum += Math.min(d, 400);
  }, { passive: true });

  function draw() {
    pivot.rotation.y = smooth * ROT_PER_PX + 0.6;
    const zoom = 1 - 0.1 * Math.sin(Math.min(1, smooth / 2400) * Math.PI / 2);
    const dist = baseDist * zoom;
    camera.position.set(0, dist * 0.22, dist); camera.lookAt(0, 0.7, 0);
    const ang = 0.9 + smooth / 650;
    sun.position.set(Math.cos(ang) * 6.5, 4.2 + 1.6 * Math.sin(ang * 0.7), Math.sin(ang) * 6.5);
    sun.intensity = 2.6; sun.target.position.set(0, 0.8, 0);
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

  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    lastY = window.scrollY;
    if (visible) start(); else stop();
  }, { rootMargin: '10% 0px 10% 0px' }).observe(stage);
}
