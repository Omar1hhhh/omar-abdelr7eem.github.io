import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { NOISE_GLSL } from './noise.glsl.js';

const C = { navy: 0x2c3e50, slate: 0x34495e, grey: 0x7f8c8d, silver: 0xbdc3c7, cloud: 0xecf0f1, bg: 0x1b2631 };

// Per-section targets: morph/amp (form), camZ, object offset (ox, oy), scale, lights, spin, grid opacity.
const STAGES = {
  hero:     { morph: .26, amp: .26, camZ: 7.5, ox:  2.2, oy:  .2, s: 1.12, key: 2.6, rim: 1.5, core: 1.1, spin: .18, grid: .22 },
  about:    { morph: .68, amp: .38, camZ: 6.2, ox: -2.5, oy:  .7, s: .9,  key: 1.8, rim: 2.3, core: 1.35, spin: .32, grid: .12 },
  skills:   { morph: 1.1, amp: .5,  camZ: 6.9, ox:  2.8, oy: -.2, s: .96, key: 2.2, rim: 1.65, core: 1.7, spin: .5,  grid: .28 },
  services: { morph: .42, amp: .22, camZ: 7.9, ox:  0,   oy: 1.9, s: .8,  key: 3.1, rim: 1.1, core: 1.05, spin: .12, grid: .36 },
  journey:  { morph: .84, amp: .42, camZ: 6.1, ox: -2.8, oy: -1.1, s: 1.02, key: 2.0, rim: 1.9, core: 1.45, spin: .38, grid: .22 },
  contact:  { morph: .12, amp: .15, camZ: 5.4, ox:  0,   oy:  .4, s: 1.18, key: 2.9, rim: 2.0, core: 2.2, spin: .08, grid: .1 }
};

function detectQuality() {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  return (coarse || cores <= 4 || mem < 4) ? 'low' : 'high';
}

