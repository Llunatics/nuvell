'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Moon,
  Sun,
  Laptop,
  LayoutGrid,
  List,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Zap,
  Terminal,
  X,
} from 'lucide-react';
import { useDisplaySettings, ThemeMode, DensityMode, ViewMode, MotionMode } from '@/hooks/use-display-settings';
import { useToast } from '@/hooks/use-toast';

export function SettingsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    theme,
    setTheme,
    density,
    setDensity,
    viewMode,
    setViewMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    motion,
    setMotion,
  } = useDisplaySettings();
  const { toast } = useToast();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg border transition-all ${
          isOpen
            ? 'bg-surface-raised text-gold border-gold/40 shadow-sm'
            : 'bg-surface border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title'
        }`}
        title="Pengaturan Tampilan & Preferensi"
        aria-label="Pengaturan Tampilan & Preferensi"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-surface-raised/95 backdrop-blur-xl border border-border-medium rounded-2xl shadow-2xl glass-panel z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface/50">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
              <span className="font-editorial text-sm font-semibold text-editorial-title">
                Pengaturan Tampilan
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-surface text-editorial-faint hover:text-editorial-title transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* 1. Theme Setting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Tema Tampilan
              </label>
              <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-xl border border-border-subtle">
                {[
                  { id: 'system', label: 'Sistem', icon: Laptop },
                  { id: 'light', label: 'Terang', icon: Sun },
                  { id: 'dark', label: 'Gelap', icon: Moon },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTheme(item.id as ThemeMode);
                        toast({ title: `Tema diubah ke ${item.label}` });
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-surface-raised text-gold border border-gold/30 shadow-sm'
                          : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Density Setting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Kepadatan Informasi (Density)
              </label>
              <div className="grid grid-cols-2 gap-1 bg-surface p-1 rounded-xl border border-border-subtle">
                {[
                  { id: 'comfortable', label: 'Nyaman' },
                  { id: 'compact', label: 'Ringkas' },
                ].map((item) => {
                  const isActive = density === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDensity(item.id as DensityMode);
                        toast({ title: `Kepadatan diubah ke ${item.label}` });
                      }}
                      className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-surface-raised text-gold border border-gold/30 shadow-sm'
                          : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. View Mode Setting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Tata Letak Publikasi Default
              </label>
              <div className="grid grid-cols-2 gap-1 bg-surface p-1 rounded-xl border border-border-subtle">
                {[
                  { id: 'grid', label: 'Kisi (Grid)', icon: LayoutGrid },
                  { id: 'list', label: 'Daftar (List)', icon: List },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = viewMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setViewMode(item.id as ViewMode);
                        toast({ title: `Tampilan diubah ke ${item.label}` });
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-surface-raised text-gold border border-gold/30 shadow-sm'
                          : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Sidebar Mode Setting (Desktop) */}
            <div className="hidden lg:block space-y-1.5">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Sidebar Desktop
              </label>
              <div className="grid grid-cols-2 gap-1 bg-surface p-1 rounded-xl border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                    !sidebarCollapsed
                      ? 'bg-surface-raised text-gold border border-gold/30 shadow-sm'
                      : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/50'
                  }`}
                >
                  <PanelLeft className="w-3.5 h-3.5" />
                  <span>Diperluas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                    sidebarCollapsed
                      ? 'bg-surface-raised text-gold border border-gold/30 shadow-sm'
                      : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/50'
                  }`}
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                  <span>Diciutkan</span>
                </button>
              </div>
            </div>

            {/* 5. Motion Setting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Efek Animasi
              </label>
              <div className="grid grid-cols-2 gap-1 bg-surface p-1 rounded-xl border border-border-subtle">
                {[
                  { id: 'full', label: 'Penuh (Fluid)', icon: Sparkles },
                  { id: 'reduced', label: 'Berkurang', icon: Zap },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = motion === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMotion(item.id as MotionMode);
                        toast({ title: `Animasi diubah ke ${item.label}` });
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-surface-raised text-gold border border-gold/30 shadow-sm'
                          : 'text-editorial-muted hover:text-editorial-title hover:bg-surface-raised/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Discreet Internal Administration Access */}
          <div className="p-3 bg-surface/80 border-t border-border-subtle flex items-center justify-between">
            <span className="text-[11px] text-editorial-faint font-mono">INTERNAL</span>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-editorial-muted hover:text-gold transition-colors font-medium"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Crawler Admin Portal →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
