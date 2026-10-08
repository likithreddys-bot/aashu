(() => {
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
const C = window.CONTENT;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const DPR = Math.min(devicePixelRatio || 1, 2);
const buzz = (ms = 12) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

/* =========================================================
   AMBIENT: snow + sparkle/firework fx
   ========================================================= */
const sc = $("#snow"), sx = sc.getContext("2d"); let flakes = [], boost = 0, wind = 0;
const size = c => { c.width = innerWidth * DPR; c.height = innerHeight * DPR; };
function seedSnow() {
  size(sc);
  const n = Math.round(Math.min(200, innerWidth * innerHeight / 5600));
  flakes = Array.from({ length: n }, () => { const z = Math.random(); return { x: Math.random() * sc.width, y: Math.random() * sc.height, r: (.6 + z * 2.3) * DPR, v: (.25 + z * 1.05) * DPR, w: rand(0, 6.28), a: .3 + z * .6 }; });
}
(function snow(t) {
  sx.clearRect(0, 0, sc.width, sc.height); wind += (Math.sin(t / 4000) * .6 - wind) * .01; sx.fillStyle = "#fff";
  for (const f of flakes) {
    f.y += f.v * (1 + boost); f.x += (Math.sin(t / 1200 + f.w) * .4 + wind) * DPR;
    if (f.y > sc.height + 5) { f.y = -5; f.x = Math.random() * sc.width; }
    if (f.x > sc.width + 5) f.x = -5; if (f.x < -5) f.x = sc.width + 5;
    sx.globalAlpha = f.a; sx.beginPath(); sx.arc(f.x, f.y, f.r, 0, 6.283); sx.fill();
  }
  boost *= .97; requestAnimationFrame(snow);
})(0);
addEventListener("resize", seedSnow); seedSnow();

const fc = $("#fx"), fx = fc.getContext("2d"); let sparks = [], fxRaf = 0;
addEventListener("resize", () => size(fc)); size(fc);
const ICE = ["#ffffff", "#bfe8ff", "#7fdcff", "#a98bff", "#5ff3d6"], GOLD = ["#fff3c4", "#ffd98a", "#ffb047", "#ffffff"], PARTY = ["#ff8fc4", "#7fdcff", "#ffd98a", "#a98bff", "#5ff3d6", "#ffffff"];
function burst(x, y, n = 40, cols = ICE, power = 7, star = true, grav = .06) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, s = rand(.25, 1) * power * DPR;
    sparks.push({ x: x * DPR, y: y * DPR, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.7, 1.3), c: cols[i % cols.length], r: rand(1, 2.6) * DPR, star: star && Math.random() < .4, g: grav });
  }
  if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
}
const firework = () => burst(rand(.15, .85) * innerWidth, rand(.12, .42) * innerHeight, 90, Math.random() < .5 ? PARTY : GOLD, 9, false);
function fxLoop() {
  fx.clearRect(0, 0, fc.width, fc.height); fx.globalCompositeOperation = "lighter";
  for (const p of sparks) {
    p.vy += p.g * DPR; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.life -= .012;
    fx.globalAlpha = Math.max(0, p.life); fx.fillStyle = p.c;
    if (p.star) { fx.save(); fx.translate(p.x, p.y); fx.rotate(p.life * 4); fx.fillRect(-p.r * 2, -p.r / 3, p.r * 4, p.r / 1.5); fx.fillRect(-p.r / 3, -p.r * 2, p.r / 1.5, p.r * 4); fx.restore(); }
    else { fx.beginPath(); fx.arc(p.x, p.y, p.r, 0, 6.283); fx.fill(); }
  }
  fx.globalCompositeOperation = "source-over";
  sparks = sparks.filter(p => p.life > 0);
  fxRaf = sparks.length ? requestAnimationFrame(fxLoop) : 0;
}
let opened = false;
addEventListener("pointerdown", e => { if (opened) burst(e.clientX, e.clientY, 16, ICE, 4); }, { passive: true });

/* =========================================================
   MUSIC
   ========================================================= */
