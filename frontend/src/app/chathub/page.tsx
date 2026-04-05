'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { MODELS } from '@/data/models';
import { useModels } from '@/hooks/useModels';
import {
  useSessions,
  useMessages,
  useCreateSession,
  useSendMessage,
  useDeleteSession,
} from '@/hooks/useChat';
import { ChatSession, Message } from '@/types';
import ChatInputBar from '@/components/chathub/ChatInputBar';
import ChatMessage from '@/components/chathub/ChatMessage';
import ModelDetailModal from '@/components/chathub/ModelDetailModal';
import AppNav from '@/components/layout/AppNav';
import Badge from '@/components/ui/Badge';

const CATEGORY_CHIPS = [
  'Use cases',
  'Monitor the situation',
  'Create a prototype',
  'Build a business plan',
  'Create content',
  'Analyze & research',
  'Learn something',
];

const SUGGESTIONS = [
  'Help me find the best AI model for my project',
  'I want to build an AI chatbot for my website',
  'Generate realistic images for my marketing campaign',
  'Analyse documents and extract key information',
  'Create AI agents for workflow automation',
  'Add voice and speech recognition to my app',
];

const QUICK_ACTIONS = [
  {
    section: 'NAVIGATION & TOOLS',
    items: [
      { emoji: '🛍', label: 'Browse Marketplace', href: '/marketplace' },
      { emoji: '🤖', label: 'Build an Agent', href: '/agents' },
      { emoji: '📖', label: 'How to use Guide', href: '#' },
      { emoji: '📐', label: 'Prompt Engineering', href: '#' },
      { emoji: '💰', label: 'View Pricing', href: '#' },
      { emoji: '📊', label: 'AI Models Analysis', href: '#' },
    ],
  },
  {
    section: 'CREATE & GENERATE',
    items: [
      { emoji: '🎨', label: 'Create image', href: '#' },
      { emoji: '🎵', label: 'Generate Audio', href: '#' },
      { emoji: '🎬', label: 'Create video', href: '#' },
      { emoji: '📋', label: 'Create slides', href: '#' },
      { emoji: '📈', label: 'Create Infographs', href: '#' },
      { emoji: '❓', label: 'Create quiz', href: '#' },
      { emoji: '🗂️', label: 'Create Flashcards', href: '#' },
      { emoji: '🧠', label: 'Create Mind map', href: '#' },
    ],
  },
  {
    section: 'ANALYZE & WRITE',
    items: [
      { emoji: '📉', label: 'Analyze Data', href: '#' },
      { emoji: '✍️', label: 'Write content', href: '#' },
      { emoji: '💻', label: 'Code Generation', href: '#' },
      { emoji: '📄', label: 'Document Analysis', href: '#' },
      { emoji: '🌐', label: 'Translate', href: '#' },
    ],
  },
];

