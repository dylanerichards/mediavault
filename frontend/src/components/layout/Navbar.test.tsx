import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import { cartApi, favoritesApi } from '../../services/api';
import { logout } from '../../utils/AuthCalls';
import { emitCartChanged } from '../../utils/appEvents';
import type { Cart, Favorite, User } from '../../types/api';

vi.mock('../../services/api', () => ({
  cartApi: { getCart: vi.fn() },
  favoritesApi: { getFavorites: vi.fn() },
}));

vi.mock('../../utils/AuthCalls', () => ({
  logout: vi.fn(),
}));

const getCart = vi.mocked(cartApi.getCart);
const getFavorites = vi.mocked(favoritesApi.getFavorites);

const customer: User = {
  id: 2,
  name: 'Casey',
  email: 'casey@example.com',
  role: 'customer',
  created_at: '2024-01-01T00:00:00Z',
};
const admin: User = { ...customer, id: 1, name: 'Admin', role: 'admin' };

const cart = (total_items: number): Cart => ({
  cart_items: [],
  total_price: 0,
  total_items,
});

const favoritesList = (n: number): Favorite[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    media_type: {
      id: i + 1,
      type: 'Book',
      title: `Book ${i + 1}`,
      price: 1,
      created_at: '',
      updated_at: '',
    },
    created_at: '',
  }));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCart.mockResolvedValue(cart(0));
    getFavorites.mockResolvedValue([]);
    vi.mocked(logout).mockResolvedValue(undefined);
  });

  it('shows cart and favorites counts from the API', async () => {
    getCart.mockResolvedValue(cart(3));
    getFavorites.mockResolvedValue(favoritesList(2));

    render(<Navbar user={customer} setUser={vi.fn()} />);

    expect(
      await screen.findByRole('button', { name: /cart \(3 items\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /favorites \(2\)/i })
    ).toBeInTheDocument();
  });

  it('shows the Analytics link only for admins', async () => {
    const { unmount } = render(<Navbar user={customer} setUser={vi.fn()} />);
    await screen.findByRole('button', { name: /cart/i });
    expect(
      screen.queryByRole('button', { name: /analytics/i })
    ).not.toBeInTheDocument();
    unmount();

    render(<Navbar user={admin} setUser={vi.fn()} />);
    expect(
      await screen.findByRole('button', { name: /analytics/i })
    ).toBeInTheDocument();
  });

  it('updates the cart count live when a cart-changed event fires', async () => {
    getCart.mockResolvedValue(cart(1));
    render(<Navbar user={customer} setUser={vi.fn()} />);

    await screen.findByRole('button', { name: /cart \(1 item\)/i });

    getCart.mockResolvedValue(cart(5));
    emitCartChanged();

    expect(
      await screen.findByRole('button', { name: /cart \(5 items\)/i })
    ).toBeInTheDocument();
  });

  it('logs out: calls logout and clears the user', async () => {
    const setUser = vi.fn();
    const u = userEvent.setup();
    render(<Navbar user={customer} setUser={setUser} />);

    await u.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(setUser).toHaveBeenCalledWith(null);
  });
});
