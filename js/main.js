import * as THREE from "three";
import { createMasha, createBear, EXPR } from "./characters.js";
import { buildWorld } from "./world.js";

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
const C = window.CONTENT;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   3D STAGE
   ========================================================= */
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $("#stage3d"), antialias: true, powerPreference: "high-performance" });
} catch (e) { document.body.classList.add("no3d"); }

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 220);
let world, masha, bear;
const cam = { pos: new THREE.Vector3(0, 20, 28), look: new THREE.Vector3(0, 2, 0) };
const cur = { pos: cam.pos.clone(), look: cam.look.clone() };
let mode = "intro", storyP = 0, lastShot = "sky", speaker = null;

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.75 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  world = buildWorld(scene);
  masha = createMasha(); masha.root.position.set(-.9, 0, .35); masha.root.rotation.y = .3; scene.add(masha.root);
  bear = createBear(); bear.root.position.set(1.0, 0, -.05); bear.root.rotation.y = -.3; scene.add(bear.root);
  addEventListener("resize", onResize);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
  if (mode !== "story") goShot(lastShot, .01);
}

// Camera framings. Phones are tall and narrow, so pull back for them.
function shot(name) {
  const a = camera.aspect, far = a < .6 ? 1.65 : a < .8 ? 1.4 : a < 1.1 ? 1.15 : 1, near = a < .8 ? 1.18 : 1;
  const m = masha.root.position, b = bear.root.position, V = (x, y, z) => new THREE.Vector3(x, y, z);
  switch (name) {
    case "sky":    return { pos: V(0, 20, 28), look: V(0, 2, 0) };
    case "wide":   return { pos: V(.2, 2.3, 6.1 * far), look: V(.05, 1.3, 0) };
    case "masha":  return { pos: V(m.x + .35, 1.55, m.z + 2.9 * near), look: V(m.x + .02, 1.08, m.z) };
    case "bear":   return { pos: V(b.x - .3, 2.0, b.z + 3.5 * (a < .8 ? 1.32 : 1)), look: V(b.x, 1.62, b.z) };
    case "cake":   return { pos: V(-.55, 1.8, 4.2 * near), look: V(-.5, 1.05, .45) };
    case "finale": return { pos: V(0, 2.05, .75 + 3.3 * far), look: V(0, 1.15, .4) };
  }
}
function goShot(name, d = 1.4, ease = "power2.inOut") {
  if (!renderer) return Promise.resolve();
  lastShot = name;
  const s = shot(name);
  return Promise.all([
    gsap.to(cam.pos, { x: s.pos.x, y: s.pos.y, z: s.pos.z, duration: d, ease, overwrite: true }),
    gsap.to(cam.look, { x: s.look.x, y: s.look.y, z: s.look.z, duration: d, ease, overwrite: true })
  ]);
}
function storyTarget(p) {
  return {
    pos: new THREE.Vector3(Math.sin(p * Math.PI * 1.5) * 2.6, 5.5 + p * 36, 9 - p * 2),
    look: new THREE.Vector3(Math.sin(p * Math.PI * 1.5 + .6) * 1.2, 9 + p * 38, -3)
  };
}

const clock = new THREE.Clock(), tmpV = new THREE.Vector3();
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener("pointermove", e => { pointer.x = e.clientX / innerWidth - .5; pointer.y = e.clientY / innerHeight - .5; }, { passive: true });

// Adaptive quality: if the phone can't hold ~40fps, drop resolution, then shadows.
const perf = { n: 0, acc: 0, level: 0 };
function adapt(dt) {
  perf.n++; perf.acc += dt;
  if (perf.n < 90) return;
  const fps = perf.n / perf.acc; perf.n = perf.acc = 0;
  if (fps < 40 && perf.level === 0) { perf.level = 1; renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight, false); }
  else if (fps < 34 && perf.level === 1) { perf.level = 2; renderer.shadowMap.enabled = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); }
}

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  if (!document.querySelector("#gate") || document.querySelector("#gate").style.display === "none") adapt(dt);
  world.update(t, dt);
  for (const c of [masha, bear]) {
    const r = c.root.position, yaw = Math.atan2(camera.position.x - r.x, camera.position.z - r.z) - c.root.rotation.y;
    c.lookYaw = clamp(yaw, -.6, .6);
    c.update(t, dt);
  }
  const tgt = mode === "story" ? storyTarget(storyP) : cam;
  const k = 1 - Math.exp(-dt * (mode === "story" ? 2.4 : 7));
  cur.pos.lerp(tgt.pos, k); cur.look.lerp(tgt.look, k);
  pointer.sx += (pointer.x - pointer.sx) * .05; pointer.sy += (pointer.y - pointer.sy) * .05;
  camera.position.copy(cur.pos);
  camera.position.x += Math.sin(t * .5) * .04 + pointer.sx * .35;
  camera.position.y += Math.sin(t * .37) * .03 - pointer.sy * .2;
  camera.lookAt(cur.look);
  renderer.render(scene, camera);
  if (speaker) placeTail(speaker);
}

