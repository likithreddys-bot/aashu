import * as THREE from "three";
import { toon, basic, mesh, outline, heartGeometry, canvasTexture } from "./toon.js";

const gsap = window.gsap;
const S = (r, w = 32, h = 24) => new THREE.SphereGeometry(r, w, h);

// Face presets, shared by both characters.
export const EXPR = {
  neutral:   { open: 0,   smile: 1, mouthW: 1,    browY: 0,    browRot: 0,    browTilt: 0,   squint: 1,   eyeScale: 1,    love: 0, smirk: 0 },
  happy:     { open: .55, smile: 0, mouthW: 1.15, browY: .02,  browRot: .15,  browTilt: 0,   squint: .85, eyeScale: 1,    love: 0, smirk: 0 },
  surprised: { open: .95, smile: 0, mouthW: .75,  browY: .06,  browRot: -.12, browTilt: 0,   squint: 1,   eyeScale: 1.15, love: 0, smirk: 0 },
  naughty:   { open: 0,   smile: 1, mouthW: 1,    browY: .01,  browRot: 0,    browTilt: .35, squint: .62, eyeScale: 1,    love: 0, smirk: .35 },
  love:      { open: .5,  smile: 0, mouthW: 1.1,  browY: .02,  browRot: .22,  browTilt: 0,   squint: 1,   eyeScale: 1,    love: 1, smirk: 0 }
};

const heartGeo = heartGeometry(0.16, 0.3);
const heartMat = toon(0xff3b6b);

class Character {
  constructor() {
    this.root = new THREE.Group();
    this.body = new THREE.Group();   // moves for jumps
    this.squash = new THREE.Group(); // scales for squash & stretch
    this.root.add(this.body); this.body.add(this.squash);
    this.face = { ...EXPR.neutral };
    this.talking = false;
    this.blink = 1; this.nextBlink = 1.5;
    this.lookYaw = 0;
    this.floatHearts = [];
  }
  setExpr(name, d = .35) { gsap.to(this.face, { ...EXPR[name] || EXPR.neutral, duration: d, ease: "power2.out", overwrite: true }); }

  applyFace(t) {
    const f = this.face, R = this.rig;
    // blink
    this.nextBlink -= this.dt;
    if (this.nextBlink <= 0) { this.blinkT = 0; this.nextBlink = 2 + Math.random() * 3.5; }
    if (this.blinkT !== undefined) { this.blinkT += this.dt; const k = this.blinkT / .16; this.blink = k < 1 ? 1 - Math.sin(k * Math.PI) * .92 : 1; if (k >= 1) this.blinkT = undefined; }
    R.eyes.forEach(e => { e.scale.set(f.eyeScale, f.eyeScale * f.squint * this.blink, f.eyeScale); e.visible = f.love < .5; });
    R.hearts.forEach(h => { h.visible = f.love > .05; h.scale.setScalar(Math.max(.001, f.love) * (1 + Math.sin(t * 9) * .08)); });
    R.brows.forEach((b, i) => {
      const s = i === 0 ? -1 : 1;
      b.position.y = R.browBaseY + f.browY + (s > 0 ? -f.browTilt * .05 : f.browTilt * .05);
      b.rotation.z = Math.PI / 2 - s * f.browRot + (s > 0 ? f.browTilt * .6 : -f.browTilt * .3);
    });
    let open = f.open;
    if (this.talking) open = Math.max(open * .45, .18 + .72 * Math.abs(Math.sin(t * 13.5) * Math.sin(t * 5.3 + 1)));
    const m = R.mouthOpen;
    m.visible = open > .03;
    m.scale.set(R.mouthSize[0] * f.mouthW, R.mouthSize[1] * Math.max(open, .03), R.mouthSize[2]);
    R.smile.visible = !m.visible || f.smile > .5 && open < .2;
    R.smile.rotation.z = Math.PI + f.smirk;
    R.smile.position.x = f.smirk * .05;
  }

