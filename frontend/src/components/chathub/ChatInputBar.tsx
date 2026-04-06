'use client';

import { useState, useRef, useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useModels } from '@/hooks/useModels';
import { MODELS } from '@/data/models';

interface ChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (message: string, attachments?: File[]) => void;
  placeholder?: string;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  disabled?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

const IcMic = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IcDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IcVideo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const IcScreen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IcPaperclip = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const IcImage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IcPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcChevron = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IcSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ChatInputBar({
  value,
  onChange,
  onSend,
  placeholder = "Describe your project, ask a question, or just say hi — I'm here to help...",
  selectedModel,
  onModelChange,
  disabled = false,
  files,
  onFilesChange,
}: ChatInputBarProps) {
  const { addToast } = useUIStore();
  const { data: apiModels } = useModels();
  const models = apiModels ?? MODELS;

  const [modelDropOpen, setModelDropOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim(), files.length > 0 ? files : undefined);
    onChange('');
    onFilesChange([]);
  }, [value, files, disabled, onSend, onChange, onFilesChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFilesChange([...files, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => onFilesChange(files.filter((_, i) => i !== idx));

  const cs = (label: string) => addToast(`🚧 ${label} — coming soon!`, 'info');

  const currentModel = models.find((m) => m.id === selectedModel) ?? models[0] ?? MODELS[0];

  return (
    <div
      className="rounded-2xl border overflow-visible"
      style={{
        background: '#fff',
        borderColor: 'var(--border2)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* File chips */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {files.map((f, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
            >
              📎 {f.name}
              <button onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`} className="opacity-60 hover:opacity-100">✕</button>
            </span>
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
        aria-label="Message input"
        className="w-full px-4 pt-4 pb-2 text-sm resize-none border-none focus:outline-none bg-transparent"
        style={{ color: 'var(--text)', fontFamily: 'Instrument Sans, sans-serif' }}
      />

      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-3 pb-3 pt-1 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <TBtn label="Voice input"    color="#7C3AED" onClick={() => cs('Voice input')}><IcMic /></TBtn>
        <TBtn label="Attach file"    color="#D97706" onClick={() => fileInputRef.current?.click()}><IcDownload /></TBtn>
        <TBtn label="Video input"    color="#2563EB" onClick={() => cs('Video input')}><IcVideo /></TBtn>
        <TBtn label="Share screen"   color="#0891B2" onClick={() => cs('Screen sharing')}><IcScreen /></TBtn>
        <TBtn label="Upload file"    color="#DC2626" onClick={() => fileInputRef.current?.click()}><IcPaperclip /></TBtn>
        <TBtn label="Upload image"   color="#059669" onClick={() => imageInputRef.current?.click()}><IcImage /></TBtn>
        <TBtn label="More options"   color="var(--text3)" onClick={() => cs('More options')}><IcPlus /></TBtn>

        {/* Model selector */}
        <div className="relative ml-auto mr-2">
          <button
            onClick={() => setModelDropOpen((v) => !v)}
            aria-label="Select AI model"
            aria-expanded={modelDropOpen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}
          >
            <span aria-hidden="true">{currentModel?.emoji ?? '🤖'}</span>
            <span className="max-w-24 truncate">{currentModel?.name ?? 'Select model'}</span>
            <IcChevron />
          </button>

          {modelDropOpen && (
            <div
              className="absolute bottom-full mb-2 right-0 w-64 rounded-xl border shadow-xl overflow-hidden z-50"
              style={{ background: '#fff', borderColor: 'var(--border)' }}
            >
              <div className="max-h-64 overflow-y-auto py-1">
                {models.slice(0, 30).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onModelChange?.(m.id); setModelDropOpen(false); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-gray-50"
                    style={{ color: m.id === selectedModel ? 'var(--accent)' : 'var(--text)' }}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: m.id === selectedModel ? 'var(--accent-lt)' : 'var(--bg2)' }}
                      aria-hidden="true"
                    >{m.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{m.name}</p>
                      <p className="truncate" style={{ color: 'var(--text3)' }}>{m.provider}</p>
                    </div>
                    {m.id === selectedModel && (
                      <span className="ml-auto shrink-0 font-bold" style={{ color: 'var(--accent)' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Circular send button */}
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="w-9 h-9 flex items-center justify-center rounded-full text-white shrink-0 transition-opacity hover:opacity-90 disabled:opacity-35 active:scale-95"
          style={{ background: 'var(--accent)' }}
        >
          <IcSend />
        </button>
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} aria-hidden="true" />
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} aria-hidden="true" />
    </div>
  );
}

function TBtn({ children, label, color, onClick }: {
  children: React.ReactNode; label: string; color: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
      style={{ color }}
    >
      {children}
    </button>
  );
}
