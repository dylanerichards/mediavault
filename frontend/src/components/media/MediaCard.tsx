import React from 'react';
import type { MediaType } from '../../types/api';
import Button from '../ui/Button';

interface MediaCardProps {
  media: MediaType;
  onAddToCart?: (id: number) => void;
  /** Current quantity in the cart; when > 0 the card shows a quantity select. */
  cartQuantity?: number;
  onUpdateQuantity?: (media: MediaType, quantity: number) => void;
  onToggleFavorite?: (media: MediaType) => void;
  isFavorited?: boolean;
  onView?: (media: MediaType) => void;
}

const typeBadgeClasses: Record<string, string> = {
  Book: 'bg-blue-100 text-blue-800',
  Podcast: 'bg-purple-100 text-purple-800',
};

const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onAddToCart,
  cartQuantity = 0,
  onUpdateQuantity,
  onToggleFavorite,
  isFavorited = false,
  onView
}) => {
  const inCart = cartQuantity > 0;
  const maxQty = Math.max(10, cartQuantity);
  const badgeClass = typeBadgeClasses[media.type] ?? 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 flex flex-col h-full">
      <button
        type="button"
        onClick={() => onView?.(media)}
        disabled={!onView}
        className="flex-1 text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md disabled:cursor-default"
        aria-label={`View details for ${media.title}`}
      >
        <div className="mb-4">
          <span
            className={`inline-block px-2 py-0.5 mb-2 text-xs font-semibold rounded-full ${badgeClass}`}
          >
            {media.type}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {media.title}
          </h3>

          {media.type === 'Book' && (
            <>
              <p className="text-sm text-gray-600 mb-1">
                by <span className="font-medium">{media.author?.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Published by {media.publisher?.name} ({media.publication_year})
              </p>
            </>
          )}

          {media.type === 'Podcast' && (
            <>
              <p className="text-sm text-gray-600 mb-1">
                Hosted by <span className="font-medium">{media.host}</span>
              </p>
              <p className="text-sm text-gray-500">
                {media.episode_count} episodes
              </p>
            </>
          )}
        </div>
      </button>

      <div className="mb-4">
        {media.type === 'Book' && (
          <p className="text-xs text-gray-500 mb-2">ISBN: {media.isbn}</p>
        )}
        <p className="text-2xl font-bold text-blue-600">
          ${media.price.toFixed(2)}
        </p>
      </div>

      <div className="flex gap-2 mt-auto">
        {inCart && onUpdateQuantity ? (
          <div className="flex-1 flex items-center gap-2">
            <label htmlFor={`qty-${media.id}`} className="text-sm text-gray-600">
              In cart
            </label>
            <select
              id={`qty-${media.id}`}
              value={cartQuantity}
              onChange={(e) => onUpdateQuantity(media, parseInt(e.target.value, 10))}
              aria-label={`Quantity for ${media.title}`}
              className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: maxQty + 1 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? '0 (remove)' : n}
                </option>
              ))}
            </select>
          </div>
        ) : (
          onAddToCart && (
            <Button
              onClick={() => onAddToCart(media.id)}
              className="flex-1"
              size="sm"
            >
              Add to Cart
            </Button>
          )
        )}
        {onToggleFavorite && (
          <Button
            onClick={() => onToggleFavorite(media)}
            variant={isFavorited ? 'danger' : 'outline'}
            size="sm"
            className="px-3"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? '♥' : '♡'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MediaCard;
