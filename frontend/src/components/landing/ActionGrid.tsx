'use client';

const ACTIONS = [
  { emoji: '🎨', label: 'Create image' },
  { emoji: '🎵', label: 'Generate Audio' },
  { emoji: '🎬', label: 'Create video' },
  { emoji: '📊', label: 'Create slides' },
  { emoji: '📈', label: 'Create Infographs' },
  { emoji: '❓', label: 'Create quiz' },
  { emoji: '🗂️', label: 'Create Flashcards' },
  { emoji: '🧠', label: 'Create Mind map' },
  { emoji: '📉', label: 'Analyze Data' },
  { emoji: '✍️', label: 'Write content' },
  { emoji: '💻', label: 'Code Generation' },
  { emoji: '📄', label: 'Document Analysis' },
  { emoji: '🌐', label: 'Translate' },
  { emoji: '🔭', label: 'Just Exploring' },
];

export default function ActionGrid() {
  return (
    <section className="my-10">
      <div className="flex flex-wrap justify-center gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:shadow-sm"
            style={{
              background: 'var(--white)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
            }}
            aria-label={action.label}
          >
            <span role="img" aria-hidden="true">{action.emoji}</span>
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
