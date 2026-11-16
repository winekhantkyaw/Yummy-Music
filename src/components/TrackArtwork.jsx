import { useId } from "react";

const palettes = {
  Happy: ["#edc58b", "#c88d74", "#61725e", "#f2e4bd"],
  Sad: ["#b7c4ca", "#7f9691", "#536a6d", "#dce2dc"],
  Relax: ["#b5c9ac", "#809a7c", "#506658", "#e6e6cf"],
  Energetic: ["#e2ae80", "#bf765b", "#62684f", "#f3d9aa"],
  Romantic: ["#e4b7a9", "#bd8279", "#726057", "#f2ddd1"],
  default: ["#d4c8b3", "#a68e70", "#606b59", "#eee4ce"],
};

function TrackArtwork({ mood, index = 0 }) {
  const colors = palettes[mood] || palettes.default;
  const offset = (index % 5) * 8;
  const footerText = `${(mood || "MUSIC").toUpperCase()} · SIDE A`;
  const isLongMoodLabel = mood === "Energetic" || mood === "Romantic";
  const instanceId = useId().replace(/[^a-z0-9-]/gi, "-");
  const gradientId = `cover-gradient-${mood}-${index}-${instanceId}`.replace(/[^a-z0-9-]/gi, "-");

  return (
    <svg className="track-artwork" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={colors[0]} />
          <stop offset="55%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
        <radialGradient id={`${gradientId}-vinyl`} cx="35%" cy="28%" r="78%">
          <stop stopColor="#777b79" />
          <stop offset=".28" stopColor="#292b2b" />
          <stop offset=".72" stopColor="#111313" />
          <stop offset="1" stopColor="#414442" />
        </radialGradient>
        <radialGradient id={`${gradientId}-label`} cx="30%" cy="25%">
          <stop stopColor={colors[3]} />
          <stop offset="1" stopColor={colors[1]} />
        </radialGradient>
        <linearGradient id={`${gradientId}-shine`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff" stopOpacity=".48" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".04" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="36" fill={`url(#${gradientId})`} />
      <circle cx="200" cy="200" r="177" fill="#101313" fillOpacity=".25" />
      <g transform={`rotate(${offset - 8} 200 200)`}>
        <circle cx="200" cy="200" r="165" fill={`url(#${gradientId}-vinyl)`} />
        {[151, 145, 137, 128, 118, 107, 96, 84, 72, 60, 48, 37].map((radius, ring) => (
          <circle key={radius} cx="200" cy="200" r={radius} fill="none" stroke={ring % 2 ? "#d9dfd9" : "#050707"} strokeOpacity={ring % 2 ? ".13" : ".52"} strokeWidth={ring % 3 === 0 ? "1.5" : ".8"} />
        ))}
        <path d="M74 130A146 146 0 0 1 174 57" fill="none" stroke={`url(#${gradientId}-shine)`} strokeWidth="17" strokeLinecap="round" />
        <circle cx="200" cy="200" r="31" fill={`url(#${gradientId}-label)`} />
        <circle cx="200" cy="200" r="23" fill="none" stroke="#fff" strokeOpacity=".38" />
        <circle cx="200" cy="200" r="3.5" fill="#171918" />
        <path d="M200 173v11" stroke="#fff" strokeOpacity=".42" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M318 75 272 126l-20 88" fill="none" stroke="#e6dfc8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M318 75 272 126l-20 88" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
      <circle cx="318" cy="75" r="13" fill="#c7c1ac" />
      <circle cx="318" cy="75" r="7" fill="#57594f" />
      <circle cx="252" cy="214" r="5" fill="#f0e7cb" />
      <path d="M35 350h330" stroke="#fff" strokeOpacity=".2" />
      <text x="200" y="374" textAnchor="middle" fill="#fff" fillOpacity=".9" fontSize={isLongMoodLabel ? "9.5" : "11"} fontWeight="700" letterSpacing={isLongMoodLabel ? "2.5" : "4"} textLength={isLongMoodLabel ? "284" : "330"} lengthAdjust="spacingAndGlyphs">{footerText}</text>
    </svg>
  );
}

export default TrackArtwork;
