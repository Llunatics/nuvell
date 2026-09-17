// Timezone & Formatting Utilities for nuvell — Asia/Jakarta (WIB)

export const TIMEZONE = 'Asia/Jakarta';

/**
 * Format currency in Indonesian Rupiah (IDR)
 */
export function formatIDR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Harga belum tersedia';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a standard readable date in Asia/Jakarta timezone
 */
export function formatDate(dateInput: string | Date | null | undefined, locale = 'id-ID'): string {
  if (!dateInput) return 'Tanggal belum diumumkan';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'Tanggal tidak valid';

  return new Intl.DateTimeFormat(locale, {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format short date (e.g. "14 Sep 2026")
 */
export function formatShortDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'TBA';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'TBA';

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Get current date string (YYYY-MM-DD) in Asia/Jakarta (WIB)
 */
export function getTodayDateWIB(nowInput?: Date): string {
  const now = nowInput || new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

/**
 * Get a past date string (YYYY-MM-DD) in Asia/Jakarta (WIB) relative to today
 */
export function getRollingPastDateWIB(daysAgo = 14, nowInput?: Date): string {
  const now = nowInput || new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return getTodayDateWIB(past);
}

/**
 * Precise Release Countdown relative to Asia/Jakarta current time
 */
export function getReleaseCountdown(releaseDateInput: string | Date | null | undefined, nowInput?: Date): {
  label: string;
  isToday: boolean;
  isUpcoming: boolean;
  isReleased: boolean;
  daysDifference: number;
} {
  if (!releaseDateInput) {
    return {
      label: 'Belum ada tanggal rilis',
      isToday: false,
      isUpcoming: false,
      isReleased: false,
      daysDifference: 0,
    };
  }

  const releaseDate = typeof releaseDateInput === 'string' ? new Date(releaseDateInput) : releaseDateInput;
  if (isNaN(releaseDate.getTime())) {
    return {
      label: 'Tanggal rilis tidak valid',
      isToday: false,
      isUpcoming: false,
      isReleased: false,
      daysDifference: 0,
    };
  }

  // Get date midnight in Asia/Jakarta
  const getMidnightWIB = (d: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(d);
    const month = parts.find((p) => p.type === 'month')?.value || '1';
    const day = parts.find((p) => p.type === 'day')?.value || '1';
    const year = parts.find((p) => p.type === 'year')?.value || '2026';
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
  };

  const now = nowInput || new Date();
  const currentMidnight = getMidnightWIB(now);
  const releaseMidnight = getMidnightWIB(releaseDate);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((releaseMidnight - currentMidnight) / MS_PER_DAY);

  if (diffDays === 0) {
    return {
      label: 'Rilis hari ini!',
      isToday: true,
      isUpcoming: false,
      isReleased: true,
      daysDifference: 0,
    };
  } else if (diffDays === 1) {
    return {
      label: 'Rilis besok',
      isToday: false,
      isUpcoming: true,
      isReleased: false,
      daysDifference: 1,
    };
  } else if (diffDays > 1) {
    return {
      label: `Rilis dalam ${diffDays} hari`,
      isToday: false,
      isUpcoming: true,
      isReleased: false,
      daysDifference: diffDays,
    };
  } else if (diffDays === -1) {
    return {
      label: 'Rilis kemarin',
      isToday: false,
      isUpcoming: false,
      isReleased: true,
      daysDifference: -1,
    };
  } else if (diffDays < -1) {
    if (Math.abs(diffDays) > 30) {
      return {
        label: `Terbit ${formatShortDate(releaseDate)}`,
        isToday: false,
        isUpcoming: false,
        isReleased: true,
        daysDifference: diffDays,
      };
    }
    return {
      label: `Rilis ${Math.abs(diffDays)} hari lalu`,
      isToday: false,
      isUpcoming: false,
      isReleased: true,
      daysDifference: diffDays,
    };
  }

  return {
    label: `Terbit ${formatShortDate(releaseDate)}`,
    isToday: false,
    isUpcoming: false,
    isReleased: true,
    daysDifference: diffDays,
  };
}

/**
 * Format relative time (e.g. "2 jam lalu", "3 hari lalu")
 */
export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} hari lalu`;
  return formatShortDate(date);
}
