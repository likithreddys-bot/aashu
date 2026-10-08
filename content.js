/* ============================================================
   EVERYTHING PERSONAL LIVES HERE. Edit text freely.
   Images: assets/anime/*.jpg (AI art), assets/img + assets/vid (your real moments).
   If an anime image is missing, the site falls back to the hero image.
   ============================================================ */
window.CONTENT = {
  name: "Aashu",
  password: "AASHLI",                  // gate word (not case-sensitive; client-side only, not real security)
  together: "2025-01-11T14:00:00",     // the afternoon you became a couple
  music: {
    local: "assets/audio/sing.mp3",    // you singing it (optional; used if present)
    youtubeId: "8JW6qzPCkE8",          // Line Without a Hook
    title: "Line Without a Hook"
  },
  art: {
    hero: "assets/anime/hero.jpg",          // fallback for any missing image
    bg: "assets/anime/bg-hd.webp",          // hero sky (no princess)
    princess: "assets/anime/princess.webp", // cut-out princess layer
    toys: [1, 2, 3, 4, 5].map(i => `assets/anime/toy-${i}.webp`),
    couple: "assets/anime/couple.jpg",
    palace: "assets/anime/palace.jpg",
    ballroom: "assets/anime/ballroom.jpg"
  },

  hero: { kicker: "Happy Birthday, Princess" },
  banner: "HAPPY BIRTHDAY",                 // letters on the flags the toys are holding

  prologue: [
    "Once upon a time,",
    "a boy sent a girl one word: “undipothava?”",
    "She stayed. And that became his whole story."
  ],

  // the opening "film": real moments flash by right after the gate
  montage: [
    { text: "December 2024", sub: "“undipothava?”" },
    { img: "assets/img/poster-her-window.jpg", text: "11 · 01 · 2025", sub: "the afternoon we said yes" },
    { img: "assets/img/her-bike.jpg", text: "28 · 09 · 2025", sub: "finally, face to face" },
    { img: "assets/img/us-selfie.jpg", text: "09 · 01 · 2026", sub: "again, and even better" },
    { img: "assets/img/her-mirror.jpg", text: "always you" },
    { img: "assets/img/poster-us-hearts.jpg", text: "and today…" }
  ],

  // tap a toy -> it opens a gift card (edit these freely)
  gifts: [
    { title: "From Teddy", text: "A promise: I'll always be your teddy bear. Soft when you need a hug, strong when you need someone." },
    { title: "From Bunny", text: "December 2024. One word: “undipothava?” And you stayed. Best answer of my life." },
    { title: "From Penguin", text: "28 September 2025. The first time I saw you for real. I'll never forget that moment." },
    { title: "From Snowman", text: "9 January 2026. We met again, and it was the best thing that has ever happened to me." },
    { title: "From Unicorn", text: "You fought for us when it was hard. Your strength is my favourite kind of magic." }
  ],

  chapters: [
    { n: "I", date: "December 2024", title: "The First Hello",
      text: "One word. And it turned into everything.",
      chat: ["undipothava?"] },
    { n: "II", date: "11 January 2025 · afternoon", title: "The Afternoon We Said Yes",
      text: "A normal afternoon that became the best day of my life.",
      video: "assets/vid/her-window.mp4" },
    { n: "III", date: "28 September 2025", title: "Finally, Face to Face",
      text: "Months of calls, and then: you. Better than I ever imagined.",
      video: "assets/vid/her-bike.mp4" },
    { n: "IV", date: "9 January 2026", title: "Again, and Even Better",
      text: "We met again. The best thing that has ever happened to me.",
      photo: "assets/img/us-selfie.jpg" }
  ],

  brave: {
    n: "V", title: "The Bravest Heart",
    text: "There were storms. You chose us anyway, and you never let go. Every princess story has a hero. In ours, it was you."
  },

  loves: {
    title: "Things I love about you",
    items: [
      { icon: "✨", front: "Your smile", back: "It fixes my worst days in one second." },
      { icon: "🧸", front: "Your childishness", back: "The little kid who comes out only when I'm beside you." },
      { icon: "🤪", front: "Your crazy things", back: "Never stop. I want every crazy idea." },
      { icon: "🛡️", front: "Your strength", back: "You fought for us. I will always fight for you." },
      { icon: "🍊", front: "Our K-drama nights", back: "When Life Gives You Tangerines, Business Proposal, and you next to me." },
      { icon: "🎵", front: "When I sing for you", back: "Line Without a Hook. Every word, for you." }
    ]
  },

  ending: {
    n: "VI", title: "My Favourite Scene",
    text: "Us. Just us, being silly, being close, being home.",
    video: "assets/vid/us-hearts.mp4"
  },

  letter: [
    "My Princess Aashu,",
    "Happy Birthday.",
    "Thank you for every call that turned into a morning, for every laugh that turned into a memory, and for choosing us on the days it was hardest to.",
    "You're the strongest person I know, and also the most gloriously silly. I'm lucky I get to see both.",
    "I may not be the best singer, but I will always sing for you. Wherever life takes us, I'll be right beside you, steady, patient, and always yours.",
    "I love you. Always."
  ],

  finale: {
    title: "Happy Birthday, Aashu",
    surprise: "And your real surprise? You'll see me very soon. 💙"
  }
};
