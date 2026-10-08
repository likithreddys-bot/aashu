(() => {
const C = window.CONTENT;
const $ = (s, el = document) => el.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const store = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) {} };

/* ---------- Characters (original art, Masha-style girl + Bear) ---------- */
const brow = (d, c = "#a5521a") => `<path d="${d}" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const heart = (x, y) => `<path d="M${x} ${y + 9} C${x - 11} ${y + 1} ${x - 11} ${y - 8} ${x - 5} ${y - 8} C${x - 2} ${y - 8} ${x} ${y - 6} ${x} ${y - 5} C${x} ${y - 6} ${x + 2} ${y - 8} ${x + 5} ${y - 8} C${x + 11} ${y - 8} ${x + 11} ${y + 1} ${x} ${y + 9}Z" fill="#ff3b6b"/>`;

function mashaSVG(expr = "neutral") {
  return `<svg viewBox="0 0 200 290" data-expr="${expr}" aria-hidden="true">
  <rect x="72" y="246" width="20" height="30" rx="8" fill="#ffd9b8"/><rect x="108" y="246" width="20" height="30" rx="8" fill="#ffd9b8"/>
  <ellipse cx="80" cy="282" rx="18" ry="8" fill="#6b3a1e"/><ellipse cx="120" cy="282" rx="18" ry="8" fill="#6b3a1e"/>
  <path d="M60 160 Q100 145 140 160 L162 258 Q100 275 38 258Z" fill="#ff8a1f"/>
  <path d="M85 165 Q100 175 115 165 L120 215 Q100 225 80 215Z" fill="#fff4e0"/><circle cx="100" cy="196" r="4" fill="#ff8a1f"/>
  <ellipse cx="50" cy="192" rx="13" ry="30" fill="#ffd9b8" transform="rotate(18 50 192)"/>
  <ellipse cx="150" cy="192" rx="13" ry="30" fill="#ffd9b8" transform="rotate(-18 150 192)"/>
  <ellipse cx="46" cy="116" rx="13" ry="26" fill="#e07a24"/><ellipse cx="154" cy="116" rx="13" ry="26" fill="#e07a24"/>
  <circle cx="100" cy="100" r="56" fill="#ffd9b8"/>
  <path d="M42 98 Q38 34 100 30 Q162 34 158 98 Q130 64 100 64 Q70 64 42 98Z" fill="#ff5d8f"/>
  <circle cx="70" cy="48" r="4" fill="#fff"/><circle cx="100" cy="40" r="4" fill="#fff"/><circle cx="130" cy="48" r="4" fill="#fff"/>
  <circle cx="55" cy="72" r="3.5" fill="#fff"/><circle cx="145" cy="72" r="3.5" fill="#fff"/>
  <path d="M152 60 L180 44 L176 76Z" fill="#ff5d8f"/><path d="M152 60 L172 90 L148 80Z" fill="#e8467a"/>
  <circle cx="68" cy="116" r="9" fill="#ff9aa8" opacity=".6"/><circle cx="132" cy="116" r="9" fill="#ff9aa8" opacity=".6"/>
  <g class="eyes"><circle cx="80" cy="98" r="10" fill="#fff"/><circle cx="120" cy="98" r="10" fill="#fff"/>
    <circle cx="82" cy="100" r="5.5" fill="#2a7fbf"/><circle cx="118" cy="100" r="5.5" fill="#2a7fbf"/>
    <circle cx="83.5" cy="98" r="2" fill="#fff"/><circle cx="119.5" cy="98" r="2" fill="#fff"/></g>
  <g data-e="neutral happy">${brow("M68 83 Q80 78 92 83M108 83 Q120 78 132 83")}</g>
  <g data-e="surprised">${brow("M68 74 Q80 66 92 74M108 74 Q120 66 132 74")}</g>
  <g data-e="naughty">${brow("M68 78 L92 87M108 82 Q120 70 132 78")}</g>
  <g data-e="love">${brow("M68 84 Q80 76 92 84M108 84 Q120 76 132 84")}${heart(80, 99)}${heart(120, 99)}</g>
  <path class="mouth" data-e="neutral" d="M90 128 Q100 135 110 128" stroke="#8a2b2b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path class="mouth" data-e="happy love" d="M82 122 Q100 152 118 122Z" fill="#8a2b2b"/>
  <ellipse class="mouth" data-e="surprised" cx="100" cy="132" rx="8" ry="11" fill="#8a2b2b"/>
  <path class="mouth" data-e="naughty" d="M86 128 Q102 138 116 122" stroke="#8a2b2b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <ellipse class="mouth" data-e="naughty" cx="108" cy="134" rx="5" ry="4" fill="#ff7a8a"/>
  <ellipse class="talkmouth m-talk" cx="100" cy="130" rx="11" ry="9" fill="#8a2b2b" style="transform-box:fill-box;transform-origin:center"/>
