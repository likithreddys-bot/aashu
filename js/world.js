import * as THREE from "three";
import { toon, basic, mesh, heartGeometry, canvasTexture, glowTexture } from "./toon.js";

const S = (r, w = 24, h = 16) => new THREE.SphereGeometry(r, w, h);
const rand = (a, b) => a + Math.random() * (b - a);
const dummy = new THREE.Object3D();

export function buildWorld(scene) {
  const W = { updaters: [] };

  /* ---------- sky, fog, light ---------- */
  scene.background = canvasTexture(4, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#4fa8ff"); gr.addColorStop(.45, "#9fd6ff"); gr.addColorStop(.72, "#ffe0b8"); gr.addColorStop(1, "#ffc38a");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  scene.fog = new THREE.Fog(0xffd9b0, 22, 70);
  scene.add(new THREE.HemisphereLight(0xcfe9ff, 0x6a8f3a, 1.7));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);
  sun.position.set(6, 12, 8); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 40 });
  sun.shadow.bias = -.0008; sun.shadow.normalBias = .02;
  scene.add(sun);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(255,250,220,1)", "rgba(255,200,120,0)"), depthWrite: false, fog: false }));
  sunGlow.position.set(14, 16, -40); sunGlow.scale.setScalar(26); scene.add(sunGlow);

  /* ---------- ground ---------- */
  const grass = toon(0x7cc46a);
  const ground = mesh(new THREE.CircleGeometry(60, 64), grass, { rot: [-Math.PI / 2, 0, 0], shadow: false });
  ground.receiveShadow = true; scene.add(ground);
  for (const [x, z, r, c] of [[-16, -26, 12, 0x6ab55c], [14, -30, 15, 0x5fa852], [0, -40, 18, 0x74bd63], [-30, -14, 10, 0x68b35a], [28, -12, 11, 0x6ab55c]])
    scene.add(mesh(S(r, 32, 16), toon(c), { pos: [x, -r * .55, z], scale: [1, .6, 1], shadow: false }));
  const plate = mesh(new THREE.CircleGeometry(2.6, 48), toon(0x9ed67e), { pos: [0, .01, .2], rot: [-Math.PI / 2, 0, 0], shadow: false });
  plate.receiveShadow = true; scene.add(plate);

  // flowers + grass tufts (instanced = cheap on phones)
  const fl = new THREE.InstancedMesh(S(.07, 8, 6), toon(0xffffff), 220);
  const cols = [0xff5d8f, 0xffd33d, 0xffffff, 0xff8a1f, 0xb48cff].map(c => new THREE.Color(c));
  for (let i = 0; i < 220; i++) {
    const a = Math.random() * Math.PI * 2, r = rand(2.4, 16);
    dummy.position.set(Math.cos(a) * r, .06, Math.sin(a) * r - 1); dummy.scale.setScalar(rand(.7, 1.4)); dummy.updateMatrix();
    fl.setMatrixAt(i, dummy.matrix); fl.setColorAt(i, cols[i % cols.length]);
  }
  scene.add(fl);
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(.07, .3, 5), toon(0x4f9a43), 360);
  for (let i = 0; i < 360; i++) {
    const a = Math.random() * Math.PI * 2, r = rand(1.6, 18);
    dummy.position.set(Math.cos(a) * r, .12, Math.sin(a) * r - 1); dummy.rotation.set(rand(-.3, .3), 0, rand(-.3, .3)); dummy.scale.setScalar(rand(.6, 1.3)); dummy.updateMatrix();
    tufts.setMatrixAt(i, dummy.matrix);
  }
  scene.add(tufts);

  /* ---------- tangerine trees ---------- */
  const trunkM = toon(0x8a5a35), leafM = toon(0x3f9a4a, { flatShading: true }), leafM2 = toon(0x4fae55, { flatShading: true }), orangeM = toon(0xff8a1f), stemM = toon(0x2f7a37);
  const trees = [[-4.6, -3.2, 1.1], [4.4, -3.6, 1.2], [-7.5, -7, 1.4], [7.8, -7.5, 1.5], [-2.2, -8.5, 1.3], [2.8, -10, 1.6], [-11, -4, 1.3], [11, -3.5, 1.2], [-6, 2.5, .9], [6.5, 2, .9]];
  for (const [x, z, k] of trees) {
    const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(k); t.rotation.y = rand(0, 6);
    t.add(mesh(new THREE.CylinderGeometry(.13, .2, 1.4, 8), trunkM, { pos: [0, .7, 0], line: 1.1 }));
    for (const [a, b, c, r] of [[0, 1.75, 0, .95], [-.5, 1.5, .2, .65], [.55, 1.55, -.1, .7], [.1, 2.3, -.1, .6]])
      t.add(mesh(new THREE.IcosahedronGeometry(r, 1), Math.random() > .5 ? leafM : leafM2, { pos: [a, b, c], line: 1.04 }));
    for (let i = 0; i < 7; i++) {
      const th = rand(0, Math.PI * 2), ph = rand(.3, 1.7), r = .92;
      const o = mesh(S(.13, 14, 10), orangeM, { pos: [Math.sin(ph) * Math.cos(th) * r, 1.75 + Math.cos(ph) * r * .8, Math.sin(ph) * Math.sin(th) * r], line: 1.08 });
      o.add(mesh(new THREE.ConeGeometry(.03, .08, 5), stemM, { pos: [0, .13, 0] }));
      t.add(o);
    }
    scene.add(t);
  }

  /* ---------- clouds ---------- */
  const cloudM = toon(0xffffff);
  const clouds = [];
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Group();
    for (let j = 0; j < 5; j++) c.add(mesh(S(rand(.8, 1.4), 16, 12), cloudM, { pos: [j * 1.1 - 2.2, rand(-.2, .4), rand(-.3, .3)], shadow: false }));
    c.position.set(rand(-30, 30), rand(9, 22), rand(-38, -14)); c.scale.setScalar(rand(.8, 1.6));
    scene.add(c); clouds.push(c);
  }

  /* ---------- bunting ---------- */
  const flagCols = [0xff5d8f, 0xff8a1f, 0xffd33d, 0x6cc26c, 0x6ec6ff];
  const poleM = toon(0xfff4e0);
  for (const s of [-1, 1]) scene.add(mesh(new THREE.CylinderGeometry(.05, .06, 3, 8), poleM, { pos: [s * 2.9, 1.5, -1.6], line: 1.15 }));
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-2.9, 2.85, -1.6), new THREE.Vector3(0, 2.0, -1.4), new THREE.Vector3(2.9, 2.85, -1.6));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)), new THREE.LineBasicMaterial({ color: 0x4a2a14 })));
  const flagShape = new THREE.Shape(); flagShape.moveTo(-.16, 0); flagShape.lineTo(.16, 0); flagShape.lineTo(0, -.38); flagShape.closePath();
  const flagGeo = new THREE.ShapeGeometry(flagShape), flags = [];
  for (let i = 1; i < 14; i++) {
    const f = mesh(flagGeo, toon(flagCols[i % 5], { side: THREE.DoubleSide }), { shadow: false });
    f.position.copy(curve.getPoint(i / 14)); scene.add(f); flags.push(f);
  }

  /* ---------- balloons ---------- */
  const balloons = [];
  const bCols = [0xff5d8f, 0xffd33d, 0x6ec6ff, 0xff8a1f, 0xb48cff, 0x6cc26c, 0xff3b6b];
  [[-3.4, 3.2, -2.2], [-2.6, 3.9, -2.8], [3.2, 3.4, -2.4], [2.5, 4.1, -3], [-4.2, 2.6, -1], [4.3, 2.8, -1.2], [0, 4.6, -3.4]].forEach((p, i) => {
    const b = new THREE.Group(); b.position.set(...p);
    b.add(mesh(S(.34, 24, 18), toon(bCols[i], { emissive: bCols[i], emissiveIntensity: .12 }), { scale: [1, 1.2, 1], line: 1.04 }));
    b.add(mesh(new THREE.ConeGeometry(.06, .08, 8), toon(bCols[i]), { pos: [0, -.43, 0], rot: [Math.PI, 0, 0] }));
    const str = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -.45, 0), new THREE.Vector3(.08, -1.2, 0), new THREE.Vector3(-.05, -2, 0)]), new THREE.LineBasicMaterial({ color: 0xffffff }));
    b.add(str); b.userData.base = b.position.clone(); b.userData.ph = Math.random() * 6;
    scene.add(b); balloons.push(b);
  });

  /* ---------- cake on a stump ---------- */
  const cake = new THREE.Group(); cake.position.set(0, 0, .75); scene.add(cake);
  cake.add(mesh(new THREE.CylinderGeometry(.5, .58, .5, 20), trunkM, { pos: [0, .25, 0], line: 1.04 }));
  cake.add(mesh(new THREE.CylinderGeometry(.49, .49, .02, 24), toon(0xd9a066), { pos: [0, .505, 0], shadow: false }));
  cake.add(mesh(new THREE.CylinderGeometry(.6, .6, .04, 32), toon(0xffffff), { pos: [0, .53, 0] }));
  cake.add(mesh(new THREE.CylinderGeometry(.44, .44, .32, 32), toon(0xff9ab3), { pos: [0, .71, 0], line: 1.03 }));
  cake.add(mesh(new THREE.TorusGeometry(.44, .045, 8, 40), toon(0xffffff), { pos: [0, .87, 0], rot: [Math.PI / 2, 0, 0] }));
  cake.add(mesh(new THREE.CylinderGeometry(.29, .29, .26, 32), toon(0xfff1d6), { pos: [0, 1.0, 0], line: 1.04 }));
  cake.add(mesh(new THREE.TorusGeometry(.29, .035, 8, 32), toon(0xff9ab3), { pos: [0, 1.13, 0], rot: [Math.PI / 2, 0, 0] }));
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; cake.add(mesh(S(.045, 10, 8), toon(0xffffff), { pos: [Math.cos(a) * .44, .83, Math.sin(a) * .44], scale: [1, 1.6, 1] })); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + .3; const o = mesh(S(.065, 14, 10), orangeM, { pos: [Math.cos(a) * .2, 1.17, Math.sin(a) * .2], line: 1.08 }); o.add(mesh(new THREE.ConeGeometry(.02, .05, 5), stemM, { pos: [0, .07, 0] })); cake.add(o); }
  const spCols = [0xffd33d, 0x6ec6ff, 0x6cc26c, 0xffffff, 0xff5d8f];
  for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, r = rand(.08, .4); cake.add(mesh(new THREE.CapsuleGeometry(.008, .03, 2, 4), toon(spCols[i % 5]), { pos: [Math.cos(a) * r, .875, Math.sin(a) * r], rot: [Math.PI / 2, 0, a], shadow: false })); }
  const stripe = canvasTexture(16, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#6ec6ff"; g.fillRect(0, i * 8, 16, 8); } });
  cake.add(mesh(new THREE.CylinderGeometry(.03, .03, .3, 12), toon(0xffffff, { map: stripe }), { pos: [0, 1.28, 0], line: 1.15 }));
  const flame = new THREE.Group(); flame.position.set(0, 1.5, 0); cake.add(flame);
  flame.add(mesh(S(.05, 16, 12), basic(0xff9a1f, { transparent: true, opacity: .95 }), { scale: [1, 1.9, 1], shadow: false }));
  flame.add(mesh(S(.028, 12, 8), basic(0xfff6c8), { pos: [0, -.015, .01], scale: [1, 1.7, 1], shadow: false }));
  const fg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(255,220,140,.95)", "rgba(255,140,30,0)"), blending: THREE.AdditiveBlending, depthWrite: false }));
  fg.scale.setScalar(.7); flame.add(fg);
  const candleLight = new THREE.PointLight(0xffa040, 3, 4, 1.6); candleLight.position.set(0, 1.55, .1); cake.add(candleLight);
  W.cake = cake; W.flame = flame; W.candleLight = candleLight; W.flameOn = true;

  /* ---------- sky floaters (hearts, tangerines, petals) for the story scroll ---------- */
  const N = 46;
  const hearts = new THREE.InstancedMesh(heartGeometry(.5, .35), toon(0xff5d8f), N);
  const tangs = new THREE.InstancedMesh(S(.3, 18, 12), toon(0xff8a1f), N);
  const petals = new THREE.InstancedMesh(new THREE.CircleGeometry(.12, 6), toon(0xffe1ec, { side: THREE.DoubleSide }), 120);
  const fdata = [];
  const seed = (n, mesh, kind) => { for (let i = 0; i < n; i++) fdata.push({ mesh, i, kind, p: new THREE.Vector3(rand(-9, 9), rand(5, 48), rand(-10, 4)), r: new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6)), s: kind === "petal" ? rand(.6, 1.3) : rand(.6, 1.2), v: rand(.2, .6), w: rand(.3, 1.2), ph: rand(0, 6) }); };
  seed(N, hearts, "heart"); seed(N, tangs, "tang"); seed(120, petals, "petal");
  [hearts, tangs, petals].forEach(m => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });

  /* ---------- sparkles ---------- */
  const spN = 500, spPos = new Float32Array(spN * 3);
  for (let i = 0; i < spN; i++) { spPos[i * 3] = rand(-16, 16); spPos[i * 3 + 1] = rand(1, 50); spPos[i * 3 + 2] = rand(-14, 6); }
  const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute("position", new THREE.BufferAttribute(spPos, 3));
  const dotTex = glowTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)");
  const sparkles = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: .22, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff1c0 }));
  scene.add(sparkles);

  /* ---------- fireworks + smoke ---------- */
  const bursts = [];
  W.firework = (pos, color) => {
    const n = 140, p = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { p.set([pos.x, pos.y, pos.z], i * 3); const d = new THREE.Vector3().randomDirection().multiplyScalar(rand(2.5, 4.5)); v.push(d); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ size: .32, map: dotTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const pts = new THREE.Points(g, m); scene.add(pts); bursts.push({ pts, v, life: 2.2 });
  };
  const smokes = [];
  const smokeTex = glowTexture("rgba(240,240,240,.7)", "rgba(240,240,240,0)");
  W.smoke = () => {
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false }));
      s.position.set(0, 1.5, .75); s.scale.setScalar(.15); s.userData = { life: 1.8 + i * .2, d: i * .18, vx: rand(-.15, .15) };
      scene.add(s); smokes.push(s);
    }
  };

  /* ---------- per-frame ---------- */
  W.update = (t, dt) => {
    for (const b of balloons) { b.position.y = b.userData.base.y + Math.sin(t * .9 + b.userData.ph) * .18; b.rotation.z = Math.sin(t * .7 + b.userData.ph) * .08; }
    flags.forEach((f, i) => { f.rotation.x = Math.sin(t * 2 + i * .6) * .25; });
    clouds.forEach((c, i) => { c.position.x += dt * (.25 + i * .03); if (c.position.x > 34) c.position.x = -34; });
    if (W.flameOn) { const k = 1 + Math.sin(t * 31) * .06 + Math.sin(t * 17) * .05; flame.scale.set(1 / k, k, 1 / k); flame.rotation.z = Math.sin(t * 9) * .08; candleLight.intensity = 2.6 + Math.sin(t * 23) * .5; }
    for (const f of fdata) {
      f.p.y += f.kind === "petal" ? -f.v * dt * .6 : f.v * dt * .25;
      if (f.p.y > 50) f.p.y = 5; if (f.p.y < 4) f.p.y = 48;
      dummy.position.set(f.p.x + Math.sin(t * f.w + f.ph) * .6, f.p.y, f.p.z);
      dummy.rotation.set(f.r.x + t * f.w * .5, f.r.y + t * f.w, f.r.z); dummy.scale.setScalar(f.s); dummy.updateMatrix();
      f.mesh.setMatrixAt(f.i, dummy.matrix);
    }
    hearts.instanceMatrix.needsUpdate = tangs.instanceMatrix.needsUpdate = petals.instanceMatrix.needsUpdate = true;
    sparkles.material.opacity = .55 + Math.sin(t * 2.3) * .35;
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.life -= dt; const a = b.pts.geometry.attributes.position;
      for (let j = 0; j < b.v.length; j++) { b.v[j].y -= 2.2 * dt; b.v[j].multiplyScalar(.985); a.array[j * 3] += b.v[j].x * dt; a.array[j * 3 + 1] += b.v[j].y * dt; a.array[j * 3 + 2] += b.v[j].z * dt; }
      a.needsUpdate = true; b.pts.material.opacity = Math.max(0, b.life / 2.2);
      if (b.life <= 0) { scene.remove(b.pts); b.pts.geometry.dispose(); b.pts.material.dispose(); bursts.splice(i, 1); }
    }
    for (let i = smokes.length - 1; i >= 0; i--) {
      const s = smokes[i], u = s.userData; if (u.d > 0) { u.d -= dt; continue; }
      u.life -= dt; s.position.y += dt * .5; s.position.x += u.vx * dt; s.scale.setScalar(s.scale.x + dt * .35);
      s.material.opacity = Math.max(0, u.life / 2) * .8;
      if (u.life <= 0) { scene.remove(s); s.material.dispose(); smokes.splice(i, 1); }
    }
  };
  return W;
}
