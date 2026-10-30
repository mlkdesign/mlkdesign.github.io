// The Azerux mark as a real 3D model: the vector logo extruded with bevelled walls, a glossy blue face and
// chrome-blue sides lit by a small studio of light strips. It tilts toward the cursor (a slow sway on touch screens).
// Each [data-logo3d] box keeps its picture until the first frame is drawn, so without WebGL nothing changes.
// Every page shares the script tag; three.js is only fetched where a box exists.
const boxes = [...document.querySelectorAll('[data-logo3d]')];
const [THREE, { SVGLoader } = {}] = boxes.length ? await Promise.all([
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/+esm'),
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/SVGLoader.js/+esm'),
]) : [];

const MARK = 'M36.3047 20.0444C35.6363 22.1427 34.8152 24.0924 33.7383 26.0747C33.3779 26.3928 29.3189 27.9892 25.3164 29.6958L26.6426 33.1753C27.7854 32.6729 28.9081 32.18 29.8145 31.7827C29.2808 32.4094 28.7161 33.0301 28.1123 33.6431C27.8057 33.9556 27.4922 34.2643 27.1719 34.5659C26.7842 34.933 26.388 35.2917 25.9824 35.6411L25.9795 35.644H25.9775C24.3134 37.087 22.5092 38.3938 20.6182 39.5474C18.3639 40.9577 16.2068 38.727 14.4229 37.561C12.6899 35.0503 13.511 31.3937 16.1875 29.8618C16.3691 29.7239 19.2055 28.4889 20.5645 27.895C20.9193 27.7394 21.1741 27.6282 21.2539 27.5913C22.0955 27.2214 23.0486 26.8029 24.0469 26.3647C26.3975 25.3312 28.9998 24.1868 30.9873 23.313C32.9376 22.517 34.7684 21.4643 36.3047 20.0444ZM21.834 31.229C19.1313 32.47 17.0802 33.5813 17.2314 34.0796C16.8039 35.4885 18.3888 36.8566 19.7422 36.2095C20.1045 36.0508 22.4546 35.0147 22.7578 34.8833C22.8871 34.826 23.0226 34.768 23.1602 34.7065L21.834 31.229ZM32.8301 2.99268C34.5548 3.7108 35.9088 4.40564 36.7588 4.87256L36.7871 4.85986C37.1145 5.04963 37.4438 5.26131 37.7656 5.45654C37.7656 5.45654 37.7996 5.66957 37.834 5.97803C38.6936 11.0527 36.1548 16.4119 31.6338 18.9663C29.4757 20.1186 25.7478 21.5801 23.4922 22.6313C23.2818 22.7228 23.0299 22.8333 22.748 22.9575C21.799 23.3739 20.5034 23.9451 19.2656 24.4897C18.039 25.0303 16.8689 25.5453 16.1523 25.8579C12.7702 27.058 10.2036 30.0764 9.88867 33.6411C8.83098 32.5707 7.8144 31.3854 6.94238 30.229C8.12389 26.9321 10.7163 24.2001 13.9883 22.8335C15.1367 22.3284 16.537 21.7142 17.9688 21.0835C19.1473 20.5661 20.3482 20.0378 21.4512 19.5532C22.1031 19.2665 22.7209 18.9943 23.2793 18.7485C28.8442 16.2856 34.3146 14.9341 34.3242 7.64502C34.2719 6.01226 33.7364 4.36334 32.8301 2.99268ZM22.9482 2.99072C25.7127 1.76234 28.9587 3.04583 30.1621 5.69971C31.3408 8.17492 30.3858 11.2714 27.9844 12.6626C26.243 13.535 22.4483 15.1118 20.7002 15.9077C20.5214 15.9923 20.3411 16.077 20.1582 16.1616C19.0442 16.6735 17.8617 17.1681 16.668 17.6704C14.2982 18.6698 11.8788 19.6982 9.83496 20.9487C7.63708 22.4041 5.8392 24.3561 4.5752 26.6333C3.86143 25.3815 3.24384 24.1133 2.69922 22.7974C5.40466 18.8217 9.91295 16.474 14.3115 14.7388C14.647 14.5914 15.0032 14.4358 15.373 14.272L14.0752 10.8677C13.1455 11.2772 12.2239 11.6795 11.3945 12.0454C7.61627 13.5513 3.99695 15.6636 1.30664 18.73C0.917409 17.317 0.614912 15.8684 0.407227 14.4663C3.79751 11.2253 8.38205 9.32904 12.7764 7.46143C13.9565 6.96038 15.1235 6.46029 16.25 5.93604C16.2539 5.93471 16.2567 5.93346 16.2607 5.93213C17.4546 5.42696 21.8562 3.44125 22.9482 2.99072ZM26.8457 7.2417C25.832 5.06275 23.3422 6.88212 21.8994 7.42822C20.6286 7.98794 18.8944 8.74669 17.5576 9.33643L18.8564 12.7417C19.8466 12.3062 20.8095 11.8827 21.6484 11.5142C21.8507 11.4267 22.2426 11.2499 22.4502 11.1626C23.8352 10.3544 27.94 9.65656 26.8457 7.2417ZM5.76855 2.60303C10.471 0.676699 15.5686 -0.203399 20.6162 0.0395508C18.9108 0.799957 16.9657 1.64945 14.9619 2.52588C13.8081 3.02824 12.6345 3.54014 11.4766 4.04932C9.18801 5.05272 6.957 6.04162 5.05078 6.91943C3.25601 7.8109 1.59427 8.8466 0.0195313 10.0425C-0.076659 8.4608 0.210363 5.24277 0.235352 5.45654C1.98213 4.34113 3.84923 3.40617 5.77344 2.58838C5.77073 2.59375 5.76987 2.59769 5.76855 2.60303Z';

