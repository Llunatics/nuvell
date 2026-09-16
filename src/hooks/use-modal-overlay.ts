'use client';

import { useEffect, useState } from 'react';

let activeOverlayCount = 0;

/**
 * Universal hook for managing modal and slide-over drawer overlays.
 * - Prevents background page scrolling while an overlay is active.
 * - Sets `data-overlay-active="true"` on the root document element so sticky headers,
 *   sidebars, and mobile navs can smoothly disable dual-backdrop-blur & borders,
 *   eliminating coarse/patchy blur seams and double-filtered artifacts.
 * - Returns `mounted` to safely portal components to `document.body` without SSR hydration issues.
 */
export function useModalOverlay(isOpen: boolean): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;

    if (isOpen) {
      activeOverlayCount++;
      document.body.style.overflow = 'hidden';
      document.documentElement.setAttribute('data-overlay-active', 'true');
    }

    return () => {
      if (isOpen) {
        activeOverlayCount = Math.max(0, activeOverlayCount - 1);
        if (activeOverlayCount === 0) {
          document.body.style.overflow = '';
          document.documentElement.removeAttribute('data-overlay-active');
        }
      }
    };
  }, [isOpen, mounted]);

  return mounted;
}