// keep the speech-bubble tail pointing at whoever is talking
function placeTail(c) {
  const bubble = $("#bubble"); if (bubble.hidden) return;
  c.rig.head.getWorldPosition(tmpV); tmpV.project(camera);
  const x = (tmpV.x + 1) / 2 * innerWidth, r = bubble.getBoundingClientRect();
  bubble.style.setProperty("--tail", clamp(x - r.left, 34, r.width - 34) + "px");
}

// Small portrait "stickers" of the 3D Masha / Bear for the story chapters.
const avatars = {};
function renderAvatars() {
  if (!renderer) return;
  let r;
  try { r = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); } catch (e) { return; }
  r.setPixelRatio(1); r.setSize(200, 200, false);
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xffffff, 0x9a7a5a, 2.3));
  const dl = new THREE.DirectionalLight(0xffffff, 1.8); dl.position.set(2, 3, 4); sc.add(dl);
  const c2 = new THREE.PerspectiveCamera(30, 1, .1, 30);
  const shoot = (ch, names, pos, look, key) => {
    const parent = ch.root.parent, p0 = ch.root.position.clone(), ry = ch.root.rotation.y;
    sc.add(ch.root); ch.root.position.set(0, 0, 0); ch.root.rotation.y = .25;
    c2.position.set(...pos); c2.lookAt(...look);
    for (const n of names) {
      Object.assign(ch.face, EXPR[n]); ch.blink = 1; ch.dt = 0; ch.nextBlink = 99; ch.applyFace(0);
      r.render(sc, c2); avatars[key + n] = r.domElement.toDataURL("image/png");
    }
    parent.add(ch.root); ch.root.position.copy(p0); ch.root.rotation.y = ry;
    Object.assign(ch.face, EXPR.neutral); ch.nextBlink = 2;
  };
  shoot(masha, ["naughty", "love", "surprised", "happy"], [.3, 1.72, 3.1], [0, 1.52, 0], "m-");
  shoot(bear, ["happy"], [-.3, 2.0, 4.6], [0, 1.85, 0], "b-");
  r.dispose(); r.forceContextLoss();
}

/* =========================================================
   MUSIC + VOICE
   ========================================================= */
const music = { mode: null, on: true, yt: null };
const songAudio = $("#songAudio"), voiceEl = $("#voice");
async function initMusic() {
  try {
    const r = await fetch(C.music.local, { method: "HEAD" });
    if (r.ok) { music.mode = "local"; songAudio.src = C.music.local; songAudio.volume = .55; songAudio.play().catch(() => {}); return; }
  } catch (e) {}
  music.mode = "yt"; $("#ytSlot").classList.add("on");
  window.onYouTubeIframeAPIReady = () => {
    music.yt = new YT.Player("ytPlayer", {
      width: 200, height: 113, videoId: C.music.youtubeId,
      playerVars: { playsinline: 1, controls: 0, loop: 1, playlist: C.music.youtubeId, rel: 0 },
      events: { onReady: e => { e.target.setVolume(55); if (music.on) e.target.playVideo(); } }
    });
  };
  const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
}
function musicVol(v) {
  if (music.mode === "local") songAudio.volume = v / 100;
  else if (music.yt && music.yt.setVolume) music.yt.setVolume(v);
}
function setMusic(on) {
  music.on = on;
  $("#musicBtn").classList.toggle("off", !on);
  $$(".vinyl").forEach(v => v.classList.toggle("paused", !on));
  const b = $("#songToggle"); if (b) b.textContent = on ? "Pause ❚❚" : "Play ▶";
  if (music.mode === "local") on ? songAudio.play().catch(() => {}) : songAudio.pause();
  else if (music.yt && music.yt.playVideo) on ? music.yt.playVideo() : music.yt.pauseVideo();
}
$("#musicBtn").addEventListener("click", () => setMusic(!music.on));

function playVoice(src) {
  return new Promise(res => {
    if (!src) return res(false);
    voiceEl.onended = () => res(true);
    voiceEl.onerror = () => res(false);
    voiceEl.src = src;
    voiceEl.play().catch(() => res(false));
  });
}
function typeText(el, text, speed = 26) {
  const chars = Array.from(text); let i = 0; el.textContent = "";
  const id = setInterval(() => { el.textContent = chars.slice(0, ++i).join(""); if (i >= chars.length) clearInterval(id); }, speed);
  return () => { clearInterval(id); el.textContent = text; };
}

