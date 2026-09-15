// ISBN Normalizer & Validator for nuvelll

export interface NormalizedIsbnResult {
  raw: string;
  clean: string;
  isbn10: string | null;
  isbn13: string | null;
  isValid: boolean;
}

/**
 * Calculates check digit for ISBN-10
 */
function calculateIsbn10CheckDigit(digits9: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits9[i], 10) * (10 - i);
  }
  const remainder = (11 - (sum % 11)) % 11;
  return remainder === 10 ? 'X' : remainder.toString();
}

/**
 * Calculates check digit for ISBN-13 (EAN-13 algorithm)
 */
function calculateIsbn13CheckDigit(digits12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? '0' : (10 - remainder).toString();
}

/**
 * Validates and normalizes ISBN strings into clean ISBN-10 and canonical ISBN-13
 */
export function normalizeIsbn(input: string | null | undefined): NormalizedIsbnResult {
  if (!input) {
    return { raw: '', clean: '', isbn10: null, isbn13: null, isValid: false };
  }

  // Strip hyphens, spaces, and punctuation
  const clean = input.replace(/[-\s\.\:]/g, '').toUpperCase().trim();

  // Handle ISBN-10
  if (/^[0-9]{9}[0-9X]$/.test(clean)) {
    const expectedCheck = calculateIsbn10CheckDigit(clean.slice(0, 9));
    const isValid = expectedCheck === clean[9];

    if (isValid) {
      // Convert to ISBN-13 with 978 prefix
      const digits12 = '978' + clean.slice(0, 9);
      const isbn13Check = calculateIsbn13CheckDigit(digits12);
      const isbn13 = digits12 + isbn13Check;
      return {
        raw: input,
        clean,
        isbn10: clean,
        isbn13,
        isValid: true,
      };
    }
  }

  // Handle ISBN-13
  if (/^[0-9]{13}$/.test(clean)) {
    const expectedCheck = calculateIsbn13CheckDigit(clean.slice(0, 12));
    const isValid = expectedCheck === clean[12];

    if (isValid) {
      // If starts with 978, can also compute matching ISBN-10
      let isbn10: string | null = null;
      if (clean.startsWith('978')) {
        const core9 = clean.slice(3, 12);
        isbn10 = core9 + calculateIsbn10CheckDigit(core9);
      }
      return {
        raw: input,
        clean,
        isbn10,
        isbn13: clean,
        isValid: true,
      };
    }
  }

  return {
    raw: input,
    clean,
    isbn10: null,
    isbn13: null,
    isValid: false,
  };
}
