/* ============================================================
   EVERYTHING PERSONAL LIVES HERE. Edit text freely.
   - Telugu lines are written in English letters (romanized).
   - `audio` is optional: drop an mp3 at that path and it plays with the
     line (your Masha-voice recording). No file = subtitles only.
   - shot:   camera angle  -> "masha" | "bear" | "wide" | "cake"
   - action: what the character does -> jump | spin | wave | peek | dance | heart | clap | cheer
   - expr:   face -> neutral | happy | surprised | naughty | love
   ============================================================ */
window.CONTENT = {
  name: "Aashu",
  password: "",                       // e.g. "tangerine" adds a gate (client-side only, not real security)
  together: "2025-01-11T14:00:00",    // live counter starts here (afternoon, local time)
  music: {
    local: "assets/audio/sing.mp3",   // you singing it (optional; used if the file exists)
    youtubeId: "8JW6qzPCkE8",         // Line Without a Hook (fallback)
    title: "Line Without a Hook"
  },

  intro: [
    { who: "masha", expr: "surprised", shot: "masha", action: "jump",  text: "Ayyo! Aashu?! Nuvvu ikkada em chesthunnav? Wait wait wait... ee roju emi roju ani gurtu undha?", audio: "assets/voice/01.mp3" },
    { who: "masha", expr: "naughty",   shot: "masha", action: "peek",  text: "Nenu Masha ni! Nee tho pata chaala naughty ga untanu. Because... nuvvu kuda naa laage kada? Hehe!", audio: "assets/voice/02.mp3" },
    { who: "bear",  expr: "happy",     shot: "bear",  action: "wave",  text: "(Bear just smiles. He has been patient with Masha for a very long time.)", audio: "assets/voice/03.mp3" },
    { who: "masha", expr: "love",      shot: "cake",  action: "heart", text: "Ee roju... mana Aashu birthday! Happy Birthday, chinna Masha! Cake ready, Bear ready, nenu ready!", audio: "assets/voice/04.mp3" },
    { who: "masha", expr: "naughty",   shot: "wide",  action: "dance", text: "Ippudu ninnu oka chinna journey ki teesukelthanu. Mana story. Kani first... scroll cheyyi, ok?", audio: "assets/voice/05.mp3" }
  ],

  chapters: [
    { ep: "01", date: "December 2024", title: "The First Hello",
      text: "It started with a simple hi. Neither of us knew that one conversation would turn into everything.",
      masha: "Look at them! Just chatting, chatting, chatting... and Bear thinks it is just 'texting'. Hehe.", mashaExpr: "naughty",
      chat: ["hi", "hello 🙂", "...", "so what are you watching these days?", "k-dramas 😌"] },
    { ep: "02", date: "11 January 2025 · afternoon", title: "The Afternoon We Said Yes",
      text: "A normal afternoon. And then it became the best day of my life, the day we became us.",
      masha: "She said yes! Bear, did you see?! Bear? ...Bear is crying. Don't tell anyone.", mashaExpr: "love",
      video: "assets/vid/her-window.mp4" },
    { ep: "03", date: "28 September 2025", title: "Finally, Face to Face",
      text: "Months of talking, and then there you were. The real you, the one I had been imagining all along. You were better.",
      masha: "Finally! Nine whole months of calls! Even Bear got tired of waiting.", mashaExpr: "surprised",
      video: "assets/vid/her-bike.mp4" },
    { ep: "04", date: "9 January 2026", title: "Again, and Even Better",
      text: "We met again. I'll say it simply: it's the best thing that has happened to me.",
      masha: "Look how close! Masha is not jealous. Masha is just... watching. Closely.", mashaExpr: "naughty",
      photo: "assets/img/us-selfie.jpg" },
    { ep: "05", date: "The hard part", title: "You Stood Strong",
      text: "It was not always easy. There were struggles, and some days were heavy. But you chose us, and you stayed strong with a clear heart and a clear mind. I will never forget that.",
      masha: "Even the toughest Masha cannot be as brave as this one. Bear says: respect.", mashaExpr: "happy",
      photo: "assets/img/her-mirror.jpg" },
    { ep: "06", date: "Always", title: "My Favourite Thing",
      text: "Your smile. And that childish, crazy side that only comes out when I'm beside you. I would pick that over anything.",
      masha: "Crazy? Who is crazy? Masha is not crazy. ...Okay, a little.", mashaExpr: "love",
      video: "assets/vid/us-hearts.mp4" }
  ],

  drama: {
    title: "When Life Gives You Tangerines",
    tagline: "Our favourite drama. But honestly, our own story is my favourite one.",
    starring: "Starring Aashu & her Bear",
    also: ["Business Proposal"]
  },

  song: {
    line: "The song I sing for you",
    note: "Every time I sang it, I meant every word."
  },

  gallery: ["assets/img/us-selfie.jpg", "assets/img/her-bike.jpg", "assets/img/her-mirror.jpg", "assets/img/poster-us-hearts.jpg",
            "assets/img/poster-her-window.jpg", "assets/img/him-black.jpg", "assets/img/him-blue.jpg"],

  bear: {
    title: "Meet your Bear",
    text: "In every story, Masha has someone who stays calm, stays patient, and loves her anyway. That's the job I want, always.",
    photos: ["assets/img/him-black.jpg", "assets/img/him-blue.jpg"]
  },

  quiz: [
    { q: "When did we first start talking?", options: ["November 2024", "December 2024", "January 2025"], answer: 1 },
    { q: "Which day did we become us?", options: ["11 January 2025", "28 September 2025", "9 January 2026"], answer: 0 },
    { q: "Our favourite K-drama?", options: ["Business Proposal", "When Life Gives You Tangerines", "Crash Landing on You"], answer: 1 },
    { q: "Our song?", options: ["Line Without a Hook", "Perfect", "Until I Found You"], answer: 0 },
    { q: "Who is Masha in this story?", options: ["Bear", "Aashu", "Aashu (obviously)"], answer: 1 }
  ],

  letter: [
    "Aashu,",
    "Happy Birthday, my Masha.",
    "Thank you for every call that turned into a morning, for every laugh that turned into a memory, and for choosing us on the days it was hardest to.",
    "You're the strongest person I know, and also the most gloriously silly. I'm lucky I get to see both.",
    "I may not be the best singer, but I will always sing for you. Wherever life takes us, I'll be the Bear to your Masha, steady, patient, and always yours.",
    "I love you. Always."
  ],

  finale: {
    wish: "Make a wish, Aashu...",
    after: { who: "masha", expr: "love", text: "Wish chesava? Secret ga unchu! Happy Birthday, Aashu! 🎉", audio: "assets/voice/06.mp3" },
    surprise: "And your real surprise is waiting for you. Look up. 💛"
  }
};
