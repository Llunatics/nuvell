'use client';

import React, { useState } from 'react';
import { Sparkles, ExternalLink, Image as ImageIcon, Calendar, BookOpen, Layers } from 'lucide-react';
import { PublisherSocialPost } from '@/types';
import { formatShortDate } from '@/lib/formatters';
import { PublisherPosterModal } from './publisher-poster-modal';

interface PublisherSocialSectionProps {
  posts: PublisherSocialPost[];
}

export function PublisherSocialSection({ posts }: PublisherSocialSectionProps) {
  const [selectedPost, setSelectedPost] = useState<PublisherSocialPost | null>(null);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
            <span className="text-xs font-mono font-semibold text-gold tracking-wider uppercase">
              Publisher Social Ingestion Proof
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-editorial-title">
            Rilisan dari Poster Media Sosial Penerbit
          </h2>
          <p className="text-sm text-editorial-muted mt-1 max-w-2xl">
            Hasil transkripsi langsung dari poster foto mingguan Facebook & Instagram resmi penerbit (Phoenix Gramedia, Elex Media, m&c! Akasha).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-editorial-faint">
          <span>{posts.length} Flyer Terverifikasi</span>
        </div>
      </div>

      {/* Grid of Posters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="glass-card rounded-2xl overflow-hidden border border-border-subtle hover:border-gold/50 cursor-pointer group transition-all duration-300 flex flex-col"
          >
            {/* Poster Header */}
            <div className="p-4 bg-surface-overlay/60 border-b border-border-subtle flex items-center justify-between">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 inline-block uppercase">
                  {post.platform} FLYER
                </span>
                <h3 className="font-editorial text-sm font-bold text-editorial-title truncate mt-1">
                  {post.publisherName}
                </h3>
              </div>
              <span className="text-xs font-mono text-editorial-faint shrink-0">
                {formatShortDate(post.releaseDateAnnounced)}
              </span>
            </div>

            {/* Poster Preview with Overlay */}
            <div className="relative aspect-[4/5] bg-surface-sunken overflow-hidden">
              <img
                src={post.posterImageUrl}
                alt={`Poster ${post.publisherName}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

              <div className="absolute bottom-3 left-3 right-3 space-y-2">
                <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border-subtle space-y-1.5">
                  <p className="text-[11px] font-mono text-gold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{post.transcribedTitles.length} Judul Ditranskrip:</span>
                  </p>
                  <ul className="text-xs text-editorial-title space-y-1">
                    {post.transcribedTitles.slice(0, 3).map((title, i) => (
                      <li key={i} className="truncate font-medium flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gold" />
                        <span className="truncate">{title}</span>
                      </li>
                    ))}
                    {post.transcribedTitles.length > 3 && (
                      <li className="text-[11px] text-editorial-muted pl-2.5 font-mono">
                        +{post.transcribedTitles.length - 3} judul lainnya...
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[11px] text-editorial-muted font-mono px-1">
                  <span>Klik untuk inspeksi flyer</span>
                  <span className="text-gold group-hover:translate-x-1 transition-transform">Detail →</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <PublisherPosterModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </section>
  );
}
