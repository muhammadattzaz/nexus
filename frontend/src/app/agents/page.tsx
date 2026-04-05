'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/layout/AppNav';
import Footer from '@/components/layout/Footer';
import ChatInputBar from '@/components/chathub/ChatInputBar';
import ChatMessage from '@/components/chathub/ChatMessage';
import LiveBadge from '@/components/ui/LiveBadge';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useAgents, useCreateAgent, useDeleteAgent, useSeedAgents } from '@/hooks/useAgents';
import { Agent } from '@/types';

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AgentConfig {
  name: string;
  type: string;
  model: string;
  tools: string[];
  status: 'draft' | 'deployed';
  emoji: string;
  description: string;
  color: string;
}

const TYPE_EMOJI: Record<string, string> = {
  'customer-support': '💼', research: '🔍', 'code-review': '💻',
  'content-writing': '✍️', 'email-outreach': '🤝', analytics: '📊',
  education: '📚', ecommerce: '🛒',
};
const TYPE_COLOR: Record<string, string> = {
  'customer-support': 'var(--teal-lt)', research: 'var(--blue-lt)', 'code-review': 'var(--accent-lt)',
  'content-writing': 'var(--rose-lt)', 'email-outreach': 'var(--blue-lt)', analytics: 'var(--amber-lt)',
  education: 'var(--teal-lt)', ecommerce: 'var(--accent-lt)',
};

function agentEmoji(type: string) { return TYPE_EMOJI[type] ?? '🤖'; }
function agentColor(type: string) { return TYPE_COLOR[type] ?? 'var(--bg2)'; }

const AGENT_TYPES = ['💬 Customer Support', '🔍 Research', '💻 Code', '✍️ Content', '📧 Email', '📊 Analytics'];
const AUDIENCES = ['B2B Enterprises', 'Small Businesses', 'Developers', 'Consumers', 'Healthcare', 'Finance'];
const TONES = ['Professional', 'Friendly', 'Concise', 'Empathetic', 'Technical', 'Creative'];
const TOOLS = ['Web Search', 'Code Execution', 'Email', 'Calendar', 'CRM', 'Database', 'File I/O', 'Webhooks'];

const WIZARD_STEPS = ['Name & Type', 'System Prompt', 'Tools', 'Memory', 'Test', 'Deploy'];

