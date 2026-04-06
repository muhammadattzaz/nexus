'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/layout/AppNav';
import Footer from '@/components/layout/Footer';
import ChatMessage from '@/components/chathub/ChatMessage';
import ChatInputBar from '@/components/chathub/ChatInputBar';
import LiveBadge from '@/components/ui/LiveBadge';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useAgents, useCreateAgent, useDeleteAgent, useSeedAgents } from '@/hooks/useAgents';
import { Agent } from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const WIZARD_STEPS = ['Purpose', 'System Prompt', 'Tools & APIs', 'Memory', 'Test', 'Deploy'];

const AGENT_KINDS = [
  'Customer Support', 'Research & Data', 'Code & Dev', 'Sales & CRM',
  'Content & Writing', 'Operations', 'Finance & Reports', 'Something else',
];
const AUDIENCES = ['Customers', 'Internal team', 'Developers', 'Executives'];
const STYLES = ['Concise', 'Detailed', 'Step-by-step', 'Creative'];
const PREF_MODELS = ['Auto-select', 'GPT-4o', 'Claude 3.5', 'Gemini Pro', 'Custom'];
const VOLUMES = ['Light (<100/day)', 'Moderate', 'Heavy', 'Enterprise'];

const JOB_SUGGESTIONS: Record<string, string[]> = {
  'Customer Support': [
    'Answer customer questions and escalate unresolved issues',
    'Handle returns, refunds, and complaints professionally',
    'Create and update support tickets automatically',
    'Draft emails, posts, and marketing content',
    'Summarise meetings and extract action items',
  ],
  'Research & Data': [
    'Search the web and write structured research reports',
    'Analyse datasets and surface actionable insights',
    'Monitor competitors and summarise market trends',
    'Draft emails, posts, and marketing content',
    'Summarise meetings and extract action items',
  ],
  'Code & Dev': [
    'Review code for bugs and suggest improvements',
    'Generate boilerplate code and documentation',
    'Help debug and explain technical errors',
    'Draft emails, posts, and marketing content',
    'Summarise meetings and extract action items',
  ],
  'Sales & CRM': [
    'Qualify leads and update CRM records automatically',
    'Draft personalised outreach emails at scale',
    'Summarise call notes and next steps',
    'Draft emails, posts, and marketing content',
    'Summarise meetings and extract action items',
  ],
  'Content & Writing': [
    'Draft blog posts, social copy, and ad creatives',
    'Repurpose long-form content into short snippets',
    'Proofread and improve tone/style of documents',
    'Draft emails, posts, and marketing content',
    'Summarise meetings and extract action items',
  ],
  'Operations': [
    'Automate recurring reports and dashboards',
    'Coordinate tasks across team tools (Slack, Jira, etc.)',
    'Summarise meeting notes and extract action items',
    'Draft emails, posts, and marketing content',
    'Summarise meetings and extract action items',
  ],
  'Finance & Reports': [
    'Generate weekly financial summaries from raw data',
    'Flag anomalies and send alert notifications',
    'Build automated expense and budget reports',
    'Draft emails, posts, and marketing content',
    'Summarise meetings and extract action items',
  ],
  'Something else': [
    'Answer customer questions and escalate unresolved issues',
    'Search the web and write structured research reports',
    'Review code for bugs and suggest improvements',
    'Draft emails, posts, and marketing content',
    'Summarise meetings and extract action items',
  ],
};

interface ToolDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  longDesc: string;
  setupSteps: string[];
  proTips: string[];
  configSteps: { label: string; placeholder: string }[];
}

