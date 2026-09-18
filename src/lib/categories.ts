// Publication Category Classification & Taxonomy for nuvell

export type BookCategory =
  | 'Komik & Manga'
  | 'Light Novel'
  | 'Novel & Sastra'
  | 'Buku Anak & Remaja'
  | 'Non-Fiksi & Pengetahuan'
  | 'Buku Umum';

export const CATEGORY_COLORS: Record<string, string> = {
  'Komik & Manga': '#C5A059', // Gold
  'Light Novel': '#3B82F6',   // Blue
  'Novel & Sastra': '#10B981', // Emerald
  'Buku Anak & Remaja': '#EC4899', // Pink
  'Non-Fiksi & Pengetahuan': '#8B5CF6', // Purple
  'Buku Umum': '#F59E0B',      // Amber
};

/**
 * Deterministically resolves the primary category of a publication
 */
export function getPublicationCategory(pub: {
  title?: string | null;
  genres?: string[] | null;
  format?: string | null;
  description?: string | null;
}): BookCategory {
  const title = (pub.title || '').toLowerCase();
  const genres = pub.genres || [];

  // 1. Light Novel
  if (
    genres.some((g) => g.toLowerCase().includes('light novel')) ||
    title.includes('(light novel)') ||
    title.includes('[light novel]') ||
    title.includes('ln vol')
  ) {
    return 'Light Novel';
  }

  // 2. Komik & Manga
  if (
    genres.some((g) => {
      const gl = g.toLowerCase();
      return (
        gl.includes('manga') ||
        gl.includes('komik') ||
        gl.includes('manhwa') ||
        gl.includes('comic')
      );
    }) ||
    title.includes('(comic)') ||
    title.includes('[comic]') ||
    title.includes('vol.') ||
    pub.format === 'TANKOBON' ||
    pub.format === 'KANZENBAN' ||
    pub.format === 'BUNKOBAN'
  ) {
    return 'Komik & Manga';
  }

  // 3. Novel & Sastra
  if (
    genres.some((g) => {
      const gl = g.toLowerCase();
      return (
        gl.includes('novel') ||
        gl.includes('fiction') ||
        gl.includes('fiksi') ||
        gl.includes('sastra') ||
        gl.includes('romance') ||
        gl.includes('thriller') ||
        gl.includes('mystery')
      );
    })
  ) {
    return 'Novel & Sastra';
  }

  // 4. Buku Anak & Remaja
  if (
    genres.some((g) => {
      const gl = g.toLowerCase();
      return (
        gl.includes('anak') ||
        gl.includes('children') ||
        gl.includes('remaja') ||
        gl.includes('young adult') ||
        gl.includes('picture book')
      );
    })
  ) {
    return 'Buku Anak & Remaja';
  }

  // 5. Non-Fiksi & Pengetahuan
  if (
    genres.some((g) => {
      const gl = g.toLowerCase();
      return (
        gl.includes('bisnis') ||
        gl.includes('self-help') ||
        gl.includes('pengembangan diri') ||
        gl.includes('agama') ||
        gl.includes('sejarah') ||
        gl.includes('filsafat') ||
        gl.includes('sains') ||
        gl.includes('psikologi') ||
        gl.includes('parenting') ||
        gl.includes('masakan')
      );
    })
  ) {
    return 'Non-Fiksi & Pengetahuan';
  }

  return 'Novel & Sastra';
}
