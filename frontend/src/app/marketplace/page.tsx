'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppNav from '@/components/layout/AppNav';
import Footer from '@/components/layout/Footer';
import ModelCard from '@/components/landing/ModelCard';
import ModelDetailModal from '@/components/chathub/ModelDetailModal';
import { ModelData } from '@/data/models';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useMarketplace, MarketplaceFilterParams } from '@/hooks/useMarketplace';

// ─── Constants ──────────────────────────────────────────────────────────────

const TYPE_TABS = ['All', 'Language', 'Vision', 'Code', 'Image Gen', 'Audio', 'Open Source'] as const;
type TypeTab = (typeof TYPE_TABS)[number];

// Maps frontend type tabs → comma-separated backend `type` field values
const TYPE_TO_BACKEND: Partial<Record<TypeTab, string>> = {
  Language: 'llm,multimodal,embedding,tool',
  Vision: 'vision',
  Code: 'code',
  'Image Gen': 'image',
  Audio: 'audio',
};

const PROVIDER_EMOJI: Record<string, string> = {
  OpenAI: '🧠',
  Anthropic: '⚡',
  Google: '🔬',
  'Google DeepMind': '🔬',
  Meta: '🦙',
  'Mistral AI': '🌀',
  Cohere: '🔵',
  DeepSeek: '💻',
  Alibaba: '🀄',
  Microsoft: '🪟',
  xAI: '𝕏',
  Amazon: '📦',
  Perplexity: '🔍',
  'Stability AI': '🎨',
  'Black Forest Labs': '🌲',
  'AI21 Labs': '🔮',
  'Hugging Face': '🤗',
  'TII UAE': '🇦🇪',
  Databricks: '🧱',
  Adept: '🤖',
  Baidu: '🐉',
  'Inflection AI': '💫',
  Writer: '✍️',
};

const PRICING_OPTIONS = [
  { label: 'Pay-per-use', value: 'paid' },
  { label: 'Free tier', value: 'free' },
];

// ─── Debounce hook ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceInner />
    </Suspense>
  );
}

