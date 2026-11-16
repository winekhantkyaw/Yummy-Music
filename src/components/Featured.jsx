import MusicIcon from "./MusicIcon";

const moodEmojis = {
  Happy: "😊",
  Sad: "🌧️",
  Relax: "🌙",
  Energetic: "⚡",
  Romantic: "❤️",
  TGIF: "🎉",
};

function Featured({ mood }) {
  return (
    <section className="featured">
      <div className="featured-text">
        <span className="featured-label">{mood === "TGIF" ? "✦ FRIDAY BONUS MIX" : "✦ MUSIC FOR YOUR MOOD"}</span>
        <h2>{mood === "TGIF" ? <>TGIF, it’s time<br /><em>to celebrate.</em></> : <>Music for your<br /><em>current mood.</em></>}</h2>
        <p>{mood === "TGIF" ? "Local Friday hits, selected for you." : "Choose a feeling and discover real playlists from Spotify and Apple Music."}</p>
        <button
          className="start-button"
          onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}
        >
          <MusicIcon className="inline-music-icon" /> Choose your mood
        </button>
      </div>
      <div className="featured-disc" aria-hidden="true">
        <div className="big-disc spinning"><span>{mood === "All" ? <MusicIcon variant="record" className="featured-record-icon" /> : moodEmojis[mood] || <MusicIcon variant="record" className="featured-record-icon" />}</span></div>
        <div className="disc-ring ring-one" />
        <div className="disc-ring ring-two" />
        <div className="floating-note note-one"><MusicIcon /></div>
        <div className="floating-note note-two"><MusicIcon /></div>
        <div className="floating-note note-three"><MusicIcon /></div>
      </div>
    </section>
  );
}

export default Featured;
