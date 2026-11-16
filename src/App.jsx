import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Featured from "./components/Featured";
import MoodSelector from "./components/MoodSelector";
import MoodMusic from "./components/MoodMusic";
import ListeningGame from "./components/ListeningGame";
import NameThatTune from "./components/NameThatTune";
import DailyPick from "./components/DailyPick";
import { getSongEntry, getTracksForMood } from "./data/tracks";
import SavedLibrary from "./components/SavedLibrary";
import ListeningInsights from "./components/ListeningInsights";
import AccountPanel from "./components/AccountPanel";
import { supabase } from "./lib/supabase";

import "./App.css";

const GUEST_OWNER = "guest";
const LAST_PLAYBACK_KEY = "yummy:last-playback";
const getLibraryKey = (owner, kind) => `yummy:${owner}:${kind}`;
const getCustomTracksKey = (owner) => `yummy:${owner}:custom-tracks`;
const getProfileKey = (owner) => `yummy:${owner}:profile`;

function readProfile(owner, user = null) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(getProfileKey(owner)) || "null");
    if (saved) return saved;
  } catch { /* Use account defaults when local profile data is unavailable. */ }
  return { name: user?.user_metadata?.full_name || "", avatar: user?.user_metadata?.avatar || "🎧", image: "" };
}

function readStoredList(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readLastPlayback() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(LAST_PLAYBACK_KEY) || "null");
    return saved?.id ? { ...saved, isPlaying: false, hasPlayed: true } : null;
  } catch {
    return null;
  }
}

function readOwnerList(owner, kind) {
  const scoped = readStoredList(getLibraryKey(owner, kind));
  if (scoped.length || owner !== GUEST_OWNER) return normalizeSongs(scoped);
  const legacyKey = kind === "favorites" ? "yummy:playlist-favorites" : "yummy:playlist-history";
  return normalizeSongs(readStoredList(legacyKey));
}

