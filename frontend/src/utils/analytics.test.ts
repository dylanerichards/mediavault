import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackEvent,
  trackMediaView,
  trackSearch,
  trackAddToCart,
  trackAddToFavorite,
} from './analytics';
import { analyticsApi } from '../services/api';

vi.mock('../services/api', () => ({
  analyticsApi: {
    recordEvent: vi.fn(),
    getEvents: vi.fn(),
  },
}));

const recordEvent = vi.mocked(analyticsApi.recordEvent);

describe('analytics tracking helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trackMediaView records a view_item event with target fields from the media', () => {
    trackMediaView({ id: 42, title: 'Dune' });

    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'view_item',
        target_type: 'MediaType',
        target_id: 42,
        target_label: 'Dune',
      })
    );
  });

  it('trackSearch records a search event with the search term', () => {
    trackSearch('sci-fi');

    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'search',
        search_term: 'sci-fi',
      })
    );
  });

  it('trackAddToCart records an add_to_cart event with target fields', () => {
    trackAddToCart({ id: 7, title: 'The Daily' });

    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'add_to_cart',
        target_type: 'MediaType',
        target_id: 7,
        target_label: 'The Daily',
      })
    );
  });

  it('trackAddToFavorite records an add_to_favorite event with target fields', () => {
    trackAddToFavorite({ id: 9, title: 'Serial' });

    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'add_to_favorite',
        target_type: 'MediaType',
        target_id: 9,
        target_label: 'Serial',
      })
    );
  });

  it('trackEvent passes the action and maps the context to payload fields', () => {
    trackEvent('view_item', {
      targetType: 'MediaType',
      targetId: 1,
      targetLabel: 'Example',
      searchTerm: 'example',
    });

    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith({
      action: 'view_item',
      target_type: 'MediaType',
      target_id: 1,
      target_label: 'Example',
      search_term: 'example',
    });
  });
});
