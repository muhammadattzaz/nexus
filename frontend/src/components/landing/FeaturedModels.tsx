'use client';
import { useModels } from '@/hooks/useModels';
import { MODELS } from '@/data/models';
import ModelCard from './ModelCard';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';

export default function FeaturedModels() {
  const { openModelDetail } = useUIStore();
  const { data: apiModels, isLoading } = useModels();
  const models = apiModels ?? MODELS;
  const featured = models.slice(0, 9);

  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          Featured Models
        </h2>
        <Link
          href="/marketplace"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          Browse all {models.length}+ →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl animate-pulse"
              style={{ background: 'var(--bg2)' }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onTry={() => openModelDetail(model.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