const music = { mode: null, on: true, yt: null }, songAudio = $("#songAudio");
async function initMusic() {
  try {
    const r = await fetch(C.music.local, { method: "HEAD" });
    if (r.ok) { music.mode = "local"; songAudio.src = C.music.local; songAudio.volume = .6; songAudio.play().catch(() => {}); return; }
  } catch (e) {}
  music.mode = "yt"; $("#ytSlot").classList.add("on");
  window.onYouTubeIframeAPIReady = () => {
    music.yt = new YT.Player("ytPlayer", { width: 320, height: 180, videoId: C.music.youtubeId,
      playerVars: { playsinline: 1, controls: 1, loop: 1, playlist: C.music.youtubeId, rel: 0 },
      events: { onReady: e => { e.target.setVolume(60); if (music.on) e.target.playVideo(); } } });
  };
  const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
}
function setMusic(on) {
  music.on = on; $("#musicBtn").classList.toggle("off", !on); $(".disc").classList.toggle("paused", !on);
  $("#songToggle").textContent = on ? "Pause ❚❚" : "Play ▶";
  if (music.mode === "local") on ? songAudio.play().catch(() => {}) : songAudio.pause();
  else if (music.yt && music.yt.playVideo) on ? music.yt.playVideo() : music.yt.pauseVideo();
}
$("#musicBtn").addEventListener("click", () => setMusic(!music.on));
$("#songToggle").addEventListener("click", () => setMusic(!music.on));

/* =========================================================
   HERO: layered scene + toys holding the banner
   ========================================================= */
const hero = { toys: [], flags: [], ready: false };

function buildTwinkles() {
  const host = $("#twinkle");
  for (let i = 0; i < 34; i++) {
    const s = document.createElement("i");
    s.style.left = rand(2, 98) + "%"; s.style.top = rand(2, 95) + "%";
    s.style.animationDelay = rand(0, 3) + "s"; s.style.animationDuration = rand(2, 4.5) + "s";
    s.style.transform = `scale(${rand(.5, 1.2)})`; host.appendChild(s);
  }
}

function buildToys(container, imgs, withBanner) {
  const toys = [];
  imgs.forEach((img, i) => {
    const el = document.createElement("img"); el.src = img.src; el.className = "toy"; el.alt = ""; el.draggable = false;
    container.appendChild(el); toys.push({ el, i });
  });
  return toys;
}

function layoutToys(toys, container) {
  const W = container.clientWidth, xs = [.1, .3, .5, .7, .9], lift = [0, .1, .04, .1, 0], H = container.clientHeight;
  toys.forEach((t, i) => { const w = t.el.offsetWidth; gsap.set(t.el, { left: W * xs[i] - w / 2, bottom: H * lift[i] }); t.cx = W * xs[i]; t.bottom = H * lift[i]; });
}

function idleToys(toys, big = false) {
  toys.forEach((t, i) => {
    const amp = (big ? 26 : 12) + i % 2 * 6, d = .42 + (i % 3) * .08;
    t.idle = gsap.timeline({ repeat: -1, delay: i * .13 })
      .to(t.el, { y: -amp, scaleY: 1.04, scaleX: .97, duration: d, ease: "sine.out" })
      .to(t.el, { y: 0, scaleY: .94, scaleX: 1.05, duration: d, ease: "sine.in" })
      .to(t.el, { scaleY: 1, scaleX: 1, duration: .14 });
    gsap.to(t.el, { rotation: i % 2 ? 5 : -5, duration: rand(.9, 1.3), yoyo: true, repeat: -1, ease: "sine.inOut", delay: i * .2 });
    t.el.addEventListener("click", () => {
      const r = t.el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * .3, 40, PARTY, 7); buzz(18);
      gsap.timeline().to(t.el, { y: -120, rotation: "+=360", duration: .55, ease: "power2.out" }).to(t.el, { y: 0, duration: .45, ease: "bounce.out" });
      if (!big) setTimeout(() => openGift(i), 650);
    });
  });
}

