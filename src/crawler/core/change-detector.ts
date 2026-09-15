// Change Detection Engine for nuvelll

import { Publication, PublicationChange, ChangeField } from '@/types';

export interface ObservationUpdate {
  publicationId: string;
  sourceId?: string;
  sourceName?: string;
  newPrice?: number | null;
  newReleaseDate?: string | null;
  newStatus?: string | null;
  newAvailability?: string | null;
  newCoverImage?: string | null;
}

export interface DetectedChange {
  field: ChangeField;
  oldValue: string | null;
  newValue: string;
  summary: string;
}

export class ChangeDetector {
  /**
   * Compares an existing Publication record with an incoming crawl observation
   * and returns an array of detected changes.
   */
  public detectChanges(
    existing: Publication,
    update: ObservationUpdate
  ): DetectedChange[] {
    const changes: DetectedChange[] = [];

    // 1. Price Change Detection
    if (
      update.newPrice !== undefined &&
      update.newPrice !== null &&
      existing.currentPrice !== null &&
      existing.currentPrice !== undefined &&
      update.newPrice !== existing.currentPrice
    ) {
      const isDrop = update.newPrice < existing.currentPrice;
      changes.push({
        field: 'PRICE',
        oldValue: existing.currentPrice.toString(),
        newValue: update.newPrice.toString(),
        summary: isDrop
          ? `Harga turun: Rp ${existing.currentPrice.toLocaleString('id-ID')} → Rp ${update.newPrice.toLocaleString('id-ID')}`
          : `Penyesuaian harga: Rp ${existing.currentPrice.toLocaleString('id-ID')} → Rp ${update.newPrice.toLocaleString('id-ID')}`,
      });
    }

    // 2. Release Date Change Detection
    if (
      update.newReleaseDate !== undefined &&
      update.newReleaseDate !== null &&
      existing.releaseDate &&
      update.newReleaseDate !== existing.releaseDate
    ) {
      changes.push({
        field: 'RELEASE_DATE',
        oldValue: existing.releaseDate,
        newValue: update.newReleaseDate,
        summary: `Jadwal rilis bergeser: ${existing.releaseDate} → ${update.newReleaseDate}`,
      });
    }

    // 3. Publication Status Shift
    if (
      update.newStatus &&
      existing.status &&
      update.newStatus !== existing.status
    ) {
      changes.push({
        field: 'STATUS',
        oldValue: existing.status,
        newValue: update.newStatus,
        summary: `Status publikasi berubah dari ${existing.status} menjadi ${update.newStatus}`,
      });
    }

    // 4. Cover Image Update
    if (
      update.newCoverImage &&
      (!existing.coverImage || existing.coverImage !== update.newCoverImage)
    ) {
      changes.push({
        field: 'COVER',
        oldValue: existing.coverImage || null,
        newValue: update.newCoverImage,
        summary: 'Cover publikasi diperbarui dengan resolusi resmi',
      });
    }

    return changes;
  }
}

export const changeDetector = new ChangeDetector();
