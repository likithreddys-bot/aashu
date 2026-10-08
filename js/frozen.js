(() => {
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
const C = window.CONTENT;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const DPR = Math.min(devicePixelRatio || 1, 2);

/* ---------- art (falls back to the hero if a file is missing) ---------- */
function setArt(img, src) {
  img.onerror = () => { img.onerror = null; img.src = C.art.hero; };
  img.src = src;
}
setArt($("#heroImg"), C.art.hero);
setArt($("#palaceImg"), C.art.palace);
setArt($("#coupleImg"), C.art.couple);
setArt($("#ballroomImg"), C.art.ballroom);

/* ---------- snow (3 depth layers) ---------- */
const sc = $("#snow"), sx = sc.getContext("2d");
let flakes = [];
function sizeCanvas(c) { c.width = innerWidth * DPR; c.height = innerHeight * DPR; }
function seedSnow() {
  sizeCanvas(sc);
  const n = Math.round(Math.min(220, innerWidth * innerHeight / 5200));
  flakes = Array.from({ length: n }, () => {
    const z = Math.random();
    return { x: Math.random() * sc.width, y: Math.random() * sc.height, r: (.6 + z * 2.4) * DPR, v: (.25 + z * 1.1) * DPR, w: rand(0, 6.28), a: .35 + z * .6 };
  });
}
let wind = 0, boost = 0;
function snowLoop(t) {
  sx.clearRect(0, 0, sc.width, sc.height);
  wind += (Math.sin(t / 4000) * .6 - wind) * .01;
  for (const f of flakes) {
    f.y += f.v * (1 + boost); f.x += (Math.sin(t / 1200 + f.w) * .4 + wind) * DPR * (1 + boost * .5);
    if (f.y > sc.height + 5) { f.y = -5; f.x = Math.random() * sc.width; }
    if (f.x > sc.width + 5) f.x = -5; if (f.x < -5) f.x = sc.width + 5;
    sx.globalAlpha = f.a; sx.beginPath(); sx.arc(f.x, f.y, f.r, 0, 6.283); sx.fillStyle = "#fff"; sx.fill();
  }
  boost *= .97;
  requestAnimationFrame(snowLoop);
}
addEventListener("resize", seedSnow); seedSnow(); requestAnimationFrame(snowLoop);

/* ---------- fx: sparkles + fireworks ---------- */
const fc = $("#fx"), fx = fc.getContext("2d"); let sparks = [], fxRaf = 0;
addEventListener("resize", () => sizeCanvas(fc)); sizeCanvas(fc);
const ICE = ["#ffffff", "#bfe8ff", "#7fdcff", "#9b7bff", "#4ef0d0"], GOLD = ["#fff3c4", "#ffd98a", "#ffb047", "#ffffff"];
function burst(x, y, n = 40, cols = ICE, power = 7, star = true) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, s = rand(.3, 1) * power * DPR;
    sparks.push({ x: x * DPR, y: y * DPR, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.7, 1.3), c: cols[i % cols.length], r: rand(1, 2.6) * DPR, star: star && Math.random() < .35 });
  }
  if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
}
function firework() {
  const x = rand(.15, .85) * innerWidth, y = rand(.12, .45) * innerHeight;
  burst(x, y, 90, Math.random() < .5 ? ICE : GOLD, 9, false);
}
function fxLoop() {
  fx.clearRect(0, 0, fc.width, fc.height);
  fx.globalCompositeOperation = "lighter";
  for (const p of sparks) {
    p.vy += .06 * DPR; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.life -= .012;
    fx.globalAlpha = Math.max(0, p.life); fx.fillStyle = p.c;
    if (p.star) { fx.save(); fx.translate(p.x, p.y); fx.rotate(p.life * 4); fx.fillRect(-p.r * 2, -p.r / 3, p.r * 4, p.r / 1.5); fx.fillRect(-p.r / 3, -p.r * 2, p.r / 1.5, p.r * 4); fx.restore(); }
    else { fx.beginPath(); fx.arc(p.x, p.y, p.r, 0, 6.283); fx.fill(); }
  }
  fx.globalCompositeOperation = "source-over";
  sparks = sparks.filter(p => p.life > 0);
  fxRaf = sparks.length ? requestAnimationFrame(fxLoop) : 0;
}
addEventListener("pointerdown", e => { if (!$("#gate").isConnected || $("#gate").style.display === "none") burst(e.clientX, e.clientY, 18, ICE, 4); }, { passive: true });

