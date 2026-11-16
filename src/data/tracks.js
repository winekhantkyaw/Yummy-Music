const tracksByMood = {
  Happy: [
    { id: "unwritten", title: "Unwritten", artist: "Natasha Bedingfield", mood: "Happy", emoji: "🌅", spotify: "5myDx9u6jUCdBy45C2XQ7z", apple: "1739928416", appleSlug: "unwritten" },
    { id: "uptown-funk", title: "Uptown Funk", artist: "Mark Ronson feat. Bruno Mars", mood: "Happy", emoji: "🪩", spotify: "4rmPQGwcLQjCoFq5NrTA0D", apple: "1030797104", appleSlug: "uptown-funk-feat-bruno-mars" },
  ],
  Sad: [
    { id: "the-scientist", title: "The Scientist", artist: "Coldplay", mood: "Sad", emoji: "🌧️", spotify: "2LTl1pU074hnzAdy0SpHAb", apple: "1725093974", appleSlug: "the-scientist" },
    { id: "lovely", title: "lovely", artist: "Billie Eilish & Khalid", mood: "Sad", emoji: "🌙", spotify: "2B0DqGtDjNVRAqrcG8R5NN", apple: "1578783749", appleSlug: "lovely" },
  ],
  Relax: [
    { id: "sunday-morning", title: "Sunday Morning", artist: "The Velvet Underground & Nico", mood: "Relax", emoji: "☁️", spotify: "4u2C3qpSwXCra6MJRzFijB", apple: "1445668953", appleSlug: "sunday-morning" },
    { id: "golden-hour", title: "golden hour", artist: "JVKE", mood: "Relax", emoji: "🌄", spotify: "4JBeqXhNnqpleC0L3FrTsl", apple: "1640157165", appleSlug: "golden-hour" },
   
  ],
  Energetic: [
    { id: "rasputin", title: "Rasputin", artist: "Majestic, Boney M.", mood: "Energetic", emoji: "⚡", spotify: "0b18g3G5spr4ZCkz7Y6Q0Q", apple: "1685047397", appleSlug: "rasputin" },
    { id: "still-dre", title: "Still D.R.E.", artist: "Dr. Dre feat. Snoop Dogg", mood: "Energetic", emoji: "🔥", spotify: "503OTo2dSqe7qk76rgsbep", apple: "1444156738", appleSlug: "still-d-r-e-feat-snoop-dogg" },
  ],
  Romantic: [
    { id: "im-yours", title: "I’m Yours", artist: "Jason Mraz", mood: "Romantic", emoji: "💗", spotify: "3S0OXQeoh0w6AY8WQVckRW", apple: "1800442835", appleSlug: "im-yours" },
    { id: "perfect", title: "Perfect", artist: "Ed Sheeran", mood: "Romantic", emoji: "🌹", spotify: "0tgVpDi06FyKpA1z0VMD4v", apple: "1630750956", appleSlug: "perfect" },
    
  ],
};

const localTracksByMood = {
  Happy: [
    { id: "local-favorite", title: "Favorite", artist: "Yummy Music", mood: "Happy", emoji: "💛", src: "/music/Favorite.mp3", service: "local" },
    { id: "local-mylifeiswet", title: "My Life Is Wet", artist: "CAMO ft JMIN", mood: "Happy", emoji: "💛", src: "/music/mylifeiswet.mp3", service: "local" },

    
  ],
  Sad: [
    { id: "local-billie", title: "Billie Eilish", artist: "Yummy Music", mood: "Sad", emoji: "🌙", src: "/music/BillieEilish.mp3", service: "local" },
    { id: "local-doublej", title: "အမှတ်တမဲ့", artist: "Doublej · Yummy Music", mood: "Sad", emoji: "🌧️", src: "/music/Doublej.mp3", service: "local" },
    
  ],
  Relax: [
    
    { id: "local-pretty-girl", title: "Pretty Girl", artist: "Maggie Lindemann", mood: "Relax", emoji: "☁️", src: "/music/pretty_girl.mp3", service: "local" },
    { id: "local-moshi_moshi", title: "Moshi Moshi", artist: "Nozomi Kitay", mood: "Relax", emoji: "☁️", src: "/music/moshi_moshi.mp3", service: "local" },
     { id: "local-fein", title: "Fein", artist: "Travis Scott", mood: "Relax", emoji: "☁️", src: "/music/fein.mp3", service: "local" },
     { id: "local-lastfridaynight", title: "Last Friday Night", artist: "Katy Perry", mood: "Relax", emoji: "☁️", src: "/music/lastfridaynight.mp3", service: "local" },
      { id: "local-drake", title: "NOKIA", artist: "Drake", mood: "Relax", emoji: "☁️", src: "/music/drake.mp3", service: "local" },
      { id: "local-thotshit", title: "Thot Shit", artist: "Megan Thee Stallion", mood: "Relax", emoji: "☁️", src: "/music/thotshit.mp3", service: "local" },

    

  ],
  Energetic: [
    { id: "local-swim", title: "SWIM", artist: "Yummy Music", mood: "Energetic", emoji: "🌊", src: "/music/SWIM.mp3", service: "local" },
    
     { id: "local-tuesday", title: "Tuesday", artist: "DUCKWRTH", mood: "Energetic", emoji: "⚡", src: "/music/Tuesday.mp3", service: "local" },
      { id: "local-travis_scott", title: "Highest in the room", artist: "Travis Scott", mood: "Energetic", emoji: "⚡", src: "/music/travis_scott.mp3", service: "local" },

  ],
  Romantic: [

     { id: "local-romantic-demo", title: "မင်း", artist: "ထူးအယ်လင်း, မီးမီးခဲ", mood: "Romantic", emoji: "❤️", src: "/music/Min.mp3", service: "local" },
     { id: "local-YouBelongWithMe", title: "You Belong With Me", artist: "Taylor Swift", mood: "Romantic", emoji: "❤️", src: "/music/YouBelongWithMe.mp3", service: "local" },
     { id: "local-beautyandthebeat", title: "Beauty And The Beat", artist: "Justin Bieber", mood: "Romantic", emoji: "❤️", src: "/music/beautyandthebeat.mp3", service: "local" },

  ],
};

export const MOODS = Object.keys(tracksByMood);

// Curated TGIF hits from the local music library. Update these IDs to change the mix.
export const TGIF_TRACK_IDS = [
  // Relax
  "local-lastfridaynight",
  "local-fein",
  // Energetic
  "local-tuesday",
  "local-swim",
  "local-travis_scott",
  // Happy
  "local-favorite",
  "local-mylifeiswet",
];

tracksByMood.All = [
  tracksByMood.Happy[0],
  tracksByMood.Sad[0],
  tracksByMood.Relax[1],
  tracksByMood.Energetic[0],
  tracksByMood.Romantic[1],
];

export function getTracksForMood(mood) {
  if (mood === "All") return [...tracksByMood.All, ...Object.values(localTracksByMood).flat()];
  if (mood === "TGIF") {
    const localTracks = Object.values(localTracksByMood).flat();
    return TGIF_TRACK_IDS.map((id) => localTracks.find((track) => track.id === id)).filter(Boolean);
  }
  return [...(tracksByMood[mood] || []), ...(localTracksByMood[mood] || [])];
}

export function getSongEntry(track, service = "spotify") {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    mood: track.mood,
    emoji: track.emoji,
    service,
    spotify: track.spotify,
    apple: track.apple,
    appleSlug: track.appleSlug,
    src: track.src,
  };
}
