import { useEffect, useRef, useState } from "react";
import { getTracksForMood } from "../data/tracks";
import MusicIcon from "./MusicIcon";

const demoTracks = [
  { id: "demo-happy-mp3", title: "Happy Preview · MP3", artist: "Yummy Music", mood: "Happy", emoji: "🌅", src: "/music/happy-demo.mp3" },
  { id: "demo-happy-wav", title: "Happy Preview · WAV", artist: "Yummy Music", mood: "Happy", emoji: "🌅", src: "/music/happy-demo.wav" },
  { id: "demo-sad-mp3", title: "Sad Preview · MP3", artist: "Yummy Music", mood: "Sad", emoji: "🌧️", src: "/music/sad-demo.mp3" },
  { id: "demo-sad-wav", title: "Sad Preview · WAV", artist: "Yummy Music", mood: "Sad", emoji: "🌧️", src: "/music/sad-demo.wav" },
  { id: "demo-relax-mp3", title: "Relax Preview · MP3", artist: "Yummy Music", mood: "Relax", emoji: "☁️", src: "/music/relax-demo.mp3" },
  { id: "demo-relax-wav", title: "Relax Preview · WAV", artist: "Yummy Music", mood: "Relax", emoji: "☁️", src: "/music/relax-demo.wav" },
  { id: "demo-energetic-mp3", title: "Energetic Preview · MP3", artist: "Yummy Music", mood: "Energetic", emoji: "⚡", src: "/music/energetic-demo.mp3" },
  { id: "demo-energetic-wav", title: "Energetic Preview · WAV", artist: "Yummy Music", mood: "Energetic", emoji: "⚡", src: "/music/energetic-demo.wav" },
  { id: "demo-romantic-mp3", title: "Romantic Preview · MP3", artist: "Yummy Music", mood: "Romantic", emoji: "💗", src: "/music/romantic-demo.mp3" },
  { id: "demo-romantic-wav", title: "Romantic Preview · WAV", artist: "Yummy Music", mood: "Romantic", emoji: "💗", src: "/music/romantic-demo.wav" },
];

const music = ["Happy", "Sad", "Relax", "Energetic", "Romantic"]
  .flatMap((mood) => getTracksForMood(mood))
  .filter((track, index, tracks) => track.src && tracks.findIndex((item) => item.id === track.id) === index)
  .concat(demoTracks);
const TOTAL_ROUNDS = 10;

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function makeQuestion(previousId = "") {
  const choices = music.filter((track) => track.id !== previousId);
  const answer = choices[Math.floor(Math.random() * choices.length)];
  const wrongAnswers = shuffled(music.filter((track) => track.id !== answer.id)).slice(0, 3);
  return { answer, options: shuffled([answer, ...wrongAnswers]) };
}

