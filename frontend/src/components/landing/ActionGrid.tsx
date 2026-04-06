'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface Action {
  emoji: string;
  label: string;
  prompt: string;
  dashed?: boolean;
}

const ACTIONS: Action[] = [
  // Row 1
  { emoji: '🎨', label: 'Create image', prompt: 'Create an image of ' },
  { emoji: '🎵', label: 'Generate Audio', prompt: 'Generate audio for ' },
  { emoji: '🎬', label: 'Create video', prompt: 'Create a video about ' },
  { emoji: '📊', label: 'Create slides', prompt: 'Create a presentation about ' },
  { emoji: '📈', label: 'Create Infographs', prompt: 'Design an infographic about ' },
  { emoji: '❓', label: 'Create quiz', prompt: 'Create a quiz about ' },
  { emoji: '🗂️', label: 'Create Flashcards', prompt: 'Create flashcards for ' },
  // Row 2
  { emoji: '🧠', label: 'Create Mind map', prompt: 'Build a mind map for ' },
  { emoji: '📉', label: 'Analyze Data', prompt: 'Analyze this data: ' },
  { emoji: '✍️', label: 'Write content', prompt: 'Write content about ' },
  { emoji: '💻', label: 'Code Generation', prompt: 'Generate code to ' },
  { emoji: '📄', label: 'Document Analysis', prompt: 'Analyze this document: ' },
  { emoji: '🌐', label: 'Translate', prompt: 'Translate the following to ' },
  { emoji: '🔭', label: 'Just Exploring', prompt: 'Tell me about ', dashed: true },
];

export default function ActionGrid() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleAction = (action: Action) => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }
    router.push(`/chathub?q=${encodeURIComponent(action.prompt)}`);
  };

  return (
    <section className="my-8">
      <div className="grid grid-cols-7 gap-2 max-w-3xl mx-auto">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleAction(action)}
            aria-label={action.label}
            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            style={{
              background: '#fff',
              border: action.dashed
                ? '1.5px dashed var(--border2)'
                : '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = action.dashed
                ? 'var(--border2)'
                : 'var(--border)';
            }}
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              {action.emoji}
            </span>
            <span
              className="text-center leading-tight font-medium"
              style={{ fontSize: '0.65rem', color: 'var(--text2)' }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
