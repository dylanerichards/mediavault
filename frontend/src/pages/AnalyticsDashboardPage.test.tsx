import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AnalyticsDashboardPage from './AnalyticsDashboardPage';
import { analyticsApi } from '../services/api';
import type { AnalyticsEventRecord, AnalyticsResponse, User } from '../types/api';

vi.mock('../services/api', () => ({
  analyticsApi: {
    recordEvent: vi.fn(),
    getEvents: vi.fn(),
    streamUrl: vi.fn(() => 'http://test/stream'),
  },
}));

const getEvents = vi.mocked(analyticsApi.getEvents);

// Minimal EventSource stub so the dashboard's SSE wiring can be driven in tests.
class FakeEventSource {
  static instances: FakeEventSource[] = [];
  listeners: Record<string, ((e: any) => void)[]> = {};
  url: string;
  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }
  addEventListener(type: string, cb: (e: any) => void) {
    (this.listeners[type] ||= []).push(cb);
  }
  emit(type: string, data?: unknown) {
    (this.listeners[type] || []).forEach((cb) =>
      cb(type === 'analytics_event' ? { data: JSON.stringify(data) } : {})
    );
  }
  close() {}
}

const fixture: AnalyticsResponse = {
  events: [
    {
      id: 10,
      action: 'view_item',
      target_type: 'MediaType',
      target_id: 5,
      target_label: 'Dune',
      search_term: null,
      user: { id: 2, name: 'Casey' },
      created_at: '2024-01-02T10:00:00Z',
    },
    {
      id: 11,
      action: 'search',
      target_type: null,
      target_id: null,
      target_label: null,
      search_term: 'sci-fi',
      user: { id: 3, name: 'Robin' },
      created_at: '2024-01-02T11:00:00Z',
    },
  ],
  summary: [
    { action: 'view_item', count: 3 },
    { action: 'search', count: 2 },
    { action: 'add_to_cart', count: 1 },
    { action: 'add_to_favorite', count: 4 },
  ],
  stats: {
    total: 5,
    top_items: [{ label: 'Dune', count: 3 }],
    top_searches: [{ term: 'sci-fi', count: 2 }],
    active_users: [{ name: 'Casey', count: 4 }],
  },
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 2,
    per_page: 50,
    has_next: false,
    has_prev: false,
  },
};

const adminUser: User = {
  id: 1,
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
};

describe('AnalyticsDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEvents.mockResolvedValue(fixture);
    FakeEventSource.instances = [];
    (globalThis as any).EventSource = FakeEventSource;
  });

  it('loads and renders platform-wide activity', async () => {
    render(<AnalyticsDashboardPage user={adminUser} />);

    expect(await screen.findByText('Platform activity')).toBeInTheDocument();
    expect(getEvents).toHaveBeenCalledTimes(1);

    // Total + per-action summary.
    expect(screen.getByText(/5 total events recorded/i)).toBeInTheDocument();

    // Behavior stats panels (ranked rows render as "1. <label>").
    expect(screen.getByText('Most viewed & added items')).toBeInTheDocument();
    expect(screen.getByText('1. Dune')).toBeInTheDocument();
    expect(screen.getByText('Popular searches')).toBeInTheDocument();
    expect(screen.getByText('Most active users')).toBeInTheDocument();
    expect(screen.getByText('1. Casey')).toBeInTheDocument();

    // Recent activity describes other users' actions with full context.
    expect(screen.getByText('Casey viewed Dune')).toBeInTheDocument();
    expect(screen.getByText('Robin searched for "sci-fi"')).toBeInTheDocument();
  });

  it('has no scope toggle (always platform-wide)', async () => {
    render(<AnalyticsDashboardPage user={adminUser} />);
    await screen.findByText('Platform activity');

    expect(
      screen.queryByRole('button', { name: /my activity/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /platform activity/i })
    ).not.toBeInTheDocument();
  });

  it('prepends a live event from the SSE stream and bumps the total', async () => {
    render(<AnalyticsDashboardPage user={adminUser} />);
    await screen.findByText('Platform activity');
    expect(screen.getByText(/5 total events recorded/i)).toBeInTheDocument();

    const source = FakeEventSource.instances[0];
    expect(source).toBeTruthy();

    const liveEvent: AnalyticsEventRecord = {
      id: 999,
      action: 'remove_from_cart',
      target_type: 'MediaType',
      target_id: 7,
      target_label: 'Live Book',
      search_term: null,
      user: { id: 5, name: 'Robin' },
      created_at: '2024-02-01T00:00:00Z',
    };

    act(() => {
      source.emit('open');
      source.emit('analytics_event', liveEvent);
    });

    expect(await screen.findByText('Robin removed Live Book from cart')).toBeInTheDocument();
    expect(screen.getByText(/6 total events recorded/i)).toBeInTheDocument();
  });
});
