'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Mohon isi email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loginWithEmail(email.trim(), password);
      toast({
        title: 'Berhasil Masuk',
        description: `Selamat datang kembali di Nuvell!`,
        variant: 'success',
      });
      router.push('/library');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk. Silakan periksa kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      toast({
        title: 'Berhasil Masuk dengan Google',
        description: 'Selamat datang di Nuvell!',
        variant: 'success',
      });
      router.push('/library');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk menggunakan akun Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      toast({
        title: 'Tautan Reset Terkirim',
        description: `Instruksi pemulihan kata sandi telah dikirim ke ${forgotEmail}`,
        variant: 'success',
      });
      setIsForgotOpen(false);
      setForgotEmail('');
    } catch (err: any) {
      toast({
        title: 'Gagal Mengirim Tautan',
        description: err.message,
        variant: 'error',
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface/90 border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block focus:outline-none group">
            <span className="font-editorial text-3xl font-bold tracking-tight text-editorial-title group-hover:text-gold transition-colors">
              nuvell
            </span>
          </Link>
          <h1 className="font-editorial text-xl sm:text-2xl font-bold text-editorial-title">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted">
            Masuk untuk mengakses koleksi, watchlist, dan riwayat tracker Anda.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-xs text-rose-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-editorial-faint block">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-surface-raised border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-editorial-body placeholder:text-editorial-muted focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-editorial-faint block">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setIsForgotOpen(true);
                }}
                className="text-[11px] text-editorial-muted hover:text-gold transition-colors"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-raised border border-border-subtle rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-editorial-body placeholder:text-editorial-muted focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-editorial-muted hover:text-editorial-title"
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-gold text-background font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors shadow-xs active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Memproses Masuk...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider OR */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-[10px] font-mono text-editorial-faint uppercase">ATAU</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-surface hover:bg-surface-raised border border-border-subtle text-editorial-title font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors active:scale-98 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Register Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-editorial-muted">
            Belum memiliki akun Nuvell?{' '}
            <Link href="/register" className="text-gold font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {isForgotOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-overlay-scrim flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setIsForgotOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-overlay border border-border-medium rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-editorial text-lg font-bold text-editorial-title">
              Pemulihan Kata Sandi
            </h3>
            <p className="text-xs text-editorial-muted">
              Masukkan alamat email akun Nuvell Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-surface-raised border border-border-subtle rounded-xl px-4 py-2.5 text-xs sm:text-sm text-editorial-body focus:outline-none focus:border-gold/50"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-editorial-muted hover:text-editorial-title"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="px-4 py-2 rounded-xl bg-gold text-background font-semibold text-xs hover:bg-gold-400 transition-colors disabled:opacity-50"
                >
                  {isForgotLoading ? 'Mengirim...' : 'Kirim Tautan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
