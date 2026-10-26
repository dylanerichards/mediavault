import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MediaCatalogPage from './MediaCatalogPage';
import {
  mediaTypesApi,
  authorsApi,
  publishersApi,
  cartApi,
  favoritesApi,
} from '../services/api';
import type { Book, Cart, Favorite, User } from '../types/api';

vi.mock('../services/api', () => ({
  mediaTypesApi: { getMediaTypes: vi.fn() },
  authorsApi: { getAuthors: vi.fn() },
  publishersApi: { getPublishers: vi.fn() },
  cartApi: {
    addToCart: vi.fn(),
    getCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeFromCart: vi.fn(),
  },
  favoritesApi: {
    getFavorites: vi.fn(),
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
  },
}));

vi.mock('../utils/analytics', () => ({
  trackMediaView: vi.fn(),
  trackSearch: vi.fn(),
  trackAddToCart: vi.fn(),
  trackAddToFavorite: vi.fn(),
}));

const user: User = {
  id: 1,
  name: 'Casey',
  email: 'casey@example.com',
  role: 'customer',
  created_at: '2024-01-01T00:00:00Z',
};

const book: Book = {
  id: 1,
  type: 'Book',
  title: 'Dune',
  price: 19.99,
  created_at: '',
  updated_at: '',
  isbn: '9780441013593',
  publication_year: 1965,
  author: { id: 10, name: 'Frank Herbert' },
  publisher: { id: 20, name: 'Ace Books' },
};

const pagination = {
  current_page: 1,
  total_pages: 1,
  total_count: 1,
  per_page: 12,
  has_next: false,
  has_prev: false,
};

const emptyCart: Cart = { cart_items: [], total_price: 0, total_items: 0 };
const cartWithItem: Cart = {
  cart_items: [
    { id: 101, quantity: 1, total_price: 19.99, media_type: book, created_at: '', updated_at: '' },
  ],
  total_price: 19.99,
  total_items: 1,
};
const favorite: Favorite = { id: 500, media_type: book, created_at: '' };

const renderPage = () =>
  render(
    <MemoryRouter>
      <MediaCatalogPage user={user} setUser={vi.fn()} />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authorsApi.getAuthors).mockResolvedValue({ data: [], pagination });
  vi.mocked(publishersApi.getPublishers).mockResolvedValue({ data: [], pagination });
  vi.mocked(mediaTypesApi.getMediaTypes).mockResolvedValue({ data: [book], pagination });
  vi.mocked(favoritesApi.getFavorites).mockResolvedValue([]);
  vi.mocked(favoritesApi.addToFavorites).mockResolvedValue(favorite);
  vi.mocked(favoritesApi.removeFromFavorites).mockResolvedValue(undefined);
  vi.mocked(cartApi.getCart).mockResolvedValue(emptyCart);
  vi.mocked(cartApi.addToCart).mockResolvedValue(undefined);
  vi.mocked(cartApi.updateCartItem).mockResolvedValue(undefined);
  vi.mocked(cartApi.removeFromCart).mockResolvedValue(undefined);
});

describe('MediaCatalogPage — favorite toggle', () => {
  it('adds then removes a favorite from a card', async () => {
    const u = userEvent.setup();
    renderPage();

    const addFav = await screen.findByRole('button', { name: 'Add to favorites' });
    await u.click(addFav);
    expect(favoritesApi.addToFavorites).toHaveBeenCalledWith(book.id);

    const removeFav = await screen.findByRole('button', { name: 'Remove from favorites' });
    await u.click(removeFav);
    expect(favoritesApi.removeFromFavorites).toHaveBeenCalledWith(favorite.id);
  });
});

describe('MediaCatalogPage — cart quantity flow', () => {
  it('switches Add to Cart to a quantity selector, then updates and removes', async () => {
    // Return an empty cart until the item is added, then return it with the item.
    let added = false;
    vi.mocked(cartApi.addToCart).mockImplementation(async () => {
      added = true;
    });
    vi.mocked(cartApi.getCart).mockImplementation(async () => (added ? cartWithItem : emptyCart));

    const u = userEvent.setup();
    renderPage();

    const addCart = await screen.findByRole('button', { name: /add to cart/i });
    await u.click(addCart);
    expect(cartApi.addToCart).toHaveBeenCalledWith(book.id, 1);

    // The card now shows a quantity selector.
    const qty = await screen.findByLabelText('Quantity for Dune');

    await u.selectOptions(qty, '3');
    expect(cartApi.updateCartItem).toHaveBeenCalledWith(101, 3);

    await u.selectOptions(qty, '0');
    expect(cartApi.removeFromCart).toHaveBeenCalledWith(101);
  });
});
