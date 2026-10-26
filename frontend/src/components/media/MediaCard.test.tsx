import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaCard from './MediaCard';
import type { Book, Podcast } from '../../types/api';

const bookFixture: Book = {
  id: 1,
  type: 'Book',
  title: 'Dune',
  price: 19.99,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  isbn: '978-0441013593',
  publication_year: 1965,
  author: { id: 10, name: 'Frank Herbert' },
  publisher: { id: 20, name: 'Ace Books' },
};

const podcastFixture: Podcast = {
  id: 2,
  type: 'Podcast',
  title: 'The Daily',
  price: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  host: 'Michael Barbaro',
  episode_count: 1500,
};

describe('MediaCard', () => {
  describe('Book rendering', () => {
    it('renders title, author, ISBN, and a Book badge', () => {
      render(<MediaCard media={bookFixture} />);

      expect(screen.getByText('Dune')).toBeInTheDocument();
      expect(screen.getByText('Frank Herbert')).toBeInTheDocument();
      expect(screen.getByText(/ISBN:\s*978-0441013593/)).toBeInTheDocument();
      expect(screen.getByText('Book')).toBeInTheDocument();
    });
  });

  describe('Podcast rendering', () => {
    it('renders the host and episode count', () => {
      render(<MediaCard media={podcastFixture} />);

      expect(screen.getByText('Michael Barbaro')).toBeInTheDocument();
      expect(screen.getByText(/1500 episodes/)).toBeInTheDocument();
      expect(screen.getByText('Podcast')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onView with the media when the card body is clicked', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();
      render(<MediaCard media={bookFixture} onView={onView} />);

      await user.click(
        screen.getByRole('button', { name: 'View details for Dune' })
      );

      expect(onView).toHaveBeenCalledTimes(1);
      expect(onView).toHaveBeenCalledWith(bookFixture);
    });

    it('calls onAddToCart with the media id when "Add to Cart" is clicked', async () => {
      const user = userEvent.setup();
      const onAddToCart = vi.fn();
      render(<MediaCard media={bookFixture} onAddToCart={onAddToCart} />);

      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      expect(onAddToCart).toHaveBeenCalledTimes(1);
      expect(onAddToCart).toHaveBeenCalledWith(bookFixture.id);
    });

    it('shows an "Add to favorites" control when not favorited and toggles it', async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn();
      render(
        <MediaCard
          media={bookFixture}
          onToggleFavorite={onToggleFavorite}
          isFavorited={false}
        />
      );

      const btn = screen.getByRole('button', { name: 'Add to favorites' });
      await user.click(btn);

      expect(onToggleFavorite).toHaveBeenCalledWith(bookFixture);
    });

    it('shows a "Remove from favorites" control when already favorited', () => {
      render(
        <MediaCard
          media={bookFixture}
          onToggleFavorite={vi.fn()}
          isFavorited
        />
      );

      expect(
        screen.getByRole('button', { name: 'Remove from favorites' })
      ).toBeInTheDocument();
    });
  });
});
