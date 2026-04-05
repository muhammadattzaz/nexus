interface LiveBadgeProps {
  label?: string;
  color?: 'teal' | 'green' | 'orange';
}

export default function LiveBadge({ label = 'Live', color = 'teal' }: LiveBadgeProps) {
  const colors = {
    teal: { dot: '#0A5E49', bg: '#E2F5EF', text: '#0A5E49' },
    green: { dot: '#2E9E5B', bg: '#E8F8EE', text: '#2E9E5B' },
    orange: { dot: '#C8622A', bg: '#FDF1EB', text: '#C8622A' },
  };
  const c = colors[color];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: c.dot }}
        />
        <span
          className="relative inline-flex rounded-full h-1.5 w-1.5"
          style={{ background: c.dot }}
        />
      </span>
      {label}
    </span>
  );
}
