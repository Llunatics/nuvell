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
  Smartphone,
  Info,
  BookOpen,
  X,
} from 'lucide-react';
import { useDisplaySettings, ThemeMode, DensityMode, ViewMode, MotionMode } from '@/hooks/use-display-settings';
import { useToast } from '@/hooks/use-toast';
import { AppIconCropperModal } from './app-icon-cropper-modal';

export function SettingsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg border transition-all ${
          isOpen
            ? 'bg-gold/15 border-gold/40 text-gold shadow-sm'
            : 'bg-surface border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title'
        }`}
        aria-label="Pengaturan Tampilan & Aplikasi"
        title="Pengaturan Tampilan & Aplikasi"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-surface border border-border-subtle shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-raised/50">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold" />
              <span className="font-editorial text-sm font-bold text-editorial-title">
                Pengaturan Aplikasi
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-editorial-faint hover:text-editorial-title hover:bg-surface-sunken transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* 1. Appearance / Theme */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Tema Visual (Appearance)
              </label>
              <div className="grid grid-cols-3 gap-1 bg-surface-sunken p-1 rounded-xl border border-border-subtle">
                {[
                  { id: 'dark', label: 'Gelap', icon: Moon },
                  { id: 'light', label: 'Terang', icon: Sun },
                  { id: 'system', label: 'Sistem', icon: Laptop },
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
                          ? 'bg-surface text-editorial-title font-semibold shadow-sm border border-border-subtle'
                          : 'text-editorial-muted hover:text-editorial-title hover:bg-surface/50 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-editorial-faint'}`} />
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
              <div className="grid grid-cols-2 gap-1 bg-surface-sunken p-1 rounded-xl border border-border-subtle">
                {[
                  { id: 'comfortable', label: 'Nyaman (Comfortable)' },
                  { id: 'compact', label: 'Ringkas (Compact)' },
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
                          ? 'bg-surface text-editorial-title font-semibold shadow-sm border border-border-subtle'
                          : 'text-editorial-muted hover:text-editorial-title hover:bg-surface/50 border border-transparent'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. View Mode Setting (Grid / List) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Tata Letak Publikasi Default
              </label>
              <div className="grid grid-cols-2 gap-1 bg-surface-sunken p-1 rounded-xl border border-border-subtle">
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
                          ? 'bg-surface text-editorial-title font-semibold shadow-sm border border-border-subtle'
                          : 'text-editorial-muted hover:text-editorial-title hover:bg-surface/50 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-editorial-faint'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. App Icon & Android Packaging Config */}
            <div className="pt-2 border-t border-border-subtle space-y-2">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Identitas Android & App Icon
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsIconModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-semibold transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Kustomisasi App Icon & APK</span>
                </div>
                <span className="font-mono text-[10px] bg-gold/20 px-2 py-0.5 rounded text-gold">Crop / Atur →</span>
              </button>
            </div>

            {/* 5. App Information & Sources */}
            <div className="pt-2 border-t border-border-subtle space-y-1.5 text-xs">
              <label className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider block">
                Tentang Aplikasi
              </label>
              <div className="p-3 rounded-xl bg-surface-sunken border border-border-subtle space-y-2 text-editorial-muted text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-editorial-title flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-gold" />
                    nuvell platform
                  </span>
                  <span className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border-subtle">
                    v1.0.0
                  </span>
                </div>
                <p className="text-editorial-faint leading-relaxed">
                  Platform pelacak & penemuan rilisan buku, komik, dan novel di Indonesia.
                </p>
                <div className="pt-1.5 border-t border-border-subtle/50 flex items-center justify-between">
                  <Link
                    href="/sources"
                    onClick={() => setIsOpen(false)}
                    className="text-gold hover:underline flex items-center gap-1 text-[10px] font-medium"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Sumber Resmi Terverifikasi</span>
                  </Link>
                  <span className="font-mono text-[10px] text-editorial-faint">WIB (Asia/Jakarta)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Icon Cropper Modal */}
      <AppIconCropperModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
      />
    </div>
  );
}
