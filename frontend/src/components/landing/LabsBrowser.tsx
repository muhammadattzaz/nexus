'use client';
import { LABS } from '@/data/labs';
import Link from 'next/link';

export default function LabsBrowser() {
  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
        >
          Browse by AI Lab
        </h2>
        <a href="/marketplace" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent)' }}>
          See all labs →
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {LABS.map((lab) => (
          <div
            key={lab.id}
            className="p-4 rounded-2xl border text-center cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-border)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-3"
              style={{ background: 'var(--bg2)' }}
            >
              {lab.emoji}
            </div>
            <p
              className="text-xs font-semibold mb-1 leading-tight"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}
            >
              {lab.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {lab.modelCount} models
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
