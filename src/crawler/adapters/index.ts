// Adapter Registry for nuvelll

import { SourceAdapter } from '../core/source-adapter';
import { elexAdapter } from './elex-adapter';
import { gramediaAdapter } from './gramedia-adapter';
import { mncAdapter } from './mnc-adapter';
import { feedAdapter } from './feed-adapter';

export const ALL_ADAPTERS: SourceAdapter[] = [
  elexAdapter,
  gramediaAdapter,
  mncAdapter,
  feedAdapter,
];

export function getAdapterById(id: string): SourceAdapter | undefined {
  return ALL_ADAPTERS.find((a) => a.id === id);
}

export function getAdapterByDomain(domain: string): SourceAdapter | undefined {
  return ALL_ADAPTERS.find((a) => a.domain.toLowerCase() === domain.toLowerCase());
}