/* =========================================================
   INTRO
   ========================================================= */
let skipped = false, skipResolve = null;
const skipP = new Promise(r => (skipResolve = r));

async function say(line, bubble = $("#bubble"), textEl = $("#bubbleText")) {
  if (skipped && bubble.id === "bubble") return;
  const ch = line.who === "bear" ? bear : masha, other = ch === masha ? bear : masha;
  if (renderer) {
    if (line.shot) goShot(line.shot, 1.3);
    ch.setExpr(line.expr || "happy"); other.setExpr(other === bear ? "happy" : "neutral");
    ch.talking = true; speaker = ch;
    if (line.action) gsap.delayedCall(.35, () => ch.act(line.action));
  }
  const who = bubble.querySelector(".who");
  if (who) who.textContent = line.who === "bear" ? "Bear" : "Masha";
  bubble.classList.toggle("bear", line.who === "bear");
  if (bubble.hidden) { bubble.hidden = false; gsap.fromTo(bubble, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: "back.out(2.2)" }); }
  else gsap.fromTo(bubble, { scale: .96 }, { scale: 1, duration: .3, ease: "back.out(3)" });
  const finish = typeText(textEl, line.text);
  let tapResolve; const tapP = new Promise(r => (tapResolve = r));
  const onTap = () => tapResolve("tap"); bubble.addEventListener("click", onTap);
  musicVol(22);
  const vp = playVoice(line.audio).then(ok => (ok ? "done" : "none"));
  const r = await Promise.race([vp, tapP, skipP]);
  if (r === "none") await Promise.race([sleep(Math.max(3200, line.text.length * 62)), tapP, skipP]);
  voiceEl.pause(); finish(); musicVol(55);
  bubble.removeEventListener("click", onTap);
  if (renderer) ch.talking = false;
  await sleep(200);
}

