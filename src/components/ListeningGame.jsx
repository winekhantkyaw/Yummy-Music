import { useEffect, useRef, useState } from "react";
import MusicIcon from "./MusicIcon";

const symbols = ["🎧", "🎵", "🎹", "🎸", "🎤", "🎼", "🎷", "🥁", "🎺", "🪇", "🎻", "📻"];
const GAME_SAVE_KEY = "yummy:memory-game";
const winMessages = [
  { title: "You did it!", note: "Take a moment to feel proud—you stayed with it and finished." },
  { title: "A lovely little win.", note: "Keep that good energy with you as the music plays on." },
  { title: "Look at you go!", note: "Small wins matter. You made this one happen." },
  { title: "You found your rhythm.", note: "Breathe, enjoy the moment, and carry that confidence forward." },
];

function pairCountFor(level) {
  return Math.min(4 + level * 2, symbols.length);
}

function makeDeck(level) {
  const selectedSymbols = symbols.slice(0, pairCountFor(level));
  const cards = [...selectedSymbols, ...selectedSymbols].map((symbol, index) => ({ id: index, symbol }));
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
  }
  return cards;
}

function playWinSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const context = new AudioContextClass();
    const now = context.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.11;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.34);
    });
    window.setTimeout(() => context.close().catch(() => {}), 800);
  } catch {
    // The visual celebration still works if audio is unavailable.
  }
}

function loadGame() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(GAME_SAVE_KEY) || "null");
    if (!saved || !Number.isInteger(saved.level) || saved.level < 1) return null;
    if (!Array.isArray(saved.cards) || saved.cards.length !== pairCountFor(saved.level) * 2) return null;
    if (saved.cards.some((card) => !Number.isInteger(card.id) || !symbols.includes(card.symbol))) return null;
    const isValidIndexes = (indexes, maxLength) => Array.isArray(indexes)
      && indexes.length <= maxLength
      && indexes.every((index) => Number.isInteger(index) && index >= 0 && index < saved.cards.length)
      && new Set(indexes).size === indexes.length;
    if (!isValidIndexes(saved.matched, saved.cards.length) || !isValidIndexes(saved.flipped, 2)) return null;
    if (!Number.isInteger(saved.moves) || saved.moves < 0) return null;
    return saved;
  } catch {
    return null;
  }
}

function ListeningGame() {
  const [initialGame] = useState(loadGame);
  const [level, setLevel] = useState(() => initialGame?.level || 1);
  const [cards, setCards] = useState(() => initialGame?.cards || makeDeck(initialGame?.level || 1));
  const [flipped, setFlipped] = useState(() => initialGame?.flipped || []);
  const [matched, setMatched] = useState(() => initialGame?.matched || []);
  const [moves, setMoves] = useState(() => initialGame?.moves || 0);
  const [locked, setLocked] = useState(() => (initialGame?.flipped?.length || 0) === 2);
  const [celebrating, setCelebrating] = useState(false);
  const wasComplete = useRef((initialGame?.matched?.length || 0) === (initialGame?.cards?.length || 0));
  const complete = matched.length === cards.length;
  const pairsFound = matched.length / 2;
  const pairCount = pairCountFor(level);
  const winMessage = winMessages[(level + moves) % winMessages.length];

  useEffect(() => {
    try {
      window.localStorage.setItem(GAME_SAVE_KEY, JSON.stringify({ level, cards, flipped, matched, moves }));
    } catch { /* Keep playing if browser storage is unavailable. */ }
  }, [level, cards, flipped, matched, moves]);

  useEffect(() => {
    if (!complete) {
      wasComplete.current = false;
      return undefined;
    }
    if (wasComplete.current) return undefined;

    wasComplete.current = true;
    setCelebrating(true);
    playWinSound();
    const timeout = window.setTimeout(() => setCelebrating(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [complete]);

  useEffect(() => {
    if (flipped.length !== 2) return undefined;

    const [first, second] = flipped;
    const isMatch = cards[first].symbol === cards[second].symbol;
    const timeout = window.setTimeout(() => {
      if (isMatch) setMatched((previous) => [...previous, first, second]);
      setFlipped([]);
      setLocked(false);
    }, isMatch ? 350 : 850);

    return () => window.clearTimeout(timeout);
  }, [flipped, cards]);

  const flipCard = (index) => {
    if (locked || flipped.includes(index) || matched.includes(index)) return;
    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);
    if (nextFlipped.length === 2) {
      setMoves((count) => count + 1);
      setLocked(true);
    }
  };

  const startLevel = (nextLevel) => {
    setLevel(nextLevel);
    setCards(makeDeck(nextLevel));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
  };

  return (
    <section className={`listening-game section game-level-${((level - 1) % 4) + 1}${complete ? " game-won" : ""}`} aria-labelledby="listening-game-title">
      <div className="game-heading">
        <div>
          <span className="eyebrow">LEVEL {level} · {pairCount} PAIRS</span>
          <h2 id="listening-game-title">Music Match</h2>
          <p>Flip two cards at a time and find every matching pair. Your progress saves automatically.</p>
        </div>
        <div className="game-stats">
          <div className="game-score">Pairs <strong>{pairsFound}/{pairCount}</strong></div>
          <div className="game-score">Moves <strong>{moves}</strong></div>
        </div>
      </div>
      <div className="game-wave" aria-hidden="true">{Array.from({ length: 15 }, (_, index) => <i key={index} />)}</div>
      <div className="game-progress" role="progressbar" aria-label="Pairs found" aria-valuemin="0" aria-valuemax={pairCount} aria-valuenow={pairsFound}>
        <span style={{ width: `${(pairsFound / pairCount) * 100}%` }} />
      </div>
      <div className="memory-board" role="group" aria-label="Music matching cards">
        {cards.map((card, index) => {
          const isVisible = flipped.includes(index) || matched.includes(index);
          return (
            <button
              type="button"
              key={card.id}
              className={`memory-card${isVisible ? " revealed" : ""}${matched.includes(index) ? " matched" : ""}`}
              style={{ "--card-index": index }}
              onClick={() => flipCard(index)}
              aria-label={isVisible ? `Card ${index + 1}: ${card.symbol}` : `Reveal card ${index + 1}`}
              aria-pressed={isVisible}
              disabled={matched.includes(index)}
            >{isVisible ? card.symbol : <MusicIcon />}</button>
          );
        })}
      </div>
      <div className={`game-feedback${celebrating ? " game-celebrating" : ""}`} aria-live="polite">
        {complete
          ? <div className="game-win-message">
            {celebrating && <span className="game-confetti" aria-hidden="true">{Array.from({ length: 36 }, (_, index) => <i key={index} style={{
              "--confetti-index": index,
              "--confetti-x": `${(index * 37 + 8) % 100}%`,
              "--confetti-y": `${(index * 17 + 5) % 48}%`,
              "--confetti-duration": `${1.2 + ((index * 13) % 11) / 10}s`,
            }}><MusicIcon /></i>)}</span>}
            <strong>✨ {winMessage.title}</strong><span>Level {level} complete in {moves} moves. {winMessage.note}</span>
          </div>
          : <span>Find the matching music cards.</span>}
        <div className="game-level-actions">
          {complete && <button type="button" className="game-next-level" onClick={() => startLevel(level + 1)}>Next level →</button>}
          <button type="button" className="game-restart" onClick={() => startLevel(1)}>Restart game</button>
        </div>
      </div>
    </section>
  );
}

export default ListeningGame;
