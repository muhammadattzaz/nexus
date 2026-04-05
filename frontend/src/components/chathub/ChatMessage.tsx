'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 mr-2 mt-0.5"
          style={{ background: 'var(--accent)' }}
          aria-hidden="true"
        >
          N
        </div>
      )}
      <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={
            isUser
              ? { background: 'var(--accent)', color: '#fff', borderBottomRightRadius: 4 }
              : { background: '#fff', color: 'var(--text)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }
          }
        >
          {isUser ? (
            <p>{content}</p>
          ) : (
            <AssistantContent content={content} />
          )}
        </div>
        {timestamp && (
          <span className="text-xs mt-1 px-1" style={{ color: 'var(--text3)' }}>
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

function AssistantContent({ content }: { content: string }) {
  // Simple markdown: code blocks, bold
  const parts = content.split(/(```[\s\S]*?```|\*\*.*?\*\*)/g);

  return (
    <div>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^[a-z]+\n/, '');
          return (
            <pre
              key={i}
              className="mt-2 mb-2 p-3 rounded-lg text-xs overflow-x-auto"
              style={{ background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'monospace' }}
            >
              <code>{code}</code>
            </pre>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} style={{ fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