/* ---------- music ---------- */
const music = { mode: null, on: true, yt: null };
const songAudio = $("#songAudio");
async function initMusic() {
  try {
    const r = await fetch(C.music.local, { method: "HEAD" });
    if (r.ok) { music.mode = "local"; songAudio.src = C.music.local; songAudio.volume = .6; songAudio.play().catch(() => {}); return; }
  } catch (e) {}
  music.mode = "yt"; $("#ytSlot").classList.add("on");
  window.onYouTubeIframeAPIReady = () => {
    music.yt = new YT.Player("ytPlayer", {
      width: 320, height: 180, videoId: C.music.youtubeId,
      playerVars: { playsinline: 1, controls: 1, loop: 1, playlist: C.music.youtubeId, rel: 0 },
      events: { onReady: e => { e.target.setVolume(60); if (music.on) e.target.playVideo(); } }
    });
  };
  const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
}
function setMusic(on) {
  music.on = on;
  $("#musicBtn").classList.toggle("off", !on);
  $(".disc").classList.toggle("paused", !on);
  $("#songToggle").textContent = on ? "Pause ❚❚" : "Play ▶";
  if (music.mode === "local") on ? songAudio.play().catch(() => {}) : songAudio.pause();
  else if (music.yt && music.yt.playVideo) on ? music.yt.playVideo() : music.yt.pauseVideo();
}
$("#musicBtn").addEventListener("click", () => setMusic(!music.on));
$("#songToggle").addEventListener("click", () => setMusic(!music.on));

/* ---------- helpers ---------- */
// split into chars, but keep each word unbreakable so titles wrap between words only
const splitChars = el => { el.innerHTML = el.textContent.split(" ").map(w => `<span class="wd">${Array.from(w).map(c => `<span class="ch">${c}</span>`).join("")}</span>`).join(" "); return el.querySelectorAll(".ch"); };
const reveal = (targets, trigger, vars = {}, start = "top 82%") =>
  gsap.from(targets, { y: 40, opacity: 0, filter: "blur(8px)", duration: 1, ease: "power3.out", stagger: .12, ...vars, scrollTrigger: { trigger, start, toggleActions: "play none none reverse" } });

/* ---------- fill content ---------- */
$("#gateTitle").textContent = `For ${C.name}`;
$("#heroKicker").textContent = C.hero.kicker;
$("#heroTitle").textContent = C.hero.title;
$("#heroLine").textContent = C.hero.line;
$("#prologueText").innerHTML = C.prologue.map(l => `<p>${l}</p>`).join("");
$("#braveN").textContent = `Chapter ${C.brave.n}`;
$("#braveTitle").textContent = C.brave.title;
$("#braveText").textContent = C.brave.text;
$("#lovesTitle").textContent = C.loves.title;
$("#songTitle").textContent = C.music.title;
$("#wish").textContent = C.finale.wish;

function chapterHTML(ch) {
  let media = "";
  if (ch.video) media = `<div class="frame"><video src="${ch.video}" poster="${ch.video.replace("vid/", "img/poster-").replace(".mp4", ".jpg")}" muted loop playsinline preload="metadata"></video></div>`;
  else if (ch.photo) media = `<div class="frame"><img src="${ch.photo}" alt="" loading="lazy"></div>`;
  const chat = ch.chat ? `<div class="chat">${ch.chat.map(m => `<span>${m}</span>`).join("")}</div>` : "";
  return `<article class="chapter"><div class="chapter-head"><div class="numeral">${ch.n}</div><div class="date">${ch.date || ""}</div><h3>${ch.title}</h3></div>
    <div class="glass">${chat}${media}<p class="text">${ch.text}</p></div></article>`;
}
$("#chapters").innerHTML = C.chapters.map(chapterHTML).join("");
$("#ending").innerHTML = chapterHTML({ ...C.ending, date: "Always" });
$("#crystals").innerHTML = C.loves.items.map(it => `<div class="crystal" role="button" tabindex="0"><div class="f"><b>${it.icon}</b><span>${it.front}</span></div><div class="bk">${it.back}</div></div>`).join("");