function splitTitle() {
  $("#titleName").textContent = C.name;
  $$("#title .t1, #title .t2").forEach(el => {
    el.innerHTML = Array.from(el.textContent).map(c => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });
}

async function runIntro() {
  $("#hud").hidden = false; splitTitle();
  gsap.set("#title .ch", { y: -140, opacity: 0, rotation: () => gsap.utils.random(-40, 40) });
  if (renderer) {
    masha.setExpr("happy"); bear.setExpr("happy");
    masha.root.visible = false;
    goShot("wide", reduced ? .1 : 4.4, "power3.inOut");
    gsap.delayedCall(2.0, () => bear.wave(3));
    gsap.delayedCall(2.7, () => { masha.root.visible = true; masha.runIn(-5.5, 1.6); });
  }
  gsap.to("#title .ch", { y: 0, opacity: 1, rotation: 0, duration: 1.1, ease: "bounce.out", stagger: .045, delay: 1.1 });
  gsap.to("#title .t2 .ch", { y: -12, duration: .5, ease: "sine.inOut", stagger: { each: .08, repeat: -1, yoyo: true }, delay: 3.2 });
  await Promise.race([sleep(4800), skipP]);
  if (renderer && !skipped) { masha.jump(.7); masha.setExpr("surprised"); }
  await Promise.race([sleep(600), skipP]);
  gsap.to("#title", { y: -30, opacity: 0, duration: .5 });
  for (const line of C.intro) { if (skipped) break; await say(line); }
  endIntro();
}

let introDone = false;
function endIntro() {
  if (introDone) return; introDone = true;
  speaker = null; voiceEl.pause();
  if (renderer) { masha.talking = bear.talking = false; masha.root.visible = true; masha.setExpr("love"); bear.setExpr("happy"); masha.burstHearts(5); }
  gsap.to("#bubble", { scale: .8, opacity: 0, duration: .25, onComplete: () => ($("#bubble").hidden = true) });
  goShot("wide", 1.6);
  gsap.to("#title", { y: 0, opacity: 1, duration: .7, ease: "back.out(2)" });
  $("#skip").hidden = true; $("#scrollHint").hidden = false;
  gsap.from("#scrollHint", { y: 30, opacity: 0, duration: .6 });
  document.body.classList.remove("locked");
  ScrollTrigger.refresh();
}
$("#skip").addEventListener("click", () => {
  skipped = true; skipResolve("skip");
  if (renderer) { gsap.killTweensOf([masha.root.position, masha.root.rotation, masha.body.position]); masha.root.position.set(-.9, 0, .35); masha.root.rotation.y = .3; masha.body.position.y = 0; }
  gsap.set("#title .ch", { y: 0, opacity: 1, rotation: 0 });
  endIntro();
});

/* =========================================================
   STORY
   ========================================================= */
const st = (el, start = "top 82%") => ({ trigger: el, start, toggleActions: "play none none reverse" });

function buildChapters() {
  const host = $("#chapters");
  C.chapters.forEach((ch, i) => {
    const el = document.createElement("article"); el.className = "ep";
    const title = ch.title.split(" ").map(w => `<span class="w"><span>${w}</span></span>`).join(" ");
    let media = "";
    if (ch.video) media = `<video src="${ch.video}" poster="${ch.video.replace("vid/", "img/poster-").replace(".mp4", ".jpg")}" muted loop playsinline preload="metadata"></video>`;
    else if (ch.photo) media = `<img src="${ch.photo}" alt="" loading="lazy">`;
    const chat = ch.chat ? `<div class="chat">${ch.chat.map(m => `<span data-t="${m.replace(/"/g, "&quot;")}"></span>`).join("")}</div>` : "";
    const av = avatars["m-" + (ch.mashaExpr || "naughty")];
    el.innerHTML = `<div class="ep-num">${ch.ep}</div>
      <div class="ep-card">
        <span class="ep-label">Episode ${ch.ep}</span>
        <h3 class="ep-title">${title}</h3>
        <div class="ep-date">${ch.date}</div>
        ${chat}${media ? `<div class="frame"><div class="frame-in">${media}</div></div>` : ""}
        <p class="ep-text">${ch.text}</p>
        <div class="masha-says">${av ? `<img src="${av}" alt="">` : ""}<div class="say">${ch.masha}</div></div>
      </div>`;
    host.appendChild(el);

    const tl = gsap.timeline({ scrollTrigger: st(el, "top 78%") });
    tl.from($(".ep-num", el), { scale: 1.8, opacity: 0, rotation: -12, duration: 1, ease: "power3.out" })
      .from($(".ep-card", el), { y: 90, opacity: 0, rotationX: 14, transformPerspective: 900, duration: 1, ease: "power3.out" }, "<.1")
      .from($$(".ep-title .w>span", el), { yPercent: 115, duration: .7, ease: "back.out(1.8)", stagger: .07 }, "<.35")
      .from($(".ep-date", el), { x: -20, opacity: 0, duration: .5 }, "<.2");
    const f = $(".frame-in", el);
    if (f) gsap.from(f, { rotationX: 55, rotationY: i % 2 ? 18 : -18, z: -160, y: 60, opacity: 0, transformPerspective: 900, duration: 1.3, ease: "power3.out", scrollTrigger: st(f, "top 88%") });
    gsap.from($(".ep-text", el), { y: 30, opacity: 0, duration: .8, ease: "power2.out", scrollTrigger: st($(".ep-text", el), "top 90%") });
    const ms = $(".masha-says", el);
    const mtl = gsap.timeline({ scrollTrigger: st(ms, "top 92%") });
    if ($("img", ms)) mtl.from($("img", ms), { scale: 0, rotation: -40, y: 30, duration: .6, ease: "back.out(2.5)" });
    mtl.from($(".say", ms), { scale: 0, opacity: 0, duration: .5, ease: "back.out(2.2)" }, "<.2");
    if (f) tilt(f);
    if (ch.chat) chatAnim($(".chat", el));
  });
  // play videos only while on screen
  const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }), { threshold: .35 });
  $$("#chapters video").forEach(v => io.observe(v));
}

function tilt(el) {
  const rx = gsap.quickTo(el, "rotationX", { duration: .5 }), ry = gsap.quickTo(el, "rotationY", { duration: .5 });
  el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 16); rx(-((e.clientY - r.top) / r.height - .5) * 16); });
  el.addEventListener("pointerleave", () => { rx(0); ry(0); });
}

function chatAnim(box) {
  const items = $$("span", box); items.forEach(s => (s.style.visibility = "hidden"));
  ScrollTrigger.create({ trigger: box, start: "top 80%", once: true, onEnter: async () => {
    for (const s of items) {
      s.style.visibility = "visible"; s.innerHTML = `<span class="typing"><b></b><b></b><b></b></span>`;
      gsap.from(s, { scale: .5, opacity: 0, duration: .35, ease: "back.out(2)", transformOrigin: s.matches(":nth-child(even)") ? "100% 100%" : "0 100%" });
      await sleep(650); s.textContent = s.dataset.t; await sleep(350);
    }
  } });
}

