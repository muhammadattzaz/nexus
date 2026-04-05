'use client';
import { ModelData } from '@/data/models';
import { cn } from '@/lib/cn';

interface ModelCardProps {
  model: ModelData;
  onTry?: (model: ModelData) => void;
  compact?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#F59E0B' : 'none'}
          stroke="#F59E0B"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

const BADGE_STYLES = {
  hot: { bg: '#FEF2F2', color: '#DC2626', label: '🔥 Hot' },
  new: { bg: '#E2F5EF', color: '#0A5E49', label: '✨ New' },
  open: { bg: '#EBF0FC', color: '#1E4DA8', label: '🔓 Open' },
};

export default function ModelCard({ model, onTry, compact }: ModelCardProps) {
  const badge = model.badge ? BADGE_STYLES[model.badge] : null;

  return (
    <div
      className="p-5 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col gap-3"
      style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'var(--accent-lt)' }}
          >
            {model.emoji}
          </div>
          <div>
            <p
              className="text-sm font-semibold leading-tight"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
            >
              {model.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {model.provider}
            </p>
          </div>
        </div>
        {badge && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Description */}
      {!compact && (
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: 'var(--text2)' }}
        >
          {model.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {model.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--blue-lt)', color: 'var(--blue)' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Rating + Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <StarRating rating={model.rating} />
          <span className="text-xs" style={{ color: 'var(--text2)' }}>
            {model.rating} ({model.reviewCount.toLocaleString()})
          </span>
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
          {typeof model.pricing.inputPer1M === 'number' && model.pricing.inputPer1M === 0
            ? 'Free'
            : `$${model.pricing.inputPer1M}/1M tk`}
        </span>
      </div>

      {/* Try button */}
      <button
        onClick={() => onTry?.(model)}
        className="w-full py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent-lt)', color: 'var(--accent)' }}
        aria-label={`Try ${model.name}`}
      >
        Try →
      </button>
    </div>
  );
}
