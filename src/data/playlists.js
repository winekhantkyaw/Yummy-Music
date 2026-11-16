export const playlists = {
  Happy: {
    emoji: "😊",
    title: "Happy Hits",
    spotify: "37i9dQZF1DXdPec7aLTmlC",
    apple: "https://embed.music.apple.com/us/playlist/happy-hits/pl.4fe671d3bd994738ace5ae974daebc10",
    appleLink: "https://music.apple.com/us/playlist/happy-hits/pl.4fe671d3bd994738ace5ae974daebc10",
  },
  Sad: {
    emoji: "🌧️",
    title: "Sad Songs",
    spotify: "37i9dQZF1DXdZjf8WgcTKM",
    apple: "https://embed.music.apple.com/us/playlist/jukebox-hits-sad-songs/pl.296f2fc6b619406c8c87ea6ffc46f5b3",
    appleLink: "https://music.apple.com/us/playlist/jukebox-hits-sad-songs/pl.296f2fc6b619406c8c87ea6ffc46f5b3",
  },
  Relax: {
    emoji: "🌙",
    title: "Relax",
    spotify: "37i9dQZF1DWV1PBrIG2weG",
    apple: "https://embed.music.apple.com/us/playlist/relax/pl.3aaf0879038242d1a5d2dc95986e6ba2",
    appleLink: "https://music.apple.com/us/playlist/relax/pl.3aaf0879038242d1a5d2dc95986e6ba2",
  },
  Energetic: {
    emoji: "⚡",
    title: "High-Energy Workout Mix",
    spotify: "2SM6rniZl84fEyMCB5KMQB",
    apple: "https://embed.music.apple.com/us/playlist/high-energy-workout-mix/pl.e2fe463636ee489fad152426aaab8788",
    appleLink: "https://music.apple.com/us/playlist/high-energy-workout-mix/pl.e2fe463636ee489fad152426aaab8788",
  },
  Romantic: {
    emoji: "❤️",
    title: "Love Songs",
    spotify: "6swYtItqiO3ZCHKvWFaD92",
    apple: "https://embed.music.apple.com/us/playlist/love-songs-essentials/pl.9170a7ae18d04316ac426bbb0152fbf8",
    appleLink: "https://music.apple.com/us/playlist/love-songs-essentials/pl.9170a7ae18d04316ac426bbb0152fbf8",
  },
};

export function getPlaylistEntry(mood, service = "spotify") {
  const selectedMood = mood === "All" ? "Happy" : mood;
  const playlist = playlists[selectedMood] || playlists.Happy;
  const spotify = service === "spotify";
  return {
    id: `${selectedMood}:${service}`,
    mood: selectedMood,
    service,
    title: playlist.title,
    emoji: playlist.emoji,
    url: spotify
      ? `https://open.spotify.com/playlist/${playlist.spotify}`
      : playlist.appleLink,
  };
}