  update(t, dt) {
    this.dt = dt;
    this.applyFace(t);
    this.rig.head.position.y = this.rig.headY + Math.sin(t * 2.2 + this.phase) * .012;
    this.rig.head.rotation.z = Math.sin(t * .9 + this.phase) * .06 + (this.headTilt || 0);
    this.rig.head.rotation.y += (this.lookYaw - this.rig.head.rotation.y) * Math.min(1, dt * 4);
    for (let i = this.floatHearts.length - 1; i >= 0; i--) {
      const h = this.floatHearts[i]; h.userData.life -= dt;
      h.position.addScaledVector(h.userData.v, dt); h.rotation.y += dt * 3;
      h.scale.setScalar(Math.max(.001, h.userData.life) * .9);
      if (h.userData.life <= 0) { this.root.remove(h); this.floatHearts.splice(i, 1); }
    }
  }

  burstHearts(n = 7) {
    for (let i = 0; i < n; i++) {
      const h = new THREE.Mesh(heartGeo, heartMat);
      h.position.set((Math.random() - .5) * .4, this.rig.headY + .3, .2);
      h.userData = { life: 1.2 + Math.random() * .6, v: new THREE.Vector3((Math.random() - .5) * 1.2, 1 + Math.random(), (Math.random() - .2) * .6) };
      this.root.add(h); this.floatHearts.push(h);
    }
  }

  /* ---------- actions (each returns a GSAP timeline) ---------- */
  jump(h = .6, d = .55) {
    const tl = gsap.timeline();
    tl.to(this.squash.scale, { x: 1.12, y: .82, z: 1.12, duration: .12, ease: "power2.out" })
      .to(this.squash.scale, { x: .92, y: 1.12, z: .92, duration: .12 })
      .to(this.body.position, { y: h, duration: d / 2, ease: "power2.out" }, "<")
      .to(this.body.position, { y: 0, duration: d / 2, ease: "power2.in" })
      .to(this.squash.scale, { x: 1.15, y: .8, z: 1.15, duration: .08 })
      .to(this.squash.scale, { x: 1, y: 1, z: 1, duration: .45, ease: "elastic.out(1,.4)" });
    return tl;
  }
  spin() {
    const tl = this.jump(.9, .8);
    tl.to(this.root.rotation, { y: `+=${Math.PI * 2}`, duration: .75, ease: "power2.inOut" }, .2);
    return tl;
  }
  wave(n = 3, side = 1) {
    const a = side > 0 ? this.rig.armR : this.rig.armL, base = a.rotation.z;
    const tl = gsap.timeline();
    tl.to(a.rotation, { z: side * 2.55, x: 0, duration: .3, ease: "back.out(2)" });
    for (let i = 0; i < n; i++) tl.to(a.rotation, { z: side * 2.15, duration: .17, yoyo: true, repeat: 1, ease: "sine.inOut" });
    tl.to(a.rotation, { z: base, duration: .4, ease: "power2.inOut" });
    return tl;
  }
  peek() {
    const tl = gsap.timeline();
    tl.to(this.root.rotation, { z: .22, duration: .3, ease: "power2.out" })
      .to(this, { headTilt: .25, duration: .3 }, "<")
      .to(this.body.position, { y: .06, duration: .1, yoyo: true, repeat: 5 })
      .to(this.root.rotation, { z: -.18, duration: .4, ease: "power2.inOut" })
      .to(this.root.rotation, { z: 0, duration: .4, ease: "back.out(2)" })
      .to(this, { headTilt: 0, duration: .4 }, "<");
    return tl;
  }
  dance(n = 4) {
    const tl = gsap.timeline(), x0 = this.root.position.x;
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? -1 : 1;
      tl.to(this.root.position, { x: x0 + s * .14, duration: .22, ease: "sine.inOut" })
        .to(this.body.position, { y: .2, duration: .11, yoyo: true, repeat: 1, ease: "power1.out" }, "<")
        .to(this.squash.rotation, { z: -s * .14, duration: .22 }, "<")
        .to(this.rig.armL.rotation, { z: -1.2 - (s > 0 ? .5 : 0), duration: .22 }, "<")
        .to(this.rig.armR.rotation, { z: 1.2 + (s < 0 ? .5 : 0), duration: .22 }, "<");
    }
    tl.to(this.root.position, { x: x0, duration: .25 })
      .to(this.squash.rotation, { z: 0, duration: .25 }, "<")
      .to(this.rig.armL.rotation, { z: -this.armRest, duration: .3 }, "<")
      .to(this.rig.armR.rotation, { z: this.armRest, duration: .3 }, "<");
    return tl;
  }
  cheer(n = 3) {
    const tl = gsap.timeline();
    tl.to(this.rig.armL.rotation, { z: -2.7, x: 0, duration: .25, ease: "back.out(2)" })
      .to(this.rig.armR.rotation, { z: 2.7, x: 0, duration: .25, ease: "back.out(2)" }, "<");
    for (let i = 0; i < n; i++) tl.add(this.jump(.5, .5));
    tl.to(this.rig.armL.rotation, { z: -this.armRest, duration: .4 })
      .to(this.rig.armR.rotation, { z: this.armRest, duration: .4 }, "<");
    return tl;
  }
  clap(n = 5) {
    const L = this.rig.armL.rotation, R = this.rig.armR.rotation, tl = gsap.timeline();
    tl.to([L, R], { x: -1.25, duration: .25, ease: "power2.out" })
      .to(L, { y: .2, duration: .25 }, "<").to(R, { y: -.2, duration: .25 }, "<");
    for (let i = 0; i < n; i++) tl.to(L, { y: .62, duration: .1, yoyo: true, repeat: 1 }).to(R, { y: -.62, duration: .1, yoyo: true, repeat: 1 }, "<");
    tl.to([L, R], { x: 0, y: 0, duration: .35, ease: "power2.inOut" });
    return tl;
  }
  runIn(fromX, d = 1.8) {
    const x1 = this.root.position.x, dir = Math.sign(x1 - fromX), yaw0 = this.root.rotation.y;
    const tl = gsap.timeline();
    tl.set(this.root.position, { x: fromX }).set(this.root.rotation, { y: dir * Math.PI / 2 })
      .to(this.root.position, { x: x1, duration: d, ease: "none" })
      .to(this.body.position, { y: .22, duration: d / 12, yoyo: true, repeat: 11, ease: "sine.out" }, "<")
      .to(this.rig.armL.rotation, { x: .7, duration: d / 12, yoyo: true, repeat: 11 }, "<")
      .to(this.rig.armR.rotation, { x: -.7, duration: d / 12, yoyo: true, repeat: 11 }, "<")
      .to(this.root.rotation, { y: yaw0, duration: .35, ease: "back.out(2)" })
      .to([this.rig.armL.rotation, this.rig.armR.rotation], { x: 0, duration: .2 }, "<");
    return tl;
  }
  act(name) {
    switch (name) {
      case "jump": return this.jump();
      case "spin": return this.spin();
      case "wave": return this.wave();
      case "peek": return this.peek();
      case "dance": return this.dance();
      case "cheer": return this.cheer();
      case "clap": return this.clap();
      case "heart": this.burstHearts(); return this.jump(.35, .45);
      default: return gsap.timeline();
    }
  }
}