</svg>`;
}

function bearSVG(expr = "neutral") {
  return `<svg viewBox="0 0 200 290" data-expr="${expr}" aria-hidden="true">
  <ellipse cx="72" cy="278" rx="24" ry="11" fill="#6f4529"/><ellipse cx="128" cy="278" rx="24" ry="11" fill="#6f4529"/>
  <ellipse cx="100" cy="212" rx="62" ry="68" fill="#8b5a3c"/><ellipse cx="100" cy="224" rx="38" ry="45" fill="#d8a679"/>
  <circle cx="40" cy="200" r="18" fill="#8b5a3c"/><circle cx="160" cy="200" r="18" fill="#8b5a3c"/>
  <circle cx="56" cy="62" r="22" fill="#8b5a3c"/><circle cx="56" cy="62" r="11" fill="#d8a679"/>
  <circle cx="144" cy="62" r="22" fill="#8b5a3c"/><circle cx="144" cy="62" r="11" fill="#d8a679"/>
  <circle cx="100" cy="112" r="60" fill="#8b5a3c"/>
  <ellipse cx="100" cy="132" rx="30" ry="22" fill="#d8a679"/><ellipse cx="100" cy="120" rx="10" ry="7" fill="#2b1a10"/>
  <g class="eyes"><circle cx="76" cy="100" r="6.5" fill="#2b1a10"/><circle cx="124" cy="100" r="6.5" fill="#2b1a10"/>
    <circle cx="78" cy="98" r="2" fill="#fff"/><circle cx="126" cy="98" r="2" fill="#fff"/></g>
  <g data-e="surprised">${brow("M64 86 Q76 78 88 86M112 86 Q124 78 136 86", "#4a2a14")}</g>
  <g data-e="naughty">${brow("M64 90 L88 94M112 90 L136 94", "#4a2a14")}</g>
  <g data-e="love">${heart(76, 101)}${heart(124, 101)}</g>
  <path class="mouth" data-e="neutral naughty" d="M90 138 Q100 144 110 138" stroke="#2b1a10" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path class="mouth" data-e="happy love" d="M86 136 Q100 154 114 136Z" fill="#6b1f1f"/>
  <ellipse class="mouth" data-e="surprised" cx="100" cy="142" rx="7" ry="9" fill="#6b1f1f"/>
  <ellipse class="talkmouth m-talk" cx="100" cy="141" rx="10" ry="8" fill="#6b1f1f" style="transform-box:fill-box;transform-origin:center"/>
  <path d="M100 -4 L72 54 L128 54Z" fill="#ff5d8f"/><circle cx="100" cy="-4" r="8" fill="#ffd33d"/>
  <path d="M82 40 L118 40M78 48 L122 48" stroke="#fff" stroke-width="3" opacity=".8"/>