/* ---------- scroll choreography ---------- */
function choreograph() {
  // hero: slow push-in + fade out as you scroll
  gsap.fromTo("#heroImg", { scale: 1.08 }, { scale: 1.32, yPercent: 8, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-text", { yPercent: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "30% top", end: "bottom top", scrub: true } });

  // prologue: lines fade in one by one while the palace zooms
  const pl = gsap.timeline({ scrollTrigger: { trigger: "#prologue", start: "top top", end: "bottom bottom", scrub: 1 } });
  pl.fromTo("#palaceImg", { scale: 1.25 }, { scale: 1, ease: "none", duration: 4 }, 0);
  $$("#prologueText p").forEach((p, i) => pl.from(p, { opacity: 0, y: 30, filter: "blur(10px)", duration: .8 }, .3 + i * .8));
  pl.to("#prologueText", { opacity: 0, y: -40, duration: .6 }, 3.6);

  // chapters
  $$(".chapter").forEach(el => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%", toggleActions: "play none none reverse" } });
    tl.from(el.querySelector(".numeral"), { scale: 2.2, opacity: 0, filter: "blur(12px)", duration: 1.1, ease: "power3.out" })
      .from(el.querySelectorAll(".date, h3"), { y: 24, opacity: 0, duration: .7, stagger: .12 }, "<.3")
      .from(el.querySelector(".glass"), { y: 70, opacity: 0, rotationX: 18, transformPerspective: 900, duration: 1, ease: "power3.out" }, "<.2");
    const fr = el.querySelector(".frame");
    if (fr) gsap.fromTo(fr, { clipPath: "polygon(50% 0%,50% 0%,50% 100%,50% 100%)" }, { clipPath: "polygon(0% 0%,100% 0%,100% 100%,0% 100%)", duration: 1.3, ease: "power3.inOut",
      scrollTrigger: { trigger: fr, start: "top 85%", toggleActions: "play none none reverse" } });
    const chat = el.querySelectorAll(".chat span");
    if (chat.length) gsap.from(chat, { scale: .6, opacity: 0, duration: .45, stagger: .5, ease: "back.out(2)", scrollTrigger: { trigger: el.querySelector(".chat"), start: "top 80%" } });
    reveal(el.querySelector(".text"), el.querySelector(".text"), {}, "top 90%");
  });
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()), { threshold: .35 });
  $$("video").forEach(v => io.observe(v));

  // the bravest heart
  const br = gsap.timeline({ scrollTrigger: { trigger: "#brave", start: "top top", end: "bottom bottom", scrub: 1 } });
  br.fromTo("#coupleImg", { scale: 1.3, yPercent: -4 }, { scale: 1.02, yPercent: 0, ease: "none", duration: 3 }, 0)
    .from("#braveN", { opacity: 0, y: 20, duration: .4 }, .6)
    .from("#braveTitle", { opacity: 0, y: 30, filter: "blur(10px)", duration: .6 }, .8)
    .from("#braveText", { opacity: 0, y: 30, duration: .6 }, 1.3);

  // crystals
  gsap.from(".crystal", { y: 60, opacity: 0, rotationY: -60, duration: .9, stagger: .1, ease: "back.out(1.6)", scrollTrigger: { trigger: "#crystals", start: "top 82%" } });
  reveal("#loves .kicker, #lovesTitle", "#loves");

  reveal("#song .glass", "#song");
  reveal("#counter .kicker, #counter h2", "#counter");
  reveal("#letter .kicker, #letter h2, .seal-wrap", "#letter");

  // finale wish
  ScrollTrigger.create({ trigger: "#finale", start: "top 35%", once: true, onEnter: () => {
    gsap.from(splitChars($("#wish")), { opacity: 0, y: -30, filter: "blur(8px)", stagger: .05, duration: .8, ease: "back.out(2)" });
  } });
  gsap.fromTo("#ballroomImg", { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "#finale", start: "top bottom", end: "top top", scrub: true } });
}

/* ---------- crystals tap ---------- */
$$(".crystal").forEach(c => c.addEventListener("click", e => {
  c.classList.toggle("flip");
  const r = c.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 34, ICE, 6);
}));

/* ---------- counter ---------- */
const t0 = new Date(C.together).getTime();
const parts = () => { const d = Math.max(0, Date.now() - t0) / 1000; return [Math.floor(d / 86400), Math.floor(d % 86400 / 3600), Math.floor(d % 3600 / 60), Math.floor(d % 60)]; };
const cIds = ["#cD", "#cH", "#cM", "#cS"]; let live = false;
setInterval(() => { if (live) parts().forEach((v, i) => ($(cIds[i]).textContent = v)); }, 1000);
ScrollTrigger.create({ trigger: "#counter", start: "top 80%", once: true, onEnter: () => {
  gsap.from("#counter .clock div", { rotationX: -90, opacity: 0, transformPerspective: 600, stagger: .12, duration: .8, ease: "back.out(1.7)" });
  const p = parts(), o = { a: 0, b: 0, c: 0, d: 0 };
  gsap.to(o, { a: p[0], b: p[1], c: p[2], d: p[3], duration: 2.4, ease: "power3.out",
    onUpdate: () => [o.a, o.b, o.c, o.d].forEach((v, i) => ($(cIds[i]).textContent = Math.round(v))), onComplete: () => (live = true) });
} });