function MarketplaceInner() {
  const { openModelDetail } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Filter state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<TypeTab>('All');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(() => {
    const p = searchParams.get('provider');
    return p ? [decodeURIComponent(p)] : [];
  });
  const [selectedPricingTier, setSelectedPricingTier] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [visibleCount, setVisibleCount] = useState(24);

  const debouncedSearch = useDebounce(search, 350);

  // ── Sidebar provider counts ───────────────────────────────────────────────
  // Always fetch the full unfiltered list so sidebar counts stay accurate.
  const { data: allData } = useMarketplace();

  const providerCounts = useMemo<Record<string, number>>(() => {
    if (!allData) return {};
    return allData.reduce<Record<string, number>>((acc, m) => {
      acc[m.provider] = (acc[m.provider] ?? 0) + 1;
      return acc;
    }, {});
  }, [allData]);

  // Sort providers by count desc for the labs bar
  const sortedProviders = useMemo(() =>
    Object.entries(providerCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
    [providerCounts],
  );

  const totalCount = allData?.length ?? 0;

  // ── API params (sent to backend) ─────────────────────────────────────────
  const apiParams = useMemo<MarketplaceFilterParams>(() => {
    const p: MarketplaceFilterParams = {};
    if (debouncedSearch) p.search = debouncedSearch;

    // Type tab: 'Open Source' sets tier=free; others set backend type(s)
    if (activeType === 'Open Source') {
      p.tier = 'free';
    } else {
      if (activeType !== 'All') p.type = TYPE_TO_BACKEND[activeType];
      if (selectedPricingTier) p.tier = selectedPricingTier;
    }

    if (selectedProviders.length > 0) p.provider = selectedProviders.join(',');
    if (minRating > 0) p.minRating = minRating;
    if (maxPrice < 100) p.maxPrice = maxPrice;
    return p;
  }, [debouncedSearch, activeType, selectedProviders, selectedPricingTier, minRating, maxPrice]);

  const hasActiveFilters = Object.keys(apiParams).length > 0;

  // ── Filtered query (reuses allData cache when no filters are active) ──────
  const { data: filteredData, isLoading, isFetching } = useMarketplace(
    hasActiveFilters ? apiParams : undefined,
  );

  // Show previous results while a new filtered fetch is in-flight (no flicker)
  const displayModels = filteredData ?? allData ?? [];

  // ── Actions ───────────────────────────────────────────────────────────────

  // Labs bar: single-provider quick-select
  const handleLabClick = (name: string) => {
    setSelectedProviders((prev) =>
      prev.length === 1 && prev[0] === name ? [] : [name],
    );
    setVisibleCount(24);
  };

  // Sidebar provider checkboxes: multi-select
  const toggleProvider = (name: string) => {
    setSelectedProviders((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
    setVisibleCount(24);
  };

  const handleTry = (model: ModelData) => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }
    openModelDetail(model.id);
  };

  const clearAllFilters = () => {
    setSearch('');
    setActiveType('All');
    setSelectedProviders([]);
    setSelectedPricingTier(null);
    setMinRating(0);
    setMaxPrice(100);
    setVisibleCount(24);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--bg)' }}>
      <AppNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          Model Marketplace
        </h1>

        {/* ── Search ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border mb-4"
          style={{ background: '#fff', borderColor: 'var(--border2)' }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            style={{ color: 'var(--text3)', flexShrink: 0 }} aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(24); }}
            placeholder={`Search ${totalCount || '…'} models by name, provider, or capability…`}
            aria-label="Search models"
            className="flex-1 text-sm bg-transparent border-none focus:outline-none"
            style={{ color: 'var(--text)' }}
          />
          {isFetching && (
            <span className="text-xs animate-pulse" style={{ color: 'var(--text3)' }}>
              loading…
            </span>
          )}
          {search && !isFetching && (
            <button
              onClick={() => { setSearch(''); setVisibleCount(24); }}
              className="text-xs"
              style={{ color: 'var(--text3)' }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Type tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveType(tab); setVisibleCount(24); }}
              className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: activeType === tab ? 'var(--accent)' : '#fff',
                color: activeType === tab ? '#fff' : 'var(--text2)',
                border: '1px solid',
                borderColor: activeType === tab ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── AI Labs bar (dynamic from API data) ────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text2)' }}>
            🏛 AI Labs
          </span>
          <button
            onClick={() => { setSelectedProviders([]); setVisibleCount(24); }}
            className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: selectedProviders.length === 0 ? 'var(--accent)' : 'var(--bg2)',
              color: selectedProviders.length === 0 ? '#fff' : 'var(--text2)',
            }}
          >
            All Labs {totalCount > 0 && `(${totalCount})`}
          </button>

          {sortedProviders.map(({ name, count }) => {
            const isActive = selectedProviders.length === 1 && selectedProviders[0] === name;
            return (
              <button
                key={name}
                onClick={() => handleLabClick(name)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  background: isActive ? 'var(--accent)' : '#fff',
                  color: isActive ? '#fff' : 'var(--text2)',
                  border: '1px solid var(--border)',
                }}
              >
                <span aria-hidden="true">{PROVIDER_EMOJI[name] ?? '🤖'}</span>
                {name}
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg2)',
                    color: isActive ? '#fff' : 'var(--text2)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 2-col layout ───────────────────────────────────────────────── */}
        <div className="flex gap-6">

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="hidden lg:block shrink-0" style={{ width: 220 }}>

            {/* Help / sign-in card */}
            {isAuthenticated ? (
              <div
                className="rounded-xl border p-3 mb-4 text-center"
                style={{ background: 'var(--teal-lt)', borderColor: 'var(--teal)' }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--teal)' }}>
                  Need help choosing?
                </p>
                <p className="text-xs mb-2" style={{ color: 'var(--teal)' }}>
                  Chat with our AI guide for a personalised recommendation
                </p>
                <a href="/chathub" className="text-xs font-semibold underline" style={{ color: 'var(--teal)' }}>
                  Start guided chat →
                </a>
              </div>
            ) : (
              <div
                className="rounded-xl border p-3 mb-4 text-center"
                style={{ background: 'var(--teal-lt)', borderColor: 'var(--teal)' }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--teal)' }}>
                  Sign in to try models
                </p>
                <p className="text-xs mb-2" style={{ color: 'var(--teal)' }}>
                  Access the full AI chat experience
                </p>
                <a href="/signin" className="text-xs font-semibold underline" style={{ color: 'var(--teal)' }}>
                  Sign in →
                </a>
              </div>
            )}

            {/* Provider (dynamic from API) */}
            <FilterSection title="Provider">
              {sortedProviders.map(({ name }) => (
                <FilterCheck
                  key={name}
                  label={name}
                  checked={selectedProviders.includes(name)}
                  onChange={() => toggleProvider(name)}
                />
              ))}
            </FilterSection>

            {/* Pricing Model */}
            <FilterSection title="Pricing Model">
              {PRICING_OPTIONS.map(({ label, value }) => (
                <FilterCheck
                  key={value}
                  label={label}
                  checked={selectedPricingTier === value}
                  onChange={() => {
                    setSelectedPricingTier((prev) => (prev === value ? null : value));
                    setVisibleCount(24);
                  }}
                />
              ))}
            </FilterSection>

            {/* Max price slider */}
            <FilterSection title="Max Price ($/1M tokens)">
              <input
                type="range"
                min={0}
                max={100}
                value={maxPrice}
                onChange={(e) => { setMaxPrice(Number(e.target.value)); setVisibleCount(24); }}
                className="w-full accent-orange-500"
                aria-label="Maximum price per million tokens"
              />
              <div className="flex justify-between text-xs" style={{ color: 'var(--text2)' }}>
                <span>$0</span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  {maxPrice === 100 ? 'Any' : `$${maxPrice}`}
                </span>
                <span>$100</span>
              </div>
            </FilterSection>

            {/* Min rating */}
            <FilterSection title="Min Rating">
              <div className="flex gap-1 flex-wrap">
                {[0, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => { setMinRating(r); setVisibleCount(24); }}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{
                      background: minRating === r ? 'var(--accent)' : 'var(--bg2)',
                      color: minRating === r ? '#fff' : 'var(--text2)',
                    }}
                  >
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full text-xs py-2 rounded-xl text-center"
                style={{ color: 'var(--accent)', background: 'var(--accent-lt)' }}
              >
                Clear all filters
              </button>
            )}
          </aside>

          {/* ── Model grid ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-56 rounded-2xl animate-pulse"
                    style={{ background: 'var(--bg2)' }}
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="text-sm" style={{ color: 'var(--text2)' }}>
                    Showing{' '}
                    <strong style={{ color: 'var(--text)' }}>
                      {Math.min(visibleCount, displayModels.length)}
                    </strong>{' '}
                    of{' '}
                    <strong style={{ color: 'var(--text)' }}>{displayModels.length}</strong>{' '}
                    models
                    {isFetching && (
                      <span className="ml-2 text-xs animate-pulse" style={{ color: 'var(--text3)' }}>
                        updating…
                      </span>
                    )}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayModels.slice(0, visibleCount).map((model) => (
                    <ModelCard key={model.id} model={model} onTry={handleTry} />
                  ))}
                </div>

                {visibleCount < displayModels.length && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setVisibleCount((v) => v + 24)}
                      className="btn-ghost px-6 py-2.5"
                    >
                      Load more models
                    </button>
                  </div>
                )}

                {displayModels.length === 0 && !isFetching && (
                  <div className="text-center py-16" style={{ color: 'var(--text2)' }}>
                    <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
                    <p className="text-base font-medium">No models match your filters.</p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-3 text-sm underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <ModelDetailModal />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text)' }}>
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer text-sm"
      style={{ color: 'var(--text2)' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-orange-500 rounded"
        aria-label={`Filter by ${label}`}
      />
      {label}
    </label>
  );
}
