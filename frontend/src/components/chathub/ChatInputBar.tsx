'use client';

import { useState, useRef, useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';
import { MODELS } from '@/data/models';

interface ChatInputBarProps {
  onSend: (message: string, attachments?: File[]) => void;
  placeholder?: string;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  disabled?: boolean;
}

export default function ChatInputBar({
  onSend,
  placeholder = 'Type a message…',
  selectedModel,
  onModelChange,
  disabled = false,
}: ChatInputBarProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const { addToast } = useUIStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) return;
    onSend(text.trim(), files.length > 0 ? files : undefined);
    setText('');
    setFiles([]);
  }, [text, files, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const currentModel = MODELS.find((m) => m.id === selectedModel);

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{ background: '#fff', borderColor: 'var(--border2)' }}
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
              <button
                onClick={() => removeFile(i)}
                aria-label={`Remove file ${f.name}`}
                className="opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
        aria-label="Message input"
        className="w-full px-4 pt-3 pb-1 text-sm resize-none border-none focus:outline-none bg-transparent"
        style={{ color: 'var(--text)' }}
      />

      {/* Bottom toolbar */}
      <div
        className="flex items-center gap-1 px-3 pb-3 pt-1 border-t flex-wrap"
        style={{ borderColor: 'var(--border)' }}
      >
        <ToolBtn aria-label="Voice conversation" style={{ color: '#7C3AED' }} onClick={() => addToast('🎤 Coming soon!', 'info')}>🎤</ToolBtn>
        <ToolBtn aria-label="Voice typing" style={{ color: '#D97706' }} onClick={() => addToast('🎙️ Coming soon!', 'info')}>🎙️</ToolBtn>
        <ToolBtn aria-label="Video input (coming soon)" style={{ color: '#2563EB' }} onClick={() => addToast('📹 Coming soon!', 'info')}>📹</ToolBtn>
        <ToolBtn aria-label="Screen sharing (coming soon)" style={{ color: '#0891B2' }} onClick={() => addToast('🖥️ Coming soon!', 'info')}>🖥️</ToolBtn>
        <ToolBtn aria-label="Attach file" style={{ color: '#DC2626' }} onClick={() => fileInputRef.current?.click()}>📎</ToolBtn>
        <ToolBtn aria-label="Upload image" style={{ color: '#059669' }} onClick={() => imageInputRef.current?.click()}>🖼️</ToolBtn>
        <ToolBtn aria-label="Prompt tips" style={{ color: 'var(--text2)' }} onClick={() => addToast('✦ Prompt tips — coming soon!', 'info')}>✦</ToolBtn>

        {/* Model selector */}
        {onModelChange && (
          <div className="relative ml-1">
            <button
              onClick={() => setModelDropOpen((v) => !v)}
              aria-label="Select AI model"
              aria-expanded={modelDropOpen}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}
            >
              <span aria-hidden="true">{currentModel?.emoji ?? '🤖'}</span>
              <span className="max-w-20 truncate">{currentModel?.name ?? 'Select model'}</span>
              <ChevronIcon />
            </button>
            {modelDropOpen && (
              <div
                className="absolute bottom-full mb-1 left-0 w-56 rounded-xl border shadow-lg overflow-hidden z-50"
                style={{ background: '#fff', borderColor: 'var(--border)' }}
              >
                <div className="max-h-60 overflow-y-auto py-1">
                  {MODELS.slice(0, 20).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { onModelChange(m.id); setModelDropOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-gray-50"
                      style={{ color: m.id === selectedModel ? 'var(--accent)' : 'var(--text)' }}
                    >
                      <span aria-hidden="true">{m.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{m.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>{m.provider}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Send — circular */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="ml-auto w-10 h-10 flex items-center justify-center rounded-full text-white transition-colors disabled:opacity-40 shrink-0 hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          <SendIcon />
        </button>
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} aria-hidden="true" />
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} aria-hidden="true" />
    </div>
  );
}

function ToolBtn({
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
