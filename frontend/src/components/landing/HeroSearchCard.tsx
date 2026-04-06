'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useAgents } from '@/hooks/useAgents';
import { Agent } from '@/types';

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  {
    key: 'recruiting',
    label: 'Recruiting',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: 'prototype',
    label: 'Create a prototype',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    key: 'business',
    label: 'Build a business',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    key: 'learning',
    label: 'Help me learn',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    key: 'research',
    label: 'Research',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconMic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconPaperclip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const IconImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconScreen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const IconVideo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Capture helpers ──────────────────────────────────────────────────────────

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
    video.onerror = () => reject(new Error('Video error'));
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HeroSearchCard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('recruiting');
  const [files, setFiles] = useState<File[]>([]);
  const [agentOpen, setAgentOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const { data: suggestions = [], isLoading: sugLoading } = useSuggestions(activeTab);

  // ── Voice Input (Web Speech API) ──────────────────────────────────────────

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
      setText(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      addToast('Voice recognition stopped.', 'info');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, addToast]);

  // ── Camera capture ────────────────────────────────────────────────────────

  const handleCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const file = await captureFromStream(stream, 'camera-capture.jpg', 'image/jpeg');
      setFiles((prev) => [...prev, file]);
      addToast('📸 Camera snapshot attached!', 'success');
    } catch {
      addToast('Camera access denied or unavailable.', 'error');
    }
  }, [addToast]);

  // ── Screen capture ────────────────────────────────────────────────────────

  const handleScreen = useCallback(async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const file = await captureFromStream(stream, 'screenshot.png', 'image/png');
      setFiles((prev) => [...prev, file]);
      addToast('🖥️ Screenshot attached!', 'success');
    } catch {
      addToast('Screen share cancelled.', 'info');
    }
  }, [addToast]);

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const q = text.trim();
    if (!q) { textareaRef.current?.focus(); return; }
    if (!isAuthenticated) { router.push('/signin'); return; }

    if (selectedAgent) {
      router.push(`/chathub?q=${encodeURIComponent(q)}&agent=${encodeURIComponent(selectedAgent._id)}`);
    } else {
      router.push(`/chathub?q=${encodeURIComponent(q)}`);
    }
  }, [text, isAuthenticated, router, selectedAgent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const fillText = (suggestion: string) => { setText(suggestion); textareaRef.current?.focus(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  // ── Render ────────────────────────────────────────────────────────────────

  const placeholder = isListening
    ? 'Listening… speak now'
    : selectedAgent
    ? `Chatting with ${selectedAgent.name} — type your message…`
    : "Click here and type anything — or just say hi! 🙋";

  return (
    <div className="max-w-3xl mx-auto mb-6">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: '#fff',
          borderColor: isListening ? '#7C3AED' : 'var(--border2)',
          boxShadow: isListening
            ? '0 0 0 3px rgba(124,58,237,0.15), 0 4px 24px rgba(0,0,0,0.07)'
            : '0 4px 24px rgba(0,0,0,0.07)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* ── File chips ───────────────────────────────────────────────────── */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {files.map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
              >
                {f.type.startsWith('image/') ? '🖼️' : '📎'} {f.name}
                <button onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`} className="ml-0.5 opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
        )}

        {/* ── Selected agent chip ───────────────────────────────────────────── */}
        {selectedAgent && (
          <div className="flex items-center gap-2 px-4 pt-3">
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'var(--accent-lt)', color: 'var(--accent)' }}
            >
              🤖 {selectedAgent.name}
              <button onClick={() => setSelectedAgent(null)} aria-label="Remove agent" className="opacity-60 hover:opacity-100">✕</button>
            </span>
          </div>
        )}

        {/* ── Textarea ─────────────────────────────────────────────────────── */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            aria-label="Search or ask anything"
            className="w-full px-4 pt-4 pb-2 pr-24 text-base resize-none border-none focus:outline-none bg-transparent"
            style={{
              color: isListening ? '#7C3AED' : 'var(--text)',
              fontFamily: 'Instrument Sans, sans-serif',
            }}
          />
          {/* Top-right quick buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={() => router.push('/marketplace')}
              aria-label="Explore models"
              title="Explore models"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm transition-opacity hover:opacity-85"
              style={{ background: '#22C55E' }}
            >⭐</button>
            <button
              onClick={() => isAuthenticated ? router.push('/chathub') : router.push('/signin')}
              aria-label="Open ChatHub"
              title="Open ChatHub"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm transition-opacity hover:opacity-85"
              style={{ background: '#3B82F6' }}
            >💬</button>
          </div>

          {/* Listening pulse overlay */}
          {isListening && (
            <div className="absolute bottom-2 left-4 flex items-center gap-1.5">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full animate-bounce"
                    style={{ height: 12 + i * 4, background: '#7C3AED', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
              <span className="text-xs font-medium" style={{ color: '#7C3AED' }}>Listening…</span>
            </div>
          )}
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-0.5 px-3 py-2.5 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Voice */}
          <ToolbarBtn
            label={isListening ? 'Stop listening' : 'Voice input'}
            color={isListening ? '#7C3AED' : '#7C3AED'}
            active={isListening}
            onClick={handleVoice}
          >
            <IconMic />
          </ToolbarBtn>

          {/* Attach file */}
          <ToolbarBtn label="Attach file" color="#D97706" onClick={() => fileInputRef.current?.click()}>
            <IconPaperclip />
          </ToolbarBtn>

          {/* Upload image */}
          <ToolbarBtn label="Upload image" color="#2563EB" onClick={() => imageInputRef.current?.click()}>
            <IconImage />
          </ToolbarBtn>

          {/* Camera capture */}
          <ToolbarBtn label="Camera capture" color="#0891B2" onClick={handleCamera}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </ToolbarBtn>

          {/* Video input */}
          <ToolbarBtn label="Video input" color="#DC2626" onClick={handleCamera}>
            <IconVideo />
          </ToolbarBtn>

          {/* Share screen */}
          <ToolbarBtn label="Share screen" color="#059669" onClick={handleScreen}>
            <IconScreen />
          </ToolbarBtn>

          <div className="flex-1" />

          {/* Agent toggle */}
          <button
            onClick={() => setAgentOpen((v) => !v)}
            aria-pressed={agentOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold mr-2 transition-colors"
            style={{
              background: agentOpen || selectedAgent ? 'var(--accent)' : 'var(--bg2)',
              color: agentOpen || selectedAgent ? '#fff' : 'var(--text2)',
            }}
          >
            🤖 {selectedAgent ? selectedAgent.name : 'Agent'}
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: agentOpen || selectedAgent ? 'rgba(255,255,255,0.25)' : 'var(--border2)',
                color: agentOpen || selectedAgent ? '#fff' : 'var(--text2)',
              }}
            >+</span>
          </button>

          {/* Let's go */}
          <button
            onClick={handleSend}
            aria-label="Let's go"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
            style={{ background: 'var(--accent)' }}
          >
            <IconSearch />
            Let&apos;s go
          </button>
        </div>

        {/* ── Agent panel ───────────────────────────────────────────────────── */}
        {agentOpen && (
          <AgentPanel
            selectedId={selectedAgent?._id ?? null}
            onSelect={(agent) => { setSelectedAgent(agent); setAgentOpen(false); }}
            onClear={() => { setSelectedAgent(null); setAgentOpen(false); }}
            onClose={() => setAgentOpen(false)}
          />
        )}

        {/* ── Category tabs ─────────────────────────────────────────────────── */}
        <div className="border-t overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative"
                  style={{
                    color: isActive ? 'var(--text)' : 'var(--text2)',
                    background: isActive ? '#fff' : 'transparent',
                  }}
                >
                  <span style={{ color: isActive ? 'var(--accent)' : 'var(--text3)' }}>{tab.icon}</span>
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--accent)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Suggestions ───────────────────────────────────────────────────── */}
        <div style={{ background: '#fff' }}>
          {sugLoading ? (
            <div className="px-4 py-3 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-5 rounded animate-pulse" style={{ background: 'var(--bg2)', width: `${60 + i * 6}%` }} />
              ))}
            </div>
          ) : (
            <ul>
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => fillText(s.text)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-[#F9F7F4] group"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)', color: 'var(--text2)' }}
                    aria-label={`Use suggestion: ${s.text}`}
                  >
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: 'var(--bg2)' }}>
                      {s.icon}
                    </span>
                    <span className="group-hover:text-[var(--text)] transition-colors">{s.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer hint ───────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-1.5 px-4 py-2.5 border-t text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text3)', background: '#FAFAF8' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Click any suggestion to fill the search box, then press{' '}
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>Let&apos;s go</span>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} aria-hidden="true" />
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} aria-hidden="true" />
    </div>
  );
}

// ─── ToolbarBtn ───────────────────────────────────────────────────────────────

function ToolbarBtn({
  children, label, color, onClick, active,
}: {
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

// ─── AgentPanel (dynamic from /agents API) ────────────────────────────────────

const AGENT_TYPE_EMOJI: Record<string, string> = {
  'customer-support': '🎧',
  'research': '🔬',
  'code': '💻',
  'sales': '💼',
  'content': '✍️',
  'operations': '⚙️',
  'finance': '📊',
  'general': '🤖',
};

function AgentPanel({
  selectedId, onSelect, onClear, onClose,
}: {
  selectedId: string | null;
  onSelect: (agent: Agent) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: agents = [], isLoading } = useAgents();
  const [q, setQ] = useState('');

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(q.toLowerCase()) ||
    a.type.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          🤖 Select an Agent
        </h3>
        <div className="flex items-center gap-2">
          {selectedId && (
            <button onClick={onClear} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
              Clear
            </button>
          )}
          <button onClick={onClose} aria-label="Close agent panel" className="text-xs opacity-60 hover:opacity-100" style={{ color: 'var(--text2)' }}>
            ✕
          </button>
        </div>
      </div>

      {!isAuthenticated ? (
        /* Not logged in */
        <div className="px-4 pb-4 text-center">
          <p className="text-sm mb-3" style={{ color: 'var(--text2)' }}>
            Sign in to use your personal AI agents
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Sign in to continue
          </button>
        </div>
      ) : isLoading ? (
        /* Loading */
        <div className="px-4 pb-4 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-32 rounded-xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : agents.length === 0 ? (
        /* No agents */
        <div className="px-4 pb-4 text-center">
          <p className="text-sm mb-3" style={{ color: 'var(--text2)' }}>
            You don&apos;t have any agents yet.
          </p>
          <button
            onClick={() => router.push('/agents')}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Build your first agent →
          </button>
        </div>
      ) : (
        /* Agent list */
        <div className="px-4 pb-4">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search agents…"
            className="w-full px-3 py-1.5 rounded-lg border text-sm mb-3 focus:outline-none"
            style={{ borderColor: 'var(--border2)', color: 'var(--text)', background: '#fff' }}
          />
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {filtered.map((agent) => {
              const isSelected = agent._id === selectedId;
              const emoji = AGENT_TYPE_EMOJI[agent.type] ?? '🤖';
              return (
                <button
                  key={agent._id}
                  onClick={() => onSelect(agent)}
                  className="shrink-0 flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all hover:shadow-sm"
                  style={{
                    width: 140,
                    background: isSelected ? 'var(--accent-lt)' : '#fff',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <span className="text-xl">{emoji}</span>
                  <p className="text-xs font-semibold truncate w-full" style={{ color: 'var(--text)' }}>
                    {agent.name}
                  </p>
                  <p className="text-[10px] truncate w-full" style={{ color: 'var(--text3)' }}>
                    {agent.type} • {agent.status}
                  </p>
                  {isSelected && (
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>✓ Selected</span>
                  )}
                </button>
              );
            })}
            {/* Create new agent shortcut */}
            <button
              onClick={() => router.push('/agents')}
              className="shrink-0 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-dashed text-center transition-colors hover:border-[var(--accent)]"
              style={{ width: 100, borderColor: 'var(--border2)', color: 'var(--text3)' }}
            >
              <span className="text-xl">➕</span>
              <p className="text-[10px] font-medium">New Agent</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