const TOOLS_LIST: ToolDef[] = [
  {
    id: 'web-search', name: 'Web Search', icon: '🌐',
    description: 'Search the web in real time for up-to-date information',
    longDesc: 'Allows your agent to query live web results, news, and public data in real time.',
    setupSteps: ['Create a SerpAPI or Bing Search account', 'Copy your API key from the dashboard', 'Paste the key in the Config tab below', 'Set the max results limit for each query'],
    proTips: ['Limit results to 5–10 to reduce token usage', 'Use domain filters to restrict to trusted sources', 'Cache repeated queries to save API credits'],
    configSteps: [{ label: 'API Key', placeholder: 'sk-serp-...' }, { label: 'Max results per query', placeholder: '5' }, { label: 'Allowed domains (optional)', placeholder: 'site:wikipedia.org' }],
  },
  {
    id: 'database-lookup', name: 'Database Lookup', icon: '🗄️',
    description: 'Query your database or vector store for internal knowledge',
    longDesc: 'Allows your agent to look up internal data like product catalogues, FAQs, and customer records from a vector store or SQL database.',
    setupSteps: ['Choose your database type (SQL or vector store)', 'Ingest your data (CSV, PDF, or direct sync)', 'Define the tool schema for structured queries', 'Return structured results to the agent context'],
    proTips: ['Use metadata filters to scope queries by department or product', 'Set a similarity threshold and discard results below 0.75', 'Summarise long chunks before returning to keep context lean'],
    configSteps: [{ label: 'Database URL', placeholder: 'postgresql://user:pass@host/db' }, { label: 'Collection / table name', placeholder: 'knowledge_base' }, { label: 'Similarity threshold', placeholder: '0.75' }],
  },
  {
    id: 'email-sender', name: 'Email Sender', icon: '📧',
    description: 'Send emails or notifications on behalf of the agent',
    longDesc: 'Enables your agent to send transactional emails, alerts, or outreach messages via SMTP or OAuth-connected providers.',
    setupSteps: ['Choose your email provider (Gmail, Outlook, or SMTP)', 'Authenticate via OAuth or enter SMTP credentials', 'Set the default sender name and reply-to address', 'Configure rate limits to avoid spam filters'],
    proTips: ['Always add an unsubscribe footer for outreach emails', 'Use HTML templates for better deliverability', 'Test in sandbox mode before going live'],
    configSteps: [{ label: 'SMTP Host', placeholder: 'smtp.gmail.com' }, { label: 'SMTP Port', placeholder: '587' }, { label: 'Sender email', placeholder: 'agent@yourcompany.com' }, { label: 'App password', placeholder: '••••••••' }],
  },
  {
    id: 'calendar-api', name: 'Calendar API', icon: '📅',
    description: 'Read/write calendar events and schedule meetings',
    longDesc: 'Lets your agent check availability, create events, and send invites via Google Calendar or Microsoft Outlook.',
    setupSteps: ['Connect Google Calendar or Outlook via OAuth', 'Grant the agent read and write permissions', 'Set the default calendar and timezone', 'Test by creating a sample event'],
    proTips: ['Use buffer time between auto-scheduled meetings', 'Sync across multiple calendars to avoid conflicts', 'Set working hours to prevent off-hours scheduling'],
    configSteps: [{ label: 'Calendar provider', placeholder: 'Google / Outlook' }, { label: 'Default timezone', placeholder: 'UTC' }, { label: 'Working hours', placeholder: '09:00–18:00' }],
  },
  {
    id: 'slack-webhook', name: 'Slack Webhook', icon: '💬',
    description: 'Post messages and alerts to Slack channels',
    longDesc: 'Sends notifications, summaries, or alerts from your agent directly into Slack channels or DMs.',
    setupSteps: ['Go to api.slack.com/apps and create a new app', 'Enable Incoming Webhooks and click "Add New Webhook"', 'Select the target channel and copy the webhook URL', 'Paste the URL in the Config tab below'],
    proTips: ['Use Block Kit JSON for rich, formatted messages', 'Post to a dedicated #agent-alerts channel', 'Throttle messages to avoid notification fatigue'],
    configSteps: [{ label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...' }, { label: 'Default channel', placeholder: '#agent-alerts' }, { label: 'Bot display name', placeholder: 'NexusBot' }],
  },
  {
    id: 'jira', name: 'Jira', icon: '🎯',
    description: 'Create and update Jira tickets automatically',
    longDesc: 'Automates ticket creation, status updates, and comment posting in your Jira projects.',
    setupSteps: ['Generate a Jira API token at id.atlassian.com', 'Copy your Jira site URL (e.g. yourco.atlassian.net)', 'Set the default project key (e.g. ENG, SUPPORT)', 'Test by creating a sample ticket'],
    proTips: ['Use labels to distinguish agent-created tickets', 'Set a default assignee for auto-created issues', 'Include a source link in the ticket description'],
    configSteps: [{ label: 'Jira site URL', placeholder: 'yourco.atlassian.net' }, { label: 'API token', placeholder: 'ATATT3...' }, { label: 'Default project key', placeholder: 'SUPPORT' }],
  },
  {
    id: 'google-sheets', name: 'Google Sheets', icon: '📊',
    description: 'Read from and write to spreadsheets',
    longDesc: 'Gives your agent the ability to read data from or write results to Google Sheets — ideal for logging, reporting, and dashboards.',
    setupSteps: ['Connect Google Workspace via OAuth', 'Share the target spreadsheet with the service account', 'Copy the spreadsheet ID from the URL', 'Define which sheet tab and range to read/write'],
    proTips: ['Use a dedicated "Agent Output" sheet tab', 'Append rows rather than overwriting to preserve history', 'Trigger a data validation formula after each write'],
    configSteps: [{ label: 'Spreadsheet ID', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms' }, { label: 'Sheet tab name', placeholder: 'Agent Output' }, { label: 'Start cell', placeholder: 'A1' }],
  },
  {
    id: 'custom-function', name: 'Custom Function', icon: '⚙️',
    description: 'Define your own tool with a JSON schema',
    longDesc: 'Build a fully custom tool by defining an HTTP endpoint and a JSON schema — the agent will call it when needed.',
    setupSteps: ['Define your function name and description', 'Write the JSON schema for input parameters', 'Set the HTTP endpoint URL and method (POST recommended)', 'Deploy and verify the endpoint returns valid JSON'],
    proTips: ['Keep the parameter schema as simple as possible', 'Return a typed JSON object, not raw text', 'Add a timeout of 10 s and a fallback error message'],
    configSteps: [{ label: 'Function name', placeholder: 'get_weather' }, { label: 'Endpoint URL', placeholder: 'https://api.example.com/fn' }, { label: 'HTTP method', placeholder: 'POST' }, { label: 'JSON schema', placeholder: '{"type":"object","properties":{...}}' }],
  },
];

const TYPE_EMOJI: Record<string, string> = {
  'customer-support': '💼', research: '🔍', 'code-review': '💻',
  'content-writing': '✍️', 'email-outreach': '🤝', analytics: '📊',
  education: '📚', ecommerce: '🛒', 'code-dev': '💻', 'sales-crm': '🤝',
  'finance-reports': '💰', operations: '⚙️', 'research-data': '🔍',
};
const TYPE_COLOR: Record<string, string> = {
  'customer-support': 'var(--teal-lt)', research: 'var(--blue-lt)', 'code-review': 'var(--accent-lt)',
  'content-writing': 'var(--rose-lt)', 'email-outreach': 'var(--blue-lt)', analytics: 'var(--amber-lt)',
  education: 'var(--teal-lt)', ecommerce: 'var(--accent-lt)',
};

function agentEmoji(type: string) { return TYPE_EMOJI[type] ?? '🤖'; }
function agentBg(type: string) { return TYPE_COLOR[type] ?? 'var(--bg2)'; }

function kindToTypeKey(kind: string) {
  return kind.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

function generateSystemPrompt(
  name: string, kind: string, mainJob: string,
  audience: string, style: string,
): string {
  const roleMap: Record<string, string> = {
    'Customer Support': 'a customer support specialist',
    'Research & Data': 'a research and data analyst',
    'Code & Dev': 'a software development assistant',
    'Sales & CRM': 'a sales and CRM specialist',
    'Content & Writing': 'a content writer and editor',
    'Operations': 'an operations coordinator',
    'Finance & Reports': 'a finance and reporting analyst',
    'Something else': 'an AI assistant',
  };
  const audienceMap: Record<string, string> = {
    'Customers': 'customers and end users',
    'Internal team': 'internal team members',
    'Developers': 'developers and technical staff',
    'Executives': 'executives and senior leadership',
  };
  const styleNote: Record<string, string> = {
    'Concise': 'Keep responses brief and to the point. Avoid unnecessary filler.',
    'Detailed': 'Provide thorough, well-structured explanations with context.',
    'Step-by-step': 'Break down every task into numbered, actionable steps.',
    'Creative': 'Be imaginative and think outside the box when solving problems.',
  };

  const role = roleMap[kind] || 'an AI assistant';
  const aud = audienceMap[audience] || 'users';
  const style_ = styleNote[style] || '';

  return `You are ${name || 'an AI assistant'}, ${role}.

## Primary Responsibility
${mainJob || `Help ${aud} with their questions and tasks efficiently and accurately.`}

## Audience
You are speaking with ${aud}. Adapt your language, depth, and tone accordingly.

## Communication Style
${style_ || 'Be clear, professional, and helpful in every response.'}

## Core Guidelines
- Always be accurate — if you are unsure, say so and offer to find out
- Ask for clarification when a request is ambiguous
- Stay focused on your primary role; politely redirect off-topic requests
- Respect user privacy and never share sensitive information
- Escalate complex or sensitive situations to a human when appropriate`.trim();
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

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
  const [chatInputText, setChatInputText] = useState('');
  const [chatInputFiles, setChatInputFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [agentName, setAgentName] = useState('');
  const [agentKind, setAgentKind] = useState('');
  const [mainJob, setMainJob] = useState('');
  const [agentAudience, setAgentAudience] = useState('');
  const [agentStyle, setAgentStyle] = useState('');
  const [prefModel, setPrefModel] = useState('');
  const [agentVolume, setAgentVolume] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [lastGenPrompt, setLastGenPrompt] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolConfigs, setToolConfigs] = useState<Record<string, Record<string, string>>>({});
  const [toolFilter, setToolFilter] = useState<'All' | 'Connected' | 'Available' | 'Suggested'>('All');
  const [drawerTool, setDrawerTool] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'Overview' | 'Steps' | 'Config'>('Overview');
  const [shortTermMem, setShortTermMem] = useState(true);
  const [longTermMem, setLongTermMem] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Sidebar tasks
  const [customTasks, setCustomTasks] = useState<{ id: string; label: string; done: boolean }[]>([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/signin');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!agentsLoading && userAgents.length === 0) seedAgents.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentsLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAuthenticated) return null;

  const resetWizard = () => {
    setWizardStep(0);
    setAgentName(''); setAgentKind(''); setMainJob('');
    setAgentAudience(''); setAgentStyle(''); setPrefModel('');
    setAgentVolume(''); setAgentPrompt(''); setLastGenPrompt('');
    setSelectedTools([]); setToolConfigs({}); setToolFilter('All'); setDrawerTool(null); setDrawerTab('Overview');
    setShortTermMem(true); setLongTermMem(false);
    setTestInput(''); setTestResponse('');
  };

  const openWizard = () => { resetWizard(); setShowWizard(true); };

  const handleWizardNext = () => {
    if (wizardStep === 0) {
      const generated = generateSystemPrompt(agentName, agentKind, mainJob, agentAudience, agentStyle);
      if (!agentPrompt || agentPrompt === lastGenPrompt) {
        setAgentPrompt(generated);
        setLastGenPrompt(generated);
      }
    }
    setWizardStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  };

  const handleTestRun = async () => {
    if (!testInput.trim()) return;
    setIsTesting(true);
    setTestResponse('');
    await new Promise((r) => setTimeout(r, 1200));
    setTestResponse(
      `**Test Response from ${agentName || 'your agent'}:**\n\nYou asked: "${testInput}"\n\nThis is a simulated preview. Connect a live LLM integration (OpenAI, Anthropic, Gemini) to see real AI responses from your deployed agent.`
    );
    setIsTesting(false);
  };

  const handleDeploy = async () => {
    try {
      const typeKey = kindToTypeKey(agentKind || 'research');
      await createAgent.mutateAsync({
        name: agentName || 'My Agent',
        description: mainJob || `${agentKind} agent for ${agentAudience}`,
        type: typeKey,
        systemPrompt: agentPrompt,
        tools: selectedTools,
        toolConfigs,
        memory: { shortTerm: shortTermMem, longTerm: longTermMem },
        model: prefModel === 'Auto-select' || !prefModel ? 'GPT-4o' : prefModel,
        tone: agentStyle,
        audience: agentAudience,
        status: 'deployed',
      });
      addToast(`🚀 ${agentName || 'Agent'} deployed successfully!`, 'success');
    } catch {
      addToast('Failed to deploy agent. Please try again.', 'error');
    }
    setShowWizard(false);
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

  // Sidebar task list: agent-derived defaults + custom user tasks
  const agentTasks = userAgents.length > 0
    ? userAgents.slice(0, 3).map((a) => ({ id: `agent-${a._id}`, label: a.name, done: a.status === 'deployed', fixed: true }))
    : [
      { id: 'default-1', label: 'Create your first agent', done: false, fixed: true },
      { id: 'default-2', label: 'Configure tool integrations', done: false, fixed: true },
      { id: 'default-3', label: 'Set up knowledge base', done: false, fixed: true },
    ];
  const allTasks = [...agentTasks, ...customTasks.map((t) => ({ ...t, fixed: false }))];

  const handleAddTask = () => {
    const label = newTaskInput.trim();
    if (!label) return;
    setCustomTasks((prev) => [...prev, { id: Date.now().toString(), label, done: false }]);
    setNewTaskInput('');
    setShowNewTask(false);
  };

  const handleToggleTask = (id: string) => {
    setCustomTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleDeleteTask = (id: string) => {
    setCustomTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── Chat View ───────────────────────────────────────────────────────────
  if (chatAgent) {
    const STARTER_PROMPTS: Record<string, string[]> = {
      'customer-support': ['How do I reset my password?', 'I have an issue with my order', 'Can you help me with a refund?'],
      'research': ['Summarise the latest AI research trends', 'Find me papers on large language models', 'What are the key insights on climate change?'],
      'code-review': ['Review this Python function for bugs', 'Suggest improvements for my API design', 'Help me debug this TypeScript error'],
      'content-writing': ['Write a blog post intro about AI', 'Create social media captions for a product launch', 'Improve the tone of this email'],
      'email-outreach': ['Draft a cold outreach email for SaaS', 'Write a follow-up email after a demo', 'Create a re-engagement campaign'],
      'analytics': ['Analyse my sales data trends', 'Generate a weekly KPI summary', 'Identify anomalies in this dataset'],
      'education': ['Explain machine learning in simple terms', 'Create a quiz on React fundamentals', 'Summarise this research paper'],
      'ecommerce': ['Help me write a product description', 'Suggest upsell strategies for my store', 'Draft a cart abandonment email'],
    };
    const starters = STARTER_PROMPTS[chatAgent.type] ?? ['What can you help me with today?', 'Tell me about your capabilities', 'Get started with a task'];

    return (
      <div className="flex flex-col h-screen pt-16" style={{ background: '#f8f7f5' }}>
        <AppNav />

        {/* ── Chat header ── */}
        <div
          className="flex items-center gap-3 px-5 py-3 border-b"
          style={{ background: '#fff', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => { setChatAgent(null); setMessages([]); }}
            aria-label="Back to agents"
            className="flex items-center gap-1.5 text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text2)' }}
          >
            ← Back
          </button>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: agentBg(chatAgent.type) }}
            aria-hidden="true"
          >
            {agentEmoji(chatAgent.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text)' }}>{chatAgent.name}</p>
            <p className="text-xs leading-tight" style={{ color: 'var(--text2)' }}>{chatAgent.model || chatAgent.type}</p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <LiveBadge label="Live" color="teal" />
            <button
              onClick={() => addToast('⚙️ Settings coming soon!', 'info')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={() => addToast('📊 Monitor view coming soon!', 'info')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
            >
              📊 Monitor
            </button>
          </div>
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* ── Empty / welcome state ── */
            <div className="flex flex-col items-center justify-center h-full gap-8 px-4 py-12">
              {/* Decorative rings + icon */}
              <div className="relative flex items-center justify-center">
                {/* Outer ring */}
                <div
                  className="absolute w-36 h-36 rounded-full border-2 opacity-10"
                  style={{ borderColor: agentBg(chatAgent.type).replace('var(', '').replace(')', '') }}
                />
                {/* Middle ring */}
                <div
                  className="absolute w-24 h-24 rounded-full border-2 opacity-20"
                  style={{ borderColor: 'var(--accent)' }}
                />
                {/* Icon circle */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md"
                  style={{ background: agentBg(chatAgent.type) }}
                  aria-hidden="true"
                >
                  {agentEmoji(chatAgent.type)}
                </div>
              </div>

              {/* Name + description */}
              <div className="text-center max-w-sm">
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
                  {chatAgent.name} is ready.
                </h2>
                {chatAgent.description && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                    {chatAgent.description}
                  </p>
                )}
              </div>

              {/* Starter prompts */}
              <div className="flex flex-col gap-2 w-full max-w-md">
                <p className="text-xs font-semibold text-center mb-1" style={{ color: 'var(--text3)' }}>
                  TRY ASKING
                </p>
                {starters.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setChatInputText(prompt);
                      handleChatSend(prompt);
                      setChatInputText('');
                    }}
                    className="w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all hover:shadow-sm hover:-translate-y-px"
                    style={{ background: '#fff', borderColor: 'var(--border)', color: 'var(--text2)' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Message list ── */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
              ))}
              {isTyping && (
                <div className="flex items-end gap-2 pt-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: agentBg(chatAgent.type) }}
                    aria-hidden="true"
                  >
                    {agentEmoji(chatAgent.type)}
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm flex gap-1"
                    style={{ background: '#fff', border: '1px solid var(--border)' }}
                    aria-label="Agent is typing"
                  >
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input area ── */}
        <div
          className="px-4 py-4 border-t"
          style={{ background: '#fff', borderColor: 'var(--border)' }}
        >
          <div className="max-w-3xl mx-auto">
            <ChatInputBar
              value={chatInputText} onChange={setChatInputText}
              files={chatInputFiles} onFilesChange={setChatInputFiles}
              onSend={(text) => { handleChatSend(text); setChatInputText(''); setChatInputFiles([]); }}
              placeholder={`Message ${chatAgent.name}…`}
              disabled={isTyping}
            />
            <p className="text-center text-xs mt-2" style={{ color: 'var(--text3)' }}>
              Live preview ·{' '}
              <button
                className="underline transition-colors hover:opacity-70"
                style={{ color: 'var(--accent)' }}
                onClick={() => addToast('✏️ Editor coming soon!', 'info')}
              >
                Edit configuration →
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Page ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--bg)' }}>
      <AppNav />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 w-full flex gap-6">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
          {/* Header */}
          <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ background: '#fff', borderColor: 'var(--border)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl" aria-hidden="true">🤖</span>
                <h2 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>Agent Builder</h2>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                Create powerful AI agents using any model. Pick a template or start from scratch.
              </p>
            </div>

            <button onClick={openWizard} className="btn-primary w-full justify-center text-sm">
              + New Agent
            </button>

            {/* Ask the Hub card */}
            <div className="rounded-xl p-3" style={{ background: 'var(--teal-lt)', color: 'var(--teal)' }}>
              <div className="flex items-start gap-2 mb-1">
                <span aria-hidden="true">✦</span>
                <p className="font-semibold text-sm">Not sure where to start?</p>
              </div>
              <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--teal)' }}>
                Chat with our AI guide — describe what you want your agent to do and get a personalised setup plan.
              </p>
              <button className="text-xs font-semibold underline" style={{ color: 'var(--teal)' }}
                onClick={() => router.push('/chathub')}>
                Ask the Hub →
              </button>
            </div>

            {/* Task list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text2)' }}>Tasks</p>
                <button
                  className="text-xs font-medium"
                  style={{ color: 'var(--accent)' }}
                  onClick={() => { setShowNewTask(true); setNewTaskInput(''); }}
                >
                  + New Task
                </button>
              </div>

              {/* Inline new-task input */}
              {showNewTask && (
                <div className="flex items-center gap-1.5 mb-2">
                  <input
                    autoFocus
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask();
                      if (e.key === 'Escape') { setShowNewTask(false); setNewTaskInput(''); }
                    }}
                    placeholder="Task name…"
                    className="flex-1 px-2 py-1 rounded-lg border text-xs focus:outline-none"
                    style={{ borderColor: 'var(--accent)', color: 'var(--text)' }}
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskInput.trim()}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                    aria-label="Add task"
                  >✓</button>
                  <button
                    onClick={() => { setShowNewTask(false); setNewTaskInput(''); }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                    style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
                    aria-label="Cancel"
                  >✕</button>
                </div>
              )}

              <ul className="space-y-1.5">
                {allTasks.map((task) => (
                  <li
                    key={task.id}
                    className="group flex items-center gap-2 text-xs"
                    style={{ color: task.done ? 'var(--teal)' : 'var(--text2)' }}
                  >
                    <button
                      onClick={() => !task.fixed && handleToggleTask(task.id)}
                      className="w-4 h-4 rounded shrink-0 flex items-center justify-center text-xs transition-colors"
                      style={{
                        border: task.done ? 'none' : '1.5px solid var(--border2)',
                        background: task.done ? 'var(--teal-lt)' : 'transparent',
                        cursor: task.fixed ? 'default' : 'pointer',
                      }}
                      aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.done ? '✓' : ''}
                    </button>
                    <span className="flex-1 truncate" style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.label}
                    </span>
                    {!task.fixed && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none"
                        style={{ color: 'var(--rose)' }}
                        aria-label={`Delete task ${task.label}`}
                      >✕</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
                Agent Library
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                Choose a{' '}
                <button onClick={openWizard} className="underline" style={{ color: 'var(--accent)' }}>default agent</button>
                {' '}or{' '}
                <button onClick={openWizard} className="underline" style={{ color: 'var(--accent)' }}>build your own</button>
              </p>
            </div>
            <button
              onClick={openWizard}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--text)', color: '#fff' }}
            >
              Default Agents
            </button>
          </div>

          {agentsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl border h-52 animate-pulse" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }} />
              ))}
            </div>
          )}

          {!agentsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {userAgents.map((agent) => (
                <AgentCard
                  key={agent._id}
                  agent={agent}
                  onClick={() => { setChatAgent(agent); setMessages([]); }}
                  onDelete={() => handleDeleteAgent(agent._id, agent.name)}
                />
              ))}

              {/* Build from Scratch */}
              <button
                onClick={openWizard}
                className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-6 min-h-[200px] transition-colors hover:border-gray-400"
                style={{ borderColor: '#d1d5db', background: 'transparent' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1"
                  style={{ background: 'var(--bg2)', color: 'var(--text3)' }}
                  aria-hidden="true"
                >+</div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Build from Scratch</span>
                <span className="text-xs text-center leading-relaxed" style={{ color: 'var(--text3)' }}>
                  Create a fully custom agent
                </span>
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />

      {/* ── Wizard Modal ──────────────────────────────────────────────────── */}
      {showWizard && (
        <>
          {/* Modal backdrop + dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <AgentWizardModal
                step={wizardStep}
                onNext={handleWizardNext}
                onBack={() => setWizardStep((s) => Math.max(s - 1, 0))}
                onClose={() => { setShowWizard(false); setDrawerTool(null); }}
                onDeploy={handleDeploy}
                agentName={agentName} setAgentName={setAgentName}
                agentKind={agentKind} setAgentKind={setAgentKind}
                mainJob={mainJob} setMainJob={setMainJob}
                agentAudience={agentAudience} setAgentAudience={setAgentAudience}
                agentStyle={agentStyle} setAgentStyle={setAgentStyle}
                prefModel={prefModel} setPrefModel={setPrefModel}
                agentVolume={agentVolume} setAgentVolume={setAgentVolume}
                agentPrompt={agentPrompt} setAgentPrompt={setAgentPrompt}
                selectedTools={selectedTools} setSelectedTools={setSelectedTools}
                toolFilter={toolFilter} setToolFilter={setToolFilter}
                drawerTool={drawerTool} setDrawerTool={setDrawerTool}
                drawerTab={drawerTab} setDrawerTab={setDrawerTab}
                shortTermMem={shortTermMem} setShortTermMem={setShortTermMem}
                longTermMem={longTermMem} setLongTermMem={setLongTermMem}
                testInput={testInput} setTestInput={setTestInput}
                testResponse={testResponse} isTesting={isTesting}
                onTestRun={handleTestRun}
                isDeploying={createAgent.isPending}
              />
            </div>
          </div>

          {/* Right-side tool drawer — z-60 so it sits above the modal */}
          {drawerTool && (
            <ToolDrawer
              key={drawerTool}
              tool={TOOLS_LIST.find((t) => t.id === drawerTool)!}
              tab={drawerTab}
              setTab={setDrawerTab}
              enabled={selectedTools.includes(drawerTool)}
              onToggle={() =>
                setSelectedTools((prev) =>
                  prev.includes(drawerTool) ? prev.filter((t) => t !== drawerTool) : [...prev, drawerTool]
                )
              }
              onClose={() => setDrawerTool(null)}
              configValues={toolConfigs[drawerTool] ?? {}}
              onDone={(values) => {
                setToolConfigs((prev) => ({ ...prev, [drawerTool]: values }));
                if (!selectedTools.includes(drawerTool)) {
                  setSelectedTools((prev) => [...prev, drawerTool]);
                }
                const toolName = TOOLS_LIST.find((t) => t.id === drawerTool)?.name ?? 'Tool';
                addToast(`✅ ${toolName} configured and enabled!`, 'success');
                setDrawerTool(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, onClick, onDelete }: {
  agent: Agent;
  onClick: () => void;
  onDelete: () => void;
}) {
  const tools = agent.tools ?? [];
  return (
    <article
      onClick={onClick}
      className="group relative rounded-2xl border flex flex-col p-4 gap-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ background: '#fff', borderColor: 'var(--border)' }}
    >
      {/* Delete on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label={`Delete ${agent.name}`}
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'var(--bg2)', color: 'var(--rose)' }}
      >✕</button>

      {/* Icon + Name */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: agentBg(agent.type) }}
          aria-hidden="true"
        >
          {agentEmoji(agent.type)}
        </div>
        <h3
          className="font-bold text-sm leading-snug"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          {agent.name}
        </h3>
      </div>

      {/* Description */}
      <p
        className="text-xs leading-relaxed flex-1"
        style={{
          color: 'var(--text2)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {agent.description || agent.type}
      </p>

      {/* Chips: model first (teal), then tools (outlined) */}
      <div className="flex flex-wrap gap-1.5">
        {agent.model && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium border"
            style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent' }}
          >
            {agent.model}
          </span>
        )}
        {tools.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 rounded-full text-xs border"
            style={{ borderColor: 'var(--border2)', color: 'var(--text2)', background: 'transparent' }}
          >
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

// ─── Wizard Modal ─────────────────────────────────────────────────────────────

interface WizardProps {
  step: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  onDeploy: () => void;
  agentName: string; setAgentName: (v: string) => void;
  agentKind: string; setAgentKind: (v: string) => void;
  mainJob: string; setMainJob: (v: string) => void;
  agentAudience: string; setAgentAudience: (v: string) => void;
  agentStyle: string; setAgentStyle: (v: string) => void;
  prefModel: string; setPrefModel: (v: string) => void;
  agentVolume: string; setAgentVolume: (v: string) => void;
  agentPrompt: string; setAgentPrompt: (v: string) => void;
  selectedTools: string[]; setSelectedTools: (v: string[]) => void;
  toolFilter: string; setToolFilter: (v: 'All' | 'Connected' | 'Available' | 'Suggested') => void;
  drawerTool: string | null; setDrawerTool: (v: string | null) => void;
  drawerTab: 'Overview' | 'Steps' | 'Config'; setDrawerTab: (v: 'Overview' | 'Steps' | 'Config') => void;
  shortTermMem: boolean; setShortTermMem: (v: boolean) => void;
  longTermMem: boolean; setLongTermMem: (v: boolean) => void;
  testInput: string; setTestInput: (v: string) => void;
  testResponse: string; isTesting: boolean;
  onTestRun: () => void;
  isDeploying: boolean;
}

function AgentWizardModal(props: WizardProps) {
  const {
    step, onNext, onBack, onClose, onDeploy,
    agentName, setAgentName, agentKind, setAgentKind,
    mainJob, setMainJob, agentAudience, setAgentAudience,
    agentStyle, setAgentStyle, prefModel, setPrefModel,
    agentVolume, setAgentVolume, agentPrompt, setAgentPrompt,
    selectedTools, setSelectedTools, toolFilter, setToolFilter,
    drawerTool, setDrawerTool, drawerTab, setDrawerTab,
    shortTermMem, setShortTermMem, longTermMem, setLongTermMem,
    testInput, setTestInput, testResponse, isTesting, onTestRun,
    isDeploying,
  } = props;

  // suppress unused warning — drawer state is read via drawerTool/drawerTab in ToolDrawer
  void drawerTool; void drawerTab; void setDrawerTab;

  const toggleTool = (id: string) =>
    setSelectedTools(selectedTools.includes(id) ? selectedTools.filter((t) => t !== id) : [...selectedTools, id]);

  const jobSuggestions = JOB_SUGGESTIONS[agentKind] ?? JOB_SUGGESTIONS['Something else'];

  const filteredTools = TOOLS_LIST.filter((t) => {
    if (toolFilter === 'Connected') return selectedTools.includes(t.id);
    if (toolFilter === 'Available') return !selectedTools.includes(t.id);
    if (toolFilter === 'Suggested') return ['web-search', 'email-sender', 'database-lookup'].includes(t.id);
    return true;
  });

  const stepTitles: Record<number, string> = {
    0: "Define your agent's purpose",
    1: 'Craft a system prompt',
    2: 'Connect tools & APIs',
    3: 'Configure memory',
    4: 'Test your agent',
    5: 'Deploy your agent',
  };
  const stepSubtitles: Record<number, string> = {
    0: "Answer a few quick questions — we'll use your answers to build the perfect agent.",
    1: 'Auto-generated from your answers. Edit freely to fine-tune behaviour.',
    2: 'Equip your agent with tools: web search, database lookup, email sender, and more.',
    3: 'Choose what your agent remembers between conversations.',
    4: 'Send a test message to preview how your agent responds.',
    5: 'Your agent is ready. Deploy it to make it live.',
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--accent)' }}>
            STEP {step + 1} OF {WIZARD_STEPS.length}
          </p>
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
            {stepTitles[step]}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{stepSubtitles[step]}</p>
        </div>
        <button onClick={onClose} aria-label="Close wizard"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg shrink-0"
          style={{ color: 'var(--text3)' }}>×</button>
      </div>

      {/* Step tabs */}
      <div className="flex items-center gap-0 px-6 py-3 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {WIZARD_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: i < step ? 'var(--accent)' : i === step ? 'var(--accent)' : 'var(--bg2)',
                  color: i <= step ? '#fff' : 'var(--text3)',
                }}
                aria-hidden="true"
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium whitespace-nowrap"
                style={{ color: i === step ? 'var(--text)' : i < step ? 'var(--accent)' : 'var(--text3)' }}>
                {s}
              </span>
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <div className="w-5 h-px mx-1.5" style={{ background: i < step ? 'var(--accent)' : 'var(--border2)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex-1">

        {/* ── Step 0: Purpose ── */}
        {step === 0 && (
          <div className="space-y-5">
            {/* Q1 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text3)' }}>
                QUESTION 1 OF 7
              </p>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }} htmlFor="agent-name">
                What do you want to call your agent?
              </label>
              <input id="agent-name" type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. Support Bot, Research Assistant, Code Reviewer..."
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: 'var(--border2)', color: 'var(--text)' }} />
            </div>

            {/* Q2 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text3)' }}>
                QUESTION 2 OF 7
              </p>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>What kind of agent is this?</p>
              <div className="flex flex-wrap gap-2">
                {AGENT_KINDS.map((k) => (
                  <button key={k} onClick={() => setAgentKind(k)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                    style={{
                      background: agentKind === k ? 'var(--accent)' : '#fff',
                      color: agentKind === k ? '#fff' : 'var(--text2)',
                      borderColor: agentKind === k ? 'var(--accent)' : 'var(--border)',
                    }}>
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text3)' }}>
                QUESTION 3 OF 7
              </p>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                What&apos;s the main job? <span className="font-normal" style={{ color: 'var(--text3)' }}>(in plain English)</span>
              </p>
              <textarea value={mainJob} onChange={(e) => setMainJob(e.target.value)}
                placeholder="e.g. Answer customer questions and escalate unresolved issues to humans"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none mb-2"
                style={{ borderColor: 'var(--border2)', color: 'var(--text)' }} />
              <div className="flex flex-wrap gap-1.5">
                {jobSuggestions.map((s) => (
                  <button key={s} onClick={() => setMainJob(s)}
                    className="px-2.5 py-1 rounded-full text-xs transition-colors hover:bg-gray-100"
                    style={{ background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Q4 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text3)' }}>
                QUESTION 4 OF 7
              </p>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Who will be talking to this agent?</p>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map((a) => (
                  <button key={a} onClick={() => setAgentAudience(a)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                    style={{
                      background: agentAudience === a ? '#1e293b' : '#fff',
                      color: agentAudience === a ? '#fff' : 'var(--text2)',
                      borderColor: agentAudience === a ? '#1e293b' : 'var(--border)',
                    }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Q5 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text3)' }}>
                QUESTION 5 OF 7
              </p>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>What response style should it use?</p>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button key={s} onClick={() => setAgentStyle(s)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                    style={{
                      background: agentStyle === s ? '#1d4ed8' : '#fff',
                      color: agentStyle === s ? '#fff' : 'var(--text2)',
                      borderColor: agentStyle === s ? '#1d4ed8' : 'var(--border)',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Q6 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text3)' }}>
                QUESTION 6 OF 7
              </p>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Which AI model do you prefer?</p>
              <div className="flex flex-wrap gap-2">
                {PREF_MODELS.map((m) => (
                  <button key={m} onClick={() => setPrefModel(m)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                    style={{
                      background: prefModel === m ? 'var(--bg2)' : '#fff',
                      color: prefModel === m ? 'var(--text)' : 'var(--text2)',
                      borderColor: prefModel === m ? 'var(--text)' : 'var(--border)',
                    }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Q7 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text3)' }}>
                QUESTION 7 OF 7
              </p>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Expected usage volume?</p>
              <div className="flex flex-wrap gap-2">
                {VOLUMES.map((v) => (
                  <button key={v} onClick={() => setAgentVolume(v)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors"
                    style={{
                      background: agentVolume === v ? 'var(--teal)' : '#fff',
                      color: agentVolume === v ? '#fff' : 'var(--text2)',
                      borderColor: agentVolume === v ? 'var(--teal)' : 'var(--border)',
                    }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: System Prompt ── */}
        {step === 1 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--text)' }} htmlFor="system-prompt">
                System Prompt
              </label>
              <button
                onClick={() => {
                  const generated = generateSystemPrompt(agentName, agentKind, mainJob, agentAudience, agentStyle);
                  setAgentPrompt(generated);
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: 'var(--accent-lt)', color: 'var(--accent)' }}
              >
                ✦ Regenerate
              </button>
            </div>
            <textarea
              id="system-prompt"
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              rows={14}
              className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)', fontFamily: 'monospace', lineHeight: '1.6' }}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
              Auto-generated based on your purpose answers. Edit freely — changes are saved automatically.
            </p>
          </div>
        )}

        {/* ── Step 2: Tools & APIs ── */}
        {step === 2 && (
          <div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              {(['All', 'Connected', 'Available', 'Suggested'] as const).map((f) => (
                <button key={f} onClick={() => setToolFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: toolFilter === f ? 'var(--accent)' : '#fff',
                    color: toolFilter === f ? '#fff' : 'var(--text2)',
                    border: `1px solid ${toolFilter === f ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                  {f}{f === 'Connected' && selectedTools.length > 0 ? ` (${selectedTools.length})` : ''}
                </button>
              ))}
            </div>

            {/* Tools grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {filteredTools.map((tool) => (
                <div key={tool.id} className="rounded-xl border overflow-hidden transition-shadow hover:shadow-sm"
                  style={{ borderColor: selectedTools.includes(tool.id) ? 'var(--accent)' : 'var(--border)' }}>
                  <label className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selectedTools.includes(tool.id)}
                      onChange={() => toggleTool(tool.id)}
                      className="mt-0.5 accent-orange-500" aria-label={`Enable ${tool.name}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span aria-hidden="true">{tool.icon}</span>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{tool.name}</p>
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text2)' }}>{tool.description}</p>
                    </div>
                  </label>
                  <button
                    onClick={() => { setDrawerTool(tool.id); setDrawerTab('Overview'); }}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-t transition-colors hover:bg-orange-50"
                    style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                  >
                    <span aria-hidden="true">⊕</span> How to configure
                    <span className="ml-auto" aria-hidden="true">›</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              className="w-full py-2.5 rounded-xl border-2 border-dashed text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
              style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}
              onClick={() => { /* coming soon */ }}
            >
              + Add more tools
            </button>
          </div>
        )}

        {/* ── Step 3: Memory ── */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Control what your agent remembers between conversations and sessions.
            </p>
            <label className="flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:bg-gray-50"
              style={{ borderColor: shortTermMem ? 'var(--accent)' : 'var(--border)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Short-term memory</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>Remembers context within a single conversation</p>
              </div>
              <input type="checkbox" checked={shortTermMem} onChange={(e) => setShortTermMem(e.target.checked)}
                className="w-4 h-4 accent-orange-500" aria-label="Enable short-term memory" />
            </label>
            <label className="flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:bg-gray-50"
              style={{ borderColor: longTermMem ? 'var(--accent)' : 'var(--border)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Long-term memory</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>Persists user preferences and context across sessions</p>
              </div>
              <input type="checkbox" checked={longTermMem} onChange={(e) => setLongTermMem(e.target.checked)}
                className="w-4 h-4 accent-orange-500" aria-label="Enable long-term memory" />
            </label>
            <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--blue-lt)', color: 'var(--blue)' }}>
              ℹ️ Long-term memory requires a connected vector store (e.g. Pinecone, Weaviate) to persist data.
            </div>
          </div>
        )}

        {/* ── Step 4: Test ── */}
        {step === 4 && (
          <div>
            <p className="text-sm mb-3" style={{ color: 'var(--text2)' }}>
              Send a test message to preview how <strong>{agentName || 'your agent'}</strong> responds.
            </p>
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="e.g. Hi! What can you help me with today?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none mb-3"
              style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
            />
            <button onClick={onTestRun} disabled={!testInput.trim() || isTesting}
              className="btn-primary text-sm disabled:opacity-50">
              {isTesting ? '⏳ Running...' : '▶ Run test'}
            </button>
            {testResponse && (
              <div className="mt-4 p-4 rounded-xl border text-sm leading-relaxed"
                style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                {testResponse}
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Deploy ── */}
        {step === 5 && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4" aria-hidden="true">🚀</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
              Ready to deploy!
            </h3>
            <p className="text-sm mb-1" style={{ color: 'var(--text2)' }}>
              <strong>{agentName || 'Your agent'}</strong> is fully configured.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6 mt-4">
              {[
                { label: 'Type', value: agentKind || '—' },
                { label: 'Audience', value: agentAudience || '—' },
                { label: 'Model', value: prefModel || 'Auto-select' },
                { label: 'Tools', value: selectedTools.length > 0 ? `${selectedTools.length} connected` : 'None' },
                { label: 'Memory', value: [shortTermMem && 'Short-term', longTermMem && 'Long-term'].filter(Boolean).join(', ') || 'None' },
              ].map((item) => (
                <div key={item.label} className="px-3 py-2 rounded-xl text-xs"
                  style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{item.label}:</span> {item.value}
                </div>
              ))}
            </div>
            <button onClick={onDeploy} disabled={isDeploying}
              className="btn-primary px-8 py-3 text-base disabled:opacity-60">
              {isDeploying ? '⏳ Deploying...' : '🚀 Deploy Agent'}
            </button>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Dot progress */}
        <div className="flex items-center gap-1.5">
          {WIZARD_STEPS.map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{
                width: i === step ? '20px' : '8px',
                height: '8px',
                background: i <= step ? 'var(--accent)' : 'var(--border2)',
              }} />
          ))}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={onBack} className="btn-ghost text-sm">← Back</button>
          )}
          {step < WIZARD_STEPS.length - 1 && (
            <button onClick={onNext} className="btn-primary text-sm">
              {step === WIZARD_STEPS.length - 2 ? 'Continue to Deploy →' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tool Drawer ──────────────────────────────────────────────────────────────

function ToolDrawer({
  tool, tab, setTab, enabled, onToggle, onClose, configValues, onDone,
}: {
  tool: ToolDef;
  tab: 'Overview' | 'Steps' | 'Config';
  setTab: (t: 'Overview' | 'Steps' | 'Config') => void;
  enabled: boolean;
  onToggle: () => void;
  onClose: () => void;
  configValues: Record<string, string>;
  onDone: (values: Record<string, string>) => void;
}) {
  const TABS = ['Overview', 'Steps', 'Config'] as const;
  const [localValues, setLocalValues] = useState<Record<string, string>>(configValues);

  const hasValues = Object.values(localValues).some((v) => v.trim() !== '');

  return (
    <div
      className="fixed top-0 right-0 h-full z-60 flex flex-col shadow-2xl"
      style={{
        width: '380px',
        background: '#fff',
        borderLeft: '1px solid var(--border)',
        zIndex: 60,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'var(--bg2)' }} aria-hidden="true">
            {tool.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{tool.name}</h3>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text2)' }}>{tool.description}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close drawer"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0 text-lg"
          style={{ color: 'var(--text3)' }}>×</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors"
            style={{
              borderColor: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text2)',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">

        {/* Overview tab */}
        {tab === 'Overview' && (
          <div className="space-y-5">
            {/* Tool detail card */}
            <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'var(--teal-lt)' }}>
              <span className="text-2xl shrink-0" aria-hidden="true">{tool.icon}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{tool.name}</p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text2)' }}>{tool.longDesc}</p>
              </div>
            </div>

            {/* Setup overview */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
                SETUP OVERVIEW
              </p>
              <ol className="space-y-2">
                {tool.setupSteps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text)' }}>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Pro tips */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
                PRO TIPS
              </p>
              <ul className="space-y-2">
                {tool.proTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs leading-relaxed"
                    style={{ background: '#fffbf0', border: '1px solid #fde68a', color: 'var(--text2)' }}>
                    <span aria-hidden="true">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Steps tab */}
        {tab === 'Steps' && (
          <div>
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Step-by-step setup guide for {tool.name}
            </p>
            <ol className="space-y-4">
              {tool.setupSteps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </div>
                    {i < tool.setupSteps.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: 'var(--border2)' }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                      {tool.proTips[i] ?? 'Follow the official documentation for this step.'}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Config tab */}
        {tab === 'Config' && (
          <div>
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Configuration for {tool.name}
            </p>
            <div className="space-y-4">
              {tool.configSteps.map((field, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold mb-1.5" htmlFor={`cfg-${tool.id}-${i}`} style={{ color: 'var(--text)' }}>
                    {field.label}
                  </label>
                  <input
                    id={`cfg-${tool.id}-${i}`}
                    type={field.label.toLowerCase().includes('password') || field.label.toLowerCase().includes('token') || field.label.toLowerCase().includes('key') ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={localValues[field.label] ?? ''}
                    onChange={(e) => setLocalValues((prev) => ({ ...prev, [field.label]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
              ℹ️ Config values are encrypted at rest and never shared with third parties.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            className="w-4 h-4 accent-orange-500"
            aria-label={`Enable ${tool.name}`}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Enable this tool</span>
        </label>
        <button
          onClick={() => onDone(localValues)}
          className="btn-primary text-sm px-5"
          style={{ background: hasValues ? 'var(--accent)' : undefined }}
        >
          {hasValues ? '✅ Save & Enable' : 'Done'}
        </button>
      </div>
    </div>
  );
}
