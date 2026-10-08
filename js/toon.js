import * as THREE from "three";

// 3-step ramp gives the flat "cartoon" shading.
const ramp = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
ramp.needsUpdate = true;

const cache = new Map();
export function toon(color, opts = {}) {
  const key = Object.keys(opts).length ? null : color;
  if (key !== null && cache.has(key)) return cache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...opts });
  if (key !== null) cache.set(key, m);
  return m;
}
export const basic = (color, opts = {}) => new THREE.MeshBasicMaterial({ color, ...opts });

const outlineMat = new THREE.MeshBasicMaterial({ color: 0x3a2214, side: THREE.BackSide });
// Inverted-hull outline: a slightly larger back-face copy drawn in dark brown.
export function outline(mesh, k = 1.06) {
  const o = new THREE.Mesh(mesh.geometry, outlineMat);
  o.scale.setScalar(k);
  o.castShadow = false;
  mesh.add(o);
  return mesh;
}

export function mesh(geo, mat, { pos, scale, rot, shadow = true, line } = {}) {
  const m = new THREE.Mesh(geo, mat);
  if (pos) m.position.set(...pos);
  if (scale) Array.isArray(scale) ? m.scale.set(...scale) : m.scale.setScalar(scale);
  if (rot) m.rotation.set(...rot);
  m.castShadow = shadow;
  if (line) outline(m, line === true ? 1.06 : line);
  return m;
}

export function heartGeometry(size = 1, depth = 0.4) {
  const s = new THREE.Shape(), x = 0, y = 0;
  s.moveTo(x + 5, y + 5);
  s.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  s.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
  s.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  s.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  s.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
  s.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
  const g = new THREE.ExtrudeGeometry(s, { depth: depth * 10, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2, bevelSegments: 3, curveSegments: 16 });
  g.center(); g.rotateZ(Math.PI); g.scale(size / 20, size / 20, size / 20);
  return g;
}

export function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function glowTexture(inner = "rgba(255,240,200,1)", outer = "rgba(255,160,40,0)") {
  return canvasTexture(128, 128, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, inner); r.addColorStop(1, outer);
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  });
}