export default function ChatHubPage() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuthStore();
  const { addToast } = useUIStore();

  const { data: apiModels, isLoading: modelsLoading } = useModels();
  const models = apiModels ?? MODELS;

  const { data: sessions = [] } = useSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { data: apiMessages = [], isLoading: messagesLoading } = useMessages(activeSessionId);

  const createSession = useCreateSession();
  const sendMessage = useSendMessage();
  const deleteSession = useDeleteSession();

  const [activeModelId, setActiveModelId] = useState(MODELS[0].id);
  const [modelSearch, setModelSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChip, setActiveChip] = useState('Use cases');
  const [sidebarTab, setSidebarTab] = useState<'sessions' | 'models'>('sessions');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) router.push('/signin');
  }, [isInitializing, isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [apiMessages, isTyping]);

  if (isInitializing) return null;
  if (!isAuthenticated) return null;

  const activeModel = models.find((m) => m.id === activeModelId) ?? models[0] ?? MODELS[0];

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase()),
  );

  const handleSend = async (text: string, attachments?: File[]) => {
    const msgContent = text + (attachments?.length ? ` [+${attachments.length} file(s)]` : '');

    setIsTyping(true);

    try {
      let sessionId = activeSessionId;

      if (!sessionId) {
        const session = await createSession.mutateAsync({
          title: text.slice(0, 60),
          modelId: activeModelId,
          modelName: activeModel.name,
        });
        sessionId = session._id;
        setActiveSessionId(sessionId);
      }

      await sendMessage.mutateAsync({ sessionId, role: 'user', content: msgContent });

      await new Promise((r) => setTimeout(r, 1200));

      const aiContent = `I'm **${activeModel.name}** by ${activeModel.provider}. You said: "${text}"\n\nThis is a simulated response. Connect a real AI provider to enable actual responses.`;
      await sendMessage.mutateAsync({ sessionId, role: 'assistant', content: aiContent });
    } catch {
      addToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession.mutateAsync(id);
      if (activeSessionId === id) setActiveSessionId(null);
    } catch {
      addToast('Failed to delete session.', 'error');
    }
  };

  const messages = apiMessages as Message[];

  return (
    <div className="flex flex-col h-screen pt-16" style={{ background: 'var(--bg)' }}>
      <AppNav />

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="hidden lg:flex flex-col border-r"
          style={{ width: 252, background: '#fff', borderColor: 'var(--border)' }}
        >
          {/* Tabs */}
          <div className="flex border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
            {(['sessions', 'models'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className="flex-1 py-3 text-xs font-semibold capitalize transition-colors"
                style={{
                  color: sidebarTab === tab ? 'var(--accent)' : 'var(--text2)',
                  borderBottom:
                    sidebarTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {tab === 'sessions' ? '💬 Sessions' : '🤖 Models'}
              </button>
            ))}
          </div>

          {sidebarTab === 'sessions' ? (
            <>
              <div className="px-3 pt-3 pb-2 shrink-0">
                <button
                  onClick={() => setActiveSessionId(null)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  + New Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-center" style={{ color: 'var(--text3)' }}>
                    No sessions yet. Start a new chat!
                  </p>
                ) : (
                  sessions.map((session: ChatSession) => (
                    <button
                      key={session._id}
                      onClick={() => setActiveSessionId(session._id)}
                      className="w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 group"
                      style={{
                        background:
                          activeSessionId === session._id ? '#FEF3ED' : 'transparent',
                        borderLeft:
                          activeSessionId === session._id
                            ? '2px solid var(--accent)'
                            : '2px solid transparent',
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                        style={{ background: 'var(--accent)' }}
                        aria-hidden="true"
                      >
                        {session.modelName?.charAt(0)?.toUpperCase() ?? 'N'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: 'var(--text)' }}
                        >
                          {session.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text2)' }}>
                          {session.modelName}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session._id, e)}
                        className="opacity-0 group-hover:opacity-100 text-xs px-1 py-0.5 rounded hover:bg-red-50 transition-opacity shrink-0"
                        style={{ color: 'var(--text3)' }}
                        aria-label={`Delete session ${session.title}`}
                      >
                        ✕
                      </button>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="px-3 pt-3 pb-2 shrink-0">
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: 'var(--text2)' }}
                >
                  Models
                </p>
                <input
                  type="search"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="Search models..."
                  aria-label="Search models"
                  className="w-full px-3 py-2 rounded-full border text-sm focus:outline-none"
                  style={{
                    borderColor: 'var(--border2)',
                    color: 'var(--text)',
                    background: 'var(--bg)',
                  }}
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {modelsLoading && (
                  <div
                    className="px-3 py-4 text-center text-xs"
                    style={{ color: 'var(--text3)' }}
                  >
                    Loading models…
                  </div>
                )}
                {filteredModels.slice(0, 40).map((model) => {
                  const isActive = model.id === activeModelId;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setActiveModelId(model.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                      style={{ background: isActive ? '#FEF3ED' : 'transparent' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{ background: isActive ? '#FCDEC8' : 'var(--bg2)' }}
                        aria-hidden="true"
                      >
                        {model.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: 'var(--text)' }}
                        >
                          {model.name}
                        </p>
                        <p
                          className="text-xs truncate flex items-center gap-1"
                          style={{ color: 'var(--text2)' }}
                        >
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: '#22c55e' }}
                            aria-hidden="true"
                          />
                          {model.provider}
                        </p>
                      </div>
                      {model.badge && <Badge variant={model.badge} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Create Agent CTA */}
          <div className="p-3 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
            <Link
              href="/agents"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              + Create Agent
            </Link>
          </div>
        </aside>

        {/* ── CENTER MAIN ── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {!activeSessionId ? (
            /* Welcome / greeting state */
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-2xl">
                <div
                  className="rounded-2xl p-8 text-center border"
                  style={{ background: '#fff', borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl"
                    style={{ background: '#FCDEC8' }}
                    aria-hidden="true"
                  >
                    ✦
                  </div>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
                  >
                    Welcome! I&apos;m here to help you 👋
                  </h2>
                  <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text2)' }}>
                    No tech background needed. Tell me what you&apos;d like to{' '}
                    <strong style={{ color: 'var(--text)' }}>achieve</strong> — I&apos;ll help you
                    discover what&apos;s possible, step by step.
                  </p>

                  <div className="text-left">
                    <p
                      className="text-xs font-bold tracking-wider uppercase mb-3 flex items-center gap-1.5"
                      style={{ color: 'var(--accent)' }}
                    >
                      <span aria-hidden="true">✦</span> WHAT WOULD YOU LIKE TO DO TODAY?
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { emoji: '✍️', label: 'Write content', sub: 'Emails, posts, stories' },
                        { emoji: '🎨', label: 'Create images', sub: 'Art, photos, designs' },
                        { emoji: '🔨', label: 'Build something', sub: 'Apps, tools, websites' },
                        { emoji: '📊', label: 'Analyze data', sub: 'Charts, insights, reports' },
                        { emoji: '🔍', label: 'Research', sub: 'Facts, summaries, sources' },
                        { emoji: '📚', label: 'Learn something', sub: 'Guides, courses, answers' },
                      ].map((tile) => (
                        <button
                          key={tile.label}
                          onClick={() => handleSend(tile.label)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors hover:bg-gray-50"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <span className="text-2xl" aria-hidden="true">
                            {tile.emoji}
                          </span>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: 'var(--text)' }}
                            >
                              {tile.label}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text2)' }}>
                              {tile.sub}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat messages */
            <div
              className="flex-1 overflow-y-auto p-4"
              style={{ background: 'var(--bg)' }}
            >
              {messagesLoading ? (
                <div
                  className="flex justify-center py-10 text-sm animate-pulse"
                  style={{ color: 'var(--text2)' }}
                >
                  Loading messages…
                </div>
              ) : (
                messages.map((msg, i) => (
                  <ChatMessage
                    key={msg._id ?? i}
                    role={msg.role as 'user' | 'assistant'}
                    content={msg.content}
                    timestamp={
                      msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : undefined
                    }
                  />
                ))
              )}
              {isTyping && (
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'var(--accent)' }}
                    aria-hidden="true"
                  >
                    N
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl text-sm"
                    style={{ background: '#fff', border: '1px solid var(--border)' }}
                    aria-label="AI is typing"
                  >
                    <span className="animate-pulse">●●●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── INPUT AREA ── */}
          <div
            className="px-4 pt-3 pb-2 border-t shrink-0"
            style={{ borderColor: 'var(--border)', background: '#fff' }}
          >
            <ChatInputBar
              onSend={handleSend}
              placeholder={`Message ${activeModel.name}…`}
              selectedModel={activeModelId}
              onModelChange={setActiveModelId}
              disabled={isTyping || createSession.isPending || sendMessage.isPending}
            />

            {/* Category chips */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORY_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap"
                  style={
                    activeChip === chip
                      ? { background: 'var(--text)', color: '#fff', borderColor: 'var(--text)' }
                      : { background: '#fff', color: 'var(--text2)', borderColor: 'var(--border)' }
                  }
                >
                  {chip === 'Use cases' && <span aria-hidden="true">▦</span>}
                  {chip === 'Monitor the situation' && <span aria-hidden="true">🔍</span>}
                  {chip === 'Create a prototype' && <span aria-hidden="true">{'<>'}</span>}
                  {chip === 'Build a business plan' && <span aria-hidden="true">💼</span>}
                  {chip === 'Create content' && <span aria-hidden="true">✏️</span>}
                  {chip === 'Analyze & research' && <span aria-hidden="true">📊</span>}
                  {chip === 'Learn something' && <span aria-hidden="true">📖</span>}
                  {chip}
                </button>
              ))}
            </div>

            {/* Suggestion links */}
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs flex items-start gap-1.5 py-0.5 hover:underline"
                  style={{ color: 'var(--text2)' }}
                >
                  <span className="mt-0.5" style={{ color: 'var(--text3)' }}>
                    •
                  </span>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL — QUICK ACTIONS ── */}
        <aside
          className="hidden xl:flex flex-col border-l overflow-y-auto"
          style={{ width: 252, background: '#fff', borderColor: 'var(--border)' }}
        >
          <div
            className="px-4 pt-4 pb-3 border-b shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              QUICK ACTIONS
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {QUICK_ACTIONS.map((group) => (
              <div key={group.section} className="mb-1">
                <p
                  className="px-4 pt-3 pb-1.5 text-xs font-semibold tracking-wider uppercase"
                  style={{ color: 'var(--text2)' }}
                >
                  {group.section}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded-xl text-sm transition-colors hover:bg-gray-50"
                    style={{ color: 'var(--text)' }}
                  >
                    <span
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-base shrink-0"
                      style={{ background: 'var(--bg2)' }}
                      aria-hidden="true"
                    >
                      {item.emoji}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text)' }}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </aside>
      </div>

      <ModelDetailModal />
    </div>
  );
}
