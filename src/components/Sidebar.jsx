import MusicIcon from "./MusicIcon";

function Sidebar({ accountUser, profile, onAccountClick, activeView, onNavigate, onHomeClick, favoriteCount, historyCount, nowPlaying, onTogglePlayback, onShowPlayer }) {
  const profileName = profile?.name || accountUser?.user_metadata?.full_name || accountUser?.email?.split("@")[0] || "Guest profile";
  const profileSubtitle = accountUser?.email || "Profile settings";
  const avatarLetter = profile?.avatar || profileName.trim().charAt(0).toUpperCase() || "G";

  return (
    <aside className="sidebar">
      <button type="button" className="logo logo-home" onClick={onHomeClick} aria-label="YUMMY Music home">
        <div className="logo-icon logo-record" aria-hidden="true">
          <svg viewBox="0 0 40 40" focusable="false">
            <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="1" />
            <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeOpacity=".28" strokeWidth="1" />
            <circle cx="20" cy="20" r="10" fill="currentColor" />
            <text x="20" y="27" textAnchor="middle" fill="#edf1e4" fontFamily="Georgia, serif" fontSize="19" fontWeight="700">Y</text>
          </svg>
        </div>
        <div>
          <strong>YUMMY Music</strong>
          <span>Feel the music</span>
          <small className="logo-credit">by busy_wine</small>
        </div>
      </button>
      <div className="sidebar-label">YOUR LIBRARY</div>
      <nav className="library-nav" aria-label="Your music library">
        <button type="button" className={activeView === "discover" ? "library-nav-item active" : "library-nav-item"} onClick={() => onNavigate("discover")}>
          <span>⌂</span> Discover
        </button>
        <button type="button" className={activeView === "favorites" ? "library-nav-item active" : "library-nav-item"} onClick={() => onNavigate("favorites")}>
          <span>♡</span> Favorites <small>{favoriteCount}</small>
        </button>
        <button type="button" className={activeView === "history" ? "library-nav-item active" : "library-nav-item"} onClick={() => onNavigate("history")}>
          <span>◷</span> Listening history <small>{historyCount}</small>
        </button>
        <button type="button" className={activeView === "insights" ? "library-nav-item active" : "library-nav-item"} onClick={() => onNavigate("insights")}>
          <span>▥</span> Listening insights
        </button>
        <button type="button" className={activeView === "game" ? "library-nav-item active" : "library-nav-item"} onClick={() => onNavigate("game")}>
          <span><MusicIcon /></span> Music Match
        </button>
        <button type="button" className={activeView === "tune-game" ? "library-nav-item active" : "library-nav-item"} onClick={() => onNavigate("tune-game")}>
          <span>🎤</span> Name That Tune
        </button>
      </nav>
      {nowPlaying?.hasPlayed && (
        <div className="sidebar-now-playing" aria-label="Now playing">
          <div className="sidebar-now-playing-top"><span className="sidebar-playing-icon"><MusicIcon /></span><span>NOW PLAYING</span></div>
          <button type="button" className="sidebar-track-info sidebar-track-open" onClick={onShowPlayer} aria-label={`Show ${nowPlaying.title} in the music player`}>
            <div className="sidebar-mini-record" aria-hidden="true"><MusicIcon /></div>
            <div className="sidebar-track-copy">
              <strong title={nowPlaying.title}>{nowPlaying.title}</strong>
              <small>{nowPlaying.artist}</small>
            </div>
          </button>
          <div className="sidebar-progress-row">
            <div className="sidebar-player-progress" aria-label={`${Math.round(nowPlaying.progress || 0)} percent played`}><span style={{ width: `${nowPlaying.progress || 0}%` }} /></div>
            <button type="button" className="sidebar-player-toggle" onClick={onTogglePlayback} aria-label={nowPlaying.isPlaying ? "Pause music" : "Resume music"}>{nowPlaying.isPlaying ? "Ⅱ" : "▶"}</button>
          </div>
        </div>
      )}
      <button type="button" className="sidebar-profile" onClick={onAccountClick} aria-label="Open profile settings" title="Open profile settings">
        <div className="avatar">{profile?.image ? <img src={profile.image} alt="" /> : avatarLetter}</div>
        <div>
          <strong>{accountUser ? profileName : profile?.name || "Profile"}</strong>
          <span>{profileSubtitle}</span>
        </div>
        <span className="profile-arrow">›</span>
      </button>
    </aside>
  );
}

export default Sidebar;
