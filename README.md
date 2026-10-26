# MediaVault

A full-stack media catalog I built with a user-action analytics system at its
core. You can browse books and podcasts, favorite and cart them, and — as an
admin — watch what everyone is doing on a live analytics dashboard.

- **Backend**: Rails 8 API (SQLite, JWT auth, RSpec)
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 (Vitest + Testing Library)

I started from the "BookVault" interview starter, whose task was to build a
**user-action tracking system** (book views, search activity, and other
interactions). That system is the heart of what I built here. Along the way I generalized the app from books-only to a media
catalog and rounded it out with the pages and controls it needed to actually
reach its features — several of those changes weren't asked for by the brief,
but I made them so the app hangs together and its functionality is discoverable.

## What I built

### The action-tracking system (the core task)

I store every tracked action server-side with full context — the user, the
action type, the target resource, the search term (for searches), and a precise
timestamp — in an `analytics_events` table, and expose it through a REST API plus
a live stream.

The actions I track:

- **Item views** — opening a book or podcast (see "clickable items" below)
- **Searches** — the catalog search term
- **Add / remove from cart**
- **Add / remove from favorites**

I surface all of this on an **admin-only analytics dashboard** as platform-wide
data: per-action totals, behavior stats (most viewed/added items, popular search
terms, most active users), and a recent-activity feed I render as readable
"User X did Y at <time>" lines. It updates **live over Server-Sent Events** (the
"real-time tracking" bonus), falling back gracefully to the data loaded on page
open.

### Domain generalization — why

The starter modeled only `Book`. To track "item views" and let the catalog grow
beyond books, I needed a more general shape, so I made `Book` a subclass of a
`MediaType` STI base and added `Podcast` as a second type. I generalized cart and
favorites from `book_id` to `media_type_id` so anything in the catalog can be
carted or favorited, and turned the books endpoint into a unified `/media_types`
API that lists, filters by type, and manages any subclass. Adding a third media
type is now a subclass plus one entry in an allow-list.

### Cohesion & accessibility improvements — why

Several features existed in the API but had no way to reach them in the UI, and a
few flows were unfinished. These weren't in the brief — I added them so the app
is coherent and its features are actually usable:

- **Clickable items + detail modal** — items weren't clickable, so a "view"
  couldn't be observed. I made each card open a details modal on click, which
  logs the view.
- **Catalog media-type filter** and a home page that routes into Books, Podcasts,
  or everything.
- **Cart and Favorites pages** with a shared **navbar** (the only entry point that
  previously existed was unreachable). The navbar shows **live item-count badges**
  for cart and favorites that update the moment something changes.
- **Favorites toggle** on each card (can't be favorited twice).
- **Cart quantity selector** — once an item is in the cart, I turn the "Add"
  button into a quantity selector; re-adding increments rather than duplicating,
  and selecting 0 removes it. A **Clear cart** button empties the cart.
- **Session persistence** — refreshing no longer logs you out; I restore the
  session from the stored token on load.
- **Finished auth** — I implemented the login and register forms (previously
  stubs) with validation.
- **Rebrand** to MediaVault to reflect the broader catalog.

### Quality

- **Performance**: the catalog list eager-loads author/publisher to avoid an N+1,
  and analytics summaries use grouped queries.
- **Error handling**: a consistent JSON error envelope, model validations, and
  auth guards (401 unauthenticated, 403 for non-admins on analytics).
- **Tests**: 135 backend examples (RSpec) and 59 frontend tests (Vitest) covering
  the new models, endpoints, components, pages, and flows.

## Setup

Prerequisites: Ruby 3.4, Node 22, SQLite 3.

```bash
# Backend (terminal 1)
cd backend
bundle install
bin/rails db:setup   # create, migrate, and seed
bin/rails server     # http://localhost:3000

# Frontend (terminal 2)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Open the app at **http://localhost:5173**. The API runs on port 3000.

### Seeded accounts

| Role     | Email                      | Password      |
| -------- | -------------------------- | ------------- |
| Admin    | `admin@bookvault.com`      | `password123` |
| Admin    | `dylanerichards@gmail.com` | `password123` |
| Customer | printed by the seed script | `password123` |

Admins see the Analytics dashboard; customers do not.

## Testing

```bash
# Backend
cd backend && bundle exec rspec

# Frontend
cd frontend && npx vitest run
npm run build        # type-check + production build
```

## API overview

All endpoints are under `/api/v1` and require a `Bearer` token except login/register.

| Method | Path                       | Notes                                        |
| ------ | -------------------------- | -------------------------------------------- |
| POST   | `/auth/login` `/auth/register` | returns `{ user, token }`                |
| GET    | `/media_types`             | list; filter by `type`, `search`, author, publisher |
| GET/POST/PATCH/DELETE | `/media_types[/:id]` | manage media (admin for writes)        |
| GET/POST/DELETE | `/favorites[/:id]` | the current user's favorites               |
| GET/POST/PATCH/DELETE | `/cart_items[/:id]` | the current user's cart             |
| POST   | `/analytics_events`        | record an action (any signed-in user)        |
| GET    | `/analytics_events`        | list + summary + behavior stats (**admin only**) |
| GET    | `/analytics_events/stream` | SSE live stream of actions (**admin only**)  |

## How I addressed the evaluation criteria

- **System design** — `MediaType` STI with `Book`/`Podcast`; analytics as a
  first-class, fully-contextual event model.
- **Database design** — a reversible STI migration, `media_type_id` join tables
  with FKs, and an indexed `analytics_events` table (action,
  `[target_type, target_id]`, user).
- **API design** — RESTful, a consistent envelope, a pagination helper, and an
  extensible type allow-list.
- **Testing** — specs for every model, endpoint, component, and user flow I added.
- **Performance** — eager loading to remove the catalog N+1; grouped-query stats.
- **Error handling** — validations, `RecordNotFound`→404, admin→403, JWT→401.
- **Bonus** — the analytics dashboard (most-viewed, popular searches, activity
  patterns) and real-time streaming via SSE.
