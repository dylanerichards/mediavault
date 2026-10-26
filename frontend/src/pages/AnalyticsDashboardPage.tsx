/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import TopList from '../components/analytics/TopList';
import { analyticsApi } from '../services/api';
import type {
  AnalyticsAction,
  AnalyticsEventRecord,
  AnalyticsStats,
  AnalyticsSummaryItem,
  User,
} from '../types/api';

const ACTION_TITLES: Record<AnalyticsAction, string> = {
  view_item: 'Item Views',
  search: 'Searches',
  add_to_cart: 'Added to Cart',
  remove_from_cart: 'Removed from Cart',
  add_to_favorite: 'Added to Favorites',
  remove_from_favorite: 'Removed from Favorites',
};

const EMPTY_STATS: AnalyticsStats = {
  total: 0,
  top_items: [],
  top_searches: [],
  active_users: [],
};

// Builds a readable "User X did Y" sentence with full context.
const describeEvent = (event: AnalyticsEventRecord): string => {
  const who = event.user?.name ?? 'Someone';
  switch (event.action) {
    case 'view_item':
      return `${who} viewed ${event.target_label ?? 'an item'}`;
    case 'search':
      return `${who} searched for "${event.search_term ?? ''}"`;
    case 'add_to_cart':
      return `${who} added ${event.target_label ?? 'an item'} to cart`;
    case 'remove_from_cart':
      return `${who} removed ${event.target_label ?? 'an item'} from cart`;
    case 'add_to_favorite':
      return `${who} added ${event.target_label ?? 'an item'} to favorites`;
    case 'remove_from_favorite':
      return `${who} removed ${event.target_label ?? 'an item'} from favorites`;
    default:
      return `${who} performed an action`;
  }
};

const AnalyticsDashboardPage: React.FC<{ user: User | null }> = ({ user }) => {
  const [events, setEvents] = useState<AnalyticsEventRecord[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummaryItem[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  // Merge a single event pushed over SSE into the current view.
  const applyLiveEvent = (event: AnalyticsEventRecord) => {
    setEvents((prev) => (prev.some((e) => e.id === event.id) ? prev : [event, ...prev]));
    setSummary((prev) =>
      prev.map((s) => (s.action === event.action ? { ...s, count: s.count + 1 } : s))
    );
    setStats((prev) => ({ ...prev, total: prev.total + 1 }));
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getEvents();
        if (!active) return;
        setEvents(response.events);
        setSummary(response.summary);
        setStats(response.stats ?? EMPTY_STATS);
        setError('');

        // Open the SSE stream for new events, resuming after the latest id.
        const lastId = response.events.reduce((max, e) => Math.max(max, e.id), 0);
        const source = new EventSource(analyticsApi.streamUrl(lastId));
        sourceRef.current = source;
        source.addEventListener('open', () => setLive(true));
        source.addEventListener('analytics_event', (ev) => {
          try {
            applyLiveEvent(JSON.parse((ev as MessageEvent).data));
          } catch {
            /* ignore malformed payloads */
          }
        });
        source.addEventListener('error', () => setLive(false));
      } catch (err: any) {
        if (active) setError(err?.error || 'Failed to load analytics');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = '/')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold text-gray-900">Platform activity</h2>
            {live && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-lg text-gray-600">
            Actions taken by every user across MediaVault
          </p>
        </div>

        {error && <ErrorMessage message={error} className="mb-6" />}

        {loading ? (
          <LoadingSpinner size="lg" className="py-12" />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {stats.total} total {stats.total === 1 ? 'event' : 'events'} recorded
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {summary.map((item) => (
                <div key={item.action} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-base font-semibold text-gray-700 mb-2">
                    {ACTION_TITLES[item.action] ?? item.action}
                  </h3>
                  <p className="text-4xl font-bold text-gray-900">{item.count}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <TopList
                title="Most viewed & added items"
                rows={stats.top_items.map((i) => ({ label: i.label, count: i.count }))}
                emptyText="No item activity yet"
                hint="Number of times each item was viewed, added to cart, or favorited."
              />
              <TopList
                title="Popular searches"
                rows={stats.top_searches.map((s) => ({ label: `“${s.term}”`, count: s.count }))}
                emptyText="No searches yet"
                hint="Number of times each term was searched."
              />
              <TopList
                title="Most active users"
                rows={stats.active_users.map((u) => ({ label: u.name, count: u.count }))}
                emptyText="No user activity yet"
                hint="Total actions each user has taken across the platform — views, searches, cart adds, and favorites combined."
              />
            </div>

            <section className="mt-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent activity</h3>

              {events.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-600">
                    No activity yet — once users browse, open items, or search, their
                    actions show up here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex justify-between items-center px-6 py-4"
                    >
                      <p className="text-sm text-gray-900">{describeEvent(event)}</p>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboardPage;
