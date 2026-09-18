import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Newsreader } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { DisplaySettingsProvider } from '@/hooks/use-display-settings';
import { ToastProvider } from '@/hooks/use-toast';
import { AuthProvider } from '@/contexts/auth-context';
import Link from 'next/link';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const editorialFont = Newsreader({
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F8FA' },
    { media: '(prefers-color-scheme: dark)', color: '#090B0E' },
  ],
};

export const metadata: Metadata = {
  title: 'nuvell — Indonesia Book Release Tracker',
  description:
    'A living release tracker for books, manga, comics, light novels, novels, and other publications released in Indonesia.',
  keywords: [
    'buku baru indonesia',
    'jadwal rilis komik elex media',
    'manga indonesia',
    'light novel indonesia',
    'gramedia new release',
    'komik m&c',
    'tracker rilisan buku',
  ],
  openGraph: {
    title: 'nuvell — Indonesia Book Release Discovery & Tracking',
    description:
      'Track what publishers are releasing across Indonesia. Single discovery layer for books, manga, and light novels.',
    siteName: 'nuvell',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`dark ${sansFont.variable} ${editorialFont.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-editorial-body font-sans antialiased flex flex-col selection:bg-gold selection:text-background">
        <AuthProvider>
          <DisplaySettingsProvider>
            <ToastProvider>
              <div className="flex flex-1 min-h-screen">
                {/* Desktop Left Sidebar (Collapsible) */}
                <Sidebar />

                {/* Main App Content Canvas */}
                <div className="flex-1 flex flex-col min-w-0 pb-[max(6.5rem,calc(5rem+env(safe-area-inset-bottom,24px)))] lg:pb-0">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>

                  {/* Minimal Editorial Consumer Footer */}
                  <footer className="border-t border-border-subtle bg-surface/30 px-6 sm:px-12 py-8 text-xs text-editorial-faint">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="font-editorial text-sm font-semibold text-editorial-title">
                          nuvell • Indonesian Book Release Tracker
                        </p>
                        <p className="mt-0.5 text-editorial-muted text-[11px]">
                          Mengagregasi metadata publik dan tanggal rilis resmi penerbit Indonesia secara etis.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-5 text-editorial-muted text-[11px]">
                        <Link href="/discover" className="hover:text-gold transition-colors">
                          Explore
                        </Link>
                        <Link href="/calendar" className="hover:text-gold transition-colors">
                          Kalender
                        </Link>
                        <Link href="/sources" className="hover:text-gold transition-colors">
                          Sources
                        </Link>
                        <span className="text-editorial-faint">Asia/Jakarta (WIB)</span>
                      </div>
                    </div>
                  </footer>
                </div>
              </div>

              {/* Mobile Fixed Bottom Navigation */}
              <MobileNav />
            </ToastProvider>
          </DisplaySettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