export default function AgentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const { data: userAgents = [], isLoading: agentsLoading } = useAgents();
  const createAgent = useCreateAgent();
  const deleteAgent = useDeleteAgent();
  const seedAgents = useSeedAgents();

  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('');
  const [agentAudience, setAgentAudience] = useState('');
  const [agentTone, setAgentTone] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [shortTermMem, setShortTermMem] = useState(true);
  const [longTermMem, setLongTermMem] = useState(false);
  const [testInput, setTestInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/signin');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!agentsLoading && userAgents.length === 0) {
      seedAgents.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentsLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAuthenticated) return null;

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleChatSend = async (text: string) => {
    if (!chatAgent) return;
    const userMsg: LocalMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1100));
    const aiMsg: LocalMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'assistant',
      content: `Hi! I'm **${chatAgent.name}** powered by ${chatAgent.model || 'AI'}. You said: "${text}"\n\nConnect an LLM integration to enable real AI responses from this deployed agent.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleDeploy = async () => {
    try {
      const typeKey = agentType.replace(/^[^\w]+/, '').toLowerCase().replace(/\s+/g, '-');
      await createAgent.mutateAsync({
        name: agentName || 'My Agent',
        description: `${agentType} agent for ${agentAudience}`,
        type: typeKey || 'research',
        systemPrompt: agentPrompt,
        tools: selectedTools,
        memory: { shortTerm: shortTermMem, longTerm: longTermMem },
        model: 'GPT-5',
        tone: agentTone,
        audience: agentAudience,
        status: 'deployed',
      });
      addToast(`🚀 ${agentName || 'Agent'} deployed successfully!`, 'success');
    } catch {
      addToast('Failed to deploy agent. Please try again.', 'error');
    }
    setShowWizard(false);
    setWizardStep(0);
  };

  const handleDeleteAgent = async (id: string, name: string) => {
    try {
      await deleteAgent.mutateAsync(id);
      addToast(`🗑️ ${name} deleted.`, 'success');
      if (chatAgent?._id === id) { setChatAgent(null); setMessages([]); }
    } catch {
      addToast('Failed to delete agent.', 'error');
    }
  };

  if (chatAgent) {
    return (
      <div className="flex flex-col h-screen pt-16" style={{ background: 'var(--bg)' }}>
        <AppNav />
        {/* Agent chat top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: '#fff', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => { setChatAgent(null); setMessages([]); }}
            aria-label="Back to agents"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-sm"
            style={{ color: 'var(--text2)' }}
          >
            ← Back
          </button>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: agentColor(chatAgent.type) }}
            aria-hidden="true"
          >
            {agentEmoji(chatAgent.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{chatAgent.name}</p>
            <p className="text-xs" style={{ color: 'var(--text2)' }}>{chatAgent.model || chatAgent.type}</p>
          </div>
          <LiveBadge label="Live" color="teal" />
          <button
            onClick={() => addToast('⚙️ Settings coming soon!', 'info')}
            className="btn-ghost text-xs px-2.5 py-1.5"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => addToast('📊 Monitor view coming soon!', 'info')}
            className="btn-ghost text-xs px-2.5 py-1.5"
          >
            📊 Monitor
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text2)' }}>
              <p className="text-2xl mb-2" aria-hidden="true">{agentEmoji(chatAgent.type)}</p>
              <p className="font-semibold">{chatAgent.name} is ready.</p>
              <p className="text-sm">{chatAgent.description}</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: agentColor(chatAgent.type) }} aria-hidden="true">{agentEmoji(chatAgent.type)}</div>
              <div className="px-4 py-3 rounded-2xl text-sm" style={{ background: '#fff', border: '1px solid var(--border)' }} aria-label="Agent is typing"><span className="animate-pulse">●●●</span></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <ChatInputBar onSend={handleChatSend} placeholder={`Message ${chatAgent.name}…`} disabled={isTyping} />
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text3)' }}>
            Live preview of your deployed agent ·{' '}
            <button className="underline" style={{ color: 'var(--accent)' }}>Edit configuration →</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--bg)' }}>
      <AppNav />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Top row */}
        <div className="flex gap-4 mb-8 flex-col lg:flex-row">
          {/* LEFT: Agent builder sidebar */}
          <div
            className="lg:w-72 rounded-2xl border p-5 flex flex-col gap-4"
            style={{ background: '#fff', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🤖</span>
              <h2 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
                Agent Builder
              </h2>
            </div>
            <button
              onClick={() => { setShowWizard(true); setWizardStep(0); }}
              className="btn-primary w-full justify-center"
            >
              + New Agent
            </button>
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: 'var(--teal-lt)', color: 'var(--teal)' }}
            >
              <p className="font-semibold mb-1">Not sure where to start?</p>
              <p className="text-xs mb-2">Chat with our AI guide</p>
              <button className="text-xs underline font-semibold" style={{ color: 'var(--teal)' }}>
                Start guided setup →
              </button>
            </div>
            {/* Task list */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>Demo Tasks</p>
              <ul className="space-y-1.5">
                {['Set up knowledge base', 'Configure tone', 'Add web search', 'Test responses'].map((task) => (
                  <li key={task} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
                    <span className="w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--border2)' }} aria-hidden="true" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: Wizard or prompt */}
          <div className="flex-1 rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--border)' }}>
            {showWizard ? (
              <AgentWizard
                step={wizardStep}
                onNext={() => setWizardStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1))}
                onBack={() => setWizardStep((s) => Math.max(s - 1, 0))}
                onDeploy={handleDeploy}
                agentName={agentName} setAgentName={setAgentName}
                agentType={agentType} setAgentType={setAgentType}
                agentAudience={agentAudience} setAgentAudience={setAgentAudience}
                agentTone={agentTone} setAgentTone={setAgentTone}
                agentPrompt={agentPrompt} setAgentPrompt={setAgentPrompt}
                selectedTools={selectedTools} toggleTool={toggleTool}
                shortTermMem={shortTermMem} setShortTermMem={setShortTermMem}
                longTermMem={longTermMem} setLongTermMem={setLongTermMem}
                testInput={testInput} setTestInput={setTestInput}
              />
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
                  Agent works <span style={{ color: 'var(--accent)' }}>for you</span>
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
                  Describe what you want your agent to do and we&apos;ll set it up automatically.
                </p>
                <textarea
                  placeholder="What should we work on next?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none"
                  style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                />
                <button
                  className="btn-primary mt-3"
                  onClick={() => { setShowWizard(true); setWizardStep(0); }}
                >
                  Build this agent →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Agents grid */}
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
          Your Agents
        </h2>
        {agentsLoading && (
          <p className="text-sm mb-4 animate-pulse" style={{ color: 'var(--text2)' }}>Loading your agents…</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userAgents.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              onChat={() => { setChatAgent(agent); setMessages([]); }}
              onEdit={() => addToast('✏️ Agent editor coming soon!', 'info')}
              onDeploy={() => addToast(`🚀 ${agent.name} re-deployed!`, 'success')}
              onDelete={() => handleDeleteAgent(agent._id, agent.name)}
            />
          ))}
          {!agentsLoading && userAgents.length === 0 && (
            <div
              className="rounded-xl border p-6 text-center col-span-full"
              style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
            >
              <p className="text-3xl mb-2" aria-hidden="true">🤖</p>
              <p className="font-semibold text-sm">No agents yet</p>
              <p className="text-xs mt-1">Click &ldquo;+ New Agent&rdquo; to build your first AI agent.</p>
            </div>
          )}
          {/* Create from scratch */}
          <button
            onClick={() => { setShowWizard(true); setWizardStep(0); }}
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 transition-colors hover:border-accent hover:bg-accent-lt"
            style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}
          >
            <span className="text-3xl" aria-hidden="true">➕</span>
            <span className="text-sm font-semibold">Create from scratch</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function AgentCard({
  agent,
  onChat,
  onEdit,
  onDeploy,
  onDelete,
}: {
  agent: Agent;
  onChat: () => void;
  onEdit: () => void;
  onDeploy: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className="rounded-xl border flex flex-col p-4 gap-3 transition-all hover:shadow-md"
      style={{ background: '#fff', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: agentColor(agent.type) }}
          aria-hidden="true"
        >
          {agentEmoji(agent.type)}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: agent.status === 'deployed' ? 'var(--teal-lt)' : 'var(--bg2)',
              color: agent.status === 'deployed' ? 'var(--teal)' : 'var(--text2)',
            }}
          >
            {agent.status === 'deployed' ? '● Live' : '○ Draft'}
          </span>
          <button
            onClick={onDelete}
            aria-label={`Delete ${agent.name}`}
            className="text-xs opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--rose)' }}
          >
            ✕
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
          {agent.name}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{agent.description || agent.type}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {agent.model && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--blue-lt)', color: 'var(--blue)' }}>
            {agent.model}
          </span>
        )}
        {(agent.tools ?? []).slice(0, 2).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
            {t}
          </span>
        ))}
        {(agent.tools ?? []).length > 2 && (
          <span className="text-xs" style={{ color: 'var(--text3)' }}>+{agent.tools.length - 2}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onChat} className="btn-primary flex-1 justify-center text-xs py-2">
          💬 Chat
        </button>
        <button onClick={onEdit} className="btn-ghost flex-1 justify-center text-xs py-2">
          ✏️ Edit
        </button>
        {agent.status === 'draft' && (
          <button onClick={onDeploy} className="btn-ghost text-xs py-2 px-3" style={{ color: 'var(--teal)', borderColor: 'var(--teal)' }}>
            🚀
          </button>
        )}
      </div>
    </article>
  );
}

function AgentWizard({
  step, onNext, onBack, onDeploy,
  agentName, setAgentName,
  agentType, setAgentType,
  agentAudience, setAgentAudience,
  agentTone, setAgentTone,
  agentPrompt, setAgentPrompt,
  selectedTools, toggleTool,
  shortTermMem, setShortTermMem,
  longTermMem, setLongTermMem,
  testInput, setTestInput,
}: {
  step: number; onNext: () => void; onBack: () => void; onDeploy: () => void;
  agentName: string; setAgentName: (v: string) => void;
  agentType: string; setAgentType: (v: string) => void;
  agentAudience: string; setAgentAudience: (v: string) => void;
  agentTone: string; setAgentTone: (v: string) => void;
  agentPrompt: string; setAgentPrompt: (v: string) => void;
  selectedTools: string[]; toggleTool: (t: string) => void;
  shortTermMem: boolean; setShortTermMem: (v: boolean) => void;
  longTermMem: boolean; setLongTermMem: (v: boolean) => void;
  testInput: string; setTestInput: (v: string) => void;
}) {
  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 shrink-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: i <= step ? 'var(--accent)' : 'var(--bg2)',
                color: i <= step ? '#fff' : 'var(--text2)',
              }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-xs" style={{ color: i === step ? 'var(--text)' : 'var(--text3)' }}>
              {s}
            </span>
            {i < WIZARD_STEPS.length - 1 && (
              <div className="w-4 h-px mx-1" style={{ background: 'var(--border2)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }} htmlFor="agent-name">Agent name</label>
            <input id="agent-name" type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="e.g. Support Assistant"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'var(--border2)', color: 'var(--text)' }} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Agent type</p>
            <div className="flex flex-wrap gap-2">
              {AGENT_TYPES.map((t) => (
                <button key={t} onClick={() => setAgentType(t)}
                  className="px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors"
                  style={{ background: agentType === t ? 'var(--accent)' : '#fff', color: agentType === t ? '#fff' : 'var(--text2)', borderColor: agentType === t ? 'var(--accent)' : 'var(--border)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Target audience</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button key={a} onClick={() => setAgentAudience(a)}
                  className="px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors"
                  style={{ background: agentAudience === a ? 'var(--teal)' : '#fff', color: agentAudience === a ? '#fff' : 'var(--text2)', borderColor: agentAudience === a ? 'var(--teal)' : 'var(--border)' }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button key={t} onClick={() => setAgentTone(t)}
                  className="px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors"
                  style={{ background: agentTone === t ? 'var(--blue)' : '#fff', color: agentTone === t ? '#fff' : 'var(--text2)', borderColor: agentTone === t ? 'var(--blue)' : 'var(--border)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }} htmlFor="agent-system-prompt">System Prompt</label>
          <textarea
            id="agent-system-prompt"
            value={agentPrompt}
            onChange={(e) => setAgentPrompt(e.target.value)}
            placeholder={`You are ${agentName || 'an AI assistant'}. ${agentTone ? `Your tone is ${agentTone.toLowerCase()}.` : ''} You help ${agentAudience || 'users'} with their questions…`}
            rows={8}
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none"
            style={{ borderColor: 'var(--border2)', color: 'var(--text)', fontFamily: 'monospace' }}
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>Select tools your agent can use</p>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map((tool) => (
              <label key={tool} className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
                <input type="checkbox" checked={selectedTools.includes(tool)} onChange={() => toggleTool(tool)} className="accent-orange-500" aria-label={`Enable ${tool} tool`} />
                <span className="text-sm" style={{ color: 'var(--text)' }}>{tool}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Memory configuration</p>
          <label className="flex items-center justify-between p-4 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Short-term memory</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>Remembers context within a conversation</p>
            </div>
            <input type="checkbox" checked={shortTermMem} onChange={(e) => setShortTermMem(e.target.checked)} className="w-4 h-4 accent-orange-500" aria-label="Enable short-term memory" />
          </label>
          <label className="flex items-center justify-between p-4 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Long-term memory</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>Persists user preferences across sessions</p>
            </div>
            <input type="checkbox" checked={longTermMem} onChange={(e) => setLongTermMem(e.target.checked)} className="w-4 h-4 accent-orange-500" aria-label="Enable long-term memory" />
          </label>
        </div>
      )}

      {step === 4 && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Test your agent</p>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Send a test message to preview your agent's response…"
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none mb-2"
            style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
          />
          <button className="btn-ghost text-sm">▶ Run test</button>
        </div>
      )}

      {step === 5 && (
        <div className="text-center py-4">
          <div className="text-5xl mb-4" aria-hidden="true">🚀</div>
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
            Ready to deploy!
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>
            <strong>{agentName || 'Your agent'}</strong> is configured and ready. Deploy it to make it live.
          </p>
          <button onClick={onDeploy} className="btn-primary px-8 py-3 text-base">
            🚀 Deploy Agent
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 5 && (
        <div className="flex gap-2 mt-6">
          {step > 0 && (
            <button onClick={onBack} className="btn-ghost">← Back</button>
          )}
          <button onClick={onNext} className="btn-primary ml-auto">
            {step === 4 ? 'Continue to Deploy →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}