function NameThatTune() {
  const audioRef = useRef(null);
  const [question, setQuestion] = useState(() => makeQuestion());
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [message, setMessage] = useState("Play the clip and choose the song you hear.");

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [question]);

  const playClip = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      audio.currentTime = duration > 14 ? Math.floor(Math.random() * Math.min(30, duration - 8)) : 0;
      await audio.play();
      setIsPlaying(true);
      setMessage("Listen closely…");
    } catch {
      setMessage("The clip could not be played. Try again or choose another song.");
    }
  };

  const answer = (track) => {
    if (selectedId || gameOver) return;
    setSelectedId(track.id);
    if (track.id === question.answer.id) {
      setScore((current) => current + 1);
      setPoints((current) => current + 100 + streak * 25);
      setStreak((current) => current + 1);
      setMessage("That's right! Your ears are on fire.");
    } else {
      setStreak(0);
      setMessage(`Not quite. The song was “${question.answer.title}”.`);
    }
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const nextQuestion = () => {
    if (round === TOTAL_ROUNDS) {
      setGameOver(true);
      setMessage(`Game over! You got ${score} out of ${TOTAL_ROUNDS} songs.`);
      return;
    }
    setRound((current) => current + 1);
    setSelectedId("");
    setHintVisible(false);
    setQuestion(makeQuestion(question.answer.id));
    setMessage("Play the clip and choose the song you hear.");
  };

  const restart = () => {
    setRound(1);
    setScore(0);
    setPoints(0);
    setStreak(0);
    setSelectedId("");
    setHintVisible(false);
    setGameOver(false);
    setQuestion(makeQuestion());
    setMessage("Play the clip and choose the song you hear.");
  };

  return (
    <section className="listening-game section name-that-tune" aria-labelledby="name-that-tune-title">
      <div className="game-heading tune-heading">
        <div>
          <span className="eyebrow">YUMMY ARCADE · SONG QUIZ</span>
          <h2 id="name-that-tune-title">Name That Tune</h2>
          <p>One clip. Four choices. Trust your ears.</p>
        </div>
        <div className="tune-scoreboard">
          <div><small>SCORE</small><strong>{points}</strong></div>
          <div><small>STREAK</small><strong>🔥 {streak}</strong></div>
        </div>
      </div>
      <div className="tune-round-row"><span>ROUND <strong>{round.toString().padStart(2, "0")}</strong> / {TOTAL_ROUNDS}</span><span>{score} {score === 1 ? "hit" : "hits"}</span></div>
      <div className="tune-round-progress" aria-label={`Round ${round} of ${TOTAL_ROUNDS}`}><span style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} /></div>
      {!gameOver ? <>
        <audio
          ref={audioRef}
          src={question.answer.src}
          preload="metadata"
          onTimeUpdate={(event) => {
            if (event.currentTarget.currentTime >= Math.min(8, event.currentTarget.duration)) {
              event.currentTarget.pause();
              setIsPlaying(false);
              setMessage("Choose the song you just heard.");
            }
          }}
          onEnded={() => setIsPlaying(false)}
          onError={() => { setIsPlaying(false); setMessage("This audio clip is unavailable. Try another song."); }}
        />
        <div className="tune-console">
          <div className={`tune-disc${isPlaying ? " spinning" : ""}`} aria-hidden="true"><MusicIcon /></div>
          <div className="tune-console-copy"><span className={isPlaying ? "tune-live" : ""}>{isPlaying ? "NOW PLAYING" : "MYSTERY TRACK"}</span><strong>{isPlaying ? "Listen for the hook" : "Can you name it?"}</strong>
            <div className={`tune-equalizer${isPlaying ? " playing" : ""}`} aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ "--bar": `${18 + ((index * 31) % 70)}%` }} />)}</div>
          </div>
          <button type="button" className="tune-play" onClick={playClip} disabled={Boolean(selectedId)}>
            <span>{isPlaying ? "↻" : "▶"}</span>{isPlaying ? "Replay" : "Play clip"}
          </button>
        </div>
        <div className="tune-question-row"><h3>Which song is this?</h3><button type="button" className="tune-hint" onClick={() => setHintVisible(true)} disabled={hintVisible || Boolean(selectedId)}> {hintVisible ? `Mood: ${question.answer.mood}` : "✦ Reveal mood clue"}</button></div>
        <div className="tune-choices" role="group" aria-label="Choose the song title">
          {question.options.map((track, index) => {
            const isCorrect = selectedId && track.id === question.answer.id;
            const isWrong = selectedId === track.id && track.id !== question.answer.id;
            return (
              <button
                type="button"
                key={track.id}
                className={`tune-choice${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}`}
                onClick={() => answer(track)}
                disabled={Boolean(selectedId)}
              >
                <span className="tune-choice-letter">{String.fromCharCode(65 + index)}</span>
                <span className="tune-choice-emoji">{track.emoji || "🎵"}</span>
                <span><strong>{track.title}</strong><small>{track.artist}</small></span>
              </button>
            );
          })}
        </div>
      </> : <div className="tune-result"><span className="tune-result-icon">{score >= 8 ? "🏆" : score >= 5 ? "🎧" : "🎵"}</span><strong>{score >= 8 ? "Amazing ears!" : score >= 5 ? "Nice listening!" : "Keep practicing!"}</strong><span>You recognized {score} of {TOTAL_ROUNDS} songs.</span><div className="tune-result-score">{points}<small>POINTS</small></div></div>}
      <div className="game-feedback" aria-live="polite">
        <span>{message}</span>
        <div className="game-level-actions">
          {!gameOver && selectedId && <button type="button" className="game-next-level" onClick={nextQuestion}>{round === TOTAL_ROUNDS ? "See score" : "Next song →"}</button>}
          {gameOver && <button type="button" className="game-next-level" onClick={restart}>Play again</button>}
        </div>
      </div>
    </section>
  );
}

export default NameThatTune;
