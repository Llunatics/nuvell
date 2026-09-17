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
      <article className="glass-card rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 transition-all hover:border-gold/30">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <Link href={`/books/${publication.slug}`} className="shrink-0 group">
            <div className="w-14 h-19 sm:w-16 sm:h-22 aspect-[3/4] bg-surface rounded-lg border border-border-subtle overflow-hidden relative shadow-xs">
              {publication.coverImage ? (
                <img
                  src={publication.coverImage}
                  alt={publication.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-editorial-faint text-[10px] text-center p-1 bg-surface-sunken">
                  No Cover
                </div>
              )}
            </div>
          </Link>

          <div className="min-w-0 space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono text-editorial-faint text-[11px] truncate">
                {publication.publisherName}
              </span>
              {publication.volume && (
                <span className="font-mono text-gold text-[11px] font-semibold">
                  Vol. {publication.volume}
                </span>
              )}
              {publication.recentChangeBadge && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getBadgeStyle(publication.recentChangeBadge)}`}>
                  {publication.recentChangeBadge}
                </span>
              )}
            </div>

            <Link href={`/books/${publication.slug}`}>
              <h3 className="text-xs sm:text-sm font-editorial font-bold text-editorial-title hover:text-gold transition-colors line-clamp-2 leading-snug">
                {publication.title}
              </h3>
            </Link>

            <div className="flex items-center gap-2 text-xs text-editorial-muted flex-wrap">
              <span className="font-mono font-bold text-editorial-title text-xs sm:text-sm">
                {formatIDR(publication.currentPrice)}
              </span>
              <span className="text-editorial-faint">•</span>
              <span className={`inline-flex items-center gap-1 text-[11px] ${countdown.isToday ? 'text-gold font-semibold' : 'text-editorial-muted'}`}>
                <Calendar className="w-3 h-3 text-gold shrink-0" />
                <span className="truncate">{countdown.label}</span>
                <span className="text-editorial-faint font-mono text-[10px]">({formatShortDate(publication.releaseDate)})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Tooltip content={collectionStatus === 'OWNED' ? 'Sudah dimiliki' : 'Tandai dimiliki'}>
            <button
              type="button"
              onClick={handleCollectionToggle}
              className={`p-2.5 sm:p-2 rounded-lg border transition-all active:scale-95 ${
                collectionStatus === 'OWNED'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-surface border-border-subtle text-editorial-faint hover:text-editorial-title hover:bg-surface-raised'
              }`}
              aria-label={collectionStatus === 'OWNED' ? 'Sudah dimiliki' : 'Tandai koleksi'}
            >
              <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content={isFollowed ? 'Hapus dari Watchlist' : 'Simpan ke Watchlist'}>
            <button
              type="button"
              onClick={handleWatchlistToggle}
              className={`p-2.5 sm:p-2 rounded-lg border transition-all active:scale-95 ${
                isFollowed
                  ? 'bg-gold/15 text-gold border-gold/40'
                  : 'bg-surface border-border-subtle text-editorial-faint hover:text-editorial-title hover:bg-surface-raised'
              }`}
              aria-label={isFollowed ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
            >
              <Bookmark className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill={isFollowed ? 'currentColor' : 'none'} />
            </button>
          </Tooltip>
        </div>
      </article>
    );
  }

  // 2. Grid Layout (Breathable & Content-First Hierarchy)
  return (
    <article className="glass-card rounded-2xl overflow-hidden flex flex-col group relative transition-all duration-300 hover:border-gold/40 bg-surface/60">
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
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-surface-sunken">
              <span className="text-xs text-editorial-muted font-medium line-clamp-3">
                {publication.title}
              </span>
            </div>
          )}
        </Link>

        {/* Floating Controls: Status Badge (Left) & Watchlist Toggle (Right) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5 pointer-events-none">
          {publication.recentChangeBadge ? (
            <span
              className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm border backdrop-blur-md ${getBadgeStyle(
                publication.recentChangeBadge
              )}`}
            >
              {publication.recentChangeBadge}
            </span>
          ) : (
            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface/85 text-editorial-muted backdrop-blur-md border border-border-subtle">
              {publication.format}
            </span>
          )}

          <button
            type="button"
            onClick={handleWatchlistToggle}
            className={`pointer-events-auto p-2 sm:p-2 rounded-full backdrop-blur-md border transition-all active:scale-90 ${
              isFollowed
                ? 'bg-gold text-background border-gold shadow-md'
                : 'bg-surface/85 text-editorial-title border-border-subtle hover:bg-surface hover:text-gold'
            }`}
            aria-label={isFollowed ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isFollowed ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-2.5">
        <div className="space-y-1">
          {/* Eyebrow: Publisher & Volume */}
          <div className="flex items-center justify-between text-[11px] text-editorial-faint font-mono">
            <span className="truncate">{publication.publisherName}</span>
            {publication.volume && (
              <span className="text-gold shrink-0 font-semibold ml-1">Vol. {publication.volume}</span>
            )}
          </div>

          {/* Title: 2 lines clamp */}
          <Link href={`/books/${publication.slug}`} className="block group-hover:text-gold transition-colors">
            <h3 className="font-editorial text-xs sm:text-sm font-bold text-editorial-title leading-snug line-clamp-2">
              {publication.title}
            </h3>
          </Link>
        </div>

        {/* Release Date info */}
        <div className="pt-1.5 border-t border-border-subtle/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-editorial-muted min-w-0">
            <Calendar className="w-3 h-3 text-gold shrink-0" />
            <span className={`truncate ${countdown.isToday ? 'text-gold font-bold' : 'text-editorial-muted'}`}>
              {countdown.label}
            </span>
          </div>
          <span className="font-mono text-[10px] text-editorial-faint shrink-0 ml-1">
            {formatShortDate(publication.releaseDate)}
          </span>
        </div>

        {/* Price & Collection CTA */}
        <div className="pt-1.5 border-t border-border-subtle/80 flex items-center justify-between gap-1.5">
          <div>
            <span className="text-[9px] text-editorial-faint uppercase font-mono block leading-none">
              Harga
            </span>
            <span className="text-xs sm:text-sm font-bold text-editorial-title font-mono">
              {formatIDR(publication.currentPrice)}
            </span>
          </div>

          {/* Quick Collection Toggle Button */}
          <button
            type="button"
            onClick={handleCollectionToggle}
            className={`h-7 sm:h-7 px-2 sm:px-2.5 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-all active:scale-95 ${
              collectionStatus === 'OWNED'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold'
                : 'bg-surface hover:bg-surface-raised border-border-subtle text-editorial-muted hover:text-editorial-title'
            }`}
            aria-label={collectionStatus === 'OWNED' ? 'Sudah dimiliki' : 'Tambahkan ke koleksi'}
          >
            {collectionStatus === 'OWNED' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] sm:text-[11px]">Dimiliki</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 text-editorial-faint" />
                <span className="text-[10px] sm:text-[11px]">+ Koleksi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
