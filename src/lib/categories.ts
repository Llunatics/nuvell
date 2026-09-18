// Publication Category Classification & Taxonomy for nuvell
// Authoritative mapping for charts, filters, and cover badges

export type BookCategory =
  | 'Komik & Manga'
  | 'Light Novel'
  | 'Novel & Sastra'
  | 'Buku Anak & Remaja'
  | 'Agama & Spiritualitas'
  | 'Pengembangan Diri & Bisnis'
  | 'Non-Fiksi & Pengetahuan'
  | 'Buku Umum';

export const CATEGORY_COLORS: Record<string, string> = {
  'Komik & Manga': '#C5A059',             // Editorial Gold
  'Light Novel': '#3B82F6',               // Deep Blue
  'Novel & Sastra': '#10B981',             // Emerald
  'Buku Anak & Remaja': '#EC4899',         // Pink
  'Agama & Spiritualitas': '#14B8A6',      // Teal
  'Pengembangan Diri & Bisnis': '#8B5CF6', // Purple
  'Non-Fiksi & Pengetahuan': '#F59E0B',     // Amber
  'Buku Umum': '#6B7280',                 // Slate
};

const KNOWN_MANGA_FRANCHISES = [
  'one piece', 'jujutsu kaisen', 'haikyu', 'naruto', 'boruto', 'dragon ball', 'bleach',
  'detective conan', 'conan', 'doraemon', 'spy x family', 'frieren', 'chainsaw man',
  'blue lock', 'tokyo revengers', 'oshi no ko', 'demon slayer', 'kimetsu', 'attack on titan',
  'shingeki', 'my hero academia', 'boku no hero', 'slam dunk', 'hunter x hunter',
  'death note', 'gachiakuta', 'kagurabachi', 'sakamoto days', 'kaiju no', 'dandadan',
  'wind breaker', 'black clover', 'dr. stone', 'solo leveling', 'karada sagashi',
  'blue period', 'bungo stray dogs', 'lycoris recoil', 'medalist', 'yona', 'hai, miiko', 'miiko',
  'kindaichi', 'kariage kun', 'shinchan', 'crayon shinchan', 'takagi', 'komi-san', 'horimiya',
  'kaguya-sama', 'vinland saga', 'berserk', 'vagabond', 'monster', '20th century boys',
  'dr. slump', 'inuyasha', 'ranma', 'sailor moon', 'cardcaptor', 'yu-gi-oh', 'fairy tail',
  'eden zero', 'fire force', 'soul eater', 'noragami', 'seraph of the end', 'gintama',
  'assassination classroom', 'ansatsu kyoushitsu', 'food wars', 'shokugeki', 'the promised neverland',
  'yakusoku no neverland', 'fire punch', 'hell\'s paradise', 'jigokuraku',
  'mashle', 'undead unluck', 'choujin x', 'boy\'s abyss', 'ao ashi', 'giant killing',
  'be blues', 'captain tsubasa', 'kuroko', 'diamond no ace', 'ace of diamond', 'days',
  'kaguya', 'rent a girlfriend', 'kanojo okarishimasu', 'quintessential quintuplets',
  'gotoubun', 'nisekoi', 'golden kamuy', 'dorohedoro', 'chainsaw', 'jojo', 'bizarre adventure',
  'phantom busters', 'drama queen', 'divine incursions', 'tentang kita yang bertolak belakang',
  'tentang suatu tempat di wilayah kinki', 'in the clear moonlit dusk', 'akasha', 'level comic', 'koloni'
];

const KNOWN_LN_FRANCHISES = [
  'light novel', 'ln:', 'ln vol', '(light novel)', '[light novel]',
  'alya sometimes', 'overlord', 'sword art online', 'mushoku tensei',
  'classroom of the elite', 're-living my life', 'reliving my life',
  'shiboyugi', 'hidup di dalam bathtub', 'tensei shitara slime',
  're:zero', 'konosuba', 'eminence in shadow', 'no game no life',
  'danmachi', 'fate/zero', 'fate/strange', 'durarara', 'monogatari',
  'oregairu', 'yahari ore no seishun', 'toradora',
  'date a live', 'youjo senki', 'saga of tanya', 'goblin slayer'
];

/**
 * Deterministically resolves the primary category of a publication
 */