function buildDrama() {
  const d = C.drama, el = $("#drama");
  el.innerHTML = `<div class="poster"><span class="ptag">Our K-drama</span><h3>${d.title}</h3><p>${d.tagline}</p>
    <div class="star">${d.starring}</div><div class="also">Also on our list: ${d.also.join(", ")}</div></div>`;
  const p = $(".poster", el);
  for (let i = 0; i < 7; i++) {
    const f = document.createElement("i"); f.className = "fruit"; f.style.left = `${8 + i * 13}%`; p.prepend(f);
    gsap.to(f, { y: 560, rotation: gsap.utils.random(-200, 200), duration: gsap.utils.random(3.5, 6), repeat: -1, delay: i * .7, ease: "none" });
  }
  gsap.from(p, { rotationY: -28, scale: .88, opacity: 0, transformPerspective: 1000, duration: 1.2, ease: "power3.out", scrollTrigger: st(p) });
  gsap.from($$("h3, p, .star, .also", p), { y: 30, opacity: 0, stagger: .12, duration: .7, scrollTrigger: st(p, "top 70%") });
}

function buildSong() {
  $("#song").innerHTML = `<div class="panel"><div class="vinyl-row"><div class="vinyl"></div><div>
    <div class="kicker">Our song</div><h3>${C.music.title}</h3><p class="small">${C.song.line}. ${C.song.note}</p>
    <button class="btn" id="songToggle">Pause ❚❚</button></div></div><div class="yt-slot" id="ytSlot"></div></div>`;
  $("#ytSlot").appendChild($("#ytPlayer"));
  $("#songToggle").addEventListener("click", () => setMusic(!music.on));
  gsap.from("#song .vinyl", { x: -160, rotation: -360, opacity: 0, duration: 1.4, ease: "power3.out", scrollTrigger: st("#song") });
  gsap.from("#song .panel", { y: 60, opacity: 0, duration: .9, scrollTrigger: st("#song") });
}

function buildGallery() {
  const imgs = C.gallery, n = imgs.length, R = Math.round(78 / Math.tan(Math.PI / n)) + 18;
  $("#gallery").innerHTML = `<div class="kicker">Our moments</div><h2>Drag to spin 🎠</h2><div class="ring-stage"><div class="ring">${imgs.map((s, i) => `<figure style="transform:rotateY(${i * 360 / n}deg) translateZ(${R}px)"><img src="${s}" alt="" loading="lazy"></figure>`).join("")}</div></div>`;
  const ring = $("#gallery .ring"), stage = $("#gallery .ring-stage"), rot = { s: 0, d: 0 };
  const apply = () => gsap.set(ring, { rotationY: rot.s + rot.d, rotationX: -8 });
  apply();
  ScrollTrigger.create({ trigger: "#gallery", start: "top bottom", end: "bottom top", onUpdate: s => { rot.s = -s.progress * 300; apply(); } });
  let down = false, lx = 0, v = 0;
  stage.addEventListener("pointerdown", e => { down = true; lx = e.clientX; v = 0; gsap.killTweensOf(rot); });
  addEventListener("pointermove", e => { if (!down) return; v = (e.clientX - lx) * .5; rot.d += v; lx = e.clientX; apply(); });
  addEventListener("pointerup", () => { if (!down) return; down = false; gsap.to(rot, { d: rot.d + v * 14, duration: 1.4, ease: "power3.out", onUpdate: apply }); });
  gsap.from("#gallery .ring-stage", { scale: .5, opacity: 0, duration: 1.2, ease: "back.out(1.6)", scrollTrigger: st("#gallery") });
}

function buildBear() {
  const b = C.bear, av = avatars["b-happy"];
  $("#bearBlock").innerHTML = `<div class="panel"><div class="kicker">Meanwhile, in the forest</div>
    ${av ? `<img src="${av}" alt="" style="width:120px;height:120px;margin:0 auto .2rem" class="bear-av">` : ""}
    <h2>${b.title}</h2><p>${b.text}</p><div class="polaroids">${b.photos.map(p => `<img src="${p}" alt="" loading="lazy">`).join("")}</div></div>`;
  const ps = $$("#bearBlock .polaroids img");
  const tl = gsap.timeline({ scrollTrigger: st("#bearBlock .polaroids", "top 85%") });
  tl.from(ps, { y: 80, opacity: 0, rotation: 0, duration: .6, stagger: .1 })
    .to(ps[0], { x: "-38%", rotation: -9, duration: .8, ease: "back.out(2)" })
    .to(ps[1], { x: "38%", rotation: 8, duration: .8, ease: "back.out(2)" }, "<");
  if (av) gsap.from(".bear-av", { scale: 0, rotation: 30, duration: .7, ease: "back.out(2.5)", scrollTrigger: st("#bearBlock") });
}

