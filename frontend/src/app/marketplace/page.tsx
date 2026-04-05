'use client';

import { useState, useMemo } from 'react';
import AppNav from '@/components/layout/AppNav';
import Footer from '@/components/layout/Footer';
import ModelCard from '@/components/landing/ModelCard';
import ModelDetailModal from '@/components/chathub/ModelDetailModal';
import { MODELS, ModelData } from '@/data/models';
import { LABS } from '@/data/labs';
import { useUIStore } from '@/store/uiStore';
import { useMarketplace } from '@/hooks/useMarketplace';

const TYPE_TABS = ['All', 'Language', 'Vision', 'Code', 'Image Gen', 'Audio', 'Open Source'] as const;
type TypeTab = (typeof TYPE_TABS)[number];

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google DeepMind', 'Meta', 'Mistral AI', 'Cohere'];
const PRICING_TIERS = ['Pay-per-use', 'Subscription', 'Free tier', 'Enterprise'];
const LICENSES = ['Commercial', 'Open source'];

export default function MarketplacePage() {
  const { openModelDetail } = useUIStore();
  const { data: apiModels, isLoading } = useMarketplace();
  const allModels = apiModels ?? MODELS;

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<TypeTab>('All');
  const [activeLab, setActiveLab] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [visibleCount, setVisibleCount] = useState(24);

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const filtered = useMemo(() => {
    return allModels.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
          !m.provider.toLowerCase().includes(search.toLowerCase()) &&
          !m.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeType !== 'All') {
        if (activeType === 'Open Source' && m.pricing.tier !== 'open-source') return false;
        if (activeType === 'Language' && m.type !== 'language') return false;
        if (activeType === 'Vision' && m.type !== 'vision') return false;
        if (activeType === 'Code' && m.type !== 'code') return false;
        if (activeType === 'Image Gen' && m.type !== 'image') return false;
        if (activeType === 'Audio' && m.type !== 'audio') return false;
      }
      if (activeLab) {
        const lab = LABS.find((l) => l.id === activeLab);
        if (lab && !m.provider.toLowerCase().includes(lab.name.toLowerCase().split(' ')[0])) return false;
      }
      if (selectedProviders.length > 0 && !selectedProviders.some((p) => m.provider.includes(p))) return false;
      if (minRating > 0 && m.rating < minRating) return false;
      if (m.pricing.inputPer1M > maxPrice && maxPrice < 100) return false;
      return true;
    });
  }, [search, activeType, activeLab, selectedProviders, minRating, maxPrice]);

  const handleTry = (model: ModelData) => openModelDetail(model.id);

  return (
    <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--bg)' }}>
      <AppNav />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          Model Marketplace
        </h1>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border mb-4"
          style={{ background: '#fff', borderColor: 'var(--border2)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text3)', flexShrink: 0 }} aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 525 models by name, provider, or capability…"
            aria-label="Search models"
            className="flex-1 text-sm bg-transparent border-none focus:outline-none"
            style={{ color: 'var(--text)' }}
          />
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveType(tab)}
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

        {/* Labs filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text2)' }}>
            🏛 AI Labs
          </span>
          <button
            onClick={() => setActiveLab(null)}
            className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
            style={{
              background: activeLab === null ? 'var(--accent)' : 'var(--bg2)',
              color: activeLab === null ? '#fff' : 'var(--text2)',
            }}
          >
            All labs
          </button>
          {LABS.map((lab) => (
            <button
              key={lab.id}
              onClick={() => setActiveLab(activeLab === lab.id ? null : lab.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              style={{
                background: activeLab === lab.id ? 'var(--accent)' : '#fff',
                color: activeLab === lab.id ? '#fff' : 'var(--text2)',
                border: '1px solid var(--border)',
              }}
            >
              <span aria-hidden="true">{lab.emoji}</span>
              {lab.name}
              <span
                className="px-1.5 py-0.5 rounded-full text-xs"
                style={{
                  background: activeLab === lab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg2)',
                  color: activeLab === lab.id ? '#fff' : 'var(--text2)',
                }}
              >
                {lab.modelCount}
              </span>
            </button>
          ))}
        </div>

        {/* 2-col layout */}
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden lg:block shrink-0" style={{ width: 220 }}>
            {/* Help card */}
            <div
              className="rounded-xl border p-3 mb-4 text-center"
              style={{ background: 'var(--teal-lt)', borderColor: 'var(--teal)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--teal)' }}>
                Need help choosing?
              </p>
              <p className="text-xs mb-2" style={{ color: 'var(--teal)' }}>
                Chat with our AI guide
              </p>
              <a
                href="/chathub"
                className="text-xs font-semibold underline"
                style={{ color: 'var(--teal)' }}
              >
                Start guided chat →
              </a>
            </div>

            <FilterSection title="Provider">
              {PROVIDERS.map((p) => (
                <FilterCheck
                  key={p}
                  label={p}
                  checked={selectedProviders.includes(p)}
                  onChange={() => toggleItem(selectedProviders, setSelectedProviders, p)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Pricing Model">
              {PRICING_TIERS.map((t) => (
                <FilterCheck
                  key={t}
                  label={t}
                  checked={selectedPricing.includes(t)}
                  onChange={() => toggleItem(selectedPricing, setSelectedPricing, t)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Max Price ($/1M tokens)">
              <input
                type="range"
                min={0}
                max={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-orange-500"
                aria-label="Maximum price per million tokens"
              />
              <div className="flex justify-between text-xs" style={{ color: 'var(--text2)' }}>
                <span>$0</span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  ${maxPrice === 100 ? 'Any' : maxPrice}
                </span>
                <span>$100</span>
              </div>
            </FilterSection>

            <FilterSection title="Min Rating">
              <div className="flex gap-1 flex-wrap">
                {[0, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
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

            <FilterSection title="License">
              {LICENSES.map((l) => (
                <FilterCheck
                  key={l}
                  label={l}
                  checked={selectedLicenses.includes(l)}
                  onChange={() => toggleItem(selectedLicenses, setSelectedLicenses, l)}
                />
              ))}
            </FilterSection>
          </aside>

          {/* Model grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-sm" style={{ color: 'var(--text2)' }}>
                <span className="animate-pulse">Loading models…</span>
              </div>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
                  Showing <strong style={{ color: 'var(--text)' }}>{Math.min(visibleCount, filtered.length)}</strong> of{' '}
                  <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> models
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.slice(0, visibleCount).map((model) => (
                    <ModelCard key={model.id} model={model} onTry={handleTry} />
                  ))}
                </div>
                {visibleCount < filtered.length && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setVisibleCount((v) => v + 24)}
                      className="btn-ghost px-6 py-2.5"
                    >
                      Load more models
                    </button>
                  </div>
                )}
                {filtered.length === 0 && (
                  <div className="text-center py-16" style={{ color: 'var(--text2)' }}>
                    <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
                    <p className="text-base font-medium">No models match your filters.</p>
                    <button
                      onClick={() => { setSearch(''); setActiveType('All'); setActiveLab(null); setSelectedProviders([]); }}
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

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>{title}</p>
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
    <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--text2)' }}>
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