export function getPublicationCategory(pub: {
  title?: string | null;
  genres?: string[] | null;
  format?: string | null;
  publisherName?: string | null;
  seriesName?: string | null;
  volume?: number | null;
  description?: string | null;
}): BookCategory {
  const title = (pub.title || '').toLowerCase();
  const series = (pub.seriesName || '').toLowerCase();
  const pubName = (pub.publisherName || '').toLowerCase();
  const full = `${title} ${series}`;
  const genres = pub.genres || [];

  // 1. Light Novel
  if (
    genres.some((g) => g.toLowerCase().includes('light novel')) ||
    KNOWN_LN_FRANCHISES.some((k) => full.includes(k))
  ) {
    return 'Light Novel';
  }

  // 2. Komik & Manga
  const mangaPublishers = [
    'elex media komputindo',
    'm&c! publishing',
    'phoenix gramedia indonesia',
    'akasha',
    'level comics',
    'koloni',
    'shueisha',
    'kodansha',
    'viz media',
    'kadokawa',
  ];
  const hasMangaGenre = genres.some((g) => {
    const gl = g.toLowerCase();
    return gl.includes('manga') || gl.includes('komik') || gl.includes('manhwa') || gl.includes('shounen') || gl.includes('shoujo');
  });
  const hasMangaKeywords =
    full.includes('komik') ||
    full.includes('manga') ||
    full.includes('manhwa') ||
    full.includes('comic') ||
    full.includes('graphic novel') ||
    pub.format === 'TANKOBON' ||
    pub.format === 'KANZENBAN' ||
    pub.format === 'BUNKOBAN';
  const hasVolumePattern = Boolean(
    title.match(/\bvol\.\s*\d+/) ||
    title.match(/\bvol\s*\d+/) ||
    title.match(/\b\d{1,3}\s*-\s*(reguler|bookpaper|special)/) ||
    title.match(/#\d+/) ||
    (pub.volume !== null && pub.volume !== undefined)
  );
  const isKnownManga = KNOWN_MANGA_FRANCHISES.some((km) => full.includes(km));

  if (
    hasMangaGenre ||
    hasMangaKeywords ||
    isKnownManga ||
    (hasVolumePattern && mangaPublishers.some((mp) => pubName.includes(mp)) && !full.includes('novel') && !full.includes('sastra') && !full.includes('cerpen'))
  ) {
    return 'Komik & Manga';
  }

  // 3. Buku Anak & Remaja
  if (
    genres.some((g) => {
      const gl = g.toLowerCase();
      return gl.includes('anak') || gl.includes('paud') || gl.includes('dongeng') || gl.includes('edukasi');
    }) ||
    full.includes('anak') || full.includes('paud') || full.includes('tk') || full.includes('balita') ||
    full.includes('dongeng') || full.includes('fabel') || full.includes('cerita bergambar') ||
    full.includes('picture book') || full.includes('mewarnai') || full.includes('coloring') ||
    full.includes('aktivitas') || full.includes('activity book') || full.includes('komik pendidikan') ||
    full.includes('saintis cilik') || full.includes('robocar') || full.includes('disney') ||
    full.includes('gina & gani') || full.includes('tuut!') || full.includes('the prince series') ||
    full.includes('why?') || full.includes('science comic') || full.includes('cookie run') ||
    full.includes('princess') || full.includes('funtastic') || pubName.includes('bip') || pubName.includes('bhuana ilmu populer')
  ) {
    return 'Buku Anak & Remaja';
  }

  // 4. Agama & Spiritualitas
  if (
    genres.some((g) => {
      const gl = g.toLowerCase();
      return gl.includes('agama') || gl.includes('spiritual') || gl.includes('islam') || gl.includes('qur\'an');
    }) ||
    full.includes('islam') || full.includes('qur\'an') || full.includes('quran') ||
    full.includes('hadits') || full.includes('tafsir') || full.includes('sholat') ||
    full.includes('shalat') || full.includes('doa') || full.includes('dzikir') ||
    full.includes('puasa') || full.includes('ramadhan') || full.includes('haji') ||
    full.includes('umrah') || full.includes('fiqih') || full.includes('tasawuf') ||
    full.includes('akhlak') || full.includes('dakwah') || full.includes('hijrah') ||
    full.includes('syariah') || full.includes('kristen') || full.includes('alkitab') ||
    full.includes('spiritual') || full.includes('qanza') || full.includes('nabi') ||
    full.includes('rasul') || full.includes('surga') || full.includes('sedekah') ||
    pubName.includes('mizan') || pubName.includes('republika') || pubName.includes('gema insani') ||
    pubName.includes('alqosbah') || pubName.includes('cordoba')
  ) {
    return 'Agama & Spiritualitas';
  }

  // 5. Pengembangan Diri & Bisnis
  if (
    genres.some((g) => {
      const gl = g.toLowerCase();
      return gl.includes('pengembangan diri') || gl.includes('bisnis') || gl.includes('finansial') || gl.includes('psikologi');
    }) ||
    full.includes('pengembangan diri') || full.includes('self-help') || full.includes('self help') ||
    full.includes('kebiasaan') || full.includes('habits') || full.includes('mindset') ||
    full.includes('karir') || full.includes('kepemimpinan') || full.includes('leadership') ||
    full.includes('manajemen') || full.includes('bisnis') || full.includes('investasi') ||
    full.includes('saham') || full.includes('finansial') || full.includes('keuangan') ||
    full.includes('marketing') || full.includes('ekonomi') || full.includes('wealth') ||
    full.includes('productivity') || full.includes('produktivitas') || full.includes('filosofi teras') ||
    full.includes('psikologi') || full.includes('digital exhaustion') || full.includes('run like life')
  ) {
    return 'Pengembangan Diri & Bisnis';
  }

  // 6. Non-Fiksi & Pengetahuan
  if (
    genres.some((g) => g.toLowerCase().includes('non-fiksi') || g.toLowerCase().includes('sejarah')) ||
    full.includes('sejarah') || full.includes('biografi') || full.includes('memoar') ||
    full.includes('politik') || full.includes('sosial') || full.includes('filsafat') ||
    full.includes('hukum') || full.includes('uud 1945') || full.includes('sains') ||
    full.includes('teknologi') || full.includes('kesehatan') || full.includes('kedokteran') ||
    full.includes('parenting') || full.includes('masakan') || full.includes('resep') ||
    full.includes('kuliner') || full.includes('kamus') || full.includes('atlas') ||
    full.includes('terorisme') || full.includes('kho ping hoo: sebuah biografi')
  ) {
    return 'Non-Fiksi & Pengetahuan';
  }

  // 7. Novel & Sastra (Default for Indonesian & Translated Literature)
  return 'Novel & Sastra';
}