// The rope runs through each toy's raised hands and sags between them; flags hang from it.
const BANNER = (C.banner || "HAPPY BIRTHDAY").split("");
function buildFlags() {
  const host = $("#flags");
  hero.flags = BANNER.map((ch, k) => {
    const f = document.createElement("div"); f.className = "flag"; f.innerHTML = `<b>${ch === " " ? "" : ch}</b>`;
    if (ch === " ") f.style.visibility = "hidden";
    host.appendChild(f); return { el: f, k };
  });
}
function updateBanner(t) {
  const box = $("#heroToys"); if (!hero.toys.length) return;
  const H = box.clientHeight, W = box.clientWidth;
  const svg = $(".bunting"); svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const pts = hero.toys.map(toy => {
    const y = gsap.getProperty(toy.el, "y"), h = toy.el.offsetHeight;
    return { x: toy.cx, hy: H - toy.bottom - h * .97 + y, y: H - toy.bottom - h * .97 + y - H * .26 };
  });
  let sticks = "";
  for (const p of pts) sticks += `M${p.x},${p.hy + 4} L${p.x},${p.y} `;
  const segs = [];
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], c = { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + H * .1 };
    d += ` Q${c.x},${c.y} ${b.x},${b.y}`; segs.push([a, c, b]);
  }
  $("#rope").setAttribute("d", d); $("#sticks").setAttribute("d", sticks);
  hero.toys.forEach((toy, i) => { if (toy.badge) toy.badge.style.transform = `translate(${Math.min(W - 16, toy.cx + toy.el.offsetWidth * .32)}px,${pts[i].hy + toy.el.offsetHeight * .62}px)`; });
  const N = BANNER.length, S = segs.length;
  hero.flags.forEach(f => {
    const u = (f.k + .5) / N * S, s = Math.min(S - 1, Math.floor(u)), lt = .1 + (u - s) * .8;
    const [a, c, b] = segs[s], m = 1 - lt;
    const x = m * m * a.x + 2 * m * lt * c.x + lt * lt * b.x, y = m * m * a.y + 2 * m * lt * c.y + lt * lt * b.y;
    const dx = 2 * m * (c.x - a.x) + 2 * lt * (b.x - c.x), dy = 2 * m * (c.y - a.y) + 2 * lt * (b.y - c.y);
    const ang = Math.atan2(dy, dx) * 57.3 + Math.sin(t * 2.2 + f.k * .8) * 7;
    f.el.style.transform = `translate(${x}px,${y}px) rotate(${ang}deg) scale(${f.s ?? 1})`;
  });
}

function parallax() {
  const layers = $$("[data-depth]").map(el => ({ x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }), d: +el.dataset.depth }));
  const move = (nx, ny) => layers.forEach(l => { l.x(nx * l.d); l.y(ny * l.d * .5); });
  addEventListener("pointermove", e => move(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5), { passive: true });
  addEventListener("deviceorientation", e => { if (e.gamma == null) return; move(Math.max(-1, Math.min(1, e.gamma / 30)) * .5, Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * .5); }, { passive: true });
}

async function setupHero() {
  $("#heroKicker").textContent = C.hero.kicker;
  $("#heroName").textContent = C.name;
  buildTwinkles();
  const [bg, princess, ...toyImgs] = await Promise.all([loadImg(C.art.bg), loadImg(C.art.princess), ...C.art.toys.map(loadImg)]);
  $("#bgImg").src = bg ? bg.src : C.art.hero;
  if (princess) $("#princessImg").src = princess.src; else $("#hero").classList.add("flat");
  const toys = toyImgs.filter(Boolean);
  hero.imgs = toys;
  if (toys.length === 5) {
    hero.toys = buildToys($("#heroToys"), toys, true);
    await Promise.all(hero.toys.map(t => t.el.decode().catch(() => {})));
    layoutToys(hero.toys, $("#heroToys")); buildFlags();
    hero.toys.forEach(t => { t.badge = document.createElement("div"); t.badge.className = "gift-badge"; t.badge.textContent = "🎁"; $("#heroToys").appendChild(t.badge); });
    addEventListener("resize", () => layoutToys(hero.toys, $("#heroToys")));
    gsap.ticker.add(time => updateBanner(time));
  } else $(".bunting").style.display = "none";
  // princess hand sparkles
  setInterval(() => {
    if (!opened || !princess || scrollY > innerHeight) return;
    const r = $("#princessImg").getBoundingClientRect(); burst(r.left + r.width * .8, r.top + r.height * .12, 6, ICE, 2.2, true, -.01);
  }, 420);
  parallax();
}

