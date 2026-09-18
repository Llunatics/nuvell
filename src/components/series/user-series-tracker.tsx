'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Bookmark,
  Clock,
  HelpCircle,
  Sparkles,
  Edit2,
  X,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { useUserSeries } from '@/hooks/use-user-series';
import { UserSeries, VolumeStatus, UserSeriesVolume } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function UserSeriesTracker() {
  const {
    seriesList,
    isLoaded,
    createSeries,
    deleteSeries,
    addVolume,
    deleteVolume,
    markVolumeStatus,
  } = useUserSeries();
  const { toast } = useToast();

  const [isAddSeriesOpen, setIsAddSeriesOpen] = useState(false);
  const [activeSeriesForVolume, setActiveSeriesForVolume] = useState<UserSeries | null>(null);

  // Form states for creating series
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [status, setStatus] = useState<'ONGOING' | 'COMPLETED'>('ONGOING');
  const [totalVolumes, setTotalVolumes] = useState<string>('');
  const [initialCount, setInitialCount] = useState<string>('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for adding volume
  const [newVolNum, setNewVolNum] = useState<string>('1');
  const [newVolStatus, setNewVolStatus] = useState<VolumeStatus>('OWNED');

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createSeries({
        title: title.trim(),
        author: author.trim() || undefined,
        publisher: publisher.trim() || undefined,
        status,
        totalVolumes: totalVolumes ? parseInt(totalVolumes, 10) : null,
        initialVolumesCount: initialCount ? parseInt(initialCount, 10) : 0,
      });

      toast({
        title: 'Seri berhasil ditambahkan!',
        description: `Melacak kelengkapan untuk ${title}`,
        variant: 'success',
      });

      // Reset form
      setTitle('');
      setAuthor('');
      setPublisher('');
      setStatus('ONGOING');
      setTotalVolumes('');
      setInitialCount('5');
      setIsAddSeriesOpen(false);
    } catch {
      toast({
        title: 'Gagal menambahkan seri',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSingleVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeriesForVolume) return;
    const volNum = parseInt(newVolNum, 10);
    if (isNaN(volNum) || volNum < 1) return;

    // Check if volume already exists
    if (activeSeriesForVolume.volumes.some((v) => v.volumeNumber === volNum)) {
      toast({
        title: `Volume ${volNum} sudah ada dalam daftar`,
        variant: 'error',
      });
      return;
    }

    try {
      await addVolume(activeSeriesForVolume.id, {
        volumeNumber: volNum,
        status: newVolStatus,
      });
      toast({
        title: `Volume ${volNum} ditambahkan`,
        variant: 'success',
      });
      setNewVolNum(`${volNum + 1}`);
      setActiveSeriesForVolume(null);
    } catch {
      toast({
        title: 'Gagal menambahkan volume',
        variant: 'error',
      });
    }
  };

  const getStatusBadge = (volStatus: VolumeStatus) => {
    switch (volStatus) {
      case 'OWNED':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          label: 'Dimiliki',
          icon: CheckCircle2,
        };
      case 'WISHLIST':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          label: 'Wishlist',
          icon: Bookmark,
        };
      case 'PREORDER':
        return {
          bg: 'bg-burgundy-400/15 text-burgundy-400 border-burgundy-400/30',
          label: 'Pre-order',
          icon: Clock,
        };
      case 'MISSING':
      default:
        return {
          bg: 'bg-surface text-editorial-muted border-border-subtle hover:border-editorial-muted',
          label: 'Belum Ada',
          icon: HelpCircle,
        };
    }
  };

  const cycleStatus = (current: VolumeStatus): VolumeStatus => {
    if (current === 'MISSING') return 'OWNED';
    if (current === 'OWNED') return 'WISHLIST';
    if (current === 'WISHLIST') return 'PREORDER';
    return 'MISSING';
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Series Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-lg sm:text-xl font-bold text-editorial-title flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold" />
            <span>Pelacak Seri Saya ({seriesList.length})</span>
          </h2>
          <p className="text-xs text-editorial-muted mt-0.5">
            Lacak volume fisik komik atau novel yang Anda miliki, wishlist, dan volume yang masih kurang.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddSeriesOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gold hover:bg-gold-400 text-background text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Seri</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-surface/50 border border-border-subtle animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {isLoaded && seriesList.length === 0 && (
        <div className="p-10 text-center bg-surface/40 rounded-2xl border border-border-subtle space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center mx-auto text-gold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-editorial text-base font-semibold text-editorial-title">
              Belum ada seri yang kamu lacak.
            </h3>
            <p className="text-xs text-editorial-muted max-w-md mx-auto mt-1">
              Catat koleksi manga, komik, atau light novel favoritmu. Tandai volume yang sudah ada dan pantau nomor volume yang masih kurang.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddSeriesOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-gold/40 text-gold text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Seri Pertama</span>
          </button>
        </div>
      )}

      {/* Series List */}
      {isLoaded && seriesList.length > 0 && (
        <div className="space-y-4">
          {seriesList.map((series) => {
            const ownedVols = series.volumes.filter((v) => v.status === 'OWNED');
            const wishlistVols = series.volumes.filter((v) => v.status === 'WISHLIST');
            const preorderVols = series.volumes.filter((v) => v.status === 'PREORDER');
            const missingVols = series.volumes.filter((v) => v.status === 'MISSING');

            const totalKnown = series.totalVolumes || series.volumes.length || 1;
            const progressPercent = Math.min(100, Math.round((ownedVols.length / totalKnown) * 100));

            return (
              <div
                key={series.id}
                className="glass-card rounded-2xl p-5 border border-border-subtle space-y-4 transition-all"
              >
                {/* Series Title & Status Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                          series.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-gold/15 text-gold border-gold/30'
                        }`}
                      >
                        {series.status === 'COMPLETED' ? 'TAMAT (Completed)' : 'ONGOING'}
                      </span>
                      {series.publisher && (
                        <span className="text-[10px] font-mono text-editorial-faint">
                          {series.publisher}
                        </span>
                      )}
                    </div>
                    <h3 className="font-editorial text-base sm:text-lg font-bold text-editorial-title">
                      {series.title}
                    </h3>
                    {series.author && (
                      <p className="text-xs text-editorial-muted">Karya: {series.author}</p>
                    )}
                  </div>

                  {/* Actions (Add Volume, Delete Series) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const nextNum = (series.volumes.length ? Math.max(...series.volumes.map(v => v.volumeNumber)) + 1 : 1);
                        setNewVolNum(`${nextNum}`);
                        setActiveSeriesForVolume(series);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle hover:border-gold/40 text-xs font-semibold text-editorial-title transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-gold" />
                      <span>Tambah Vol</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus pelacak seri "${series.title}"?`)) {
                          deleteSeries(series.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-surface hover:bg-rose-500/15 border border-border-subtle hover:border-rose-500/30 text-editorial-faint hover:text-rose-400 transition-colors"
                      title="Hapus seri ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Counter Description */}
                <div className="space-y-1.5 bg-surface/40 p-3 rounded-xl border border-border-subtle">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-editorial-title">
                      {series.status === 'COMPLETED' && series.totalVolumes ? (
                        <span>
                          {ownedVols.length} / {series.totalVolumes} volume dikoleksi ({progressPercent}%)
                        </span>
                      ) : (
                        <span>
                          {ownedVols.length} volume dimiliki
                          {series.volumes.length > ownedVols.length && ` • ${series.volumes.length - ownedVols.length} dalam pantauan`}
                          {' • Ongoing'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-editorial-muted">
                      <span className="text-emerald-400">{ownedVols.length} Dimiliki</span>
                      {wishlistVols.length > 0 && <span className="text-amber-400">{wishlistVols.length} Wishlist</span>}
                      {preorderVols.length > 0 && <span className="text-burgundy-400">{preorderVols.length} Preorder</span>}
                      {missingVols.length > 0 && <span className="text-editorial-faint">{missingVols.length} Kurang</span>}
                    </div>
                  </div>

                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border-subtle">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-gold rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Volume Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-editorial-faint uppercase tracking-wider">
                      Daftar Volume (Klik untuk ubah status):
                    </span>
                    <span className="text-[10px] text-editorial-muted">
                      Dimiliki ➔ Wishlist ➔ Preorder ➔ Belum Ada
                    </span>
                  </div>

                  {series.volumes.length === 0 ? (
                    <p className="text-xs text-editorial-muted italic py-2">
                      Belum ada volume yang dicatat. Klik &quot;Tambah Vol&quot; di atas untuk memasukkan nomor volume.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {series.volumes.map((vol) => {
                        const meta = getStatusBadge(vol.status);
                        const Icon = meta.icon;
                        return (
                          <div
                            key={vol.id}
                            className="group relative inline-flex items-center"
                          >
                            <button
                              type="button"
                              onClick={() => markVolumeStatus(series.id, vol.id, cycleStatus(vol.status))}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all active:scale-95 ${meta.bg}`}
                              title={`Vol ${vol.volumeNumber}: ${meta.label}. Klik untuk ubah.`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>Vol. {vol.volumeNumber}</span>
                            </button>

                            {/* Delete volume icon on hover */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteVolume(series.id, vol.id);
                              }}
                              className="hidden group-hover:flex absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface-raised border border-rose-500/40 text-rose-400 items-center justify-center text-[10px] hover:bg-rose-500 hover:text-white transition-colors"
                              title="Hapus volume ini"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE SERIES MODAL */}
      {isAddSeriesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-overlay-scrim flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setIsAddSeriesOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-overlay border border-border-medium rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-editorial text-lg font-bold text-editorial-title">
                Tambah Pelacak Seri Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSeriesOpen(false)}
                className="p-1 rounded-lg text-editorial-faint hover:text-editorial-title hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSeries} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-editorial-body block mb-1">
                  Judul Seri <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Frieren: Beyond Journey's End"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-editorial-body block mb-1">
                    Pengarang (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kanehito Yamada"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-editorial-body block mb-1">
                    Penerbit (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: m&c! Publishing"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-editorial-body block mb-1">
                    Status Seri
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ONGOING' | 'COMPLETED')}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title"
                  >
                    <option value="ONGOING">Masih Berjalan (Ongoing)</option>
                    <option value="COMPLETED">Tamat (Completed)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-editorial-body block mb-1">
                    Target Volume Total
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Kosongkan jika ongoing"
                    value={totalVolumes}
                    onChange={(e) => setTotalVolumes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-editorial-body block mb-1">
                  Buat Slot Volume Awal (Opsional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={initialCount}
                  onChange={(e) => setInitialCount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title font-mono"
                  placeholder="Contoh: 10 volume awal"
                />
                <p className="text-[10px] text-editorial-muted mt-1">
                  Akan membuat slot volume otomatis untuk Anda tandai statusnya.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddSeriesOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs font-medium text-editorial-body"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-400 text-background text-xs font-semibold shadow-sm transition-all"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Seri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SINGLE VOLUME MODAL */}
      {activeSeriesForVolume && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-overlay-scrim flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setActiveSeriesForVolume(null)}
        >
          <div
            className="w-full max-w-sm bg-surface-overlay border border-border-medium rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
              <div>
                <h3 className="font-editorial text-base font-bold text-editorial-title">
                  Tambah Volume
                </h3>
                <p className="text-[11px] text-editorial-muted">{activeSeriesForVolume.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSeriesForVolume(null)}
                className="p-1 rounded-lg text-editorial-faint hover:text-editorial-title"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSingleVolume} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-editorial-body block mb-1">
                  Nomor Volume
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newVolNum}
                  onChange={(e) => setNewVolNum(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-editorial-body block mb-1">
                  Status Koleksi
                </label>
                <select
                  value={newVolStatus}
                  onChange={(e) => setNewVolStatus(e.target.value as VolumeStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border-subtle focus:border-gold/50 focus:outline-none text-xs text-editorial-title"
                >
                  <option value="OWNED">Dimiliki (Owned)</option>
                  <option value="WISHLIST">Wishlist</option>
                  <option value="PREORDER">Pre-order</option>
                  <option value="MISSING">Belum Ada / Kurang</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setActiveSeriesForVolume(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-xs text-editorial-body"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gold hover:bg-gold-400 text-background text-xs font-semibold shadow-sm transition-all"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