/* ---------- letter ---------- */
$("#seal").addEventListener("click", async () => {
  const s = $("#seal"), r = s.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 60, GOLD.concat(ICE), 8);
  await gsap.to(s, { scale: 1.3, rotation: 25, opacity: 0, duration: .5, ease: "back.in(2)" });
  $(".seal-wrap").hidden = true; $("#paper").hidden = false; ScrollTrigger.refresh();
  await gsap.from("#paper", { opacity: 0, y: 40, scaleY: .3, transformOrigin: "50% 0%", duration: .9, ease: "power3.out" });
  const host = $("#letterText");
  for (const line of C.letter) {
    const p = document.createElement("p"); host.appendChild(p);
    const caret = document.createElement("span"); caret.className = "caret";
    for (const ch of Array.from(line)) { p.textContent += ch; p.appendChild(caret); await sleep(".,!?".includes(ch) ? 220 : 32); }
    caret.remove(); await sleep(420);
  }
});

/* ---------- finale: blow out the candles ---------- */
let out = false;
async function extinguish() {
  if (out) return; out = true;
  ["#blowBtn", "#tapBlow", "#blowHint"].forEach(s => ($(s).hidden = true));
  $("#glow").classList.add("out");
  gsap.to("#ballroomImg", { filter: "brightness(.62) saturate(.85)", duration: .6, ease: "power2.out" });   // candles go out
  gsap.to("#wish", { opacity: 0, y: -20, duration: .5 });
  boost = 2.5;
  for (let i = 0; i < 14; i++) setTimeout(firework, 300 + i * 380);
  burst(innerWidth / 2, innerHeight * .45, 160, GOLD.concat(ICE), 11);
  await sleep(900);
  const ft = $("#finalTitle"); ft.textContent = C.finale.title; ft.hidden = false;
  gsap.from(splitChars(ft), { opacity: 0, y: 40, scale: .4, filter: "blur(10px)", stagger: .06, duration: .9, ease: "back.out(2.2)" });
  await sleep(1800);
  const s = $("#surprise"); s.textContent = C.finale.surprise; s.hidden = false;
  gsap.from(s, { opacity: 0, y: 20, duration: 1 });
}
$("#tapBlow").addEventListener("click", extinguish);
$("#blowBtn").addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 1024;
    ac.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize); $("#blowBtn").textContent = "Now blow… 💨";
    let base = 0, n = 0, hot = 0; const ts = performance.now();
    const poll = () => {
      if (out) { stream.getTracks().forEach(t => t.stop()); ac.close(); return; }
      an.getByteTimeDomainData(buf); let sum = 0; for (const v of buf) sum += ((v - 128) / 128) ** 2; const rms = Math.sqrt(sum / buf.length);
      if (performance.now() - ts < 700) { base = (base * n + rms) / (n + 1); n++; }
      else { hot = rms > Math.max(.12, base * 3.5) ? hot + 1 : Math.max(0, hot - 1); $("#glow").style.opacity = String(1 - Math.min(.7, rms * 3)); if (hot > 16) return extinguish(); }
      requestAnimationFrame(poll);
    };
    poll();
  } catch (e) { $("#blowBtn").hidden = true; }
});

/* ---------- gate ---------- */
if (C.password) $("#pw").hidden = false;
$("#openBtn").addEventListener("click", async () => {
  if (C.password && $("#pw").value.trim().toLowerCase() !== C.password.toLowerCase()) { $("#pwErr").hidden = false; return; }
  const r = $("#openBtn").getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 80, ICE, 9);
  initMusic(); $("#musicBtn").hidden = false;
  await gsap.to("#flash", { opacity: 1, duration: .35, ease: "power2.in" });
  $("#gate").style.display = "none";
  gsap.to("#flash", { opacity: 0, duration: 1.2, ease: "power2.out" });
  gsap.from("#heroImg", { scale: 1.5, filter: "blur(14px) brightness(1.6)", duration: 2.6, ease: "power3.out" });
  gsap.from("#heroKicker", { opacity: 0, y: 20, duration: 1, delay: .8 });
  gsap.from(splitChars($("#heroTitle")), { opacity: 0, y: 50, rotationX: -90, filter: "blur(10px)", stagger: .06, duration: 1.1, ease: "back.out(1.8)", delay: 1.1 });
  gsap.from("#heroLine", { opacity: 0, y: 20, duration: 1.2, delay: 2.2 });
  gsap.from(".scrollhint", { opacity: 0, duration: 1, delay: 3 });
  setTimeout(() => { document.body.classList.remove("locked"); ScrollTrigger.refresh(); }, 1800);
});

choreograph();
})();
