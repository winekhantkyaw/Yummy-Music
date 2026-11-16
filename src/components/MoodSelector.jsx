import MoodIcon from "./MoodIcon";

const moods = [
  "All",
  "Happy",
  "Sad",
  "Relax",
  "Energetic",
  "Romantic",
  "TGIF",
];

function MoodSelector({ selectedMood, setSelectedMood }) {
  return (
    <section className="section mood-explore" id="discover">

      <div className="section-header">
        <div>
          <span className="eyebrow">
            DISCOVER
          </span>

          <h2>What are you feeling?</h2>
          <p className="mood-hint">Choose a mood to find music ready to play.</p>
        </div>
      </div>

      <div className="mood-list">

        {moods.map((name) => (

          <button
            type="button"
            key={name}
            onClick={() => setSelectedMood(name)}
            aria-pressed={selectedMood === name}
            className={
              selectedMood === name
                ? "mood-card selected"
                : "mood-card"
            }
          >

            <span className="mood-icon mood-symbol">
              <MoodIcon mood={name} />
            </span>

            <span className="mood-name">{name}</span>

            {selectedMood === name && (
              <i>✓</i>
            )}

          </button>

        ))}

      </div>

    </section>
  );
}

export default MoodSelector;
