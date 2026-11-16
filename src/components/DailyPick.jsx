import { useMemo } from "react";
import { getTracksForMood } from "../data/tracks";
import TrackArtwork from "./TrackArtwork";

function DailyPick({ mood = "All", customTracks = [], onPlayTrack }) {
  const pick = useMemo(() => {
    const tracks = [...getTracksForMood(mood), ...customTracks]
      .filter((track) => track?.title && track.src)
      .filter((track) => mood === "All" || track.mood === mood)
      .filter((track, index, all) => all.findIndex((item) => item.id === track.id) === index);
    if (!tracks.length) return null;
    const seed = [...`${mood}:${tracks.map((track) => track.id).join(",")}`]
      .reduce((value, character) => value + character.charCodeAt(0), 0);
    return tracks[Math.floor((Math.abs(Math.sin(seed) * 10000) % 1) * tracks.length)];
  }, [mood, customTracks]);

  if (!pick) return null;

  return (
    <section className="daily-pick" aria-labelledby="daily-pick-title">
      <div className="daily-pick-art" aria-hidden="true"><TrackArtwork mood={pick.mood} /></div>
      <div className="daily-pick-copy">
        <span className="eyebrow">TODAY’S LOCAL PICK · {pick.mood}</span>
        <h2 id="daily-pick-title">{pick.title}</h2>
        <p>{pick.artist} · From a local music file</p>
      </div>
      <button type="button" className="daily-pick-play" onClick={() => onPlayTrack(pick)}><span aria-hidden="true">▶</span> Play pick</button>
    </section>
  );
}

export default DailyPick;