function arm(side, x, y, r, len, mat, handR) {
  const pivot = new THREE.Group(); pivot.position.set(side * x, y, 0); pivot.rotation.order = "YXZ";
  pivot.add(mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat, { pos: [0, -len / 2 - r * .5, 0], line: 1.08 }));
  pivot.add(mesh(S(handR, 16, 12), mat, { pos: [0, -len - r * 1.2, 0], line: 1.08 }));
  return pivot;
}

/* ================= Masha-style girl ================= */
export function createMasha() {
  const c = new Character(); c.phase = 0; c.armRest = .45;
  const skin = toon(0xffc7a2), dress = toon(0xff7a1a), shoe = toon(0x6b3a1e), white = toon(0xfff8ee), hair = toon(0xf0a640), cheek = toon(0xff8fa0);
  const dots = canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = "#ff4f8b"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff";
    for (let y = 0; y < 6; y++) for (let x = 0; x < 12; x++) { g.beginPath(); g.arc(x * 44 + (y % 2) * 22 + 10, y * 44 + 16, 7, 0, 7); g.fill(); }
  });
  dots.wrapS = dots.wrapT = THREE.RepeatWrapping;
  const scarfMat = toon(0xffffff, { map: dots, side: THREE.DoubleSide });
  const P = c.squash;

  for (const s of [-1, 1]) {
    P.add(mesh(new THREE.CylinderGeometry(.075, .08, .38, 12), skin, { pos: [s * .12, .27, 0], line: 1.1 }));
    P.add(mesh(S(.11, 16, 12), shoe, { pos: [s * .12, .07, .04], scale: [1, .6, 1.45], line: 1.08 }));
  }
  P.add(mesh(new THREE.CylinderGeometry(.2, .52, .78, 32), dress, { pos: [0, .82, 0], line: 1.04 }));
  P.add(mesh(new THREE.TorusGeometry(.5, .035, 8, 40), white, { pos: [0, .45, 0], rot: [Math.PI / 2, 0, 0] }));
  P.add(mesh(new THREE.TorusGeometry(.19, .045, 8, 28), white, { pos: [0, 1.2, 0], rot: [Math.PI / 2, 0, 0] }));
  for (const [y, z] of [[1.04, .29], [.88, .335]]) P.add(mesh(S(.03, 10, 8), white, { pos: [0, y, z] }));

  const armL = arm(-1, .22, 1.12, .06, .3, skin, .075), armR = arm(1, .22, 1.12, .06, .3, skin, .075);
  armL.rotation.z = -.45; armR.rotation.z = .45; P.add(armL, armR);

  const head = new THREE.Group(); head.position.y = 1.62; P.add(head);
  head.add(mesh(S(.42, 40, 32), skin, { scale: [1, .95, .95], line: 1.04 }));
  const scarf = mesh(new THREE.SphereGeometry(.452, 48, 24, 0, Math.PI * 2, 0, Math.PI * .56), scarfMat, { rot: [-.6, 0, 0], scale: [1, .97, .97], line: 1.03 });
  head.add(scarf);
  head.add(mesh(new THREE.TorusGeometry(.415, .055, 10, 40, Math.PI), scarfMat, { rot: [-.35, 0, Math.PI] }));
  head.add(mesh(S(.07, 16, 12), toon(0xff4f8b), { pos: [.13, -.37, .2], line: 1.1 }));
  head.add(mesh(new THREE.ConeGeometry(.06, .2, 10), toon(0xff4f8b), { pos: [.2, -.45, .2], rot: [0, 0, .7], line: 1.1 }));
  head.add(mesh(new THREE.ConeGeometry(.06, .2, 10), toon(0xff4f8b), { pos: [.08, -.48, .22], rot: [0, 0, -.4], line: 1.1 }));
  for (const x of [-.14, 0, .14]) head.add(mesh(S(.09, 16, 12), hair, { pos: [x, .2, .345 - Math.abs(x) * .2], scale: [1.3, .55, .6] }));

  const eyes = [], brows = [], hearts = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * .15, .02, .345);
    e.add(mesh(S(.105, 24, 16), white, { scale: [1, 1.2, .45], shadow: false }));
    e.add(mesh(S(.066, 20, 14), toon(0x3a8fd6), { pos: [0, -.01, .035], scale: [1, 1.1, .3], shadow: false }));
    e.add(mesh(S(.038, 16, 12), basic(0x111111), { pos: [0, -.01, .05], scale: [1, 1.1, .3], shadow: false }));
    e.add(mesh(S(.02, 10, 8), basic(0xffffff), { pos: [.025, .03, .058], shadow: false }));
    head.add(e); eyes.push(e);
    const b = mesh(new THREE.CapsuleGeometry(.018, .1, 4, 8), toon(0xb8601e), { pos: [s * .15, .15, .345], rot: [0, 0, Math.PI / 2], shadow: false });
    head.add(b); brows.push(b);
    const h = mesh(heartGeo, heartMat, { pos: [s * .15, .02, .4], shadow: false }); h.visible = false; head.add(h); hearts.push(h);
    head.add(mesh(S(.07, 16, 12), cheek, { pos: [s * .25, -.1, .3], scale: [1, .7, .3], shadow: false }));
  }
  head.add(mesh(S(.035, 12, 10), toon(0xf7b896), { pos: [0, -.06, .39], shadow: false }));
  const mouthOpen = mesh(S(1, 20, 14), basic(0x7a1f2b), { pos: [0, -.2, .33], shadow: false });
  mouthOpen.add(mesh(S(.5, 14, 10), basic(0xff7a8a), { pos: [0, -.35, .3], shadow: false }));
  const smile = mesh(new THREE.TorusGeometry(.07, .014, 8, 20, Math.PI), basic(0x6b2a1a), { pos: [0, -.18, .35], shadow: false });
  head.add(mouthOpen, smile);

  c.rig = { head, headY: 1.62, eyes, brows, browBaseY: .15, hearts, mouthOpen, mouthSize: [.075, .08, .04], smile, armL, armR };
  c.headWorld = new THREE.Vector3(0, 1.9, 0);
  return c;
}

