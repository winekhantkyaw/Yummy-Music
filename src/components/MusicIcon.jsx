function MusicIcon({ variant = "note", className = "" }) {
  if (variant === "record") {
    return (
      <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="21" fill="currentColor" />
        <circle cx="24" cy="24" r="16" fill="none" stroke="#fff" strokeOpacity=".3" />
        <circle cx="24" cy="24" r="12" fill="none" stroke="#fff" strokeOpacity=".25" />
        <circle cx="24" cy="24" r="8" fill="#d7e8bd" />
        <circle cx="24" cy="24" r="2" fill="#303b31" />
        <path d="M9 17a16 16 0 0 1 7-7" fill="none" stroke="#fff" strokeLinecap="round" strokeOpacity=".42" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M19 5v16.2a5.5 5.5 0 1 1-3-4.9V9.1l11-2.3v11.4a5.5 5.5 0 1 1-3-4.9V4.4L19 5Z" fill="currentColor" />
      <path d="M19 8.2 24 7.1" stroke="#fff" strokeLinecap="round" strokeOpacity=".5" strokeWidth="1.4" />
    </svg>
  );
}

export default MusicIcon;