function playHero() {
  const tl = gsap.timeline();
  tl.fromTo(".l-bg", { scale: 1.35, filter: "blur(16px) brightness(1.7)" }, { scale: 1, filter: "blur(0px) brightness(1)", duration: 2.8, ease: "power3.out", clearProps: "filter" }, 0)
    .from(".l-princess img", { y: 120, opacity: 0, duration: 2.0, ease: "power3.out" }, .5)
    .from("#heroKicker", { opacity: 0, y: 16, letterSpacing: "1em", duration: 1.2, ease: "power2.out" }, 1.0)
    .fromTo("#heroName", { clipPath: "inset(-20% 100% -20% 0)" }, { clipPath: "inset(-20% 0% -20% 0)", duration: 2.2, ease: "power2.inOut",
      onUpdate() { if (Math.random() < .5) { const r = $("#heroName").getBoundingClientRect(); burst(r.left + r.width * this.progress(), r.top + r.height * rand(.3, .8), 3, GOLD, 2.5); } } }, 1.3);
  hero.toys.forEach((t, i) => tl.from(t.el, { y: 260, rotation: rand(-30, 30), duration: .9, ease: "back.out(1.8)" }, 1.8 + i * .14));
  hero.flags.forEach((f, i) => { f.s = 0; tl.to(f, { s: 1, duration: .5, ease: "back.out(3)" }, 2.9 + i * .06); });
  tl.add(() => idleToys(hero.toys), 3.1).from(".scrollhint", { opacity: 0, duration: .8 }, 3.6);
  // scroll-out: each layer at its own speed
  const out = { trigger: "#hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".l-bg img", { yPercent: 12, ease: "none", scrollTrigger: out });
  gsap.to(".l-princess img", { yPercent: 26, ease: "none", scrollTrigger: out });
  gsap.to("#heroToys", { yPercent: 70, ease: "none", scrollTrigger: out });
  gsap.to(".hero-title", { yPercent: -80, opacity: 0, ease: "none", scrollTrigger: out });
}

/* ---------- gifts ---------- */
const opened5 = new Set();
function openGift(i) {
  const g = (C.gifts || [])[i]; if (!g) return;
  opened5.add(i);
  const toy = hero.toys[i]; if (toy && toy.badge) { toy.badge.classList.add("done"); toy.badge.textContent = "✓"; }
  $("#giftToy").src = toy.el.src; $("#giftTitle").textContent = g.title; $("#giftText").textContent = g.text;
  $("#giftCount").textContent = opened5.size === C.gifts.length ? "All gifts opened 💙" : `${opened5.size} of ${C.gifts.length} gifts opened`;
  $("#giftModal").hidden = false;
  gsap.fromTo("#giftCard", { scale: .3, rotation: -12, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .6, ease: "back.out(2)" });
  gsap.fromTo("#giftToy", { y: 40, scale: .6 }, { y: 0, scale: 1, duration: .7, ease: "back.out(2.5)", delay: .1 });
  burst(innerWidth / 2, innerHeight / 2, 70, PARTY, 9); buzz(25);
  if (opened5.size === C.gifts.length) { setTimeout(() => { for (let k = 0; k < 6; k++) setTimeout(firework, k * 300); }, 500); $("#toyHint").textContent = "Scroll ↓ there's more"; }
}
const closeGift = () => gsap.to("#giftCard", { scale: .8, opacity: 0, duration: .25, onComplete: () => ($("#giftModal").hidden = true) });
$("#giftClose").addEventListener("click", closeGift);
$("#giftModal").addEventListener("click", e => { if (e.target.id === "giftModal") closeGift(); });

/* ---------- opening film ---------- */
async function playMontage() {
  const M = C.montage || []; if (!M.length) return;
  const stage = $("#mStage"); stage.innerHTML = M.map(m => `<div class="shot">${m.img ? `<img src="${m.img}" alt="">` : ""}</div>`).join("") + `<div class="m-flare"></div>`;
  $("#montage").hidden = false;
  let skip = false; const skipP = new Promise(r => $("#mSkip").addEventListener("click", () => { skip = true; r(); }, { once: true }));
  const shots = $$("#mStage .shot");
  for (let i = 0; i < M.length && !skip; i++) {
    const s = shots[i], img = s.querySelector("img");
    gsap.to(s, { opacity: 1, duration: .5 });
    if (img) gsap.fromTo(img, { scale: 1.25, x: i % 2 ? -20 : 20 }, { scale: 1.05, x: 0, duration: 2.4, ease: "power1.out" });
    gsap.fromTo(".m-flare", { xPercent: -120 }, { xPercent: 120, duration: .9, ease: "power2.inOut" });
    $("#mBig").textContent = M[i].text || ""; $("#mSub").textContent = M[i].sub || "";
    gsap.fromTo("#mBig", { opacity: 0, y: 20, letterSpacing: ".4em" }, { opacity: 1, y: 0, letterSpacing: ".06em", duration: .8, ease: "power3.out" });
    gsap.fromTo("#mSub", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8, delay: .35 });
    burst(innerWidth / 2, innerHeight * .78, 14, ICE, 3);
    await Promise.race([sleep(i === 0 ? 2300 : 1800), skipP]);
    if (i < M.length - 1) gsap.to(s, { opacity: 0, duration: .6 });
  }
  await gsap.to("#flash", { opacity: 1, duration: .3 });
  $("#montage").hidden = true;
}