export function createScene(canvas, { reduced }) {
  const quality = detectQuality();
  const hi = quality === 'high';

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: hi,
    powerPreference: hi ? 'high-performance' : 'low-power'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, hi ? 1.5 : 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.bg);
  scene.fog = new THREE.FogExp2(C.bg, 0.045);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  // Lights
  scene.add(new THREE.AmbientLight(C.slate, 0.6));
  const key = new THREE.DirectionalLight(C.cloud, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.PointLight(C.silver, 14, 25); rim.position.set(-4, 1, -3); scene.add(rim);
  const fill = new THREE.PointLight(C.grey, 6, 15); fill.position.set(0, -3, 3); scene.add(fill);

  // Signature object: liquid-glass shell + digital nucleus + orbit rings
  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0.2 }, uAmp: { value: 0.22 }, uMouse: { value: new THREE.Vector2() }
  };
  const group = new THREE.Group(); scene.add(group);

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: hi ? C.cloud : C.silver, metalness: 0.12, roughness: 0.08,
    transmission: hi ? 1 : 0.75, thickness: 1.8, ior: 1.46,
    attenuationColor: new THREE.Color(C.silver), attenuationDistance: 2,
    clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5,
    transparent: true, opacity: hi ? 0.94 : 0.82
  });
  shellMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; uniform float uMorph; uniform float uAmp; uniform vec2 uMouse;
        ${NOISE_GLSL}
        vec3 displace(vec3 p){
          vec3 n = normalize(p);
          float f1 = snoise(n * (1.4 + uMorph * 1.8) + vec3(0.0, uTime * 0.22, uTime * 0.11));
          float f2 = snoise(n * (3.5 + uMorph * 2.0) - uTime * 0.35) * 0.35;
          float d = (f1 + f2) * uAmp + dot(n.xy, uMouse) * uAmp * 0.4;
          return p + n * d;
        }`)
      .replace('#include <beginnormal_vertex>', `
        vec3 dP0 = displace(position);
        vec3 tng = normalize(cross(normal, abs(normal.y) < 0.99 ? vec3(0.,1.,0.) : vec3(1.,0.,0.)));
        vec3 btg = cross(normal, tng);
        vec3 objectNormal = normalize(cross(displace(position + tng*0.02) - dP0, displace(position + btg*0.02) - dP0));`)
      .replace('#include <begin_vertex>', 'vec3 transformed = dP0;');
  };
  shellMat.customProgramCacheKey = () => 'liquid-glass';
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, hi ? 32 : 20), shellMat);
  group.add(shell);

  const coreMat = new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uIntensity: { value: 1 }, uA: { value: new THREE.Color(C.grey) }, uB: { value: new THREE.Color(C.cloud) } },
    vertexShader: `varying vec3 vN, vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uTime, uIntensity; uniform vec3 uA, uB; varying vec3 vN, vV;
      void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.5); float pulse = 0.75 + 0.25*sin(uTime*1.6);
      gl_FragColor = vec4(mix(uA, uB, f) * uIntensity * pulse, 0.35 + f*0.65); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, hi ? 32 : 24, hi ? 32 : 24), coreMat);
  group.add(core);

  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.7, 1)),
    new THREE.LineBasicMaterial({ color: C.silver, transparent: true, opacity: 0.42 }));
  group.add(wire);

  const ringMat = new THREE.MeshBasicMaterial({ color: C.silver, transparent: true, opacity: 0.38 });
  const rings = [0, 1, 2].map((i) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.9 + i * 0.42, 0.006, 6, hi ? 160 : 100), ringMat);
    r.rotation.set(Math.PI / 2.3 + i * 0.55, i * 0.85, 0); group.add(r); return r;
  });

  // Environment: soft particles + light grid + a few calm orbiting forms
  const N = hi ? 480 : 180, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 2.8 + Math.random() * 8.6, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p)], i * 3);
  }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: C.silver, size: hi ? 0.025 : 0.04, transparent: true, opacity: 0.42, depthWrite: false }));
  scene.add(particles);

  const grid = new THREE.GridHelper(hi ? 48 : 32, hi ? 48 : 32, C.slate, C.slate);
  grid.position.y = -3.6; grid.material.transparent = true; grid.material.opacity = 0.14; grid.material.depthWrite = false;
  scene.add(grid);

  const calmGroup = new THREE.Group();
  scene.add(calmGroup);

  const softGeometry = new THREE.OctahedronGeometry(0.22, 0);
  const softMaterial = new THREE.MeshPhysicalMaterial({
    color: C.cloud,
    emissive: new THREE.Color(C.slate),
    emissiveIntensity: 0.12,
    metalness: 0.18,
    roughness: 0.3,
    transparent: true,
    opacity: 0.52,
    transmission: 0.25,
    depthWrite: false
  });

  const calmMeshes = [];
  for (let i = 0; i < (hi ? 6 : 4); i++) {
    const mesh = new THREE.Mesh(softGeometry, softMaterial.clone());
    mesh.userData = {
      orbit: 1.7 + i * 0.6,
      speed: 0.25 + i * 0.08,
      offset: i * 0.9,
      height: -1.2 + i * 0.55,
      drift: (Math.random() - 0.5) * 1.2
    };
    mesh.position.set((i - 2.5) * 1.2, mesh.userData.height, -2.2 - i * 0.7);
    calmMeshes.push(mesh);
    calmGroup.add(mesh);
  }

  // State
  const cur = { ...STAGES.hero }, target = { ...STAGES.hero };
  let base = STAGES.hero, journey = null, layout = { rtl: false, mobile: false }, progress = 0;
  const pointer = new THREE.Vector2(), mouse = new THREE.Vector2();
  const clock = new THREE.Clock(); let elapsed = 0;
  let isVisible = true;

  function applyTarget() {
    const src = journey ? { ...base, ...journey } : base;
    Object.assign(target, src);
    target.ox *= layout.rtl ? -1 : 1;
    if (layout.mobile) { target.ox = 0; target.oy = src.oy * 0.3 + 1.5; target.s = src.s * 0.65; }
  }

  addEventListener('pointermove', e => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  }, { passive: true });

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth < 768 ? 46 : 38;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const visibilityObserver = new IntersectionObserver((entries) => {
    isVisible = entries.some(entry => entry.isIntersecting);
    if (!isVisible) renderer.setAnimationLoop(null);
    else if (!document.hidden) renderer.setAnimationLoop(frame);
  }, { threshold: 0.1 });
  visibilityObserver.observe(canvas);

  let lastFrame = 0;
  function frame(now = performance.now()) {
    if (!isVisible || document.hidden) return;
    if (!hi && now - lastFrame < 1000 / 30) return;
    lastFrame = now;

    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt * (reduced ? 0.15 : 1);
    const k = 1 - Math.exp(-dt * 3);
    for (const key in cur) cur[key] += (target[key] - cur[key]) * k;
    mouse.lerp(pointer, k * 1.5);

    uniforms.uTime.value = elapsed; uniforms.uMorph.value = cur.morph; uniforms.uAmp.value = cur.amp;
    uniforms.uMouse.value.copy(mouse);
    coreMat.uniforms.uIntensity.value = cur.core;

    group.position.set(cur.ox, cur.oy, 0); group.scale.setScalar(cur.s);
    group.rotation.y += dt * cur.spin * (reduced ? 0 : 1);
    group.rotation.x = Math.sin(elapsed * 0.2) * 0.15 + mouse.y * 0.2;
    shell.rotation.y = elapsed * 0.18;
    shell.rotation.x = Math.sin(elapsed * 0.38) * 0.45;
    wire.rotation.y -= dt * cur.spin * 1.8; wire.rotation.z += dt * 0.12;
    rings.forEach((r, i) => {
      r.rotation.z += dt * (0.06 + i * 0.05);
      r.rotation.x = Math.sin(elapsed * 0.6 + i) * 0.2 + i * 0.2;
    });

    calmGroup.rotation.y = elapsed * 0.12 + mouse.x * 0.4;
    calmGroup.rotation.x = mouse.y * 0.18;
    calmMeshes.forEach((mesh, i) => {
      const data = mesh.userData;
      const t = elapsed * data.speed + data.offset;
      mesh.position.x = Math.sin(t) * data.orbit + mouse.x * 1.1 + (i - 2.5) * 0.8;
      mesh.position.y = data.height + Math.cos(t * 1.4) * 0.8 + mouse.y * 0.8;
      mesh.position.z = -2.8 - i * 0.6 + Math.sin(t * 1.1) * 0.6;
      mesh.rotation.x = t;
      mesh.rotation.y = t * 1.7;
      mesh.scale.setScalar(0.8 + Math.sin(t * 2) * 0.2 + cur.morph * 0.25);
    });

    key.intensity = cur.key; rim.intensity = cur.rim * 12; grid.material.opacity = cur.grid * 0.75;
    grid.position.z = -progress * 6;
    grid.rotation.z = elapsed * 0.05;
    particles.rotation.y = progress * Math.PI * 0.7 + elapsed * 0.04; particles.rotation.x = progress * 0.3 + elapsed * 0.02;

    camera.position.x += (mouse.x * 0.35 - camera.position.x) * k;
    camera.position.y += (mouse.y * 0.25 - camera.position.y) * k;
    camera.position.z += (cur.camZ - camera.position.z) * k;
    camera.lookAt(mouse.x * 0.6, mouse.y * 0.4, 0);
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(frame);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) renderer.setAnimationLoop(null);
    else if (isVisible) renderer.setAnimationLoop(frame);
  });

  const dispose = () => {
    visibilityObserver.disconnect();
    softGeometry.dispose();
    calmMeshes.forEach(mesh => { mesh.material.dispose(); });
    pGeo.dispose();
    particles.material.dispose();
    grid.geometry.dispose();
    grid.material.dispose();
    renderer.dispose();
    pmrem.dispose();
  };

  window.addEventListener('beforeunload', dispose, { once: true });

  return {
    setStage(name) { base = STAGES[name] || STAGES.hero; if (name !== 'journey') journey = null; applyTarget(); },
    setJourneyStep(i, n) {
      const t = n > 1 ? i / (n - 1) : 0;
      journey = { morph: 0.3 + t * 0.9, amp: 0.2 + t * 0.25, core: 0.9 + t * 1.1, key: 1.4 + t * 1.2, spin: 0.2 + t * 0.4 };
      base = STAGES.journey; applyTarget();
    },
    setProgress(p) { progress = p; },
    setLayout(l) { layout = { ...layout, ...l }; applyTarget(); },
    dispose
  };
}
