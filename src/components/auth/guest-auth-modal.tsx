'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, Lock, BookmarkCheck, ArrowRight } from 'lucide-react';
import { useModalOverlay } from '@/hooks/use-modal-overlay';

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function GuestAuthModal({
  isOpen,
  onClose,
  title = 'Simpan ke Koleksi Personal Anda',
  description = 'Masuk atau buat akun Nuvell gratis untuk menyimpan buku, memantau riwayat fluktuasi harga, dan menerima radar notifikasi rilis.',
}: GuestAuthModalProps) {
  const mounted = useModalOverlay(isOpen);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-modal-title"
      className="modal-overlay-scrim flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-overlay border border-border-medium rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-editorial-faint hover:text-editorial-title hover:bg-surface transition-colors"
          aria-label="Tutup jendela"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Branding */}
        <div className="space-y-3 text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center mx-auto shadow-xs">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold">
              NUVELL PASSPORT
            </span>
            <h2 id="guest-modal-title" className="font-editorial text-xl sm:text-2xl font-bold text-editorial-title mt-1">
              {title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/login"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-gold text-background font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors shadow-xs active:scale-98"
          >
            <span>Masuk ke Akun Anda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-editorial-title font-medium text-xs sm:text-sm flex items-center justify-center transition-colors active:scale-98"
          >
            <span>Daftar Akun Baru</span>
          </Link>
        </div>

        {/* Dismiss subtle footer */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-editorial-faint hover:text-editorial-muted transition-colors underline decoration-border-subtle"
          >
            Lanjutkan jelajah sebagai tamu
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
