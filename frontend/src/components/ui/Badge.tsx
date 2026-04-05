interface BadgeProps {
  variant: 'hot' | 'new' | 'open';
  className?: string;
}

export default function Badge({ variant, className }: BadgeProps) {
  const styles = {
    hot: { bg: '#FEF2F2', color: '#DC2626', label: '🔥 Hot' },
    new: { bg: '#E2F5EF', color: '#0A5E49', label: '✨ New' },
    open: { bg: '#EBF0FC', color: '#1E4DA8', label: '🔓 Open' },
  };
  const s = styles[variant];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className ?? ''}`}
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