function buildCounter() {
  $("#counter").innerHTML = `<div class="panel"><div class="kicker">Together since 11 January 2025</div><h2>Every second counts</h2>
    <div class="clock"><div><b id="cD">0</b><span>days</span></div><div><b id="cH">0</b><span>hours</span></div><div><b id="cM">0</b><span>minutes</span></div><div><b id="cS">0</b><span>seconds</span></div></div>
    <p class="small">...and still counting. 🍊</p></div>`;
  const t0 = new Date(C.together).getTime(), parts = () => { const d = Math.max(0, Date.now() - t0) / 1000; return [Math.floor(d / 86400), Math.floor(d % 86400 / 3600), Math.floor(d % 3600 / 60), Math.floor(d % 60)]; };
  const ids = ["#cD", "#cH", "#cM", "#cS"]; let live = false;
  const tick = () => { if (!live) return; parts().forEach((v, i) => ($(ids[i]).textContent = v)); };
  setInterval(tick, 1000);
  ScrollTrigger.create({ trigger: "#counter", start: "top 80%", once: true, onEnter: () => {
    gsap.from("#counter .clock div", { rotationX: -100, opacity: 0, transformPerspective: 600, duration: .8, stagger: .12, ease: "back.out(1.7)" });
    const p = parts(), o = { d: 0, h: 0, m: 0, s: 0 };
    gsap.to(o, { d: p[0], h: p[1], m: p[2], s: p[3], duration: 2.2, ease: "power3.out", onUpdate: () => { $("#cD").textContent = Math.round(o.d); $("#cH").textContent = Math.round(o.h); $("#cM").textContent = Math.round(o.m); $("#cS").textContent = Math.round(o.s); }, onComplete: () => (live = true) });
  } });
}

function buildQuiz() {
  $("#quiz").innerHTML = `<div class="panel qcard"><div class="kicker">Mini game</div><h2>How well do you know us?</h2><div class="qinner" id="qinner"></div></div>`;
  const box = $("#qinner"); let i = 0, mistakes = 0;
  const jokes = ["Hehe, Masha says nope!", "Aiyo, Bear is disappointed 🐻", "Close... not close. Try again!", "Masha is laughing. Try again!"];
  const dots = () => `<div class="progress">${C.quiz.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</div>`;
  const render = () => {
    if (i >= C.quiz.length) {
      const av = avatars["m-love"];
      box.innerHTML = `${av ? `<img src="${av}" alt="" style="width:130px;height:130px;margin:0 auto">` : ""}<p class="q">${mistakes === 0 ? "Perfect score! You know us by heart. 🍊" : "You got there in the end, and that's what matters. 🍊"}</p>`;
      const r = box.getBoundingClientRect(); confetti(160, r.left + r.width / 2, r.top + 60);
      return;
    }
    const q = C.quiz[i];
    box.innerHTML = `${dots()}<p class="q">${q.q}</p>${q.options.map((o, k) => `<button class="opt" data-k="${k}">${o}</button>`).join("")}<p class="fb" id="fb"></p>`;
    gsap.from($$(".opt", box), { x: -30, opacity: 0, stagger: .07, duration: .4 });
    $$(".opt", box).forEach(b => b.addEventListener("click", async () => {
      if (+b.dataset.k === q.answer) {
        b.classList.add("right"); $("#fb").textContent = "Yes! 🍊";
        $$(".opt", box).forEach(x => (x.disabled = true));
        const r = b.getBoundingClientRect(); confetti(50, r.left + r.width / 2, r.top);
        await sleep(900);
        await gsap.to(box, { rotationY: 90, opacity: .2, transformPerspective: 900, duration: .28, ease: "power2.in" });
        i++; render();
        gsap.fromTo(box, { rotationY: -90, opacity: .2 }, { rotationY: 0, opacity: 1, duration: .45, ease: "back.out(1.6)" });
      } else {
        mistakes++; b.classList.add("wrong"); b.disabled = true;
        gsap.fromTo(b, { x: -8 }, { x: 0, duration: .5, ease: "elastic.out(1,.3)" });
        $("#fb").textContent = jokes[Math.floor(Math.random() * jokes.length)];
      }
    }));
  };
  render();
  gsap.from("#quiz .panel", { y: 70, opacity: 0, rotationX: 20, transformPerspective: 900, duration: 1, scrollTrigger: st("#quiz") });
}

