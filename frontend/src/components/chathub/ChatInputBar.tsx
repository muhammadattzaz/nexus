'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useModels } from '@/hooks/useModels';
import { useAgents } from '@/hooks/useAgents';
import { useAuthStore } from '@/store/authStore';
import { MODELS } from '@/data/models';
import { Agent } from '@/types';

interface ChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (message: string, attachments?: File[], agentId?: string) => void;
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
const IcPaperclip = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const IcImage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IcScreen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IcVideo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const IcCamera = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
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

// ─── Capture helper ───────────────────────────────────────────────────────────

async function captureFromStream(
  stream: MediaStream,
  filename: string,
  mimeType: 'image/jpeg' | 'image/png',
): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.onloadedmetadata = () => {
      video.play().then(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        stream.getTracks().forEach((t) => t.stop());
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], filename, { type: mimeType }));
          else reject(new Error('Canvas capture failed'));
        }, mimeType);
      });
    };
    video.onerror = () => reject(new Error('Video load error'));
  });
}

// ─── Agent type emoji map ─────────────────────────────────────────────────────

const AGENT_TYPE_EMOJI: Record<string, string> = {
  'customer-support': '🎧',
  research: '🔬',
  code: '💻',
  sales: '💼',
  content: '✍️',
  operations: '⚙️',
  finance: '📊',
  general: '🤖',
};

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
  const router = useRouter();
  const { addToast } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const { data: apiModels } = useModels();
  const models = apiModels ?? MODELS;

  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // ── Voice input ─────────────────────────────────────────────────────────────

  const handleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      addToast('Voice input is not supported in this browser. Try Chrome or Edge.', 'error');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results as SpeechRecognitionResultList)
        .map((r) => r[0].transcript)
        .join('');
      onChange(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      addToast('Voice recognition stopped.', 'info');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, onChange, addToast]);

  // ── Camera capture ──────────────────────────────────────────────────────────

  const handleCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const file = await captureFromStream(stream, 'camera-capture.jpg', 'image/jpeg');
      onFilesChange([...files, file]);
      addToast('📸 Camera snapshot attached!', 'success');
    } catch {
      addToast('Camera access denied or unavailable.', 'error');
    }
  }, [files, onFilesChange, addToast]);

  // ── Screen capture ──────────────────────────────────────────────────────────

  const handleScreen = useCallback(async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const file = await captureFromStream(stream, 'screenshot.png', 'image/png');
      onFilesChange([...files, file]);
      addToast('🖥️ Screenshot attached!', 'success');
    } catch {
      addToast('Screen share cancelled.', 'info');
    }
  }, [files, onFilesChange, addToast]);

  // ── Send ────────────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim(), files.length > 0 ? files : undefined, selectedAgent?._id);
    onChange('');
    onFilesChange([]);
  }, [value, files, disabled, onSend, onChange, onFilesChange, selectedAgent]);

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

  const currentModel = models.find((m) => m.id === selectedModel) ?? models[0] ?? MODELS[0];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="rounded-2xl border overflow-visible"
      style={{
        background: '#fff',
        borderColor: isListening ? '#7C3AED' : 'var(--border2)',
        boxShadow: isListening
          ? '0 0 0 3px rgba(124,58,237,0.15), 0 2px 12px rgba(0,0,0,0.06)'
          : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
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
              {f.type.startsWith('image/') ? '🖼️' : '📎'} {f.name}
              <button onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`} className="opacity-60 hover:opacity-100">✕</button>
            </span>
          ))}
        </div>
      )}

      {/* Selected agent chip */}
      {selectedAgent && (
        <div className="flex items-center gap-2 px-4 pt-2">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'var(--accent-lt)', color: 'var(--accent)' }}
          >
            🤖 {selectedAgent.name}
            <button
              onClick={() => setSelectedAgent(null)}
              aria-label="Remove agent"
              className="opacity-60 hover:opacity-100"
            >✕</button>
          </span>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? 'Listening… speak now'
              : selectedAgent
              ? `Chatting with ${selectedAgent.name} — type your message…`
              : placeholder
          }
          rows={2}
          disabled={disabled}
          aria-label="Message input"
          className="w-full px-4 pt-4 pb-2 text-sm resize-none border-none focus:outline-none bg-transparent"
          style={{
            color: isListening ? '#7C3AED' : 'var(--text)',
            fontFamily: 'Instrument Sans, sans-serif',
          }}
        />

        {/* Listening pulse */}
        {isListening && (
          <div className="absolute bottom-2 left-4 flex items-center gap-1.5 pointer-events-none">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 rounded-full animate-bounce"
                  style={{ height: 10 + i * 3, background: '#7C3AED', animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            <span className="text-xs font-medium" style={{ color: '#7C3AED' }}>Listening…</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-3 pb-3 pt-1 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Voice */}
        <TBtn
          label={isListening ? 'Stop listening' : 'Voice input'}
          color="#7C3AED"
          active={isListening}
          onClick={handleVoice}
        ><IcMic /></TBtn>

        {/* Attach file */}
        <TBtn label="Attach file" color="#D97706" onClick={() => fileInputRef.current?.click()}>
          <IcPaperclip />
        </TBtn>

        {/* Upload image */}
        <TBtn label="Upload image" color="#2563EB" onClick={() => imageInputRef.current?.click()}>
          <IcImage />
        </TBtn>

        {/* Camera capture */}
        <TBtn label="Camera capture" color="#0891B2" onClick={handleCamera}>
          <IcCamera />
        </TBtn>

        {/* Video input (camera) */}
        <TBtn label="Video input" color="#DC2626" onClick={handleCamera}>
          <IcVideo />
        </TBtn>

        {/* Share screen */}
        <TBtn label="Share screen" color="#059669" onClick={handleScreen}>
          <IcScreen />
        </TBtn>

        {/* Agent toggle */}
        <button
          onClick={() => setAgentOpen((v) => !v)}
          aria-pressed={agentOpen}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ml-1 transition-colors"
          style={{
            background: agentOpen || selectedAgent ? 'var(--accent)' : 'var(--bg2)',
            color: agentOpen || selectedAgent ? '#fff' : 'var(--text2)',
          }}
        >
          🤖 {selectedAgent ? selectedAgent.name.split(' ')[0] : 'Agent'}
          <span
            className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: agentOpen || selectedAgent ? 'rgba(255,255,255,0.25)' : 'var(--border2)',
              color: agentOpen || selectedAgent ? '#fff' : 'var(--text2)',
            }}
          >+</span>
        </button>

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

        {/* Send button */}
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

      {/* Agent panel */}
      {agentOpen && (
        <AgentPanel
          selectedId={selectedAgent?._id ?? null}
          isAuthenticated={isAuthenticated}
          onSelect={(agent) => { setSelectedAgent(agent); setAgentOpen(false); }}
          onClear={() => { setSelectedAgent(null); setAgentOpen(false); }}
          onClose={() => setAgentOpen(false)}
          onNavigate={(path) => router.push(path)}
        />
      )}

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} aria-hidden="true" />
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} aria-hidden="true" />
    </div>
  );
}

// ─── TBtn ─────────────────────────────────────────────────────────────────────

function TBtn({ children, label, color, onClick, active }: {
  children: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
      style={{
        color,
        background: active ? `${color}18` : undefined,
        outline: active ? `2px solid ${color}40` : undefined,
      }}
    >
      {children}
    </button>
  );
}

// ─── AgentPanel ───────────────────────────────────────────────────────────────

function AgentPanel({
  selectedId, isAuthenticated, onSelect, onClear, onClose, onNavigate,
}: {
  selectedId: string | null;
  isAuthenticated: boolean;
  onSelect: (agent: Agent) => void;
  onClear: () => void;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const [q, setQ] = useState('');
  const { data: agents = [], isLoading } = useAgents();

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(q.toLowerCase()) ||
      a.type.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="text-xs font-semibold" style={{ color: 'var(--text)' }}>🤖 Select an Agent</h3>
        <div className="flex items-center gap-2">
          {selectedId && (
            <button
              onClick={onClear}
              className="text-xs px-2 py-0.5 rounded-lg"
              style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
            >Clear</button>
          )}
          <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100" style={{ color: 'var(--text2)' }}>✕</button>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="px-4 pb-4 text-center">
          <p className="text-xs mb-3" style={{ color: 'var(--text2)' }}>Sign in to use your personal AI agents</p>
          <button
            onClick={() => onNavigate('/signin')}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >Sign in</button>
        </div>
      ) : isLoading ? (
        <div className="px-4 pb-4 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-28 rounded-xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="px-4 pb-4 text-center">
          <p className="text-xs mb-3" style={{ color: 'var(--text2)' }}>No agents yet. Build one to get started.</p>
          <button
            onClick={() => onNavigate('/agents')}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >Build an Agent →</button>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search agents…"
            className="w-full px-3 py-1.5 rounded-lg border text-xs mb-3 focus:outline-none"
            style={{ borderColor: 'var(--border2)', color: 'var(--text)', background: '#fff' }}
          />
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {filtered.map((agent) => {
              const isSelected = agent._id === selectedId;
              return (
                <button
                  key={agent._id}
                  onClick={() => onSelect(agent)}
                  className="shrink-0 flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all hover:shadow-sm"
                  style={{
                    width: 130,
                    background: isSelected ? 'var(--accent-lt)' : '#fff',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <span className="text-lg">{AGENT_TYPE_EMOJI[agent.type] ?? '🤖'}</span>
                  <p className="text-xs font-semibold truncate w-full" style={{ color: 'var(--text)' }}>{agent.name}</p>
                  <p className="text-[10px] truncate w-full" style={{ color: 'var(--text3)' }}>
                    {agent.type} · {agent.status}
                  </p>
                  {isSelected && (
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>✓ Selected</span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => onNavigate('/agents')}
              className="shrink-0 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-dashed transition-colors hover:border-[var(--accent)]"
              style={{ width: 90, borderColor: 'var(--border2)', color: 'var(--text3)' }}
            >
              <span className="text-lg">➕</span>
              <p className="text-[10px] font-medium">New Agent</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

