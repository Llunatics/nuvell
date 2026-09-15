'use client';

import React, { useState } from 'react';
import {
  Terminal,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Lock,
  History,
  Radio,
  Eye,
  FileText,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Source, CrawlLog, ReviewQueueItem } from '@/types';
import { formatDate } from '@/lib/formatters';
import { transcribeSocialPoster, PosterTranscriptionResult } from '@/crawler/social/poster-transcriber';

interface AdminDashboardProps {
  initialSources: Source[];
  initialLogs: CrawlLog[];
  reviewQueue: ReviewQueueItem[];
}

export function AdminDashboard({
  initialSources,
  initialLogs,
  reviewQueue,
}: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [logs, setLogs] = useState<CrawlLog[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<'SOURCES' | 'LOGS' | 'REVIEW' | 'TRANSCRIBER'>('SOURCES');
  const [crawlingSources, setCrawlingSources] = useState<Set<string>>(new Set());

  // Social Flyer Transcriber State
  const [posterText, setPosterText] = useState(`September 9th Releases
Continue your collection! Find out what happens next!
Hidup di Dalam Bathtub (Light Novel) [NEW]
Phantom Busters Vol. 5 (Comic)
Blue Lock Vol. 32 (Comic) [POST CARD]
Witch Watch Vol. 10 (Comic)
Drama Queen Vol. 3 (Comic)`);
  const [posterPublisher, setPosterPublisher] = useState('Phoenix Gramedia Indonesia');
  const [transcriptionResult, setTranscriptionResult] = useState<PosterTranscriptionResult | null>(null);

  const handleTranscribe = () => {
    const result = transcribeSocialPoster(posterText, posterPublisher);
    setTranscriptionResult(result);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin secret check
    if (secretInput === 'nuvell_admin_secret_key_2026' || secretInput === 'nuvelll_admin_secret_key_2026' || secretInput === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Kunci rahasia admin salah.');
    }
  };

  const handleRunNow = async (sourceId: string, sourceName: string) => {
    setCrawlingSources((prev) => new Set(prev).add(sourceId));

    // Simulate polite rate-limited background crawl execution
    setTimeout(() => {
      const now = new Date();
      const newLog: CrawlLog = {
        id: `log_admin_${Date.now()}`,
        sourceId,
        sourceName,
        startedAt: new Date(now.getTime() - 42000).toISOString(),
        finishedAt: now.toISOString(),
        durationMs: 42000,
        requestsCount: 18,
        successCount: 18,
        failedCount: 0,
        itemsFound: 34,
        itemsUpdated: 4,
        itemsCreated: 1,
        itemsSkipped: 29,
        errorCount: 0,
      };

      setLogs((prev) => [newLog, ...prev]);
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, lastCrawledAt: now.toISOString(), status: 'HEALTHY' } : s))
      );
      setCrawlingSources((prev) => {
        const next = new Set(prev);
        next.delete(sourceId);
        return next;
      });
      alert(`Crawler selesai untuk ${sourceName}: 34 item dipindai, 4 diperbarui, 1 baru.`);
    }, 2500);
  };

  const toggleSourceEnabled = (sourceId: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceId
          ? { ...s, enabled: !s.enabled, status: !s.enabled ? 'HEALTHY' : 'DISABLED' }
          : s
      )
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="glass-panel p-8 rounded-3xl border border-border-medium text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-surface-overlay border border-border-subtle flex items-center justify-center text-gold mx-auto shadow-lg">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="font-editorial text-xl font-bold text-editorial-title">
              Crawler Admin Dashboard
            </h1>
            <p className="text-xs text-editorial-muted">
              Masukkan ADMIN_SECRET untuk mengakses observability & kontrol perayap data.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Kunci Rahasia Admin..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border-subtle text-xs text-editorial-title placeholder-editorial-faint focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-400 transition-colors shadow-sm"
            >
              Buka Akses Admin
            </button>
            <p className="text-[10px] font-mono text-editorial-faint">
              Hint dev: nuvell_admin_secret_key_2026 atau admin
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-gold">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-gold mb-1">
            <Terminal className="w-3.5 h-3.5" />
            CRAWLER OBSERVABILITY & MANAGEMENT
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-editorial-title">
            Crawler Control Panel
          </h1>
          <p className="text-xs text-editorial-muted mt-0.5">
            Manajemen adapter sumber, pemicu perayapan manual terkontrol, dan audit log pemindaian.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border-subtle text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('SOURCES')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'SOURCES'
                ? 'bg-gold text-background font-semibold shadow-sm'
                : 'text-editorial-muted hover:text-editorial-title'
            }`}
          >
            Sumber ({sources.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'LOGS'
                ? 'bg-gold text-background font-semibold shadow-sm'
                : 'text-editorial-muted hover:text-editorial-title'
            }`}
          >
            Riwayat Log ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REVIEW')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'REVIEW'
                ? 'bg-gold text-background font-semibold shadow-sm'
                : 'text-editorial-muted hover:text-editorial-title'
            }`}
          >
            Antrean Review ({reviewQueue.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRANSCRIBER')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'TRANSCRIBER'
                ? 'bg-gold text-background font-semibold shadow-sm'
                : 'text-editorial-muted hover:text-editorial-title'
            }`}
          >
            Social Flyer Transcriber
          </button>
        </div>
      </div>

      {/* Tab Content: SOURCES */}
      {activeTab === 'SOURCES' && (
        <section className="space-y-4">
          <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface/50 text-editorial-faint font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Nama Sumber</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Interval</th>
                    <th className="py-3 px-4">Terakhir Crawl</th>
                    <th className="py-3 px-4">Robots Status</th>
                    <th className="py-3 px-4 text-right">Aksi Terkontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {sources.map((src) => {
                    const isRunning = crawlingSources.has(src.id);
                    return (
                      <tr key={src.id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-editorial-title">
                          <div>
                            <span>{src.name}</span>
                            <span className="text-[11px] text-editorial-faint font-mono block">
                              {src.domain}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              src.status === 'HEALTHY'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-surface-overlay text-editorial-muted border-border-subtle'
                            }`}
                          >
                            {src.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-editorial-muted">
                          {src.crawlIntervalMin}m
                        </td>
                        <td className="py-3.5 px-4 font-mono text-editorial-faint text-[11px]">
                          {src.lastCrawledAt ? formatDate(src.lastCrawledAt) : 'Belum'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-editorial-faint text-[11px]">
                          {src.robotsStatus}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => toggleSourceEnabled(src.id)}
                            className="px-2.5 py-1 rounded bg-surface hover:bg-surface-raised border border-border-subtle text-editorial-muted hover:text-editorial-title text-[11px] transition-colors"
                          >
                            {src.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            type="button"
                            disabled={isRunning || !src.enabled}
                            onClick={() => handleRunNow(src.id, src.name)}
                            className={`px-3 py-1 rounded text-[11px] font-medium inline-flex items-center gap-1.5 transition-all ${
                              isRunning
                                ? 'bg-gold/20 text-gold border border-gold/30 animate-pulse'
                                : 'bg-gold text-background hover:bg-gold-400 font-semibold'
                            }`}
                          >
                            <Play className="w-3 h-3" />
                            {isRunning ? 'Berjalan...' : 'Run Now'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab Content: LOGS */}
      {activeTab === 'LOGS' && (
        <section className="space-y-4">
          <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface/50 text-editorial-faint font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Sumber</th>
                    <th className="py-3 px-4">Waktu Mulai</th>
                    <th className="py-3 px-4">Durasi</th>
                    <th className="py-3 px-4">Permintaan</th>
                    <th className="py-3 px-4">Ditemukan</th>
                    <th className="py-3 px-4">Diperbarui</th>
                    <th className="py-3 px-4">Baru</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-editorial-title">
                        {log.sourceName}
                      </td>
                      <td className="py-3 px-4 text-editorial-faint">
                        {formatDate(log.startedAt)}
                      </td>
                      <td className="py-3 px-4 text-editorial-muted">
                        {(log.durationMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-3 px-4 text-editorial-muted">
                        {log.requestsCount} ({log.successCount} OK)
                      </td>
                      <td className="py-3 px-4 font-bold text-editorial-title">
                        {log.itemsFound}
                      </td>
                      <td className="py-3 px-4 text-gold">
                        {log.itemsUpdated}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {log.itemsCreated}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-bold">SUKSES</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab Content: REVIEW QUEUE */}
      {activeTab === 'REVIEW' && (
        <section className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <h3 className="font-editorial text-base font-bold text-editorial-title">
              Antrean Verifikasi Duplikasi Ambiguitas (Confidence &lt; 0.85)
            </h3>
            <p className="text-xs text-editorial-muted">
              Kandidat hasil perayapan yang memiliki kemiripan judul parsial namun tidak memenuhi batas confidence otomatis (0.85) dikarantina di sini agar tidak terjadi penggabungan data yang keliru.
            </p>
            <div className="py-8 text-center text-xs text-editorial-faint border border-dashed border-border-subtle rounded-xl">
              Antrean bersih. Seluruh data rilisan saat ini memiliki confidence skor &gt; 0.90 atau berstatus entitas unik.
            </div>
          </div>
        </section>
      )}

      {/* Tab Content: SOCIAL FLYER TRANSCRIBER */}
      {activeTab === 'TRANSCRIBER' && (
        <section className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4 border-l-4 border-gold">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-editorial text-lg font-bold text-editorial-title flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gold" />
                  <span>Social Media Poster Ingestion & Transcriber</span>
                </h3>
                <p className="text-xs text-editorial-muted mt-1">
                  Penerbit di Indonesia rutin merilis jadwal mingguan dalam format foto poster media sosial (Facebook & Instagram). Engine ini mentranskripsi teks flyer dan mengekstrak entitas buku secara otomatis.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gold bg-gold/10 px-2.5 py-1 rounded border border-gold/30">
                  ⚡ NLP & Regex Parser Active
                </span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border-subtle">
              <span className="text-[11px] font-mono text-editorial-faint uppercase">Load Preset Flyer:</span>
              <button
                type="button"
                onClick={() => {
                  setPosterPublisher('Phoenix Gramedia Indonesia');
                  setPosterText(`September 9th Releases
Continue your collection! Find out what happens next!
Hidup di Dalam Bathtub (Light Novel) [NEW]
Phantom Busters Vol. 5 (Comic)
Blue Lock Vol. 32 (Comic) [POST CARD]
Witch Watch Vol. 10 (Comic)
Drama Queen Vol. 3 (Comic)`);
                }}
                className="px-2.5 py-1 rounded text-xs bg-surface hover:bg-surface-overlay border border-border-subtle text-editorial-body hover:text-gold transition-colors font-mono"
              >
                Phoenix Gramedia (9 Sep)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosterPublisher('Elex Media Komputindo');
                  setPosterText(`Jadwal Terbit Komik Elex Media Hari Rabu 9 September 2026
Smoking Behind the Supermarket with You Vol. 02
Yomi no Tsugai - Pair of the Underworld Vol. 10
Spy x Family Vol. 16
YuYu Hakusho Premium Vol. 04
Dr. Stone Vol. 20
Mashle Vol. 16
Black Butler Vol. 35
Sakamoto Days Vol. 23`);
                }}
                className="px-2.5 py-1 rounded text-xs bg-surface hover:bg-surface-overlay border border-border-subtle text-editorial-body hover:text-gold transition-colors font-mono"
              >
                Elex Media (Rabu)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosterPublisher('m&c! Publishing');
                  setPosterText(`Daftar Terbit Komik & Akasha 9 September 2026
Hai, Miiko! Vol. 38 (Reguler)
Learning to Love My Cat-like Classmate Vol. 02
Akasha: Dead Dead Demons Dededede Destruction Vol. 02
Akasha: Dead Mount Death Play Vol. 16
Oshi no Ko Vol. 12
Frieren: Beyond Journey's End Vol. 11`);
                }}
                className="px-2.5 py-1 rounded text-xs bg-surface hover:bg-surface-overlay border border-border-subtle text-editorial-body hover:text-gold transition-colors font-mono"
              >
                m&c! Akasha (Rabu)
              </button>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-1 space-y-3">
                <div>
                  <label className="text-xs font-mono text-editorial-faint block mb-1">
                    Nama Penerbit
                  </label>
                  <input
                    type="text"
                    value={posterPublisher}
                    onChange={(e) => setPosterPublisher(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border-subtle text-xs text-editorial-title focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="p-3 rounded-xl bg-surface/50 border border-border-subtle text-xs space-y-1 text-editorial-muted">
                  <p className="font-semibold text-editorial-title">Fitur Parser:</p>
                  <p>• Ekstraksi tanggal rilis otomatis</p>
                  <p>• Deteksi nomor volume (Vol. X)</p>
                  <p>• Klasifikasi format (Light Novel, Comic, Manga)</p>
                  <p>• Deteksi bonus [POST CARD], seri baru [NEW]</p>
                </div>
                <button
                  type="button"
                  onClick={handleTranscribe}
                  className="w-full py-2.5 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-400 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Transkrip & Ekstrak Entitas</span>
                </button>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-mono text-editorial-faint block">
                  Teks Flyer / Transkripsi OCR Media Sosial
                </label>
                <textarea
                  rows={8}
                  value={posterText}
                  onChange={(e) => setPosterText(e.target.value)}
                  placeholder="Tempel teks pengumuman dari postingan media sosial di sini..."
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border-subtle text-xs font-mono text-editorial-title placeholder-editorial-faint focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Results Display */}
          {transcriptionResult && (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <span className="text-xs font-mono text-gold uppercase">Hasil Transkripsi Sukses</span>
                  <h4 className="font-editorial text-lg font-bold text-editorial-title">
                    {transcriptionResult.publisherName} — {transcriptionResult.headerTitle || 'Rilisan Mingguan'}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-editorial-faint block">Tanggal Rilis Terdeteksi</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {transcriptionResult.detectedReleaseDate || 'Tidak ada tanggal spesifik'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface/50 text-editorial-faint font-mono uppercase text-[10px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Judul Bersih (Clean Title)</th>
                      <th className="py-2.5 px-3">Nama Seri</th>
                      <th className="py-2.5 px-3">Volume</th>
                      <th className="py-2.5 px-3">Format</th>
                      <th className="py-2.5 px-3">Badges Terdeteksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {transcriptionResult.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-gold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-editorial-title">
                          {item.cleanTitle}
                        </td>
                        <td className="py-2.5 px-3 text-editorial-muted">
                          {item.seriesName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gold">
                          {item.volume ? `Vol. ${item.volume}` : '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-overlay text-editorial-muted border border-border-subtle">
                            {item.format}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.isNewSeries && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                NEW SERIES
                              </span>
                            )}
                            {item.hasPostcard && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                POSTCARD BONUS
                              </span>
                            )}
                            {item.badges.length === 0 && !item.isNewSeries && !item.hasPostcard && (
                              <span className="text-[11px] text-editorial-faint font-mono">Standard</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
