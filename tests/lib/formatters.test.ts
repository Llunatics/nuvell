import { describe, it, expect } from 'vitest';
import { formatIDR, getReleaseCountdown } from '@/lib/formatters';

describe('Formatters & Asia/Jakarta Countdown', () => {
  it('formats Indonesian Rupiah currency cleanly', () => {
    expect(formatIDR(45000)).toMatch(/Rp\s*45\.000/);
    expect(formatIDR(180000)).toMatch(/Rp\s*180\.000/);
    expect(formatIDR(null)).toBe('Harga belum tersedia');
  });

  it('calculates countdown relative to Asia/Jakarta timezone correctly', () => {
    // Current mock reference date: 2026-09-14
    const mockToday = new Date('2026-09-14T10:00:00+07:00');

    const todayRes = getReleaseCountdown('2026-09-14', mockToday);
    expect(todayRes.isToday).toBe(true);
    expect(todayRes.label).toBe('Rilis hari ini!');

    const tomorrowRes = getReleaseCountdown('2026-09-15', mockToday);
    expect(tomorrowRes.isUpcoming).toBe(true);
    expect(tomorrowRes.label).toBe('Rilis besok');

    const futureRes = getReleaseCountdown('2026-09-18', mockToday);
    expect(futureRes.daysDifference).toBe(4);
    expect(futureRes.label).toBe('Rilis dalam 4 hari');

    const pastRes = getReleaseCountdown('2026-09-10', mockToday);
    expect(pastRes.isReleased).toBe(true);
    expect(pastRes.label).toBe('Rilis 4 hari lalu');
  });
});
