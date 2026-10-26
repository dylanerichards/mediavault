import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartPage from './CartPage';
import { cartApi, favoritesApi } from '../services/api';
import type { Cart, MediaType, User } from '../types/api';

vi.mock('../services/api', () => ({
  cartApi: {
    getCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeFromCart: vi.fn(),
  },
  // Used by the Navbar count badges.
  favoritesApi: {
    getFavorites: vi.fn(),
  },
}));

vi.mock('../utils/analytics', () => ({
  trackRemoveFromCart: vi.fn(),
}));

const getCart = vi.mocked(cartApi.getCart);
const updateCartItem = vi.mocked(cartApi.updateCartItem);
const removeFromCart = vi.mocked(cartApi.removeFromCart);

const user: User = {
  id: 1,
  name: 'Casey',
  email: 'casey@example.com',
  role: 'customer',
  created_at: '2024-01-01T00:00:00Z',
};

const book = (id: number, title: string, price: number): MediaType => ({
  id,
  type: 'Book',
  title,
  price,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
});

const cartWithItems: Cart = {
  cart_items: [
    { id: 101, quantity: 2, total_price: 39.98, media_type: book(1, 'Dune', 19.99), created_at: '', updated_at: '' },
    { id: 102, quantity: 1, total_price: 9.99, media_type: book(2, 'Serial', 9.99), created_at: '', updated_at: '' },
  ],
  total_price: 49.97,
  total_items: 3,
};

const emptyCart: Cart = { cart_items: [], total_price: 0, total_items: 0 };

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCart.mockResolvedValue(cartWithItems);
    updateCartItem.mockResolvedValue(undefined);
    removeFromCart.mockResolvedValue(undefined);
    vi.mocked(favoritesApi.getFavorites).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists cart items and the total', async () => {
    render(<CartPage user={user} setUser={vi.fn()} />);

    expect(await screen.findByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('Serial')).toBeInTheDocument();
    expect(screen.getByText(/Total: \$49\.97/)).toBeInTheDocument();
  });

  it('updates quantity via the select', async () => {
    const u = userEvent.setup();
    render(<CartPage user={user} setUser={vi.fn()} />);

    const select = await screen.findByLabelText('Quantity for Dune');
    await u.selectOptions(select, '3');

    expect(updateCartItem).toHaveBeenCalledWith(101, 3);
  });

  it('removes an item when quantity is set to 0', async () => {
    const u = userEvent.setup();
    render(<CartPage user={user} setUser={vi.fn()} />);

    const select = await screen.findByLabelText('Quantity for Serial');
    await u.selectOptions(select, '0');

    expect(removeFromCart).toHaveBeenCalledWith(102);
  });

  it('clears the whole cart when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const u = userEvent.setup();
    render(<CartPage user={user} setUser={vi.fn()} />);

    await u.click(await screen.findByRole('button', { name: /clear cart/i }));

    await waitFor(() => {
      expect(removeFromCart).toHaveBeenCalledWith(101);
      expect(removeFromCart).toHaveBeenCalledWith(102);
    });
  });

  it('shows an empty state when there are no items', async () => {
    getCart.mockResolvedValue(emptyCart);
    render(<CartPage user={user} setUser={vi.fn()} />);

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear cart/i })).not.toBeInTheDocument();
  });
});
