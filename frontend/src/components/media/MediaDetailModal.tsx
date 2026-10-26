import React, { useEffect } from 'react';
import type { MediaType } from '../../types/api';
import Button from '../ui/Button';

interface MediaDetailModalProps {
  media: MediaType | null;
  onClose: () => void;
}

const typeBadgeClasses: Record<string, string> = {
  Book: 'bg-blue-100 text-blue-800',
  Podcast: 'bg-purple-100 text-purple-800',
};

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ media, onClose }) => {
  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!media) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [media, onClose]);

  if (!media) return null;

  const badgeClass = typeBadgeClasses[media.type] ?? 'bg-gray-100 text-gray-800';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${media.title} details`}
      >
        <div className="flex justify-between items-start mb-4">
          <span
            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}
          >
            {media.type}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">{media.title}</h2>

        <dl className="space-y-2 text-sm">
          {media.type === 'Book' && (
            <>
              <Detail label="Author" value={media.author?.name} />
              <Detail label="Publisher" value={media.publisher?.name} />
              <Detail label="Publication year" value={media.publication_year} />
              <Detail label="ISBN" value={media.isbn} />
            </>
          )}
          {media.type === 'Podcast' && (
            <>
              <Detail label="Host" value={media.host} />
              <Detail label="Episodes" value={media.episode_count} />
            </>
          )}
          <Detail label="Price" value={`$${media.price.toFixed(2)}`} />
        </dl>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium text-right">{value}</dd>
    </div>
  );
};

export default MediaDetailModal;
