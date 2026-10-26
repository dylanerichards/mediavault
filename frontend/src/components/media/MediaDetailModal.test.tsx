import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaDetailModal from './MediaDetailModal';
import type { Book } from '../../types/api';

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

describe('MediaDetailModal', () => {
  it('renders nothing when media is null', () => {
    const { container } = render(
      <MediaDetailModal media={null} onClose={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and detail values for a media fixture', () => {
    render(<MediaDetailModal media={bookFixture} onClose={() => {}} />);

    expect(
      screen.getByRole('heading', { name: 'Dune' })
    ).toBeInTheDocument();
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument();
    expect(screen.getByText('Ace Books')).toBeInTheDocument();
    expect(screen.getByText('1965')).toBeInTheDocument();
    expect(screen.getByText('978-0441013593')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  it('calls onClose when a "Close" button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MediaDetailModal media={bookFixture} onClose={onClose} />);

    // Both the footer button and the × icon button are labelled "Close".
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);

    await user.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(closeButtons[closeButtons.length - 1]);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
