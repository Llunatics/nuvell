// Core Domain Types for nuvell — Indonesia Book Release Intelligence Platform

export type SourceType = 'PUBLISHER' | 'BOOKSTORE' | 'CATALOG' | 'FEED' | 'SITEMAP';

export type SourceStatus = 
  | 'HEALTHY' 
  | 'DEGRADED' 
  | 'UNAVAILABLE' 
  | 'BLOCKED' 
  | 'DISABLED' 
  | 'CIRCUIT_OPEN';

export type ConfidenceRating = 
  | 'OFFICIAL_PUBLISHER'    // 5 stars
  | 'OFFICIAL_BOOKSTORE'    // 4 stars
  | 'SECONDARY_CATALOG'     // 3 stars
  | 'COMMUNITY_SUBMISSION'; // 2 stars

export type PublicationStatus = 
  | 'ANNOUNCED' 
  | 'PREORDER' 
  | 'RELEASED' 
  | 'AVAILABLE' 
  | 'OUT_OF_STOCK' 
  | 'DELAYED' 
  | 'DISCONTINUED' 
  | 'UNKNOWN';

export type BookFormat = 
  | 'TANKOBON' 
  | 'BUNKOBAN' 
  | 'KANZENBAN' 
  | 'PAPERBACK' 
  | 'HARDCOVER' 
  | 'EBOOK' 
  | 'OMNIBUS' 
  | 'ARTBOOK' 
  | 'MAGAZINE';

export type AuthorRole = 'AUTHOR' | 'ILLUSTRATOR' | 'ORIGINAL_CREATOR' | 'TRANSLATOR' | 'EDITOR';

export type ChangeField = 
  | 'PRICE' 
  | 'RELEASE_DATE' 
  | 'STATUS' 
  | 'AVAILABILITY' 
  | 'COVER' 
  | 'TITLE' 
  | 'DESCRIPTION';

export type ChangeTypeBadge = 
  | 'NEW' 
  | 'UPDATED' 
  | 'PRICE DROP' 
  | 'DATE CHANGED' 
  | 'PREORDER' 
  | 'BACK IN STOCK';

export interface Source {
  id: string;
  name: string;
  slug: string;
  domain: string;
  baseUrl: string;
  type: SourceType;
  country: string;
  enabled: boolean;
  crawlIntervalMin: number;
  lastCrawledAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  status: SourceStatus;
  robotsStatus: string;
  confidenceLevel: ConfidenceRating;
  notes?: string | null;
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  country: string;
  description?: string | null;
  isOfficial: boolean;
  imprints?: Imprint[];
}

export interface Imprint {
  id: string;
  name: string;
  slug: string;
  publisherId: string;
  description?: string | null;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  originalName?: string | null;
  biography?: string | null;
  country?: string | null;
}

export interface Series {
  id: string;
  name: string;
  slug: string;
  originalTitle?: string | null;
  publisherId?: string | null;
  publisherName?: string | null;
  totalVolumes?: number | null;
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS';
  description?: string | null;
  coverUrl?: string | null;
  volumes?: PublicationSummary[];
}

export interface PublicationAuthor {
  authorId: string;
  name: string;
  slug: string;
  role: AuthorRole;
}

export interface PriceObservation {
  id: string;
  publicationId: string;
  sourceId: string;
  sourceName?: string;
  price: number;
  currency: string;
  recordedAt: string;
}

export interface AvailabilityObservation {
  id: string;
  publicationId: string;
  sourceId: string;
  sourceName: string;
  availability: string;
  sourceUrl: string;
  recordedAt: string;
}

export interface PublicationChange {
  id: string;
  publicationId: string;
  field: ChangeField;
  oldValue?: string | null;
  newValue: string;
  detectedAt: string;
  sourceName?: string | null;
}

export interface Edition {
  id: string;
  publicationId: string;
  editionName: string;
  format: BookFormat;
  isbn?: string | null;
  releaseDate?: string | null;
  isSpecialEdition: boolean;
  notes?: string | null;
}

export interface PublisherSocialPost {
  id: string;
  publisherId: string;
  publisherName: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER_X';
  postUrl: string;
  postDate: string;
  caption: string;
  posterImageUrl: string;
  releaseDateAnnounced: string;
  transcribedTitles: string[];
}

export interface Publication {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string | null;
  subtitle?: string | null;
  seriesId?: string | null;
  seriesName?: string | null;
  volume?: number | null;
  format: BookFormat;
  language: string;
  country: string;
  isbn10?: string | null;
  isbn13?: string | null;
  description?: string | null;
  coverImage?: string | null;
  status: PublicationStatus;
  publicationDate?: string | null;
  releaseDate?: string | null;
  announcedAt?: string | null;
  preorderDate?: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  pageCount?: number | null;
  completenessScore: number;
  publisherId: string;
  publisherName: string;
  imprintId?: string | null;
  imprintName?: string | null;
  ageRating?: string | null;
  dimensions?: string | null;
  weight?: number | null;
  currentPrice?: number | null;
  lowestObservedPrice?: number | null;
  highestObservedPrice?: number | null;
  authors: PublicationAuthor[];
  genres: string[];
  sources: AvailabilityObservation[];
  priceHistory: PriceObservation[];
  changes: PublicationChange[];
  editions?: Edition[];
  sourceCount: number;
  recentChangeBadge?: ChangeTypeBadge | null;
  socialFlyerSource?: {
    platform: string;
    postUrl: string;
    posterImageUrl: string;
    announcedReleaseDate: string;
  } | null;
}

export type PublicationSummary = Pick<
  Publication,
  | 'id'
  | 'slug'
  | 'title'
  | 'volume'
  | 'status'
  | 'releaseDate'
  | 'coverImage'
  | 'currentPrice'
  | 'publisherName'
  | 'format'
  | 'isbn13'
  | 'completenessScore'
  | 'recentChangeBadge'
>;

export interface CrawlLog {
  id: string;
  sourceId: string;
  sourceName: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  requestsCount: number;
  successCount: number;
  failedCount: number;
  itemsFound: number;
  itemsUpdated: number;
  itemsCreated: number;
  itemsSkipped: number;
  errorCount: number;
  errorMessage?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  publisherId: string;
  publisherName: string;
  publishedAt: string;
  sourceUrl: string;
  excerpt: string;
  relatedPublicationId?: string | null;
  relatedPublicationTitle?: string | null;
}

export interface ReviewQueueItem {
  id: string;
  publicationId?: string | null;
  candidateData: Record<string, unknown>;
  confidenceScore: number;
  matchReason: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

export interface UserCollectionItem {
  publicationId: string;
  seriesId?: string;
  volume?: number;
  status: 'OWNED' | 'WISHLIST' | 'MISSING' | 'PREORDERED';
  updatedAt: string;
  notes?: string;
}

export interface UserWatchlistItem {
  id: string;
  type: 'BOOK' | 'SERIES' | 'AUTHOR' | 'PUBLISHER';
  targetId: string;
  targetName: string;
  targetSlug: string;
  createdAt: string;
}