// Resting pose: nearly face-on; the oblique extrusion (SHEAR) already shows the walls.
const BASE = { x: -0.12, y: -0.22 };
const SHEAR = { x: 0.36, y: 0.32 };
const TILT = 0.32; // how far the cursor can turn it, in radians
// Share of the canvas height the mark fills; the canvas overhangs its box by 12% each side (style.css).
const FILL = 0.72;

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const buildGeometry = () => {
  const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 40"><path d="${MARK}"/></svg>`);
  const shapes = svg.paths.flatMap((path) => SVGLoader.createShapes(path));
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 2.4,
    curveSegments: 28,
    bevelEnabled: true,
    bevelThickness: 0.42,
    bevelSize: 0.24,
    bevelOffset: -0.24, // the bevel eats into the outline instead of fattening it, so the gaps stay as drawn
    bevelSegments: 2,
  });
  geometry.rotateX(Math.PI); // SVG y runs down; a turn (not a mirror) keeps the faces pointing out
  geometry.center();
  // An oblique extrusion like the rendered picture: the back runs off to the lower right, so the walls show
  // on the right and below while the face keeps its full width. Split first: the shear tilts the wall
  // normals, which would then read as bevel.
  const mark = splitBevel(geometry);
  mark.applyMatrix4(new THREE.Matrix4().set(1, 0, -SHEAR.x, 0, 0, 1, SHEAR.y, 0, 0, 0, 1, 0, 0, 0, 0, 1));
  mark.center();
  return mark;
};

// ExtrudeGeometry puts the bevel and the straight walls in one group; split them so the bevel can
// catch the light as a thin bright rim around the face while the walls stay dark chrome.
// Groups after the split: 0 face, 1 walls, 2 bevel.
const splitBevel = (geometry) => {
  // Every shape adds its own cap and side groups; sort all their triangles into the three buckets.
  const normal = geometry.getAttribute('normal');
  const face = [];
  const walls = [];
  const bevel = [];
  geometry.groups.forEach((group) => {
    for (let i = group.start; i < group.start + group.count; i += 3) {
      if (group.materialIndex === 0) face.push(i);
      else (Math.abs(normal.getZ(i) + normal.getZ(i + 1) + normal.getZ(i + 2)) / 3 > 0.12 ? bevel : walls).push(i);
    }
  });
  const order = [...face, ...walls, ...bevel];
  const faceCount = face.length * 3;
  const out = new THREE.BufferGeometry();
  Object.entries(geometry.attributes).forEach(([name, attribute]) => {
    const size = attribute.itemSize;
    const array = new attribute.array.constructor(attribute.array.length);
    order.forEach((start, k) => array.set(attribute.array.subarray(start * size, (start + 3) * size), k * 3 * size));
    out.setAttribute(name, new THREE.BufferAttribute(array, size));
  });
  out.addGroup(0, faceCount, 0);
  out.addGroup(faceCount, walls.length * 3, 1);
  out.addGroup(faceCount + walls.length * 3, bevel.length * 3, 2);
  geometry.dispose();
  return out;
};