function storeList(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

function normalizeSongs(entries) {
  return entries.filter(Boolean).map((entry) => {
    if (entry.artist && (entry.src || (entry.spotify && entry.apple))) return entry;
    const track = getTracksForMood(entry.mood)[0];
    return { ...getSongEntry(track, entry.service || "spotify"), selectedAt: entry.selectedAt };
  });
}

function App() {
  const [accountUser, setAccountUser] = useState(null);
  const [profile, setProfile] = useState(() => readProfile(GUEST_OWNER));
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState("All");
  const [selectedService, setSelectedService] = useState("spotify");
  const [selectedTrackId, setSelectedTrackId] = useState(() => readLastPlayback()?.id || "");
  const [activeView, setActiveView] = useState("discover");
  const [favorites, setFavorites] = useState(() => readOwnerList(GUEST_OWNER, "favorites"));
  const [history, setHistory] = useState(() => readOwnerList(GUEST_OWNER, "history"));
  const [customTracks, setCustomTracks] = useState(() => readStoredList(getCustomTracksKey(GUEST_OWNER)));
  const [libraryOwner, setLibraryOwner] = useState(GUEST_OWNER);
  const [cloudReady, setCloudReady] = useState(!supabase);
  const [libraryMessage, setLibraryMessage] = useState("");
  const [nowPlaying, setNowPlaying] = useState(readLastPlayback);
  const [playbackCommand, setPlaybackCommand] = useState(0);
  const [playerScrollProgress, setPlayerScrollProgress] = useState(() => Math.min(window.scrollY / 300, 1));

  useEffect(() => {
    try { window.localStorage.removeItem("yummy:tgif-tracks"); } catch { /* Ignore unavailable browser storage. */ }
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateScrollPosition = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const nextProgress = Math.min(window.scrollY / 300, 1);
        setPlayerScrollProgress((current) => Math.abs(current - nextProgress) < 0.01 ? current : nextProgress);
      });
    };
    updateScrollPosition();
    window.addEventListener("scroll", updateScrollPosition, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollPosition);
    };
  }, []);

  const handlePlaybackChange = (state) => {
    setNowPlaying((current) => {
      if (!state.isPlaying && current?.id && current.id !== state.id) return current;
      const progress = !state.isPlaying && current?.id === state.id && state.progress === 0
        ? current.progress || 0
        : state.progress || 0;
      const updated = { ...state, progress, hasPlayed: state.isPlaying || current?.hasPlayed || false };
      if (updated.hasPlayed) {
        try {
          window.localStorage.setItem(LAST_PLAYBACK_KEY, JSON.stringify({ ...updated, isPlaying: false }));
        } catch {
          // The current session remains playable if storage is unavailable.
        }
      }
      return updated;
    });
  };

  const togglePlayback = () => {
    const activeAudio = Array.from(document.querySelectorAll("audio")).find((audio) => !audio.paused);
    if (activeAudio) {
      activeAudio.pause();
      return;
    }
    if (nowPlaying?.src) {
      const savedAudio = document.getElementById(`saved-audio-${encodeURIComponent(nowPlaying.id)}`);
      if (savedAudio) {
        savedAudio.play().catch(() => {});
        return;
      }
    }
    setPlaybackCommand((current) => current + 1);
  };

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    const applySession = (session) => {
      const user = session?.user || null;
      const owner = user?.id || GUEST_OWNER;
      setAccountUser(user);
      setLibraryOwner(owner);
      setProfile(readProfile(owner, user));
      setFavorites(readOwnerList(owner, "favorites"));
      setHistory(readOwnerList(owner, "history"));
      setCustomTracks(readStoredList(getCustomTracksKey(owner)));
      setCloudReady(!user);
      setLibraryMessage("");
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) applySession(session);
    }).catch(() => {
      if (active) applySession(null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !accountUser?.id) return undefined;

    let active = true;
    supabase
      .from("user_music_library")
      .select("favorites, history")
      .eq("user_id", accountUser.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) throw error;
        if (data) {
          setFavorites(normalizeSongs(Array.isArray(data.favorites) ? data.favorites : []));
          setHistory(normalizeSongs(Array.isArray(data.history) ? data.history : []));
        }
        setLibraryOwner(accountUser.id);
        setCloudReady(true);
        setLibraryMessage("");
      })
      .catch(() => {
        if (!active) return;
        setCloudReady(true);
        setLibraryMessage("Your lists are saved on this device. Apply the Supabase library migration to sync them to your account.");
      });

    return () => {
      active = false;
    };
  }, [accountUser?.id]);

  useEffect(() => {
    const owner = accountUser?.id || GUEST_OWNER;
    if (libraryOwner !== owner) return;
    storeList(getLibraryKey(owner, "favorites"), favorites);
    storeList(getLibraryKey(owner, "history"), history);
    storeList(getCustomTracksKey(owner), customTracks);

    if (!supabase || !accountUser?.id || !cloudReady) return;
    supabase.from("user_music_library").upsert({
      user_id: accountUser.id,
      favorites,
      history,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" }).then(({ error }) => {
      if (error) setLibraryMessage("Your lists are saved on this device, but account sync needs the Supabase library migration.");
      else setLibraryMessage("");
    });
  }, [favorites, history, customTracks, accountUser?.id, libraryOwner, cloudReady]);

  const recordHistory = (entry) => {
    const timestamp = new Date().toISOString();
    setHistory((previous) => {
      const existing = previous.find((saved) => saved.id === entry.id);
      const eventTimes = Array.isArray(existing?.playedAt)
        ? existing.playedAt
        : existing?.selectedAt ? [existing.selectedAt] : [];
      const lastEvent = Date.parse(eventTimes[eventTimes.length - 1] || "");
      const isDuplicateAction = Number.isFinite(lastEvent) && Date.now() - lastEvent < 5000;
      const playedAt = isDuplicateAction ? eventTimes : [...eventTimes, timestamp].slice(-300);
      return [{ ...existing, ...entry, selectedAt: timestamp, playedAt }, ...previous.filter((saved) => saved.id !== entry.id)].slice(0, 100);
    });
  };

  const toggleFavorite = (entry) => {
    setFavorites((previous) => previous.some((saved) => saved.id === entry.id)
      ? previous.filter((saved) => saved.id !== entry.id)
      : [{ ...entry, favoritedAt: new Date().toISOString() }, ...previous]);
  };

  const selectMood = (mood) => {
    setSelectedMood(mood);
    if (mood === "TGIF") {
      const tgifTracks = getTracksForMood("TGIF");
      if (!tgifTracks.length) return;
      const choices = tgifTracks.length > 1 ? tgifTracks.filter((track) => track.id !== selectedTrackId) : tgifTracks;
      const randomTrack = choices[Math.floor(Math.random() * choices.length)];
      document.querySelectorAll("audio").forEach((player) => player.pause());
      setSelectedService("local");
      setSelectedTrackId(randomTrack.id);
      setActiveView("discover");
      recordHistory(getSongEntry(randomTrack, "local"));
      setPlaybackCommand((current) => current + 1);
      window.setTimeout(() => document.getElementById("song-player")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }
    // Keep the current player mounted while the user browses another mood.
    if (selectedTrackId) return;
    const firstTrack = mood === "All"
      ? getTracksForMood(mood)[0]
      : [...customTracks.filter((track) => track.mood === mood), ...getTracksForMood(mood)][0];
    if (!firstTrack) return;
    setSelectedTrackId(firstTrack.id);
    recordHistory(getSongEntry(firstTrack, selectedService));
  };

  const openSavedSong = (entry) => {
    setSelectedMood(entry.mood);
    setSelectedService(entry.service);
    setSelectedTrackId(entry.id);
    setActiveView("discover");
    recordHistory(entry);
  };

  const removeFavorite = (id) => {
    setFavorites((previous) => previous.filter((entry) => entry.id !== id));
  };

  const playDailyPick = (track) => {
    document.querySelectorAll("audio").forEach((player) => player.pause());
    setSelectedMood(track.mood);
    setSelectedService(track.src ? "local" : "spotify");
    setSelectedTrackId(track.id);
    setActiveView("discover");
    recordHistory(getSongEntry(track, track.src ? "local" : "spotify"));
    setPlaybackCommand((current) => current + 1);
    window.setTimeout(() => document.getElementById("song-player")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };

  const recommendMood = (mood) => {
    selectMood(mood);
    window.setTimeout(() => document.getElementById("mood-music")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const findTrack = (track) => {
    document.querySelectorAll("audio").forEach((player) => player.pause());
    setSelectedMood(track.mood);
    setSelectedService(track.src ? "local" : "spotify");
    setSelectedTrackId(track.id);
    setActiveView("discover");
    recordHistory(getSongEntry(track, track.src ? "local" : "spotify"));
    window.setTimeout(() => document.getElementById("song-player")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };

  const searchableTracks = [
    ...["Happy", "Sad", "Relax", "Energetic", "Romantic"].flatMap((mood) => getTracksForMood(mood)),
    ...customTracks,
  ].filter((track, index, all) => all.findIndex((item) => item.id === track.id) === index);

  const saveProfile = async (nextProfile) => {
    const owner = accountUser?.id || GUEST_OWNER;
    if (supabase && accountUser) {
      const { error } = await supabase.auth.updateUser({ data: { full_name: nextProfile.name, avatar: nextProfile.avatar } });
      if (error) throw error;
    }
    storeList(getProfileKey(owner), nextProfile);
    setProfile(nextProfile);
  };

  return (
    <div
      className={`app${nowPlaying?.hasPlayed && activeView === "discover" ? " app-player-docked" : ""}${playerScrollProgress <= 0.02 ? " app-player-collapsed" : ""}`}
      style={{ "--player-scroll-progress": playerScrollProgress }}
    >
      <Sidebar
        accountUser={accountUser}
        profile={profile}
        onAccountClick={() => setIsAccountOpen(true)}
        activeView={activeView}
        onNavigate={setActiveView}
        onHomeClick={() => {
          setActiveView("discover");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        favoriteCount={favorites.length}
        historyCount={history.length}
        nowPlaying={nowPlaying}
        onTogglePlayback={togglePlayback}
        onShowPlayer={() => {
          setActiveView("discover");
          window.setTimeout(() => document.getElementById("song-player")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
        }}
      />

      <main className="main">
        <Header onRecommend={recommendMood} onFindTrack={findTrack} tracks={searchableTracks} />
        <div className={activeView === "discover" ? "" : "view-hidden"}>
            <Featured mood={selectedMood} />
            {selectedMood !== "TGIF" && <DailyPick mood={selectedMood} customTracks={customTracks} onPlayTrack={playDailyPick} />}
            <MoodSelector selectedMood={selectedMood} setSelectedMood={selectMood} />
            <MoodMusic
              mood={selectedMood}
              setMood={setSelectedMood}
              service={selectedService}
              setService={setSelectedService}
              selectedTrackId={selectedTrackId}
              setSelectedTrackId={setSelectedTrackId}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onRecordHistory={recordHistory}
              customTracks={customTracks}
              onPlaybackChange={handlePlaybackChange}
              playbackCommand={playbackCommand}
            />
        </div>
        {activeView !== "discover" && (
          (activeView === "favorites" || activeView === "history") &&
          <SavedLibrary
            kind={activeView}
            items={activeView === "favorites" ? favorites : history}
            onOpen={openSavedSong}
            onRemove={removeFavorite}
            onPlaybackChange={handlePlaybackChange}
          />
        )}
        {activeView === "game" && <ListeningGame />}
        {activeView === "tune-game" && <NameThatTune />}
        {activeView === "insights" && <ListeningInsights history={history} />}
        {libraryMessage && accountUser && <p className="library-sync-note" role="status">{libraryMessage}</p>}
      </main>

      {isAccountOpen && (
        <AccountPanel
          supabase={supabase}
          user={accountUser}
          profile={profile}
          onSaveProfile={saveProfile}
          onClose={() => setIsAccountOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
