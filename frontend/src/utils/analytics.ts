import { analyticsApi } from '../services/api';
import type { AnalyticsAction, MediaType } from '../types/api';

export type { AnalyticsAction };

export interface TrackContext {
  targetType?: string;
  targetId?: number;
  targetLabel?: string;
  searchTerm?: string;
}

// Records a user action on the server (fire-and-forget) so it can be viewed
// across the whole platform, not just in this browser.
export function trackEvent(action: AnalyticsAction, context: TrackContext = {}): void {
  void analyticsApi.recordEvent({
    action,
    target_type: context.targetType,
    target_id: context.targetId,
    target_label: context.targetLabel,
    search_term: context.searchTerm,
  });
}

// Convenience helpers for the actions the app tracks.
export function trackMediaView(media: Pick<MediaType, 'id' | 'title'>): void {
  trackEvent('view_item', {
    targetType: 'MediaType',
    targetId: media.id,
    targetLabel: media.title,
  });
}

export function trackSearch(term: string): void {
  trackEvent('search', { searchTerm: term });
}

export function trackAddToCart(media: Pick<MediaType, 'id' | 'title'>): void {
  trackEvent('add_to_cart', {
    targetType: 'MediaType',
    targetId: media.id,
    targetLabel: media.title,
  });
}

export function trackAddToFavorite(media: Pick<MediaType, 'id' | 'title'>): void {
  trackEvent('add_to_favorite', {
    targetType: 'MediaType',
    targetId: media.id,
    targetLabel: media.title,
  });
}

export function trackRemoveFromCart(media: Pick<MediaType, 'id' | 'title'>): void {
  trackEvent('remove_from_cart', {
    targetType: 'MediaType',
    targetId: media.id,
    targetLabel: media.title,
  });
}

export function trackRemoveFromFavorite(media: Pick<MediaType, 'id' | 'title'>): void {
  trackEvent('remove_from_favorite', {
    targetType: 'MediaType',
    targetId: media.id,
    targetLabel: media.title,
  });
}
