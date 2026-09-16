'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Check, Calendar, ExternalLink, Plus } from 'lucide-react';
import { Publication } from '@/types';
import { formatIDR, getReleaseCountdown, formatShortDate } from '@/lib/formatters';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useCollection } from '@/hooks/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Tooltip } from '@/components/ui/tooltip';

interface ReleaseCardProps {
  publication: Publication;
  layout?: 'grid' | 'list' | 'feed';
}

export function ReleaseCard({ publication, layout = 'grid' }: ReleaseCardProps) {
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const { getItemStatus, setItemStatus } = useCollection();
  const { toast } = useToast();

  const isFollowed = isWatchlisted('BOOK', publication.id);
  const collectionStatus = getItemStatus(publication.id);
  const countdown = getReleaseCountdown(publication.releaseDate);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist('BOOK', publication.id, publication.title, publication.slug);
    if (!isFollowed) {
      toast({
        title: 'Ditambahkan ke Watchlist',
        description: publication.title,
        variant: 'success',
      });
    } else {
      toast({
        title: 'Dihapus dari Watchlist',
        description: publication.title,
      });
    }
  };

  const handleCollectionToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = collectionStatus === 'OWNED' ? null : 'OWNED';
    setItemStatus(publication.id, nextStatus, {
      seriesId: publication.seriesId || undefined,
      volume: publication.volume || undefined,
    });
    if (nextStatus === 'OWNED') {
      toast({
        title: 'Ditandai sebagai Dimiliki',
        description: publication.title,
        variant: 'success',
      });
    } else {
      toast({
        title: 'Dihapus dari Koleksi',
        description: publication.title,
      });
    }
  };

  const getBadgeStyle = (badge?: string | null) => {
    switch (badge) {
      case 'NEW':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'PRICE DROP':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'PREORDER':
        return 'bg-burgundy/15 text-burgundy-400 border-burgundy/30';
      default:
        return 'bg-surface-raised/80 text-editorial-muted border-border-subtle';
    }
  };

  // 1. List Layout
  if (layout === 'list') {
    return (
      <article className="glass-card rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4 transition-all hover:border-gold/30">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <Link href={`/books/${publication.slug}`} className="shrink-0 group">
            <div className="w-12 h-16 sm:w-14 sm:h-20 bg-surface rounded-lg border border-border-subtle overflow-hidden relative">
              {publication.coverImage ? (
                <img
                  src={publication.coverImage}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-editorial-faint text-[10px] text-center p-1">
                  No Cover
                </div>
              )}
            </div>
          </Link>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono text-editorial-faint text-[11px] truncate">
                {publication.publisherName}
              </span>
              {publication.volume && (
                <span className="font-mono text-gold text-[11px]">
                  Vol. {publication.volume}
                </span>
              )}
              {publication.recentChangeBadge && (
                <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${getBadgeStyle(publication.recentChangeBadge)}`}>
                  {publication.recentChangeBadge}
                </span>
              )}
            </div>

            <Link href={`/books/${publication.slug}`}>
              <h3 className="text-sm sm:text-base font-semibold text-editorial-title hover:text-gold transition-colors truncate">
                {publication.title}
              </h3>
            </Link>

            <div className="flex items-center gap-3 text-xs text-editorial-muted">
              <span className="font-mono font-medium text-editorial-title">
                {formatIDR(publication.currentPrice)}
              </span>
              <span>•</span>
              <span className={countdown.isToday ? 'text-gold font-medium' : 'text-editorial-faint'}>
                {formatShortDate(publication.releaseDate)} ({countdown.label})
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Tooltip content={collectionStatus === 'OWNED' ? 'Sudah dimiliki' : 'Tandai dimiliki'}>
            <button
              type="button"
              onClick={handleCollectionToggle}
              className={`p-2 rounded-lg border transition-all ${
                collectionStatus === 'OWNED'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-surface border-border-subtle text-editorial-faint hover:text-editorial-title hover:bg-surface-raised'
              }`}
              aria-label="Tandai koleksi"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content={isFollowed ? 'Hapus dari Watchlist' : 'Simpan ke Watchlist'}>
            <button
              type="button"
              onClick={handleWatchlistToggle}
              className={`p-2 rounded-lg border transition-all ${
                isFollowed
                  ? 'bg-gold/15 text-gold border-gold/40'
                  : 'bg-surface border-border-subtle text-editorial-faint hover:text-editorial-title hover:bg-surface-raised'
              }`}
              aria-label="Toggle watchlist"
            >
              <Bookmark className="w-3.5 h-3.5" fill={isFollowed ? 'currentColor' : 'none'} />
            </button>
          </Tooltip>

          <Link
            href={`/books/${publication.slug}`}
            className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-title hover:text-gold transition-colors"
          >
            Detail
          </Link>
        </div>
      </article>
    );
  }

  // 2. Grid Layout (Progressive Disclosure)
  return (
    <article className="glass-card rounded-2xl overflow-hidden flex flex-col group relative transition-all duration-300 hover:border-gold/40">
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        <Link href={`/books/${publication.slug}`} className="block w-full h-full">
          {publication.coverImage ? (
            <img
              src={publication.coverImage}
              alt={publication.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-surface-sunken">
              <span className="text-xs text-editorial-muted font-medium line-clamp-3">
                {publication.title}
              </span>
            </div>
          )}
        </Link>

        {/* Floating Top Controls: Status Badge (Left) & Watchlist Toggle (Right) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          {publication.recentChangeBadge ? (
            <span
              className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm border backdrop-blur-md ${getBadgeStyle(
                publication.recentChangeBadge
              )}`}
            >
              {publication.recentChangeBadge}
            </span>
          ) : (
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-surface/80 text-editorial-muted backdrop-blur-md border border-border-subtle">
              {publication.format}
            </span>
          )}

          <button
            type="button"
            onClick={handleWatchlistToggle}
            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md border transition-all ${
              isFollowed
                ? 'bg-gold text-background border-gold shadow-md'
                : 'bg-surface/80 text-editorial-title border-border-subtle hover:bg-surface hover:text-gold'
            }`}
            aria-label={isFollowed ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isFollowed ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Floating Release Date Pill (Bottom) */}
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <div
            className={`px-2.5 py-1 rounded-lg text-[11px] backdrop-blur-md border flex items-center justify-between ${
              countdown.isToday
                ? 'bg-gold/90 text-background font-semibold border-gold shadow-sm'
                : 'bg-surface/85 text-editorial-body border-border-subtle'
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3 h-3 shrink-0" />
              <span className="truncate">{countdown.label}</span>
            </span>
            <span className="font-mono text-[10px] opacity-80 shrink-0">
              {formatShortDate(publication.releaseDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Eyebrow: Publisher & Volume */}
          <div className="flex items-center justify-between text-xs text-editorial-faint font-mono">
            <span className="truncate">{publication.publisherName}</span>
            {publication.volume && (
              <span className="text-gold shrink-0 font-medium">Vol. {publication.volume}</span>
            )}
          </div>

          {/* Title */}
          <Link href={`/books/${publication.slug}`} className="block group-hover:text-gold transition-colors">
            <h3 className="font-editorial text-sm sm:text-base font-bold text-editorial-title leading-snug line-clamp-2">
              {publication.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Progressive Disclosure Action Bar */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] text-editorial-faint uppercase font-mono block leading-none mb-1">
              Harga
            </span>
            <span className="text-sm font-bold text-editorial-title font-mono">
              {formatIDR(publication.currentPrice)}
            </span>
          </div>

          {/* Quick Collection Toggle Button */}
          <button
            type="button"
            onClick={handleCollectionToggle}
            className={`py-1 px-2.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              collectionStatus === 'OWNED'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-surface hover:bg-surface-raised border-border-subtle text-editorial-muted hover:text-editorial-title'
            }`}
            title={collectionStatus === 'OWNED' ? 'Tersimpan di koleksi' : 'Tambahkan ke koleksi'}
          >
            <Check className="w-3 h-3" />
            <span>{collectionStatus === 'OWNED' ? 'Dimiliki' : '+ Koleksi'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
