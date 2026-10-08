/* ============================================================
   EVERYTHING PERSONAL LIVES HERE. Edit text freely.
   Images: assets/anime/*.jpg (AI art), assets/img + assets/vid (your real moments).
   If an anime image is missing, the site falls back to the hero image.
   ============================================================ */
window.CONTENT = {
  name: "Aashu",
  password: "",                        // e.g. "tangerine" adds a gate (client-side only, not real security)
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
    "Once upon a time, in December 2024,",
    "a boy said a simple hi to a girl.",
    "He didn't know it yet,",
    "but that hi was the beginning of his whole story."
  ],

  chapters: [
    { n: "I", date: "December 2024", title: "The First Hello",
      text: "It started with one message. Neither of us knew that one conversation would turn into everything.",
      chat: ["hi", "hello 🙂", "so what are you watching these days?", "k-dramas 😌"] },
    { n: "II", date: "11 January 2025 · afternoon", title: "The Afternoon We Said Yes",
      text: "A normal afternoon, until it became the best day of my life. The day we became us.",
      video: "assets/vid/her-window.mp4" },
    { n: "III", date: "28 September 2025", title: "Finally, Face to Face",
      text: "Months of calls, and then there you were. The real you. Better than every time I had imagined you.",
      video: "assets/vid/her-bike.mp4" },
    { n: "IV", date: "9 January 2026", title: "Again, and Even Better",
      text: "We met again. I'll say it simply: it's the best thing that has ever happened to me.",
      photo: "assets/img/us-selfie.jpg" }
  ],

  brave: {
    n: "V", title: "The Bravest Heart",
    text: "It was not always easy. There were storms, and some days were heavy. But you chose us, you stood strong with a clear heart and a clear mind, and you never let go. Every princess story has a hero. In ours, it was you."
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
    surprise: "And your real surprise is waiting for you. Look up. 💙"
  }
};
