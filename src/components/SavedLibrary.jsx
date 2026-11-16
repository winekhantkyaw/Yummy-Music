import { useState } from "react";
import TrackArtwork from "./TrackArtwork";

function SavedLibrary({ kind, items, onOpen, onRemove, onPlaybackChange }) {
  const [playback, setPlayback] = useState({ id: "", progress: 0 });
  const isHistory = kind === "history";
  const title = isHistory ? "Listening history" : "Your favorites";
  const dateGroups = [];
  if (items.length) {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    items.forEach((item) => {
      const savedAt = new Date(isHistory ? item.selectedAt : item.favoritedAt);
      const validDate = (isHistory ? item.selectedAt : item.favoritedAt) && !Number.isNaN(savedAt.getTime());
      const dateKey = validDate ? `${savedAt.getFullYear()}-${savedAt.getMonth()}-${savedAt.getDate()}` : "unknown-date";
      const label = !validDate ? (isHistory ? "Earlier" : "Saved earlier") : dateKey === todayKey ? "Today" : dateKey === yesterdayKey ? "Yesterday" : savedAt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
      let group = dateGroups.find((entry) => entry.key === dateKey);
      if (!group) {
        group = { key: dateKey, label, date: validDate ? savedAt.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "", items: [] };
        dateGroups.push(group);
      }
      group.items.push(item);
    });
  }

  const renderCard = (item, index) => {
    const audioId = `saved-audio-${encodeURIComponent(item.id)}`;
    const playHistoryItem = () => {
      if (item.src) {
        const audio = document.getElementById(audioId);
        if (playback.id === item.id) audio?.pause();
        else {
          document.querySelectorAll("audio").forEach((player) => player.pause());
          audio?.play().catch(() => {});
        }
        return;
      }
      const providerUrl = item.service === "apple" && item.apple
        ? `https://music.apple.com/us/song/${item.appleSlug || item.title.toLowerCase().replaceAll(" ", "-")}/${item.apple}`
        : item.spotify
          ? `https://open.spotify.com/track/${item.spotify}`
          : null;
      if (providerUrl) window.open(providerUrl, "_blank", "noopener,noreferrer");
      else onOpen(item);
    };

    return (
    <article className={`saved-card${isHistory ? " recent-card" : ""}`} key={`${item.id}-${item.selectedAt || "favorite"}`}>
      {(
        <div className="saved-history-row">
          <button type="button" className="saved-row-open" onClick={playHistoryItem} aria-label={`Play ${item.title}`}>
            <span className="saved-icon"><TrackArtwork mood={item.mood} index={index} /></span>
            <span className="saved-copy">
              <strong>{item.title}</strong>
              <small>{item.artist}</small>
              <span className={`saved-track-progress${playback.id === item.id ? " is-playing" : ""}`} aria-label={playback.id === item.id ? "Song playing" : "Playback status"}>
                <span style={{ width: `${playback.id === item.id ? playback.progress : 0}%` }} />
              </span>
            </span>
          </button>
          <span className={`saved-play-wrap${playback.id === item.id ? " is-playing" : ""}`}>
            <button type="button" className="saved-play" aria-label={playback.id === item.id ? `Pause ${item.title}` : `Play ${item.title}`} onClick={playHistoryItem}>{playback.id === item.id ? "Ⅱ" : "▶"}</button>
            <span className="saved-progress-track" aria-hidden="true"><span style={{ width: `${playback.id === item.id ? playback.progress : 0}%` }} /></span>
          </span>
        </div>
      )}
      {item.src ? (
        <audio
          id={audioId}
          className="history-audio-source"
          preload="none"
          onPlay={() => {
            setPlayback({ id: item.id, progress: 0 });
            onPlaybackChange?.({ ...item, isPlaying: true, progress: 0 });
          }}
          onPause={() => {
            setPlayback((current) => current.id === item.id ? { id: "", progress: 0 } : current);
            onPlaybackChange?.({ ...item, isPlaying: false, progress: 0 });
          }}
          onEnded={() => {
            setPlayback((current) => current.id === item.id ? { id: "", progress: 0 } : current);
            onPlaybackChange?.({ ...item, isPlaying: false, progress: 0 });
          }}
          onTimeUpdate={(event) => {
            const audio = event.currentTarget;
            const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            setPlayback((current) => current.id === item.id ? { ...current, progress } : current);
            onPlaybackChange?.({ ...item, isPlaying: true, progress });
          }}
        ><source src={item.src} /></audio>
      ) : null}
      {!isHistory && (
        <button
          type="button"
          className="saved-remove"
          aria-label={`Remove ${item.title} from favorites`}
          onClick={() => onRemove(item.id)}
        >×</button>
      )}
    </article>
  );
  };

  return (
    <section className={`saved-library section${isHistory ? " recent-music" : " favorites-library"}`} aria-labelledby="saved-library-title">
      <div className="section-header">
        <div>
          <span className="eyebrow">{isHistory ? "YOUR LISTENING JOURNEY" : "THE SONGS YOU LOVE"}</span>
          <h2 id="saved-library-title">{title}</h2>
          <p className="mood-hint">
            {isHistory
              ? "Your music, arranged by day. Play any track again right here."
              : "A collection of your favorite songs, ready whenever you are."}
          </p>
        </div>
      </div>

      {items.length ? (
        (
          <div className="history-timeline">
            {dateGroups.map((group) => (
              <section className={`history-day${group.label === "Today" ? " today" : ""}`} key={group.key}>
                <header className="history-day-heading">
                  <span className="history-day-dot" />
                  <span className="history-date-caption">{isHistory ? "LISTENING DAY" : "SAVED ON"}</span>
                  <h3>{group.label}</h3>
                  {group.date && <time>{group.date}</time>}
                  <span className="history-play-count">{group.items.length} {isHistory ? (group.items.length === 1 ? "play" : "plays") : (group.items.length === 1 ? "song" : "songs")}</span>
                </header>
                <div className="saved-grid">{group.items.map(renderCard)}</div>
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="library-empty">
          <span>{isHistory ? "◷" : "♡"}</span>
          <h3>{isHistory ? "Nothing here yet" : "Save songs you love"}</h3>
          <p>{isHistory
            ? "Choose a mood and select a song to build your history."
            : "Tap “Add favorite” on any song and it will show up here."}</p>
        </div>
      )}
    </section>
  );
}

export default SavedLibrary;
