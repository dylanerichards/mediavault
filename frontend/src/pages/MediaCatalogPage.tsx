/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mediaTypesApi, authorsApi, publishersApi, cartApi, favoritesApi } from '../services/api';
import type { MediaType, Author, Publisher, PaginatedResponse, User } from '../types/api';
import Navbar from '../components/layout/Navbar';
import MediaCard from '../components/media/MediaCard';
import MediaDetailModal from '../components/media/MediaDetailModal';
import SearchBar from '../components/ui/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';
import {
  trackMediaView,
  trackSearch,
  trackAddToCart,
  trackAddToFavorite,
  trackRemoveFromCart,
  trackRemoveFromFavorite,
} from '../utils/analytics';

interface MediaCatalogPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const MediaCatalogPage: React.FC<MediaCatalogPageProps> = ({ user, setUser }) => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') ?? '';

  const [media, setMedia] = useState<PaginatedResponse<MediaType>>({ data: [], pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: 20, has_next: false, has_prev: false } });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  // Debounced copy of searchTerm that actually drives fetching, so we don't
  // hit the API on every keystroke.
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>(
    initialType === 'Book' || initialType === 'Podcast' ? initialType : ''
  );
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  // Map of favorited media id -> the Favorite record id (needed to un-favorite).
  const [favoriteIds, setFavoriteIds] = useState<Record<number, number>>({});
  // Map of media id -> its cart line ({ cart item id, quantity }).
  const [cartItems, setCartItems] = useState<Record<number, { id: number; quantity: number }>>({});

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params: Record<string, number | string> = {
        page: currentPage,
        per_page: 12
      };

      if (appliedSearch) {
        params.search = appliedSearch;
      }
      if (selectedType) {
        params.type = selectedType;
      }
      if (selectedAuthor) {
        params.author_id = parseInt(selectedAuthor);
      }
      if (selectedPublisher) {
        params.publisher_id = parseInt(selectedPublisher);
      }

      const response = await mediaTypesApi.getMediaTypes<MediaType>(params);
      setMedia(response);
      setError('');
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Failed to fetch media';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [authorsResponse, publishersResponse] = await Promise.all([
        authorsApi.getAuthors({ per_page: 100 }),
        publishersApi.getPublishers({ per_page: 100 })
      ]);
      setAuthors(authorsResponse.data);
      setPublishers(publishersResponse.data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const favs = await favoritesApi.getFavorites();
      const map: Record<number, number> = {};
      favs.forEach((f) => {
        map[f.media_type.id] = f.id;
      });
      setFavoriteIds(map);
    } catch {
      // Non-fatal: the catalog still works without favorite state.
    }
  };

  const loadCart = async () => {
    if (!user) return;
    try {
      const cart = await cartApi.getCart();
      const map: Record<number, { id: number; quantity: number }> = {};
      cart.cart_items.forEach((ci) => {
        map[ci.media_type.id] = { id: ci.id, quantity: ci.quantity };
      });
      setCartItems(map);
    } catch {
      // Non-fatal: the catalog still works without cart state.
    }
  };

  useEffect(() => {
    fetchFilters();
    loadFavorites();
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce the search box into appliedSearch (used for fetching + tracking).
  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedSearch, selectedType, selectedAuthor, selectedPublisher]);

  // Log a search action once the debounced term settles.
  useEffect(() => {
    if (appliedSearch) trackSearch(appliedSearch);
  }, [appliedSearch]);

  const handleViewMedia = (item: MediaType) => {
    setSelectedMedia(item);
    trackMediaView(item);
  };

  const handleAddToCart = async (id: number) => {
    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      await cartApi.addToCart(id, 1);
      const item = media.data.find((m) => m.id === id);
      if (item) trackAddToCart(item);
      // Refresh so the card switches to its quantity selector.
      await loadCart();
    } catch (error: any) {
      alert(error.error || 'Failed to add item to cart');
    }
  };

  // Once an item is in the cart, its quantity is adjusted here (not re-added).
  // Selecting 0 removes the item from the cart.
  const handleUpdateQuantity = async (item: MediaType, quantity: number) => {
    const entry = cartItems[item.id];
    if (!entry) return;
    try {
      if (quantity <= 0) {
        await cartApi.removeFromCart(entry.id);
        trackRemoveFromCart(item);
        setCartItems((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      } else {
        await cartApi.updateCartItem(entry.id, quantity);
        setCartItems((prev) => ({ ...prev, [item.id]: { ...entry, quantity } }));
      }
    } catch (error: any) {
      alert(error.error || 'Failed to update quantity');
    }
  };

  // Toggle a favorite: add if not already favorited, remove if it is. The
  // backend also enforces that an item can only be favorited once.
  const handleToggleFavorite = async (item: MediaType) => {
    if (!user) {
      alert('Please log in to manage favorites');
      return;
    }

    const existingFavoriteId = favoriteIds[item.id];

    try {
      if (existingFavoriteId) {
        await favoritesApi.removeFromFavorites(existingFavoriteId);
        trackRemoveFromFavorite(item);
        setFavoriteIds((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      } else {
        const favorite = await favoritesApi.addToFavorites(item.id);
        setFavoriteIds((prev) => ({ ...prev, [item.id]: favorite.id }));
        trackAddToFavorite(item);
      }
    } catch (error: any) {
      alert(error.error || 'Failed to update favorites');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    if (value === 'Podcast') {
      setSelectedAuthor('');
      setSelectedPublisher('');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedAuthor('');
    setSelectedPublisher('');
    setCurrentPage(1);
  };

  const showAuthorPublisher = selectedType === '' || selectedType === 'Book';
  const hasActiveFilters = Boolean(
    searchTerm || selectedType || selectedAuthor || selectedPublisher
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} setUser={setUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Media Catalog</h1>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title..."
              className="md:col-span-2"
            />

            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Media</option>
              <option value="Book">Books</option>
              <option value="Podcast">Podcasts</option>
            </select>

            {showAuthorPublisher && (
              <select
                value={selectedAuthor}
                onChange={(e) => {
                  setSelectedAuthor(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Authors</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            )}

            {showAuthorPublisher && (
              <select
                value={selectedPublisher}
                onChange={(e) => {
                  setSelectedPublisher(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Publishers</option>
                {publishers.map((publisher) => (
                  <option key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {media.pagination.total_count} results
              </p>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : (
        <>
          {media.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No media found</p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {media.data.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onAddToCart={handleAddToCart}
                    cartQuantity={cartItems[item.id]?.quantity}
                    onUpdateQuantity={handleUpdateQuantity}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorited={favoriteIds[item.id] !== undefined}
                    onView={handleViewMedia}
                  />
                ))}
              </div>

              <Pagination
                pagination={media.pagination}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </>
      )}

      <MediaDetailModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
      </main>
    </div>
  );
};

export default MediaCatalogPage;
