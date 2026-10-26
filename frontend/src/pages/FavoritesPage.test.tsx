import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesPage from './FavoritesPage';
import { favoritesApi, cartApi } from '../services/api';
import type { Favorite, MediaType, User } from '../types/api';

vi.mock('../services/api', () => ({
  favoritesApi: {
    getFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
  },
  // Used by the Navbar count badges.
  cartApi: {
    getCart: vi.fn(),
  },
}));

vi.mock('../utils/analytics', () => ({
  trackRemoveFromFavorite: vi.fn(),
}));

const getFavorites = vi.mocked(favoritesApi.getFavorites);
const removeFromFavorites = vi.mocked(favoritesApi.removeFromFavorites);

const user: User = {
  id: 1,
  name: 'Casey',
  email: 'casey@example.com',
  role: 'customer',
  created_at: '2024-01-01T00:00:00Z',
};

const media = (id: number, title: string): MediaType => ({
  id,
  type: 'Book',
  title,
  price: 12.5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
});

const favorites: Favorite[] = [
  { id: 201, media_type: media(1, 'Dune'), created_at: '' },
  { id: 202, media_type: media(2, 'Serial'), created_at: '' },
];

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFavorites.mockResolvedValue(favorites);
    removeFromFavorites.mockResolvedValue(undefined);
    vi.mocked(cartApi.getCart).mockResolvedValue({
      cart_items: [],
      total_price: 0,
      total_items: 0,
    });
  });

  it('lists the user favorites', async () => {
    render(<FavoritesPage user={user} setUser={vi.fn()} />);

    expect(await screen.findByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('Serial')).toBeInTheDocument();
  });

  it('removes a favorite and drops it from the list', async () => {
    const u = userEvent.setup();
    render(<FavoritesPage user={user} setUser={vi.fn()} />);

    await screen.findByText('Dune');
    const removeButtons = screen.getAllByRole('button', { name: /^remove$/i });
    await u.click(removeButtons[0]);

    expect(removeFromFavorites).toHaveBeenCalledWith(201);
    await waitFor(() => expect(screen.queryByText('Dune')).not.toBeInTheDocument());
    expect(screen.getByText('Serial')).toBeInTheDocument();
  });

  it('shows an empty state when there are no favorites', async () => {
    getFavorites.mockResolvedValue([]);
    render(<FavoritesPage user={user} setUser={vi.fn()} />);

    expect(await screen.findByText(/haven't favorited anything/i)).toBeInTheDocument();
  });
});
