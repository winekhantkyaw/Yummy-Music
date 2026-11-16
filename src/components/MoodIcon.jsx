import MusicIcon from "./MusicIcon";

function MoodIcon({ mood }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" };
  if (mood === "All") return <MusicIcon variant="record" className="mood-record-icon" />;
  if (mood === "TGIF") return (
    <span className="tgif-mark" aria-hidden="true">
      <span className="tgif-letter">T</span>
      <span className="tgif-letter">G</span>
      <span className="tgif-letter">I</span>
      <span className="tgif-letter">F</span>
      <i className="tgif-spark tgif-spark-one">✦</i>
      <i className="tgif-spark tgif-spark-two">✧</i>
    </span>
  );
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...common}>
      {mood === "Happy" && <>
        <circle cx="24" cy="24" r="8" />
        <path d="M24 5v5m0 28v5M5 24h5m28 0h5M10.6 10.6l3.5 3.5m19.8 19.8 3.5 3.5m0-26.8-3.5 3.5m-19.8 19.8-3.5 3.5" />
      </>}
      {mood === "Sad" && <>
        <path d="M12 29h23a7 7 0 0 0 .4-14 11 11 0 0 0-20.7 2.4A6 6 0 0 0 12 29Z" />
        <path d="m17 35-2 4m11-4-2 4m11-4-2 4" />
      </>}
      {mood === "Relax" && <>
        <path d="M31 8a16 16 0 1 0 9 27A17 17 0 0 1 31 8Z" />
        <path d="m13 12 .8 2.2L16 15l-2.2.8L13 18l-.8-2.2L10 15l2.2-.8L13 12Zm21 8 .9 2.1L37 23l-2.1.9L34 26l-.9-2.1L31 23l2.1-.9L34 20Z" />
      </>}
      {mood === "Energetic" && <path d="M27 5 12 26h11l-2 17 16-23H25l2-15Z" fill="currentColor" stroke="none" />}
      {mood === "Romantic" && <path d="M24 40S7 30 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22Z" />}
    </svg>
  );
}

export default MoodIcon;
