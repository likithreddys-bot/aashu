# For Aashu

A birthday website in an anime ice-princess style: aurora, snow, scroll-driven story chapters (GSAP), and a candle-blowing finale.
The live page is `index.html` + `css/frozen.css` + `js/frozen.js`. AI art lives in `assets/anime/`.
Static files only, no build step. Hosted with GitHub Pages from `main`.

## Edit
- **All text, dates, quiz, letter:** `content.js`
- **Masha voice lines (optional):** `assets/voice/01.mp3` … `06.mp3` (one per line in `content.js`)
- **Your singing (optional):** `assets/audio/sing.mp3`. Used instead of the YouTube song when present.

## Code
- `js/characters.js`: the 3D toon Masha and Bear (expressions, lip-sync, actions)
- `js/world.js`: orchard, cake, balloons, sky floaters, fireworks
- `js/main.js`: camera director, intro, scroll story, finale
- `vendor/`: Three.js 0.160.0, GSAP 3.12.5 (bundled so nothing depends on a CDN)

## Preview locally
`python3 -m http.server 8000`, then open http://localhost:8000