/* ================= Bear ================= */
export function createBear() {
  const c = new Character(); c.phase = 1.7; c.armRest = .25;
  const fur = toon(0x8b5a3c), light = toon(0xd8a679), dark = basic(0x1c110a), white = basic(0xffffff);
  const P = c.squash;
  for (const s of [-1, 1]) P.add(mesh(S(.28, 20, 16), fur, { pos: [s * .32, .22, .1], scale: [1, .8, 1.15], line: 1.05 }));
  P.add(mesh(S(.7, 40, 32), fur, { pos: [0, .95, 0], scale: [1, 1.05, .85], line: 1.03 }));
  P.add(mesh(S(.5, 32, 24), light, { pos: [0, .9, .36], scale: [1, 1.1, .55], shadow: false }));
  const armL = arm(-1, .6, 1.45, .15, .42, fur, .17), armR = arm(1, .6, 1.45, .15, .42, fur, .17);
  armL.rotation.z = -.25; armR.rotation.z = .25; P.add(armL, armR);

  const head = new THREE.Group(); head.position.y = 2.05; P.add(head);
  head.add(mesh(S(.58, 40, 32), fur, { scale: [1.05, .95, .95], line: 1.03 }));
  for (const s of [-1, 1]) {
    head.add(mesh(S(.2, 20, 16), fur, { pos: [s * .42, .42, -.05], line: 1.06 }));
    head.add(mesh(S(.11, 16, 12), light, { pos: [s * .42, .43, .1], scale: [1, 1, .4], shadow: false }));
  }
  head.add(mesh(S(.27, 32, 24), light, { pos: [0, -.15, .42], scale: [1.15, .85, .75], line: 1.04 }));
  head.add(mesh(S(.09, 16, 12), dark, { pos: [0, -.04, .62], scale: [1.3, .85, .8] }));
  head.add(mesh(S(.025, 8, 6), white, { pos: [.03, 0, .69] }));
  const eyes = [], brows = [], hearts = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * .21, .1, .49);
    e.add(mesh(S(.065, 16, 12), dark, { scale: [1, 1.15, .6], shadow: false }));
    e.add(mesh(S(.02, 8, 6), white, { pos: [.02, .025, .035], shadow: false }));
    head.add(e); eyes.push(e);
    const b = mesh(new THREE.CapsuleGeometry(.022, .1, 4, 8), toon(0x4a2a14), { pos: [s * .21, .25, .48], rot: [0, 0, Math.PI / 2], shadow: false });
    head.add(b); brows.push(b);
    const h = mesh(heartGeo, heartMat, { pos: [s * .21, .1, .56], shadow: false }); h.visible = false; head.add(h); hearts.push(h);
  }
  const mouthOpen = mesh(S(1, 20, 14), basic(0x5a1717), { pos: [0, -.26, .6], shadow: false });
  const smile = mesh(new THREE.TorusGeometry(.08, .018, 8, 20, Math.PI), basic(0x2b1a10), { pos: [0, -.22, .64], shadow: false });
  head.add(mouthOpen, smile);
  // party hat
  const hat = new THREE.Group(); hat.position.set(.18, .62, 0); hat.rotation.z = -.3; head.add(hat);
  hat.add(mesh(new THREE.ConeGeometry(.22, .55, 24), toon(0xff5d8f), { pos: [0, .25, 0], line: 1.05 }));
  hat.add(mesh(new THREE.TorusGeometry(.15, .025, 8, 24), toon(0xffffff), { pos: [0, .14, 0], rot: [Math.PI / 2, 0, 0] }));
  hat.add(mesh(S(.08, 14, 10), toon(0xffd33d), { pos: [0, .55, 0], line: 1.08 }));

  c.rig = { head, headY: 2.05, eyes, brows, browBaseY: .25, hearts, mouthOpen, mouthSize: [.09, .085, .04], smile, armL, armR };
  return c;
}