/* =========================================================
   STORY CONTENT
   ========================================================= */
const splitChars = el => { el.innerHTML = el.textContent.split(" ").map(w => `<span class="wd">${Array.from(w).map(c => `<span class="ch">${c}</span>`).join("")}</span>`).join(" "); return el.querySelectorAll(".ch"); };
const reveal = (targets, trigger, vars = {}, start = "top 82%") =>
  gsap.from(targets, { y: 40, opacity: 0, filter: "blur(8px)", duration: 1, ease: "power3.out", stagger: .12, ...vars, scrollTrigger: { trigger, start, toggleActions: "play none none reverse" } });
const art = (img, src) => { img.onerror = () => { img.onerror = null; img.src = C.art.hero; }; img.src = src; };

$("#gateTitle").textContent = C.name;
art($("#palaceImg"), C.art.palace); art($("#coupleImg"), C.art.couple); art($("#ballroomImg"), C.art.ballroom);
$("#prologueText").innerHTML = C.prologue.map(l => `<p>${l}</p>`).join("");
$("#braveN").textContent = `Chapter ${C.brave.n}`; $("#braveTitle").textContent = C.brave.title; $("#braveText").textContent = C.brave.text;
$("#lovesTitle").textContent = C.loves.title; $("#songTitle").textContent = C.music.title;

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
$$(".crystal").forEach(c => c.addEventListener("click", () => { c.classList.toggle("flip"); buzz(); const r = c.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 34, ICE, 6); }));