</svg>`;
}

const chars = { masha: $("#masha"), bear: $("#bear") };
const setExpr = (who, expr) => { const s = $("svg", chars[who]); if (s) s.dataset.expr = expr; };

/* ---------- Music (his singing if present, else the original via YouTube) ---------- */
const music = { mode: null, on: true, yt: null };
const songAudio = $("#songAudio"), voiceEl = $("#voice");

async function initMusic() {
  try {
    const r = await fetch(C.music.local, { method: "HEAD" });
    if (r.ok) {
      music.mode = "local"; songAudio.src = C.music.local; songAudio.volume = .55;
      songAudio.play().catch(() => {});
      return;
    }
  } catch (e) {}
  music.mode = "yt";
  window.onYouTubeIframeAPIReady = () => {
    music.yt = new YT.Player("ytPlayer", {
      width: 200, height: 113, videoId: C.music.youtubeId,
      playerVars: { playsinline: 1, controls: 0, loop: 1, playlist: C.music.youtubeId, rel: 0, modestbranding: 1 },
      events: { onReady: e => { e.target.setVolume(55); if (music.on) e.target.playVideo(); } }
    });
  };
  const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
}
function musicVol(v) {
  if (music.mode === "local") songAudio.volume = v / 100;
  else if (music.yt && music.yt.setVolume) music.yt.setVolume(v);
}
function musicToggle() {
  music.on = !music.on;
  $("#musicBtn").classList.toggle("off", !music.on);
  if (music.mode === "local") music.on ? songAudio.play() : songAudio.pause();
  else if (music.yt && music.yt.playVideo) music.on ? music.yt.playVideo() : music.yt.pauseVideo();
}
$("#musicBtn").addEventListener("click", musicToggle);

/* ---------- Intro narration ---------- */
function playVoice(src) {
  return new Promise(res => {
    if (!src) return res(false);
    voiceEl.onended = () => res(true);
    voiceEl.onerror = () => res(false);
    voiceEl.src = src;
    voiceEl.play().catch(() => res(false));
  });
}
function typeText(el, text) {
  let i = 0; el.textContent = "";
  const id = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(id); }, 28);
  return () => { clearInterval(id); el.textContent = text; };
}
async function say(line) {
  const bubble = $("#bubble");
  Object.entries(chars).forEach(([k, el]) => el.classList.toggle("speaking", k === line.who));
  setExpr(line.who, line.expr || "happy");
  const other = line.who === "masha" ? "bear" : "masha"; setExpr(other, "neutral");
  const finish = typeText($("#bubbleText"), line.text);
  let tapResolve; const tapP = new Promise(r => (tapResolve = r));
  const onTap = () => tapResolve("tap"); bubble.addEventListener("click", onTap, { once: true });
  musicVol(25);
  const vp = playVoice(line.audio).then(ok => (ok ? "done" : "none"));
  const r = await Promise.race([vp, tapP]);
  if (r === "none") await Promise.race([sleep(Math.max(3000, line.text.length * 60)), tapP]);
  voiceEl.pause(); finish(); musicVol(55);
  bubble.removeEventListener("click", onTap);
  Object.values(chars).forEach(el => el.classList.remove("speaking"));
  await sleep(180);
}
async function runIntro() {
  for (const line of C.intro) await say(line);
  $("#bubble").hidden = true; setExpr("masha", "love"); setExpr("bear", "happy");
  $("#scrollHint").hidden = false;
}

/* ---------- Chapters ---------- */
function buildChapters() {
  const host = $("#chapters");
  C.chapters.forEach(ch => {
    const sec = document.createElement("article"); sec.className = "chapter";
    let media = "";
    if (ch.video) media = `<video class="media" src="${ch.video}" poster="${ch.video.replace("vid/", "img/poster-").replace(".mp4", ".jpg")}" muted loop playsinline preload="metadata"></video>`;
    else if (ch.photo) media = `<img class="media" src="${ch.photo}" alt="" loading="lazy">`;
    const chat = ch.chat ? `<div class="chat">${ch.chat.map(m => `<span>${m}</span>`).join("")}</div>` : "";
    sec.innerHTML = `<div class="card-title"><div class="ep">${ch.ep}</div><h3>${ch.title}</h3><div class="dt">${ch.date}</div></div>
      ${chat}${media}<p class="story">${ch.text}</p>
      <div class="mini"><div class="face">${mashaSVG("naughty")}</div><div class="say">${ch.masha}</div></div>`;
    host.appendChild(sec);
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("in");
    const v = $("video", e.target); if (v) (e.isIntersecting ? v.play().catch(() => {}) : v.pause());
  }), { threshold: .25 });
  host.querySelectorAll(".chapter").forEach(c => io.observe(c));
}

function buildBear() {
  const b = C.bear;
  $("#bearBlock").innerHTML = `<p class="kicker">Meanwhile, in the forest</p><h2>${b.title}</h2>
    <div class="char" style="margin:0 auto;width:150px">${bearSVG("happy")}</div>
    <p>${b.text}</p><div class="polaroids">${b.photos.map(p => `<img src="${p}" alt="" loading="lazy">`).join("")}</div>`;
}

/* ---------- Counter ---------- */
function startCounter() {
  const t0 = new Date(C.together).getTime();
  const tick = () => {
    let d = Math.max(0, Date.now() - t0) / 1000;
    $("#cD").textContent = Math.floor(d / 86400);
    $("#cH").textContent = Math.floor(d % 86400 / 3600);
    $("#cM").textContent = Math.floor(d % 3600 / 60);
    $("#cS").textContent = Math.floor(d % 60);
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- Quiz (nobody can lose) ---------- */
function startQuiz() {
  const box = $("#quizBox"); let i = 0, mistakes = 0;
  const jokes = ["Hehe, Masha says nope!", "Aiyo, Bear is disappointed 🐻", "Close... not close. Try again!", "Masha is laughing. Try again!"];
  const show = () => {
    if (i >= C.quiz.length) {
      box.innerHTML = `<div class="mini" style="justify-content:center"><div class="face" style="flex-basis:90px">${mashaSVG("love")}</div></div>
        <p class="q" style="margin-top:1rem">${mistakes === 0 ? "Perfect! You know us by heart. 🍊" : "You got there in the end, and that's what matters. 🍊"}</p>`;
      return;
    }
    const q = C.quiz[i];
    box.innerHTML = `<div class="progress">${i + 1} / ${C.quiz.length}</div><p class="q">${q.q}</p>
      ${q.options.map((o, k) => `<button class="opt" data-k="${k}">${o}</button>`).join("")}<p class="fb" id="fb"></p>`;
    box.querySelectorAll(".opt").forEach(b => b.addEventListener("click", async () => {
      const k = +b.dataset.k;
      if (k === q.answer) {
        b.classList.add("right"); $("#fb").textContent = "Yes! 🍊";
        box.querySelectorAll(".opt").forEach(x => (x.disabled = true));
        await sleep(1100); i++; show();
      } else {
        mistakes++; b.classList.add("wrong"); b.disabled = true;
        $("#fb").textContent = jokes[Math.floor(Math.random() * jokes.length)];
      }
    }));
  };
  show();
}

/* ---------- Letter (typewriter) ---------- */
function startLetter() {
  const host = $("#letterText"); let done = false;
  new IntersectionObserver(async (es, ob) => {
    if (!es[0].isIntersecting || done) return; done = true; ob.disconnect();
    for (const line of C.letter) {
      const p = document.createElement("p"); host.appendChild(p);
      const caret = document.createElement("span"); caret.className = "caret";
      for (const ch of line) { p.textContent += ch; p.appendChild(caret); await sleep(ch === "." || ch === "," ? 220 : 32); }
      caret.remove(); await sleep(500);
    }
  }, { threshold: .4 }).observe($("#letterBlock"));
}

/* ---------- Confetti ---------- */
const cv = $("#confetti"), cx = cv.getContext("2d"); let parts = [], raf = 0;
const fit = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
addEventListener("resize", fit); fit();
function confetti(n = 160) {
  const cols = ["#ff8a1f", "#ff5d8f", "#ffd33d", "#6cc26c", "#6ec6ff", "#fff"];
  for (let i = 0; i < n; i++) parts.push({
    x: cv.width / 2, y: cv.height * .6, vx: (Math.random() - .5) * 22 * devicePixelRatio, vy: (-Math.random() * 20 - 6) * devicePixelRatio,
    s: (6 + Math.random() * 8) * devicePixelRatio, c: cols[i % cols.length], r: Math.random() * 6, vr: (Math.random() - .5) * .4
  });
  if (!raf) loop();
}
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts.forEach(p => { p.vy += .55 * devicePixelRatio; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
  parts = parts.filter(p => p.y < cv.height + 40);
  raf = parts.length ? requestAnimationFrame(loop) : 0;
}

/* ---------- Finale: blow out the candle ---------- */
function startFinale() {
  $("#wish").textContent = C.finale.wish;
  const flame = $("#flame"), blowBtn = $("#blowBtn");
  const tapBtn = document.createElement("button"); tapBtn.className = "small"; tapBtn.textContent = "or just tap here";
  tapBtn.style.cssText = "display:block;margin:.8rem auto 0;background:none;border:0;text-decoration:underline;font:inherit;color:inherit;cursor:pointer";
  blowBtn.after(tapBtn); blowBtn.textContent = "Blow into the mic 🎤";
  let out = false;
  const extinguish = () => {
    if (out) return; out = true; flame.classList.add("out");
    blowBtn.hidden = tapBtn.hidden = true; $("#blowHint").hidden = true;
    confetti(220); setTimeout(() => confetti(140), 600);
    const s = $("#surprise"); s.textContent = C.finale.surprise; s.hidden = false;
    $("#songCredit").textContent = `♪ ${C.music.title}`; $("#songCredit").hidden = false;
    $("#ytWrap").classList.add("show");
  };
  tapBtn.addEventListener("click", extinguish);
  blowBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
      const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 1024;
      ac.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize); blowBtn.textContent = "Now blow... 💨"; let base = 0, n = 0, hot = 0, t0 = performance.now();
      const poll = () => {
        if (out) { stream.getTracks().forEach(t => t.stop()); ac.close(); return; }
        an.getByteTimeDomainData(buf); let sum = 0; for (const v of buf) sum += ((v - 128) / 128) ** 2; const rms = Math.sqrt(sum / buf.length);
        if (performance.now() - t0 < 700) { base = (base * n + rms) / (n + 1); n++; }
        else { hot = rms > Math.max(.12, base * 3.5) ? hot + 1 : 0; if (hot > 18) return extinguish(); }
        requestAnimationFrame(poll);
      };
      poll();
    } catch (e) { blowBtn.hidden = true; }
  });
}

/* ---------- Boot ---------- */
async function start() {
  $("#gate").hidden = true; $("#app").hidden = false; $("#musicBtn").hidden = false;
  $("#bannerName").textContent = C.name;
  chars.masha.innerHTML = mashaSVG("surprised"); chars.bear.innerHTML = bearSVG("happy");
  buildChapters(); buildBear(); startCounter(); startQuiz(); startLetter(); startFinale();
  initMusic(); await runIntro();
}
$("#gateTitle").textContent = `${C.name}, this is for you`;
if (C.password) $("#pw").hidden = false;
$("#openBtn").addEventListener("click", () => {
  if (C.password && $("#pw").value.trim().toLowerCase() !== C.password.toLowerCase()) { $("#pwErr").hidden = false; return; }
  start();
});
window.__test = { start };
})();