function buildLetter() {
  $("#letter").innerHTML = `<div class="kicker">You've got mail</div><h2>A letter for you</h2>
    <div class="env-wrap"><div class="envelope"><div class="env-back"></div><div class="env-paper">For Aashu 💌</div><div class="env-front"></div><div class="env-flap"></div><div class="env-seal">♥</div></div></div>
    <div class="paper" hidden><div id="letterText"></div></div>`;
  let done = false;
  ScrollTrigger.create({ trigger: "#letter .env-wrap", start: "top 70%", once: true, onEnter: () => {
    if (done) return; done = true;
    const tl = gsap.timeline();
    tl.from("#letter .envelope", { y: 80, rotation: -8, opacity: 0, duration: .8, ease: "back.out(1.6)" })
      .to("#letter .env-seal", { scale: 0, rotation: 180, duration: .35, ease: "back.in(2)" }, "+=.3")
      .to("#letter .env-flap", { rotationX: 180, duration: .8, ease: "power2.inOut" })
      .set("#letter .env-flap", { zIndex: 0 })
      .to("#letter .env-paper", { y: -130, duration: .9, ease: "power2.out" })
      .to("#letter .env-wrap", { height: 0, opacity: 0, duration: .6, ease: "power2.in" }, "+=.3")
      .add(() => { $("#letter .paper").hidden = false; ScrollTrigger.refresh(); })
      .from("#letter .paper", { y: 60, scale: .85, opacity: 0, duration: .8, ease: "back.out(1.4)" })
      .add(typeLetter);
  } });
}
async function typeLetter() {
  const host = $("#letterText");
  for (const line of C.letter) {
    const p = document.createElement("p"); host.appendChild(p);
    const caret = document.createElement("span"); caret.className = "caret";
    for (const ch of Array.from(line)) { p.textContent += ch; p.appendChild(caret); await sleep(".,!?".includes(ch) ? 230 : 34); }
    caret.remove(); await sleep(450);
  }
}

/* =========================================================
   FINALE
   ========================================================= */
function setMode(m) {
  if (m === mode) return;
  const prev = mode; mode = m;
  if (!renderer) return;
  if (m === "story") { cam.pos.copy(cur.pos); cam.look.copy(cur.look); }
  if (m === "finale") {
    goShot("finale", 2.4, "power3.inOut");
    masha.setExpr("happy"); bear.setExpr("happy");
    gsap.delayedCall(1.6, () => { masha.dance(4); bear.wave(2); });
  }
  if (m === "intro" && prev === "story") goShot("wide", 1.8);
}

function buildFinale() {
  $("#wish").textContent = C.finale.wish;
  const blowBtn = $("#blowBtn"), tapBtn = $("#tapBlow");
  let out = false;
  ScrollTrigger.create({ trigger: "#finale", start: "top 20%", onEnter: () => setMode("finale"), onLeaveBack: () => setMode("story") });
  gsap.from("#wish", { y: -40, opacity: 0, duration: .9, ease: "back.out(2)", scrollTrigger: st("#finale", "top 30%") });

  const extinguish = async () => {
    if (out) return; out = true;
    blowBtn.hidden = tapBtn.hidden = true; $("#blowHint").hidden = true;
    if (renderer) {
      world.flameOn = false;
      gsap.to(world.flame.scale, { x: .01, y: .01, z: .01, duration: .35, ease: "power2.in" });
      gsap.to(world.candleLight, { intensity: 0, duration: .5 });
      world.smoke();
      const cols = [0xff5d8f, 0xffd33d, 0x6ec6ff, 0xff8a1f, 0xb48cff, 0x6cc26c];
      for (let i = 0; i < 12; i++) gsap.delayedCall(.5 + i * .35, () => world.firework(new THREE.Vector3(gsap.utils.random(-2.6, 2.6), gsap.utils.random(2.6, 4.2), gsap.utils.random(-2.5, -1.2)), cols[i % cols.length]));
      gsap.delayedCall(.4, () => { masha.setExpr("love"); masha.burstHearts(10); masha.cheer(3); bear.clap(6); });
    }
    confetti(240, innerWidth / 2, innerHeight * .55); gsap.delayedCall(.7, () => confetti(160, innerWidth / 2, innerHeight * .45));
    await sleep(1600);
    const fl = C.finale.after; if (fl) await say({ ...fl, shot: null, action: "spin" }, $("#finaleBubble"), $("#finaleText"));
    const s = $("#surprise"); s.textContent = C.finale.surprise; s.hidden = false;
    gsap.from(s, { y: 30, opacity: 0, scale: .8, duration: .9, ease: "back.out(2)" });
    $("#songCredit").textContent = `♪ ${C.music.title}`; $("#songCredit").hidden = false;
  };
  tapBtn.addEventListener("click", extinguish);
  blowBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 1024;
      ac.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize); blowBtn.textContent = "Now blow… 💨";
      let base = 0, n = 0, hot = 0; const t0 = performance.now();
      const poll = () => {
        if (out) { stream.getTracks().forEach(t => t.stop()); ac.close(); return; }
        an.getByteTimeDomainData(buf); let sum = 0; for (const v of buf) sum += ((v - 128) / 128) ** 2; const rms = Math.sqrt(sum / buf.length);
        if (performance.now() - t0 < 700) { base = (base * n + rms) / (n + 1); n++; }
        else {
          hot = rms > Math.max(.12, base * 3.5) ? hot + 1 : Math.max(0, hot - 1);
          if (renderer && world.flameOn) world.flame.rotation.z = clamp(rms * 4, 0, .9);   // flame bends as she blows
          if (hot > 16) return extinguish();
        }
        requestAnimationFrame(poll);
      };
      poll();
    } catch (e) { blowBtn.hidden = true; }
  });
}