function choreograph() {
  const pl = gsap.timeline({ scrollTrigger: { trigger: "#prologue", start: "top top", end: "bottom bottom", scrub: 1 } });
  pl.fromTo("#palaceImg", { scale: 1.25 }, { scale: 1, ease: "none", duration: 4 }, 0);
  $$("#prologueText p").forEach((p, i) => pl.from(p, { opacity: 0, y: 30, filter: "blur(10px)", duration: .6 }, i * .6));
  pl.to("#prologueText", { opacity: 0, y: -40, duration: .5 }, 3.4);

  $$(".chapter").forEach(el => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" } });
    tl.from(el.querySelector(".numeral"), { scale: 1.5, opacity: 0, filter: "blur(12px)", duration: .9, ease: "power3.out" })
      .from(el.querySelectorAll(".date, h3"), { y: 24, opacity: 0, duration: .7, stagger: .12 }, "<.3")
      .from(el.querySelector(".glass"), { y: 70, opacity: 0, rotationX: 18, transformPerspective: 900, duration: 1, ease: "power3.out" }, "<.2");
    const fr = el.querySelector(".frame");
    if (fr) gsap.fromTo(fr, { clipPath: "polygon(50% 0%,50% 0%,50% 100%,50% 100%)" }, { clipPath: "polygon(0% 0%,100% 0%,100% 100%,0% 100%)", duration: 1, ease: "power3.inOut", scrollTrigger: { trigger: fr, start: "top 96%", toggleActions: "play none none reverse" } });
    const chat = el.querySelectorAll(".chat span");
    if (chat.length) gsap.from(chat, { scale: .6, opacity: 0, duration: .45, stagger: .5, ease: "back.out(2)", scrollTrigger: { trigger: el.querySelector(".chat"), start: "top 80%" } });
    reveal(el.querySelector(".text"), el.querySelector(".text"), {}, "top 90%");
  });
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()), { threshold: .35 });
  $$("video").forEach(v => io.observe(v));

  const br = gsap.timeline({ scrollTrigger: { trigger: "#brave", start: "top top", end: "bottom bottom", scrub: 1 } });
  br.fromTo("#coupleImg", { scale: 1.3, yPercent: -4 }, { scale: 1.02, yPercent: 0, ease: "none", duration: 3 }, 0)
    .from("#braveN", { opacity: 0, y: 20, duration: .4 }, .6).from("#braveTitle", { opacity: 0, y: 30, filter: "blur(10px)", duration: .6 }, .8).from("#braveText", { opacity: 0, y: 30, duration: .6 }, 1.3);

  gsap.from(".crystal", { y: 60, opacity: 0, rotationY: -60, duration: .9, stagger: .1, ease: "back.out(1.6)", scrollTrigger: { trigger: "#crystals", start: "top 82%" } });
  reveal("#loves .kicker, #lovesTitle", "#loves");
  reveal("#song .glass", "#song"); reveal("#counter .kicker, #counter h2", "#counter"); reveal("#letter .kicker, #letter h2, .seal-wrap", "#letter");
  gsap.fromTo("#ballroomImg", { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "#finale", start: "top bottom", end: "top top", scrub: true } });
}

/* counter */
const t0 = new Date(C.together).getTime();
const parts = () => { const d = Math.max(0, Date.now() - t0) / 1000; return [Math.floor(d / 86400), Math.floor(d % 86400 / 3600), Math.floor(d % 3600 / 60), Math.floor(d % 60)]; };
const cIds = ["#cD", "#cH", "#cM", "#cS"]; let live = false;
setInterval(() => { if (live) parts().forEach((v, i) => ($(cIds[i]).textContent = v)); }, 1000);
ScrollTrigger.create({ trigger: "#counter", start: "top 80%", once: true, onEnter: () => {
  gsap.from("#counter .clock div", { rotationX: -90, opacity: 0, transformPerspective: 600, stagger: .12, duration: .8, ease: "back.out(1.7)" });
  const p = parts(), o = { a: 0, b: 0, c: 0, d: 0 };
  gsap.to(o, { a: p[0], b: p[1], c: p[2], d: p[3], duration: 2.4, ease: "power3.out", onUpdate: () => [o.a, o.b, o.c, o.d].forEach((v, i) => ($(cIds[i]).textContent = Math.round(v))), onComplete: () => (live = true) });
} });

