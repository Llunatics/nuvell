// Title Normalization Engine for nuvelll

export interface NormalizedTitleResult {
  raw: string;
  normalizedTitle: string;
  seriesCandidate: string;
  volumeNumber: number | null;
  editionSuffix: string | null;
  isSpecialEdition: boolean;
}

const EDITION_PATTERNS = [
  /special\s+edition/i,
  /collector['’]?s?\s+edition/i,
  /edisi\s+khusus/i,
  /edisi\s+kolektor/i,
  /edisi\s+terbatas/i,
  /limited\s+edition/i,
  /deluxe\s+edition/i,
  /anniversary\s+edition/i,
  /omnibus(\s+edition)?/i,
  /edisi\s+sampul\s+film/i,
  /hardcover\s+edition/i,
  /boxset/i,
];

/**
 * Normalizes title string, handles volume indicators, Unicode NFKC, and detects special edition suffixes.
 */
export function normalizeTitle(input: string): NormalizedTitleResult {
  if (!input) {
    return {
      raw: '',
      normalizedTitle: '',
      seriesCandidate: '',
      volumeNumber: null,
      editionSuffix: null,
      isSpecialEdition: false,
    };
  }

  // 1. Unicode NFKC Normalization
  let clean = input.normalize('NFKC').trim();

  // 2. Check for edition suffixes
  let editionSuffix: string | null = null;
  let isSpecialEdition = false;

  for (const pattern of EDITION_PATTERNS) {
    const match = clean.match(pattern);
    if (match) {
      editionSuffix = match[0].trim();
      isSpecialEdition = true;
      // Strip edition suffix from working title for volume/series matching
      clean = clean.replace(pattern, '').replace(/[()\[\]]/g, ' ').trim();
      break;
    }
  }

  // 3. Extract Volume Number
  // Examples:
  // "One Piece Vol. 34" -> 34
  // "Jujutsu Kaisen #25" -> 25
  // "Frieren 11" -> 11
  // "Spy x Family Volume 13" -> 13
  // "Vol 08" -> 8
  const volPatterns = [
    /(?:vol(?:ume)?\.?|jilid|bk\.?|#)\s*([0-9]+)/i,
    /\s+([0-9]{1,4})$/, // trailing standalone number
    /\s+([0-9]{1,4})\s*(?::|\-|\/)/, // number before colon/hyphen
  ];

  let volumeNumber: number | null = null;
  let seriesCandidate = clean;

  for (const pat of volPatterns) {
    const m = clean.match(pat);
    if (m && m[1]) {
      const parsed = parseInt(m[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed < 2000) {
        volumeNumber = parsed;
        // Strip volume part to find series candidate
        seriesCandidate = clean.replace(pat, '').trim();
        break;
      }
    }
  }

  // 4. Clean and normalize working series candidate
  seriesCandidate = seriesCandidate
    .replace(/[–—\-:_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 5. Build canonical lowercase normalized title
  const normalizedTitle = [
    seriesCandidate.toLowerCase(),
    volumeNumber ? `vol ${volumeNumber}` : '',
    editionSuffix ? editionSuffix.toLowerCase() : '',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    raw: input,
    normalizedTitle,
    seriesCandidate,
    volumeNumber,
    editionSuffix,
    isSpecialEdition,
  };
}
