'use client';

import React from 'react';
import Link from 'next/link';
import { X, ExternalLink, Image as ImageIcon, Calendar, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { PublisherSocialPost } from '@/types';
import { formatShortDate } from '@/lib/formatters';

interface PublisherPosterModalProps {
  post: PublisherSocialPost | null;
  onClose: () => void;
}

export function PublisherPosterModal({ post, onClose }: PublisherPosterModalProps) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-surface-raised border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-background/80 hover:bg-background border border-border-subtle text-editorial-muted hover:text-editorial-title transition-colors"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Flyer Image Visual Proof */}
        <div className="md:w-1/2 bg-surface-sunken p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border-subtle overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-gold/15 text-gold border border-gold/30">
                {post.platform} POST PROOF
              </span>
              <span className="text-xs text-editorial-faint font-mono">
                {formatShortDate(post.postDate)}
              </span>
            </div>
            <h3 className="font-editorial text-lg font-bold text-editorial-title">
              {post.publisherName}
            </h3>
            <p className="text-xs text-editorial-muted italic">
              "{post.caption}"
            </p>
          </div>

          <div className="my-4 relative rounded-xl overflow-hidden border border-border-subtle bg-black/40 aspect-[4/5] flex items-center justify-center group">
            <img
              src={post.posterImageUrl}
              alt={`Poster Rilisan ${post.publisherName}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 text-white text-xs pointer-events-none flex items-center justify-between">
              <span className="font-mono text-[11px] bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                Rilis: {post.releaseDateAnnounced}
              </span>
              <span className="text-[10px] bg-emerald-500/80 px-2 py-0.5 rounded font-mono">
                Verified Social Source
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={post.postUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-lg text-xs font-mono bg-surface hover:bg-surface-overlay border border-border-subtle text-editorial-title flex items-center justify-center gap-2 transition-colors"
            >
              <span>Buka Post Asli di {post.platform}</span>
              <ExternalLink className="w-3.5 h-3.5 text-gold" />
            </a>
          </div>
        </div>

        {/* Right: Transcribed Releases List */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
              <Sparkles className="w-4 h-4 text-gold" />
              <h4 className="font-editorial text-base font-bold text-editorial-title">
                Transkrip Judul dari Poster ({post.transcribedTitles.length} Judul)
              </h4>
            </div>

            <p className="text-xs text-editorial-muted">
              Judul-judul berikut diekstrak & ditranskripsi langsung dari poster pengumuman grafis mingguan penerbit:
            </p>

            <div className="space-y-2.5">
              {post.transcribedTitles.map((title, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-gold">#{idx + 1}</span>
                      <h5 className="text-sm font-semibold text-editorial-title">
                        {title}
                      </h5>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-editorial-faint font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Terkonfirmasi Rilis {post.releaseDateAnnounced}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-border-subtle mt-4 text-[11px] text-editorial-faint space-y-1 font-mono">
            <p className="text-gold font-medium">⚡ Automated Social Poster Ingestion Engine</p>
            <p>
              Penerbit komik & novel di Indonesia (Phoenix Gramedia, Elex Media, m&c!) mengumumkan jadwal rilis mingguan melalui foto poster di media sosial. Mesin Nuvell mentranskrip poster tersebut menjadi entitas data buku terverifikasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
