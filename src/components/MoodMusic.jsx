import { useEffect, useRef, useState } from "react";
import { getSongEntry, getTracksForMood, MOODS } from "../data/tracks";
import TrackArtwork from "./TrackArtwork";
import MusicIcon from "./MusicIcon";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function MoodMusic({
  mood,
  setMood,
  service,
  setService,
  selectedTrackId,
  setSelectedTrackId,
  favorites,
  onToggleFavorite,
  onRecordHistory,
  customTracks,
  onPlaybackChange,
  playbackCommand,
}) {
  const [playingTrackId, setPlayingTrackId] = useState("");
  const [lastPlayedTrackId, setLastPlayedTrackId] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const savedVolume = Number(window.localStorage.getItem("yummy:volume"));
    return Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1 ? savedVolume : 0.8;
  });
  const [shuffle, setShuffle] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [lyricsResult, setLyricsResult] = useState(null);
  const audioRef = useRef(null);
  const autoPlayRef = useRef("");
  const moodTracks = mood === "All" ? getTracksForMood("All") : getTracksForMood(mood);
  const tracks = [...moodTracks, ...customTracks.filter((track) => mood === "All" || track.mood === mood)];
  const allTracks = [...MOODS.flatMap(getTracksForMood), ...customTracks];
  const selectedTrack = tracks.find((track) => track.id === selectedTrackId)
    || allTracks.find((track) => track.id === selectedTrackId)
    || tracks[0];
  const selectedTrackIndex = Math.max(0, tracks.findIndex((track) => track.id === selectedTrack.id));
  const entry = getSongEntry(selectedTrack, selectedTrack.src ? "local" : service);
  const isFavorite = favorites.some((favorite) => favorite.id === selectedTrack.id);
  const availableService = selectedTrack.src ? "local" : selectedTrack[service] ? service : selectedTrack.spotify ? "spotify" : "apple";
  const isPlaying = playingTrackId === selectedTrack.id;
  const currentLyrics = lyricsResult?.trackId === selectedTrack.id ? lyricsResult : null;

  useEffect(() => {
    if (!isMaximized) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMaximized(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMaximized]);

  const toggleLyrics = () => {
    const nextOpen = !lyricsOpen;
    setLyricsOpen(nextOpen);
    if (nextOpen) {
      window.setTimeout(() => document.getElementById("song-lyrics")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    }
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    try {
      window.localStorage.setItem("yummy:volume", String(volume));
    } catch { /* Volume remains adjustable for this session if storage is unavailable. */ }
  }, [volume, selectedTrack.id]);

  useEffect(() => {
    if (!lyricsOpen) return undefined;
    const controller = new AbortController();
    const params = new URLSearchParams({ track_name: selectedTrack.title, artist_name: selectedTrack.artist });
    fetch(`https://lrclib.net/api/get?${params}`, {
      signal: controller.signal,
      headers: { "Lrclib-App-Id": "YummyMusic/1.0" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Lyrics not found");
        return response.json();
      })
      .then((data) => {
        const text = data.plainLyrics || data.syncedLyrics?.split(/\r?\n/).map((line) => line.replace(/^\[(?:\d{2}:)?\d{2}:\d{2}(?:\.\d+)?\]\s*/, "")).filter(Boolean).join("\n");
        if (!text) throw new Error("Lyrics not found");
        setLyricsResult({ trackId: selectedTrack.id, status: "ready", text });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLyricsResult({ trackId: selectedTrack.id, status: "missing", text: "" });
      });
    return () => controller.abort();
  }, [lyricsOpen, selectedTrack.id, selectedTrack.title, selectedTrack.artist]);

  useEffect(() => {
    onPlaybackChange?.({
      id: selectedTrack.id,
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      mood: selectedTrack.mood,
      src: selectedTrack.src,
      isPlaying,
      progress: duration ? (currentTime / duration) * 100 : 0,
    });
  }, [selectedTrack, isPlaying, currentTime, duration, onPlaybackChange]);

  const lastPlaybackCommand = useRef(playbackCommand);
  useEffect(() => {
    if (lastPlaybackCommand.current === playbackCommand) return;
    lastPlaybackCommand.current = playbackCommand;
    if (!selectedTrack.src || !audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
  }, [playbackCommand, isPlaying, selectedTrack.src]);

  useEffect(() => {
    if (autoPlayRef.current !== selectedTrack.id || !audioRef.current) return;
    autoPlayRef.current = "";
    audioRef.current.play().catch(() => {});
  }, [selectedTrack.id]);

  const embedUrl = availableService === "spotify"
    ? `https://open.spotify.com/embed/track/${selectedTrack.spotify}?utm_source=generator&autoplay=1`
    : `https://embed.music.apple.com/us/song/${selectedTrack.appleSlug}/${selectedTrack.apple}?autoplay=1`;
  const openUrl = availableService === "spotify"
    ? `https://open.spotify.com/track/${selectedTrack.spotify}`
    : `https://music.apple.com/us/song/${selectedTrack.apple}`;

  const chooseTrack = (track) => {
    document.querySelectorAll("audio").forEach((player) => player.pause());
    setPlayingTrackId("");
    autoPlayRef.current = track.src && track.id !== selectedTrack.id ? track.id : "";
    if (track.src && track.id === selectedTrack.id) audioRef.current?.play().catch(() => {});
    setSelectedTrackId(track.id);
    onRecordHistory(getSongEntry(track, track.src ? "local" : service));
    window.setTimeout(() => {
      document.getElementById("song-player")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const stepTrack = (direction) => {
    if (tracks.length < 2) return;
    const nextIndex = shuffle && direction > 0
      ? (selectedTrackIndex + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length
      : (selectedTrackIndex + direction + tracks.length) % tracks.length;
    const track = tracks[nextIndex];
    document.querySelectorAll("audio").forEach((player) => player.pause());
    setPlayingTrackId("");
    autoPlayRef.current = track.src ? track.id : "";
    setSelectedTrackId(track.id);
    onRecordHistory(getSongEntry(track, track.src ? "local" : service));
  };

  const playNextLocalTrack = () => {
    const localTracks = mood === "TGIF" ? tracks.filter((track) => track.src) : allTracks.filter((track) => track.src);
    if (!localTracks.length) return;
    const currentIndex = localTracks.findIndex((track) => track.id === selectedTrack.id);
    const nextIndex = shuffle && localTracks.length > 1
      ? (Math.max(currentIndex, 0) + 1 + Math.floor(Math.random() * (localTracks.length - 1))) % localTracks.length
      : (currentIndex + 1 + localTracks.length) % localTracks.length;
    const track = localTracks[nextIndex];
    if (mood !== "TGIF") setMood(track.mood);
    setPlayingTrackId("");
    autoPlayRef.current = track.id;
    setSelectedTrackId(track.id);
    onRecordHistory(getSongEntry(track, "local"));
  };

  const chooseService = (nextService) => {
    setService(nextService);
    onRecordHistory(getSongEntry(selectedTrack, nextService));
  };

  return (
    <section className={`mood-music section${mood === "All" ? " popular-picks" : ""}`} id="mood-music" aria-labelledby="music-title">
      {mood !== "TGIF" && <div className="section-header song-picker-heading">
        <div>
          <span className="eyebrow">{mood === "All" ? "YOUR MUSIC SHELF" : `${mood.toUpperCase()} MOOD`}</span>
          <h2 id="music-title">Pick your next song</h2>
          <p className="mood-hint">A little row of songs, ready when you are.</p>
        </div>
        <div className="track-heading-actions">
          <span className="track-count">{tracks.length} tracks</span>
          <button type="button" className="lyrics-shortcut" onClick={toggleLyrics} aria-expanded={lyricsOpen} aria-controls="song-lyrics">
            <span aria-hidden="true">≡</span>{lyricsOpen ? "Hide lyrics" : "Lyrics"}
          </button>
        </div>
      </div>}

      {mood !== "TGIF" && <div className="track-grid" role="group" aria-label={`${mood} songs`}>
        {tracks.map((track, index) => (
          <button
            type="button"
            key={track.id}
            className={`track-card${mood === "All" ? " popular-track" : ""}${selectedTrack.id === track.id ? " selected" : ""}${selectedTrack.id === track.id && isPlaying ? " playing" : ""}`}
            onClick={() => chooseTrack(track)}
            aria-pressed={selectedTrack.id === track.id}
          >
            <span className={`track-art track-art-${index % 5}`} aria-hidden="true"><TrackArtwork mood={track.mood} index={index} /></span>
            {mood === "All" && <span className="track-rank">{String(index + 1).padStart(2, "0")}</span>}
            <span className="track-copy">
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
              <em>{track.mood}</em>
            </span>
            <span className="track-play" aria-hidden="true">
              {selectedTrack.id === track.id && isPlaying
                ? <span className="playing-bars"><i /><i /><i /><i /></span>
                : "▶"}
            </span>
          </button>
        ))}
      </div>}

      {!selectedTrack.src && <div className="service-switch" role="group" aria-label="Choose a music service">
        <button
          type="button"
          className={availableService === "spotify" ? "service-button selected spotify-choice" : "service-button"}
          onClick={() => chooseService("spotify")}
          aria-pressed={service === "spotify"}
          disabled={!selectedTrack.spotify}
        >Spotify</button>
        <button
          type="button"
          className={availableService === "apple" ? "service-button selected apple-choice" : "service-button"}
          onClick={() => chooseService("apple")}
          aria-pressed={service === "apple"}
          disabled={!selectedTrack.apple}
        >Apple Music</button>
      </div>}

      <div className={`song-player${isPlaying ? " is-playing" : ""}${!isPlaying && lastPlayedTrackId === selectedTrack.id ? " is-paused" : ""}${isMaximized ? " is-maximized" : ""}`} id="song-player">
        <button type="button" className="player-collapsed-toggle" onClick={() => {
          if (!isPlaying) audioRef.current?.play().catch(() => {});
          window.scrollTo({ top: 180, behavior: "smooth" });
        }} aria-label={isPlaying ? "Expand music player" : `Play ${selectedTrack.title}`}>
          {isPlaying ? <MusicIcon variant="record" /> : <span className="player-collapsed-play" aria-hidden="true">▶</span>}
        </button>
        <div className="player-hero">
          <div className={`player-cover${isPlaying ? " rotating" : ""}`} aria-hidden="true">
            <div className="player-vinyl"><TrackArtwork mood={selectedTrack.mood} index={selectedTrackIndex} /></div>
            <i className="cover-spark spark-one" /><i className="cover-spark spark-two" />
          </div>
          <div className="player-details">
            <div className="player-status-row">
              <div className="player-status"><span className={isPlaying ? "status-dot live" : "status-dot"} />{isPlaying ? "NOW PLAYING" : "READY TO PLAY"}</div>
              <button
                type="button"
                className="player-maximize-toggle"
                onClick={() => setIsMaximized((current) => !current)}
                aria-label={isMaximized ? "Restore music player" : "Maximize music player"}
                aria-expanded={isMaximized}
                title={isMaximized ? "Restore player" : "Maximize player"}
              >{isMaximized ? "×" : "⛶"}</button>
            </div>
            <h3>{selectedTrack.title}</h3>
            <p className="player-artist">{selectedTrack.artist}</p>
            <div className="player-tags"><span className={`player-emotion emotion-${selectedTrack.mood.toLowerCase()}`}>Feeling · {selectedTrack.mood}</span><span>{selectedTrack.src ? "Yummy Audio" : availableService === "spotify" ? "Spotify" : "Apple Music"}</span></div>
            <div className="player-actions">
              {selectedTrack.src ? <span className="local-track-badge">YUMMY AUDIO</span> : (
                <a href={openUrl} target="_blank" rel="noreferrer" onClick={() => onRecordHistory(getSongEntry(selectedTrack, availableService))}>
                  Open in {availableService === "spotify" ? "Spotify" : "Apple Music"} ↗
                </a>
              )}
          <button
            type="button"
            className={`player-favorite${isFavorite ? " saved" : ""}`}
            onClick={() => onToggleFavorite(entry)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${selectedTrack.title} from favorites` : `Add ${selectedTrack.title} to favorites`}
          >
            <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
            {isFavorite ? "Saved" : "Favorite"}
          </button>
          <button type="button" className={`lyrics-toggle${lyricsOpen ? " open" : ""}`} onClick={toggleLyrics} aria-expanded={lyricsOpen} aria-controls="song-lyrics">
            <span aria-hidden="true">≡</span>{lyricsOpen ? "Hide lyrics" : "Lyrics"}
          </button>
            </div>
          </div>
        </div>
        {selectedTrack.src ? (
          <div className="custom-audio-player">
            <audio
              key={selectedTrack.id}
              ref={audioRef}
              className="audio-source"
              preload="metadata"
              onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); setCurrentTime(0); }}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onPlay={() => { setPlayingTrackId(selectedTrack.id); setLastPlayedTrackId(selectedTrack.id); onRecordHistory(entry); }}
              onPause={() => setPlayingTrackId((current) => current === selectedTrack.id ? "" : current)}
              onEnded={() => { setPlayingTrackId(""); setCurrentTime(0); playNextLocalTrack(); }}
            >
              <source src={selectedTrack.src} />
              Your browser does not support audio playback.
            </audio>
            <button
              type="button"
              className="audio-toggle"
              onClick={() => {
                if (isPlaying) audioRef.current?.pause();
                else audioRef.current?.play().catch(() => {});
              }}
              aria-label={isPlaying ? `Pause ${selectedTrack.title}` : `Play ${selectedTrack.title}`}
            >{isPlaying ? "Ⅱ" : "▶"}</button>
            <div className="audio-extra-controls">
              <button type="button" onClick={() => stepTrack(-1)} aria-label="Previous track" title="Previous track">|◀</button>
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }}
                aria-label="Restart song"
                title="Restart song"
              >↺</button>
              <button type="button" className={shuffle ? "active" : ""} onClick={() => setShuffle((value) => !value)} aria-label="Shuffle" aria-pressed={shuffle} title="Shuffle">⤨</button>
              <button type="button" onClick={() => stepTrack(1)} aria-label="Next track" title="Next track">▶|</button>
            </div>
            <label className="audio-volume" title={`Volume ${Math.round(volume * 100)}%`}>
              <span aria-hidden="true">{volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volume"
              />
            </label>
            <div className="audio-timeline">
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={Math.min(currentTime, duration || 0)}
                disabled={!duration}
                onChange={(event) => {
                  const nextTime = Number(event.target.value);
                  if (audioRef.current) audioRef.current.currentTime = nextTime;
                  setCurrentTime(nextTime);
                }}
                aria-label="Seek through song"
                title="Click or drag to choose a part of the song"
                style={{ "--audio-progress": `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              <div className="audio-times"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
            </div>
            <span className="audio-live-label"><i />{isPlaying ? "PLAYING" : "READY"}</span>
          </div>
        ) : (
          <>
            <iframe
              key={`${service}-${selectedTrack.id}`}
              className={`music-embed ${availableService}-embed`}
              title={`${selectedTrack.title} by ${selectedTrack.artist} on ${availableService === "spotify" ? "Spotify" : "Apple Music"}`}
              src={embedUrl}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
            <p className="streaming-note">Playback is provided by {availableService === "spotify" ? "Spotify" : "Apple Music"}; sign-in or a subscription may be required.</p>
          </>
        )}
        {lyricsOpen && (
          <div className="lyrics-panel" id="song-lyrics" aria-live="polite">
            <div className="lyrics-panel-heading">
              <div><span className="eyebrow">SING ALONG</span><h4>{selectedTrack.title} · Lyrics</h4></div>
              <button type="button" onClick={() => setLyricsOpen(false)} aria-label="Close lyrics">×</button>
            </div>
            {!currentLyrics && <p className="lyrics-message">Looking for lyrics…</p>}
            {currentLyrics?.status === "missing" && <p className="lyrics-message">Lyrics aren’t available for this song yet.</p>}
            {currentLyrics?.status === "ready" && <pre className="lyrics-text">{currentLyrics.text}</pre>}
            <p className="lyrics-attribution">Lyrics provided by <a href="https://lrclib.net" target="_blank" rel="noreferrer">LRCLIB</a></p>
          </div>
        )}
      </div>
    </section>
  );
}

export default MoodMusic;