/* letter */
$("#seal").addEventListener("click", async () => {
  const s = $("#seal"), r = s.getBoundingClientRect(); buzz(30);
  burst(r.left + r.width / 2, r.top + r.height / 2, 60, GOLD.concat(ICE), 8);
  await gsap.to(s, { scale: 1.3, rotation: 25, opacity: 0, duration: .5, ease: "back.in(2)" });
  $(".seal-wrap").hidden = true; $("#paper").hidden = false; ScrollTrigger.refresh();
  await gsap.from("#paper", { opacity: 0, y: 40, scaleY: .3, transformOrigin: "50% 0%", duration: .9, ease: "power3.out" });
  const host = $("#letterText");
  for (const line of C.letter) {
    const p = document.createElement("p"); host.appendChild(p);
    const caret = document.createElement("span"); caret.className = "caret";
    for (const ch of Array.from(line)) { p.textContent += ch; p.appendChild(caret); await sleep(".,!?".includes(ch) ? 220 : 30); }
    caret.remove(); await sleep(400);
  }
});

/* finale: the party starts by itself */
ScrollTrigger.create({ trigger: "#finale", start: "top 35%", once: true, onEnter: async () => {
  const ft = $("#finalTitle"); ft.textContent = C.finale.title;
  gsap.fromTo(ft, { clipPath: "inset(-20% 100% -20% 0)" }, { clipPath: "inset(-20% 0% -20% 0)", duration: 2.2, ease: "power2.inOut" });
  boost = 2;
  for (let i = 0; i < 16; i++) setTimeout(firework, 200 + i * 420);
  if (hero.imgs && hero.imgs.length === 5) {
    const ft2 = buildToys($("#finaleToys"), hero.imgs); await Promise.all(ft2.map(t => t.el.decode().catch(() => {})));
    layoutToys(ft2, $("#finaleToys"));
    ft2.forEach((t, i) => gsap.from(t.el, { y: 240, duration: .8, ease: "back.out(1.8)", delay: .6 + i * .12 }));
    setTimeout(() => idleToys(ft2, true), 1600);
  }
  await sleep(2400);
  const s = $("#surprise"); s.textContent = C.finale.surprise; gsap.from(s, { opacity: 0, y: 20, duration: 1 });
} });

/* =========================================================
   GATE
   ========================================================= */
if (C.password) $("#pw").hidden = false;
const ready = setupHero();
(async () => {   // preload everything she'll see first, with a progress ring
  const urls = [C.art.bg, C.art.princess, ...C.art.toys, C.art.palace, C.art.couple, C.art.ballroom, ...(C.montage || []).map(m => m.img).filter(Boolean)];
  let n = 0; const arc = $("#loaderArc");
  await Promise.all(urls.map(u => loadImg(u).then(() => { n++; arc.style.strokeDashoffset = 119.4 * (1 - n / urls.length); $("#loaderPct").textContent = Math.round(n / urls.length * 100) + "%"; })));
  await ready;
  gsap.to("#loader", { scale: 0, opacity: 0, duration: .35, onComplete: () => { $("#loader").hidden = true; $("#openBtn").hidden = false; gsap.from("#openBtn", { scale: .6, opacity: 0, duration: .5, ease: "back.out(2)" }); } });
})();
addEventListener("scroll", () => { const h = document.documentElement.scrollHeight - innerHeight; $("#progress").style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; }, { passive: true });
$("#openBtn").addEventListener("click", async () => {
  if (C.password && $("#pw").value.trim().toLowerCase() !== C.password.toLowerCase()) { $("#pwErr").hidden = false; return; }
  const r = $("#openBtn").getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 80, ICE, 9);
  if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().catch(() => {});
  initMusic(); $("#musicBtn").hidden = false;
  await ready;
  buzz(30);
  await gsap.to("#flash", { opacity: 1, duration: .35, ease: "power2.in" });
  $("#gate").style.display = "none"; opened = true;
  gsap.to("#flash", { opacity: 0, duration: .6 });
  await playMontage();
  gsap.to("#flash", { opacity: 0, duration: 1.2, ease: "power2.out" });
  playHero();
  setTimeout(() => { document.body.classList.remove("locked"); ScrollTrigger.refresh(); }, 2000);
});
choreograph();
})();
