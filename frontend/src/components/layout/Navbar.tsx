import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import type { User } from '../../types/api';
import { logout } from '../../utils/AuthCalls';
import { cartApi, favoritesApi } from '../../services/api';
import { onCartChanged, onFavoritesChanged } from '../../utils/appEvents';

interface NavbarProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const Badge: React.FC<{ count: number }> = ({ count }) =>
  count > 0 ? (
    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-semibold rounded-full min-w-[1rem] h-4 px-1 flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

// Shared top navigation for the signed-in app pages.
const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Load counts on mount and refresh them live whenever the cart or favorites
  // change anywhere in the app.
  useEffect(() => {
    if (!user) {
      setCartCount(0);
      setFavoritesCount(0);
      return;
    }

    const refreshCart = async () => {
      try {
        const cart = await cartApi.getCart();
        setCartCount(cart.total_items);
      } catch {
        /* best-effort */
      }
    };

    const refreshFavorites = async () => {
      try {
        const favorites = await favoritesApi.getFavorites();
        setFavoritesCount(favorites.length);
      } catch {
        /* best-effort */
      }
    };

    refreshCart();
    refreshFavorites();

    const offCart = onCartChanged(refreshCart);
    const offFavorites = onFavoritesChanged(refreshFavorites);
    return () => {
      offCart();
      offFavorites();
    };
  }, [user]);

  const go = (path: string) => () => {
    window.location.href = path;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <button
            type="button"
            onClick={go('/')}
            className="text-2xl font-bold text-gray-900"
          >
            MediaVault
          </button>

          <nav className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={go('/media')}>
              Catalog
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={go('/cart')}
              aria-label={`Cart (${cartCount} item${cartCount === 1 ? '' : 's'})`}
              title="Cart"
            >
              <span className="relative inline-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
                <Badge count={cartCount} />
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={go('/favorites')}
              aria-label={`Favorites (${favoritesCount})`}
              title="Favorites"
            >
              <span className="relative inline-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                <Badge count={favoritesCount} />
              </span>
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={go('/analytics')}
                aria-label="Analytics"
                title="Analytics"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
              </Button>
            )}
            {user && (
              <span className="hidden sm:inline text-sm text-gray-600 ml-1">
                Hi, {user.name}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
