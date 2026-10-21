import React from 'react';
import type { Book } from '../../types/api';
import Button from '../ui/Button';

interface BookCardProps {
  book: Book;
  onAddToCart?: (bookId: number) => void;
  onAddToFavorites?: (bookId: number) => void;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onAddToCart,
  onAddToFavorites
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 flex flex-col h-full">
      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            by <span className="font-medium">{book.author.name}</span>
          </p>
          <p className="text-sm text-gray-500">
            Published by {book.publisher.name} ({book.publication_year})
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">ISBN: {book.isbn}</p>
        <p className="text-2xl font-bold text-blue-600">
          ${book.price.toFixed(2)}
        </p>
      </div>

      <div className="flex gap-2 mt-auto">
        {onAddToCart && (
          <Button
            onClick={() => onAddToCart(book.id)}
            className="flex-1"
            size="sm"
          >
            Add to Cart
          </Button>
        )}
        {onAddToFavorites && (
          <Button
            onClick={() => onAddToFavorites(book.id)}
            variant="outline"
            size="sm"
            className="px-3"
          >
            ♥
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookCard;