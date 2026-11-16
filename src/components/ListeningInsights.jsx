import { useMemo, useState } from "react";

const MOOD_EMOJI = { Happy: "☀️", Sad: "🌧️", Relax: "☁️", Energetic: "⚡", Romantic: "💗" };

function ListeningInsights({ history }) {
  const [period, setPeriod] = useState("week");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedBucket, setSelectedBucket] = useState("");
  const insight = useMemo(() => {
    const now = new Date();
    const dayCount = period === "week" ? 7 : 30;
    const start = new Date(now);
    start.setDate(now.getDate() - dayCount + 1);
    start.setHours(0, 0, 0, 0);
    const events = history.flatMap((entry) => {
      const dates = Array.isArray(entry.playedAt) && entry.playedAt.length
        ? entry.playedAt
        : entry.selectedAt ? [entry.selectedAt] : [];
      return dates.map((date) => ({ entry, date: new Date(date) }))
        .filter((event) => !Number.isNaN(event.date.getTime()) && event.date >= start && event.date <= now);
    });
    const moods = Object.entries(events.reduce((counts, { entry }) => {
      const mood = entry.mood || "Other";
      counts[mood] = (counts[mood] || 0) + 1;
      return counts;
    }, {})).sort((first, second) => second[1] - first[1]);
    const songCounts = Object.values(events.reduce((counts, { entry }) => {
      const item = counts[entry.id] || { id: entry.id, title: entry.title, artist: entry.artist, mood: entry.mood, count: 0 };
      item.count += 1;
      counts[entry.id] = item;
      return counts;
    }, {})).sort((first, second) => second.count - first.count);
    const bucketCount = period === "week" ? 7 : 5;
    const activity = Array.from({ length: bucketCount }, (_, index) => {
      const from = new Date(start);
      from.setDate(start.getDate() + (period === "week" ? index : index * 7));
      const to = new Date(from);
      to.setDate(from.getDate() + (period === "week" ? 1 : 7));
      if (to > new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)) to.setTime(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime());
      const count = events.filter(({ date }) => date >= from && date < to).length;
      return {
        label: period === "week" ? from.toLocaleDateString(undefined, { weekday: "short" }) : `Week ${index + 1}`,
        count,
        from,
        to,
      };
    });
    return { events, moods, songCounts, activity };
  }, [history, period]);

  const topMood = insight.moods[0];
  const maxMoodCount = Math.max(1, ...insight.moods.map(([, count]) => count));
  const maxActivity = Math.max(1, ...insight.activity.map(({ count }) => count));
  const activeBucket = insight.activity.find(({ label }) => label === selectedBucket);
  const filteredEvents = insight.events.filter(({ entry, date }) => (
    (!selectedMood || (entry.mood || "Other") === selectedMood)
    && (!activeBucket || (date >= activeBucket.from && date < activeBucket.to))
  ));
  const visibleSongs = Object.values(filteredEvents.reduce((counts, { entry }) => {
    const item = counts[entry.id] || { id: entry.id, title: entry.title, artist: entry.artist, count: 0 };
    item.count += 1;
    counts[entry.id] = item;
    return counts;
  }, {})).sort((first, second) => second.count - first.count).slice(0, 5);
  const clearFilters = () => { setSelectedMood(""); setSelectedBucket(""); };
  const changePeriod = (nextPeriod) => { setPeriod(nextPeriod); clearFilters(); };

  return (
    <section className="listening-insights section" aria-labelledby="insights-title">
      <header className="insights-heading">
        <div>
          <span className="eyebrow">YOUR MUSIC, IN NUMBERS</span>
          <h2 id="insights-title">Listening Insights</h2>
          <p>See which moods and songs showed up in your listening history.</p>
        </div>
        <div className="insights-period" role="group" aria-label="Choose listening period">
          <button type="button" className={period === "week" ? "selected" : ""} onClick={() => changePeriod("week")} aria-pressed={period === "week"}>Last 7 days</button>
          <button type="button" className={period === "month" ? "selected" : ""} onClick={() => changePeriod("month")} aria-pressed={period === "month"}>Last 30 days</button>
        </div>
      </header>

      <div className="insights-stats">
        <article><span>TRACKS LOGGED</span><strong>{insight.events.length}</strong><small>{period === "week" ? "in the last 7 days" : "in the last 30 days"}</small></article>
        <article><span>DIFFERENT SONGS</span><strong>{new Set(insight.events.map(({ entry }) => entry.id)).size}</strong><small>unique tracks in this period</small></article>
        <article><span>TOP MOOD</span><strong>{topMood ? <>{MOOD_EMOJI[topMood[0]] || "🎵"} {topMood[0]}</> : "—"}</strong><small>{topMood ? `${topMood[1]} tracks logged` : "no activity yet"}</small></article>
      </div>

      {insight.events.length ? <div className="insights-grid">
        <section className="insights-card" aria-labelledby="mood-breakdown-title">
          <div className="insights-card-heading"><div><span className="eyebrow">YOUR VIBE</span><h3 id="mood-breakdown-title">Moods you played</h3></div></div>
          <div className="mood-breakdown">
            {insight.moods.map(([mood, count]) => <button type="button" className={`mood-breakdown-row${selectedMood === mood ? " selected" : ""}`} key={`${period}-${mood}`} onClick={() => setSelectedMood((current) => current === mood ? "" : mood)} aria-pressed={selectedMood === mood} title={`Filter top songs by ${mood}`}>
              <span className="mood-breakdown-name"><i>{MOOD_EMOJI[mood] || "🎵"}</i>{mood}</span>
              <span className="mood-breakdown-bar"><i style={{ width: `${(count / maxMoodCount) * 100}%` }} /></span>
              <strong>{count}</strong>
            </button>)}
          </div>
        </section>
        <section className="insights-card" aria-labelledby="activity-title">
          <div className="insights-card-heading"><div><span className="eyebrow">LISTENING ACTIVITY</span><h3 id="activity-title">{period === "week" ? "By day" : "By week"}</h3></div></div>
          <div className={`activity-bars${period === "month" ? " monthly" : ""}`}>
            {insight.activity.map((item) => <button type="button" className={`activity-bar-item${selectedBucket === item.label ? " selected" : ""}`} key={`${period}-${item.label}`} onClick={() => setSelectedBucket((current) => current === item.label ? "" : item.label)} aria-pressed={selectedBucket === item.label} title={`Show songs from ${item.label}`}>
              <strong>{item.count}</strong><span><i style={{ height: `${Math.max(item.count ? 10 : 4, (item.count / maxActivity) * 100)}%` }} /></span><small>{item.label}</small>
            </button>)}
          </div>
        </section>
        <section className="insights-card insights-top-songs" aria-labelledby="top-songs-title">
          <div className="insights-card-heading"><div><span className="eyebrow">ON REPEAT</span><h3 id="top-songs-title">{selectedMood || selectedBucket ? "Filtered songs" : "Your top songs"}</h3></div>{(selectedMood || selectedBucket) && <button type="button" className="insights-clear-filter" onClick={clearFilters}>Clear filter ×</button>}</div>
          {visibleSongs.length ? <ol>{visibleSongs.map((song, index) => <li key={song.id}>
            <span className="top-song-rank">{String(index + 1).padStart(2, "0")}</span>
            <span className="top-song-copy"><strong>{song.title}</strong><small>{song.artist}</small></span>
            <span className="top-song-count">{song.count}×</span>
          </li>)}</ol> : <p className="insights-filter-empty">No songs match this selection.</p>}
        </section>
      </div> : <div className="insights-empty"><span>♫</span><h3>Your listening story starts here</h3><p>Choose a mood or song to add it to your history, then come back to see your most-played moods and tracks.</p></div>}

      <p className="insights-note">Based on songs selected or opened in this app. Music services don’t report playback details back to Yummy.</p>
    </section>
  );
}

export default ListeningInsights;
