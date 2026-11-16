import { useState } from "react";
import MusicIcon from "./MusicIcon";

const moodWords = {
  Happy: ["happy", "joy", "joyful", "good", "cheerful", "excited", "celebrate", "sunshine", "upbeat"],
  Sad: ["sad", "down", "blue", "lonely", "heartbroken", "upset", "cry", "miss", "grief"],
  Relax: ["relax", "calm", "peace", "peaceful", "chill", "tired", "stress", "anxious", "sleep", "quiet", "unwind"],
  Energetic: ["energy", "energetic", "hype", "workout", "active", "powerful", "motivated", "pump", "dance", "focused"],
  Romantic: ["love", "romantic", "crush", "date", "tender", "affection", "in love", "sweetheart"]
};

function understandFeeling(value) {
  const text = value.toLowerCase();
  const scores = Object.fromEntries(Object.entries(moodWords).map(([mood, words]) => [
    mood,
    words.reduce((score, word) => score + (text.includes(word) ? (word.includes(" ") ? 2 : 1) : 0), 0),
  ]));
  const bestMood = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  return scores[bestMood] > 0 ? bestMood : null;
}

function Header({ onRecommend, onFindTrack, tracks = [] }) {
  const [feeling, setFeeling] = useState("");
  const [message, setMessage] = useState("");

  const submitFeeling = (event) => {
    event.preventDefault();
    const query = feeling.trim().toLowerCase();
    const matchedTrack = query && tracks.find((track) => `${track.title} ${track.artist}`.toLowerCase().includes(query));
    if (matchedTrack) {
      onFindTrack(matchedTrack);
      setMessage(`Found “${matchedTrack.title}” by ${matchedTrack.artist}.`);
      return;
    }
    const mood = understandFeeling(feeling.trim());
    if (!feeling.trim()) {
      setMessage("Tell me a little about how you feel.");
      return;
    }
    if (!mood) {
      setMessage("Try words like calm, happy, heartbroken, energetic, or in love.");
      return;
    }
    onRecommend(mood);
    setMessage(`I picked ${mood} songs for you.`);
  };

  return (
    <header className="topbar">
      <div className="welcome">
        <span>YOUR MUSIC, YOUR MOOD</span>
        <h1>Find your mood. <MusicIcon className="heading-music-icon" /></h1>
        <p>Describe how you feel and get a music recommendation.</p>
      </div>
      <form className="feeling-search" onSubmit={submitFeeling}>
        <span aria-hidden="true">✦</span>
        <input
          aria-label="How are you feeling?"
          value={feeling}
          onChange={(event) => setFeeling(event.target.value)}
          placeholder="Search a song or describe how you feel"
        />
        <button type="submit">Recommend</button>
        {message && <small role="status">{message}</small>}
      </form>
    </header>
  );
}

export default Header;
