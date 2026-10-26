/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Button from '../components/ui/Button';
import { favoritesApi } from '../services/api';
import { trackRemoveFromFavorite } from '../utils/analytics';
import type { Favorite, User } from '../types/api';

interface FavoritesPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ user, setUser }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setFavorites(await favoritesApi.getFavorites());
      setError('');
    } catch (err: any) {
      setError(err?.error || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (favorite: Favorite) => {
    try {
      await favoritesApi.removeFromFavorites(favorite.id);
      trackRemoveFromFavorite(favorite.media_type);
      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
    } catch (err: any) {
      alert(err?.error || 'Failed to remove favorite');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} setUser={setUser} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Favorites</h1>

        {error && <ErrorMessage message={error} className="mb-6" />}

        {loading ? (
          <LoadingSpinner size="lg" className="py-12" />
        ) : favorites.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-4">You haven't favorited anything yet.</p>
            <Button onClick={() => (window.location.href = '/media')}>Browse the catalog</Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="flex justify-between items-center px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{favorite.media_type.title}</p>
                  <p className="text-sm text-gray-500">
                    {favorite.media_type.type} · ${favorite.media_type.price.toFixed(2)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleRemove(favorite)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