/* =========================================================
   CONFETTI (2D overlay)
   ========================================================= */
const cv = $("#confetti"), cx = cv.getContext("2d"); let parts = [], raf = 0;
const fit = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
addEventListener("resize", fit); fit();
function confetti(n = 160, x = innerWidth / 2, y = innerHeight * .6) {
  const cols = ["#ff8a1f", "#ff5d8f", "#ffd33d", "#6cc26c", "#6ec6ff", "#ffffff"], d = devicePixelRatio;
  for (let i = 0; i < n; i++) parts.push({ x: x * d, y: y * d, vx: (Math.random() - .5) * 22 * d, vy: (-Math.random() * 18 - 5) * d, s: (6 + Math.random() * 8) * d, c: cols[i % cols.length], r: Math.random() * 6, vr: (Math.random() - .5) * .4, round: Math.random() < .3 });
  if (!raf) loop();
}
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  for (const p of parts) {
    p.vy += .5 * devicePixelRatio; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
    if (p.round) { cx.beginPath(); cx.arc(0, 0, p.s / 3, 0, 7); cx.fill(); } else cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
    cx.restore();
  }
  parts = parts.filter(p => p.y < cv.height + 40);
  raf = parts.length ? requestAnimationFrame(loop) : 0;
}

/* =========================================================
   BOOT
   ========================================================= */
function buildStory() {
  buildChapters(); buildDrama(); buildSong(); buildGallery(); buildBear(); buildCounter(); buildQuiz(); buildLetter(); buildFinale();
  ScrollTrigger.create({ trigger: "#chapters", start: "top bottom", endTrigger: "#finale", end: "top bottom",
    onUpdate: s => (storyP = s.progress), onEnter: () => setMode("story"), onLeaveBack: () => setMode("intro") });
  gsap.to("#hud", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: ".intro-space", start: "top top", end: "60% top", scrub: true } });
}

async function openGift() {
  const tl = gsap.timeline();
  tl.to("#gift", { scale: 1.12, duration: .15, ease: "power2.out" })
    .to("#gift .lid", { y: -220, x: 40, rotation: 35, opacity: 0, duration: .7, ease: "power2.out" })
    .to("#flash", { opacity: 1, duration: .25 }, "-=.35")
    .set("#gate", { display: "none" })
    .to("#flash", { opacity: 0, duration: .9, ease: "power2.out" });
  await sleep(700);
  $("#musicBtn").hidden = false;
  initMusic();
  runIntro();
}

$("#gateTitle").textContent = `${C.name}, this is for you`;
if (C.password) $("#pw").hidden = false;
const openBtn = $("#openBtn"); openBtn.disabled = true;

(async function boot() {
  await document.fonts.ready.catch(() => {});
  if (renderer) {
    renderAvatars();
    const s = shot("sky"); cam.pos.copy(s.pos); cam.look.copy(s.look); cur.pos.copy(s.pos); cur.look.copy(s.look);
    renderer.compile(scene, camera);
    frame();
  }
  buildStory();
  $("#loading").hidden = true; openBtn.disabled = false;
  openBtn.addEventListener("click", () => {
    if (C.password && $("#pw").value.trim().toLowerCase() !== C.password.toLowerCase()) { $("#pwErr").hidden = false; gsap.fromTo("#pw", { x: -8 }, { x: 0, duration: .5, ease: "elastic.out(1,.3)" }); return; }
    openGift();
  });
  window.__site = { skip: () => $("#skip").click(), confetti, setMode, world, masha, bear };
})();