// A dark room with soft boxes and thin strips: the strips draw the bright streaks along the chrome walls.
const buildEnvironment = (renderer) => {
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x01030a);
  const light = (w, h, color, power, x, y, z) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  light(14, 9, 0x9fc4ff, 2.2, -6, 8, 9); // key soft box, up-left and in front: the bright face
  light(10, 6, 0x3d7bff, 1.4, 9, -2, 7); // blue fill from the right
  light(30, 0.5, 0xd8ecff, 6, 0, 3, -10); // strips behind and around: streaks on the walls
  light(30, 0.4, 0x7fd0ff, 5, 0, -4, -9);
  light(0.5, 30, 0xb8e4ff, 5, 11, 0, -3);
  light(0.4, 30, 0x5aa8ff, 4, -11, 0, -2);
  light(30, 0.35, 0xe6f4ff, 7, 0, -10, 2);
  light(0.35, 30, 0x9fdcff, 7, 9, 0, 8); // in front, low right: glints on the walls that face us
  light(30, 0.35, 0x9fdcff, 6, 0, -9, 8);
  light(30, 8, 0x0a1a66, 1, 0, -12, 0); // deep blue floor bounce
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(room, 0.025).texture;
  pmrem.dispose();
  return texture;
};

const pointer = { x: 0, y: 0, active: false };
if (finePointer && THREE) {
  addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer.active = false; });
}

const instances = [];
let geometry;

const mount = (box) => {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  geometry ||= buildGeometry();
  const scene = new THREE.Scene();
  scene.environment = buildEnvironment(renderer);
  // The face keeps the flat Azerux blue (emissive) under a clear lacquer that only adds the gloss.
  const face = new THREE.MeshPhysicalMaterial({
    color: 0x0a2a80, emissive: 0x1850c4, metalness: 0, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.3,
  });
  // The walls are deep navy chrome: dark by themselves, with the light strips running along them.
  const walls = new THREE.MeshPhysicalMaterial({
    color: 0x3050ff, emissive: 0x000050, metalness: 1, roughness: 0.1, envMapIntensity: 1.3,
  });
  // The bevel is the bright cyan-blue rim between the face and the walls.
  const rim = new THREE.MeshPhysicalMaterial({
    color: 0xe4f3ff, emissive: 0x4a90ff, metalness: 1, roughness: 0.12, envMapIntensity: 1.5,
  });
  const mark = new THREE.Mesh(geometry, [face, walls, rim]);
  const pivot = new THREE.Group();
  pivot.add(mark);
  scene.add(pivot);

  const camera = new THREE.PerspectiveCamera(16, 1, 1, 1000);
  const state = { box, canvas, renderer, scene, camera, pivot, rx: BASE.x, ry: BASE.y, drawn: false, visible: true, dirty: true };

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Distance at which the 40-unit-tall mark fills FILL of the canvas height.
    camera.position.set(0, 0, 40 / (FILL * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))));
    camera.updateProjectionMatrix();
    state.dirty = true;
  };
  box.appendChild(canvas);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    if (state.visible) state.dirty = true;
  }, { rootMargin: '100px' }).observe(box);
  resize();
  instances.push(state);
};

// Where the cursor sits relative to the box, turned back by the box's own CSS rotation.
const aim = (state, time) => {
  if (reduceMotion) return BASE;
  if (!finePointer) {
    return { x: BASE.x + Math.sin(time / 2100) * 0.08, y: BASE.y + Math.sin(time / 2900) * 0.12 };
  }
  if (!pointer.active) return BASE;
  const rect = state.box.getBoundingClientRect();
  const dx = (pointer.x - (rect.left + rect.width / 2)) / (innerWidth / 2);
  const dy = (pointer.y - (rect.top + rect.height / 2)) / (innerHeight / 2);
  const angle = -THREE.MathUtils.degToRad(parseFloat(getComputedStyle(state.box).rotate) || 0);
  const ux = THREE.MathUtils.clamp(dx * Math.cos(angle) - dy * Math.sin(angle), -1, 1);
  const uy = THREE.MathUtils.clamp(dx * Math.sin(angle) + dy * Math.cos(angle), -1, 1);
  return { x: BASE.x + uy * TILT, y: BASE.y + ux * TILT };
};

const frame = (time) => {
  instances.forEach((state) => {
    if (!state.visible) return;
    const target = aim(state, time);
    const rx = state.rx + (target.x - state.rx) * 0.08;
    const ry = state.ry + (target.y - state.ry) * 0.08;
    const moved = Math.abs(rx - state.rx) + Math.abs(ry - state.ry) > 1e-5;
    state.rx = rx;
    state.ry = ry;
    if (!moved && !state.dirty) return;
    state.pivot.rotation.set(rx, ry, 0);
    state.renderer.render(state.scene, state.camera);
    state.dirty = false;
    if (!state.drawn) {
      state.drawn = true;
      state.box.classList.add('is-3d');
    }
  });
  requestAnimationFrame(frame);
};

if (THREE) boxes.forEach(mount);
if (instances.length) requestAnimationFrame(frame);
