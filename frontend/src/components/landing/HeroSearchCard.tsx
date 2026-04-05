'use client';

import { useState, useRef, useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';

type Phase = 1 | 2 | 3;

const GOAL_TILES = [
  { icon: '✍️', label: 'Write content' },
  { icon: '🎨', label: 'Create images' },
  { icon: '🛠️', label: 'Build something' },
  { icon: '⚡', label: 'Automate work' },
  { icon: '📊', label: 'Analyse data' },
  { icon: '🔍', label: 'Just exploring' },
];

const AGENT_CATEGORIES = [
  'Customer Support', 'Research', 'Code Review',
  'Content Writing', 'Data Analysis', 'Sales Outreach',
];

export default function HeroSearchCard() {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<Phase>(1);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { addToast } = useUIStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    addToast('✅ Query submitted! Finding your perfect model…', 'success');
    setText('');
    setPhase(1);
  }, [text, addToast]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGoalClick = (goal: string) => {
    setText(goal);
    setPhase(3);
    setTimeout(() => setPhase(1), 2000);
  };

  const handleComingSoon = () => {
    addToast('🚧 Coming soon!', 'info');
  };

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div
        className="rounded-2xl shadow-lg border overflow-hidden"
        style={{ background: '#fff', borderColor: 'var(--border2)' }}
      >
        {/* File chips */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {files.map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
              >
                📎 {f.name}
                <button
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${f.name}`}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Click here and type anything — or just say hi! 🙋"
          rows={3}
          aria-label="Search or ask anything"
          className="w-full px-4 pt-4 pb-2 text-base resize-none border-none focus:outline-none bg-transparent"
          style={{ color: 'var(--text)', fontFamily: 'Instrument Sans, sans-serif' }}
        />

        {/* Bottom button row */}
        <div className="flex items-center gap-1 px-3 pb-3 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
          <IconButton
            aria-label="Voice conversation"
            style={{ color: '#7C3AED' }}
            onClick={() => addToast('🎤 Voice conversation — coming soon!', 'info')}
          >
            🎤
          </IconButton>
          <IconButton
            aria-label="Voice typing"
            style={{ color: '#D97706' }}
            onClick={() => addToast('🎙️ Voice typing — coming soon!', 'info')}
          >
            🎙️
          </IconButton>
          <IconButton
            aria-label="Video input (coming soon)"
            style={{ color: '#2563EB' }}
            onClick={handleComingSoon}
          >
            📹
          </IconButton>
          <IconButton
            aria-label="Screen sharing (coming soon)"
            style={{ color: '#0891B2' }}
            onClick={handleComingSoon}
          >
            🖥️
          </IconButton>
          <IconButton
            aria-label="Attach file"
            style={{ color: '#DC2626' }}
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </IconButton>
          <IconButton
            aria-label="Upload image"
            style={{ color: '#059669' }}
            onClick={() => imageInputRef.current?.click()}
          >
            🖼️
          </IconButton>
          <IconButton
            aria-label="Prompt tips"
            style={{ color: 'var(--text2)' }}
            onClick={() => addToast('✦ Prompt tips coming soon!', 'info')}
          >
            ✦
          </IconButton>

          {/* Agent+ toggle */}
          <button
            onClick={() => setAgentPanelOpen((v) => !v)}
            aria-pressed={agentPanelOpen}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ml-auto"
            style={{
              background: agentPanelOpen ? 'var(--accent)' : 'var(--bg2)',
              color: agentPanelOpen ? '#fff' : 'var(--text2)',
            }}
          >
            🤖 Agent+
          </button>

          {/* Send */}
          <button
            onClick={handleSend}
            aria-label="Send message"
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            <SendIcon />
            Let&apos;s go
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />

        {/* Agent panel */}
        {agentPanelOpen && (
          <div
            className="border-t px-4 py-4"
            style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                🤖 Agent Configuration
              </h3>
              <button
                onClick={() => setAgentPanelOpen(false)}
                aria-label="Close agent panel"
                className="text-xs opacity-60 hover:opacity-100"
                style={{ color: 'var(--text2)' }}
              >
                ✕ Close
              </button>
            </div>
            <input
              type="text"
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              placeholder="Search agent capabilities…"
              className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)', background: '#fff' }}
            />
            <div className="flex flex-wrap gap-2">
              {AGENT_CATEGORIES.filter((c) =>
                c.toLowerCase().includes(agentSearch.toLowerCase())
              ).map((cat) => (
                <button
                  key={cat}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors hover:border-accent"
                  style={{ borderColor: 'var(--border2)', color: 'var(--text2)', background: '#fff' }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              className="mt-3 text-xs flex items-center gap-1"
              style={{ color: 'var(--accent)' }}
              onClick={() => addToast('🔀 Shuffled use cases!', 'info')}
            >
              🔀 Shuffle use cases
            </button>
          </div>
        )}

        {/* Expandable body */}
        <div
          className="border-t"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
        >
          {phase === 1 && (
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">👋</span>
                <div>
                  <p className="font-semibold text-base mb-1" style={{ color: 'var(--text)' }}>
                    Welcome! You&apos;re in the right place.
                  </p>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text2)' }}>
                    <li>✅ 525+ AI models — all in one place</li>
                    <li>✅ We&apos;ll recommend the perfect one for you</li>
                    <li>✅ No technical knowledge needed</li>
                    <li>✅ Free to explore, pay only when you use</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setPhase(2)}
                  className="btn-primary text-sm"
                >
                  ✨ Let&apos;s get started
                </button>
                <button
                  onClick={() => setText('')}
                  className="btn-ghost text-sm"
                >
                  Skip — search directly
                </button>
              </div>
            </div>
          )}

          {phase === 2 && (
            <div className="px-6 py-5">
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text2)' }}>
                What&apos;s your main goal today?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GOAL_TILES.map((tile) => (
                  <button
                    key={tile.label}
                    onClick={() => handleGoalClick(tile.label)}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium text-left transition-all hover:border-accent hover:shadow-sm"
                    style={{
                      borderColor: 'var(--border2)',
                      background: '#fff',
                      color: 'var(--text)',
                    }}
                  >
                    <span className="text-xl">{tile.icon}</span>
                    {tile.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 3 && (
            <div className="px-6 py-8 text-center">
              <div className="text-3xl mb-3 animate-bounce">✨</div>
              <p className="text-base font-medium" style={{ color: 'var(--text)' }}>
                Building your personalised query…
              </p>
              <div
                className="mt-3 h-1 rounded-full overflow-hidden"
                style={{ background: 'var(--bg2)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    background: 'var(--accent)',
                    animation: 'progressBar 1.8s ease-in-out',
                    width: '100%',
                  }}
                />
              </div>
              <style>{`
                @keyframes progressBar {
                  from { width: 0%; }
                  to   { width: 100%; }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  style,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  'aria-label': string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-base transition-colors hover:bg-gray-100"
      style={style}
    >
      {children}
    </button>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
