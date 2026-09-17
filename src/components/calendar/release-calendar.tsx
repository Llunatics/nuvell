'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Layers,
  Clock,
  ExternalLink,
  Sparkles,
  X,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Publication } from '@/types';
import { formatIDR, getReleaseCountdown, formatShortDate } from '@/lib/formatters';
import { ReleaseCard } from '@/components/books/release-card';
import { useModalOverlay } from '@/hooks/use-modal-overlay';

interface ReleaseCalendarProps {
  publications: Publication[];
}

type CalendarViewMode = 'month' | 'week' | 'upcoming';

export function ReleaseCalendar({ publications }: ReleaseCalendarProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September
  const [selectedDay, setSelectedDay] = useState<number | null>(15);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const mounted = useModalOverlay(isDayDrawerOpen);
  const [formatFilter, setFormatFilter] = useState<string>('ALL');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Filter publications for active month
  const monthPubs = useMemo(() => {
    return publications.filter((p) => {
      if (!p.releaseDate) return false;
      const parts = p.releaseDate.split('-');
      if (parts.length < 3) return false;
      const pubYear = parseInt(parts[0], 10);
      const pubMonth = parseInt(parts[1], 10) - 1;
      if (pubYear !== currentYear || pubMonth !== currentMonth) return false;

      if (formatFilter === 'MANGA') {
        return (
          (p.genres?.includes('Manga') || p.genres?.includes('Manhwa') || p.genres?.includes('Komik')) &&
          !p.genres?.includes('Light Novel') &&
          !p.genres?.includes('Agama & Spiritualitas') &&
          !p.genres?.includes('Novel') &&
          p.format !== 'PAPERBACK'
        );
      }
      if (formatFilter === 'LIGHT_NOVEL') {
        return p.genres?.includes('Light Novel');
      }
      if (formatFilter === 'NOVEL') {
        return (
          p.genres?.includes('Novel') ||
          p.genres?.includes('Literary Fiction') ||
          p.genres?.includes('Historical Fiction')
        );
      }
      return true;
    });
  }, [publications, currentYear, currentMonth, formatFilter]);

  // Group publications by day of month
  const pubsByDay = useMemo(() => {
    const map = new Map<number, Publication[]>();
    monthPubs.forEach((p) => {
      if (p.releaseDate) {
        const parts = p.releaseDate.split('-');
        const day = parseInt(parts[2], 10);
        if (!isNaN(day)) {
          const existing = map.get(day) || [];
          existing.push(p);
          map.set(day, existing);
        }
      }
    });
    return map;
  }, [monthPubs]);

  // Days list for mobile horizontal strip
  const daysList = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayNames = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
      const dayName = dayNames[dateObj.getDay()];
      const releases = pubsByDay.get(day) || [];
      const isToday = currentMonth === 8 && day === 15 && currentYear === 2026;
      return {
        day,
        dayName,
        releaseCount: releases.length,
        isToday,
      };
    });
  }, [daysInMonth, currentYear, currentMonth, pubsByDay]);

  // Upcoming publications sorted by date
  const upcomingTimeline = useMemo(() => {
    return publications
      .filter((p) => p.releaseDate && p.releaseDate >= '2026-09-15')
      .sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''));
  }, [publications]);

  const upcomingByDate = useMemo(() => {
    const groups = new Map<string, Publication[]>();
    upcomingTimeline.forEach((p) => {
      if (p.releaseDate) {
        const existing = groups.get(p.releaseDate) || [];
        existing.push(p);
        groups.set(p.releaseDate, existing);
      }
    });
    return Array.from(groups.entries());
  }, [upcomingTimeline]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsDayDrawerOpen(true);
  };

  const selectedDayReleases = selectedDay ? pubsByDay.get(selectedDay) || [] : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* MOBILE CALENDAR (md:hidden) — Native-feel horizontal strip & inline view */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-5">
        {/* Mobile Header: Month navigation & view switcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-11 h-11 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-editorial-muted hover:text-editorial-title active:scale-95 transition-all"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="font-editorial text-lg font-bold text-editorial-title px-2">
                {monthNames[currentMonth]} {currentYear}
              </h1>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-11 h-11 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-editorial-muted hover:text-editorial-title active:scale-95 transition-all"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex items-center bg-surface-raised p-1 rounded-xl border border-border-subtle">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'month'
                    ? 'bg-surface text-editorial-title font-semibold shadow-sm'
                    : 'text-editorial-muted'
                }`}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => setViewMode('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'upcoming'
                    ? 'bg-surface text-editorial-title font-semibold shadow-sm'
                    : 'text-editorial-muted'
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View 1: Horizontal Date Selector + Inline Day Releases */}
        {viewMode === 'month' && (
          <div className="space-y-5">
            {/* Horizontal Scrollable Date Strip */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-0.5 scroll-smooth snap-x">
                {daysList.map((item) => {
                  const isSelected = selectedDay === item.day;
                  return (
                    <button
                      key={`mob-day-${item.day}`}
                      type="button"
                      onClick={() => setSelectedDay(item.day)}
                      className={`snap-center shrink-0 w-[54px] min-h-[64px] py-2 px-1 rounded-2xl flex flex-col items-center justify-between transition-all border ${
                        isSelected
                          ? 'bg-gold text-background border-gold shadow-md font-bold scale-[1.02]'
                          : item.isToday
                          ? 'bg-gold/15 text-gold border-gold/40'
                          : item.releaseCount > 0
                          ? 'bg-surface border-border-subtle text-editorial-title active:bg-surface-raised'
                          : 'bg-surface/20 border-transparent text-editorial-faint active:bg-surface/40'
                      }`}
                      aria-label={`${item.day} ${monthNames[currentMonth]}, ${item.releaseCount} rilis`}
                    >
                      <span className={`text-[10px] font-mono tracking-wider ${
                        isSelected ? 'text-background/80 font-semibold' : 'text-editorial-faint'
                      }`}>
                        {item.dayName}
                      </span>
                      <span className={`text-base font-bold ${
                        isSelected ? 'text-background' : item.isToday ? 'text-gold' : 'text-editorial-title'
                      }`}>
                        {item.day}
                      </span>
                      <div className="h-2 flex items-center justify-center">
                        {item.releaseCount > 0 ? (
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-background' : 'bg-gold'
                          }`} />
                        ) : (
                          <span className="w-1.5 h-1.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inline Releases for Selected Day */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gold uppercase tracking-wider block">
                    {selectedDay === 15 && currentMonth === 8 && currentYear === 2026
                      ? 'HARI INI • JADWAL RILIS'
                      : 'JADWAL RILIS'}
                  </span>
                  <h2 className="font-editorial text-base font-bold text-editorial-title">
                    {selectedDay} {monthNames[currentMonth]} {currentYear}
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-gold/15 text-gold border border-gold/30">
                  {selectedDayReleases.length} Rilisan
                </span>
              </div>

              {selectedDayReleases.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedDayReleases.map((pub) => (
                    <ReleaseCard key={pub.id} publication={pub} layout="list" />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-surface/30 border border-border-subtle space-y-2">
                  <Clock className="w-8 h-8 text-editorial-faint mx-auto" />
                  <p className="text-xs font-medium text-editorial-title">
                    Tidak ada jadwal terbit pada tanggal ini
                  </p>
                  <p className="text-[11px] text-editorial-muted">
                    Geser tanggal di atas untuk melihat jadwal rilis lainnya yang ditandai titik emas.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile View 2: Upcoming Timeline */}
        {viewMode === 'upcoming' && (
          <div className="space-y-5">
            {upcomingByDate.map(([date, items]) => (
              <div key={`mob-timeline-${date}`} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gold px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/20">
                    {formatShortDate(date)}
                  </span>
                  <span className="text-xs text-editorial-muted">
                    {items.length} rilis
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((pub) => (
                    <ReleaseCard key={pub.id} publication={pub} layout="list" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP CALENDAR (hidden md:block) — Preserves multi-column layout & drawer */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-8">
        {/* Calendar Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-wider mb-1">
              <CalendarIcon className="w-3.5 h-3.5" />
              KALENDER RILIS • WIB
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-editorial-title">
              {monthNames[currentMonth]} {currentYear}
            </h1>
            <p className="text-xs text-editorial-muted mt-0.5">
              Jadwal terbit buku cetak, manga, dan novel di Indonesia
            </p>
          </div>

          {/* View Mode Toggle Segmented Bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-raised p-1 rounded-xl border border-border-subtle shadow-sm">
              {[
                { id: 'month', label: 'Bulan' },
                { id: 'week', label: 'Minggu' },
                { id: 'upcoming', label: 'Timeline' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id as CalendarViewMode)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === tab.id
                      ? 'bg-surface text-editorial-title border border-border-subtle shadow-sm font-semibold'
                      : 'text-editorial-muted hover:text-editorial-title'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Month Stepper Buttons */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border-subtle shadow-sm">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-surface-raised text-editorial-muted hover:text-editorial-title transition-colors"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-surface-raised text-editorial-muted hover:text-editorial-title transition-colors"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 1. MONTH VIEW */}
        {viewMode === 'month' && (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-mono text-editorial-faint uppercase pb-2 border-b border-border-subtle">
            <span className="text-rose-400">Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span className="text-gold">Sab</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-16 sm:h-24 rounded-xl opacity-20 bg-surface/20" />
            ))}

            {/* Active Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const releases = pubsByDay.get(day) || [];
              const hasReleases = releases.length > 0;
              const isToday = currentMonth === 8 && day === 15 && currentYear === 2026;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`h-16 sm:h-24 p-2 rounded-xl text-left flex flex-col justify-between transition-all group relative border ${
                    isSelected
                      ? 'bg-surface-raised border-gold shadow-md'
                      : isToday
                      ? 'bg-gold/10 border-gold/40'
                      : hasReleases
                      ? 'bg-surface hover:bg-surface-raised border-border-subtle hover:border-gold/30'
                      : 'bg-surface/20 hover:bg-surface/35 border-transparent text-editorial-faint'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-medium ${
                        isToday
                          ? 'text-gold font-bold'
                          : isSelected
                          ? 'text-editorial-title'
                          : 'text-editorial-body'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-mono text-gold bg-gold/15 px-1 rounded">
                        HARI INI
                      </span>
                    )}
                  </div>

                  {hasReleases && (
                    <div className="w-full">
                      <div className="px-1.5 py-0.5 rounded-md bg-gold/15 text-gold text-[10px] font-mono font-semibold truncate flex items-center justify-between">
                        <span>{releases.length} rilis</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          <p className="text-xs text-editorial-muted font-mono">
            Rilis Pekan Berjalan (14 - 20 September 2026)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {[14, 15, 16, 17, 18, 19, 20].map((day) => {
              const releases = pubsByDay.get(day) || [];
              const isToday = day === 15;
              return (
                <div
                  key={`week-${day}`}
                  className={`p-3 rounded-2xl border space-y-2 ${
                    isToday
                      ? 'bg-gold/10 border-gold/50'
                      : 'bg-surface border-border-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-editorial-title">
                      {day} Sep
                    </span>
                    <span className="text-[10px] font-mono text-gold">
                      {releases.length} buku
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {releases.slice(0, 3).map((r) => (
                      <Link
                        key={r.id}
                        href={`/books/${r.slug}`}
                        className="block text-[11px] text-editorial-body hover:text-gold transition-colors truncate p-1 rounded bg-surface-raised"
                      >
                        {r.title}
                      </Link>
                    ))}
                    {releases.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className="text-[10px] text-gold hover:underline"
                      >
                        +{releases.length - 3} lainnya
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. UPCOMING TIMELINE VIEW */}
      {viewMode === 'upcoming' && (
        <div className="space-y-6">
          {upcomingByDate.map(([date, items]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-gold px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/20">
                  {formatShortDate(date)}
                </span>
                <span className="text-xs text-editorial-muted">
                  {items.length} terbitan resmi terkonfirmasi
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((pub) => (
                  <ReleaseCard key={pub.id} publication={pub} layout="grid" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Contextual Slide-Over Drawer for Selected Date - Portaled to document.body */}
      {isDayDrawerOpen && selectedDay && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="modal-overlay-scrim flex justify-end transition-all animate-in fade-in duration-200"
          onClick={() => setIsDayDrawerOpen(false)}
        >
          <div
            className="w-full max-w-lg h-full bg-surface-raised border-l border-border-medium shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div>
                  <span className="text-[11px] font-mono text-gold uppercase tracking-wider block">
                    Rilis Buku & Manga
                  </span>
                  <h2 className="font-editorial text-xl font-bold text-editorial-title">
                    {selectedDay} {monthNames[currentMonth]} {currentYear}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDayDrawerOpen(false)}
                  className="p-1 rounded-lg text-editorial-faint hover:text-editorial-title hover:bg-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedDayReleases.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Clock className="w-8 h-8 text-editorial-faint mx-auto" />
                  <p className="text-xs text-editorial-muted">
                    Tidak ada jadwal terbit terdaftar pada tanggal ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-editorial-muted">
                    Menampilkan {selectedDayReleases.length} publikasi yang beredar di toko buku:
                  </p>
                  <div className="space-y-2.5">
                    {selectedDayReleases.map((pub) => (
                      <ReleaseCard key={pub.id} publication={pub} layout="list" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border-subtle text-center">
              <button
                type="button"
                onClick={() => setIsDayDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-title transition-colors"
              >
                Tutup Jadwal
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
