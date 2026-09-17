'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Bookmark,
  Calendar,
  Layers,
  Building2,
  Clock,
  Radio,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Publication, Publisher, Series, Announcement } from '@/types';
import { ReleaseCard } from '@/components/books/release-card';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useCollection } from '@/hooks/use-collection';
import { formatShortDate, getTodayDateWIB, getRollingPastDateWIB } from '@/lib/formatters';

interface HomeFeedClientProps {
  publications: Publication[];
  publishers: Publisher[];
  series: Series[];
  announcements: Announcement[];
}

export function HomeFeedClient({
  publications,
  publishers,
  series,
  announcements,
}: HomeFeedClientProps) {
  const { items: watchlistItems } = useWatchlist();
  const { collection } = useCollection();

  const todayStr = useMemo(() => getTodayDateWIB(), []);
  const rollingPastStr = useMemo(() => getRollingPastDateWIB(14), []);

  // Today releases (dynamic WIB date, with fallback to latest batch if today has no drops)
  const todayReleases = useMemo(() => {
    const exactToday = publications.filter((p) => p.releaseDate === todayStr);
    if (exactToday.length > 0) return exactToday;
    // Fallback to the latest observed release batch
    const sorted = [...publications]
      .filter((p) => p.releaseDate && p.releaseDate <= todayStr)
      .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
    const latestDate = sorted[0]?.releaseDate;
    return latestDate ? sorted.filter((p) => p.releaseDate === latestDate) : [];
  }, [publications, todayStr]);

  const upcomingReleases = useMemo(() => {
    return publications
      .filter((p) => (p.releaseDate && p.releaseDate > todayStr) || p.status === 'PREORDER')
      .slice(0, 8);
  }, [publications, todayStr]);

  const freshReleases = useMemo(() => {
    const recents = publications
      .filter((p) => p.releaseDate && p.releaseDate >= rollingPastStr && p.releaseDate <= todayStr)
      .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
    if (recents.length > 0) return recents.slice(0, 8);
    // If empty window, return newest released books
    return [...publications]
      .filter((p) => p.releaseDate && p.releaseDate <= todayStr)
      .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
      .slice(0, 8);
  }, [publications, rollingPastStr, todayStr]);

  // Personalized "From Your Watchlist" items
  const watchlistMatches = useMemo(() => {
    if (watchlistItems.length === 0) return [];

    const followedBookIds = new Set(watchlistItems.filter((i) => i.type === 'BOOK').map((i) => i.targetId));
    const followedSeriesIds = new Set(watchlistItems.filter((i) => i.type === 'SERIES').map((i) => i.targetId));
    const followedPublisherIds = new Set(watchlistItems.filter((i) => i.type === 'PUBLISHER').map((i) => i.targetId));

    return publications.filter((p) => {
      if (followedBookIds.has(p.id)) return true;
      if (p.seriesId && followedSeriesIds.has(p.seriesId)) return true;
      if (followedPublisherIds.has(p.publisherId)) return true;
      return false;
    }).slice(0, 4);
  }, [publications, watchlistItems]);

  return (
    <div className="space-y-12 sm:space-y-16 px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto">
      {/* 1. Subtle Editorial Greeting & Today's Digest */}
      <section className="space-y-4 pt-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Rilis Pekan Ini • WIB
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold text-editorial-title tracking-tight leading-tight">
            Jadwal Rilis Buku & Manga <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-editorial-title via-gold to-amber-500">
              Pekan Ini di Indonesia.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted max-w-xl">
            Cek tanggal edar resmi buku, komik, dan novel favoritmu dari berbagai penerbit.
          </p>
        </div>

        {/* Today's Digest Banner Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface/70 border border-border-subtle backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6 divide-x divide-border-subtle text-xs">
            <div>
              <span className="font-mono text-lg font-bold text-editorial-title block">
                {todayReleases.length}
              </span>
              <span className="text-editorial-faint">Rilis Hari Ini</span>
            </div>
            <div className="pl-6">
              <span className="font-mono text-lg font-bold text-gold block">
                {upcomingReleases.length}+
              </span>
              <span className="text-editorial-faint">Segera Terbit</span>
            </div>
            <div className="pl-6">
              <span className="font-mono text-lg font-bold text-emerald-400 block">
                {publishers.length}
              </span>
              <span className="text-editorial-faint">Penerbit Resmi</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/calendar"
              className="px-3.5 py-1.5 rounded-xl bg-surface-raised hover:bg-surface border border-border-subtle hover:border-gold/40 text-xs font-medium text-editorial-title hover:text-gold transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>Kalender Rilis</span>
            </Link>
            <Link
              href="/discover"
              className="px-3.5 py-1.5 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-400 transition-colors flex items-center gap-1"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Personalized "From Your Watchlist" (if followed items exist) */}
      {watchlistMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-gold" />
              <div>
                <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                  Watchlist Kamu
                </h2>
                <p className="text-xs text-editorial-muted">
                  Judul dan penerbit yang kamu ikuti
                </p>
              </div>
            </div>
            <Link
              href="/library?tab=watchlist"
              className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
            >
              Lihat Semua ({watchlistItems.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {watchlistMatches.map((pub) => (
              <ReleaseCard key={pub.id} publication={pub} layout="grid" />
            ))}
          </div>
        </section>
      )}

      {/* 3. Fresh Releases (Newest September 2026) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                Baru Terbit
              </h2>
              <p className="text-xs text-editorial-muted">
                Sudah beredar di toko buku pekan ini
              </p>
            </div>
          </div>
          <Link
            href="/discover?tab=latest"
            className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
          >
            Katalog Lengkap <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {freshReleases.map((pub) => (
            <ReleaseCard key={pub.id} publication={pub} layout="grid" />
          ))}
        </div>
      </section>

      {/* 4. Coming Soon & Pre-orders */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-burgundy-400" />
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                Segera Hadir
              </h2>
              <p className="text-xs text-editorial-muted">
                Jadwal rilis dan pre-order mendatang
              </p>
            </div>
          </div>
          <Link
            href="/calendar"
            className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
          >
            Jadwal Rilis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {upcomingReleases.map((pub) => (
            <ReleaseCard key={pub.id} publication={pub} layout="grid" />
          ))}
        </div>
      </section>

      {/* 5. Publisher Official Announcements */}
      {announcements.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-gold" />
              <div>
                <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
                  Kabar Penerbit
                </h2>
                <p className="text-xs text-editorial-muted">
                  Update langsung dari kanal resmi penerbit
                </p>
              </div>
            </div>
            <span className="text-xs text-editorial-faint font-mono">Feed Resmi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-editorial-faint">
                    <span className="text-gold font-medium">{ann.publisherName}</span>
                    <span>{formatShortDate(ann.publishedAt)}</span>
                  </div>
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-editorial-muted leading-relaxed">
                    {ann.excerpt}
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-[11px] text-editorial-faint">
                    Kanal Resmi
                  </span>
                  <a
                    href={ann.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gold hover:underline inline-flex items-center gap-1"
                  >
                    Lihat postingan ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Contextual Series Discovery Strip */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-gold mb-1">
              <Layers className="w-3.5 h-3.5" />
              PELACAK SERI
            </div>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-editorial-title">
              Kelengkapan Koleksi Seri
            </h2>
            <p className="text-xs text-editorial-muted mt-0.5">
              Cek nomor volume yang sudah terbit dan lengkapi koleksimu.
            </p>
          </div>
          <Link
            href="/discover?tab=series"
            className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle hover:border-gold/40 text-xs font-semibold text-editorial-title hover:text-gold transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Katalog Seri</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {series.slice(0, 3).map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.slug}`}
              className="glass-card rounded-xl p-3.5 flex items-center gap-3 group"
            >
              <div className="w-12 h-16 bg-surface rounded-md overflow-hidden shrink-0 border border-border-subtle">
                {s.coverUrl && <img src={s.coverUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-editorial text-sm font-semibold text-editorial-title group-hover:text-gold transition-colors truncate">
                  {s.name}
                </h3>
                <p className="text-xs text-editorial-faint font-mono">{s.publisherName}</p>
                <span className="inline-block text-[10px] font-mono text-editorial-muted mt-1">
                  {s.totalVolumes ? `${s.totalVolumes} Volume` : 'Ongoing'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Publishers Discovery Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-editorial-muted" />
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title">
              Penerbit Buku & Komik
            </h2>
          </div>
          <Link
            href="/discover?tab=publishers"
            className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
          >
            Semua Penerbit ({publishers.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {publishers.map((pub) => (
            <Link
              key={pub.id}
              href={`/publishers/${pub.slug}`}
              className="glass-card rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1.5 group"
            >
              <div className="w-9 h-9 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-gold font-bold font-editorial group-hover:border-gold/50 transition-colors text-sm">
                {pub.name[0]}
              </div>
              <h3 className="text-xs font-semibold text-editorial-title group-hover:text-gold transition-colors line-clamp-1">
                {pub.name}
              </h3>
              <span className="text-[10px] text-editorial-faint font-mono">Resmi</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
