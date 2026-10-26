/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Button from '../components/ui/Button';
import { cartApi } from '../services/api';
import { trackRemoveFromCart } from '../utils/analytics';
import type { Cart, CartItem, User } from '../types/api';

interface CartPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const CartPage: React.FC<CartPageProps> = ({ user, setUser }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const items = cart?.cart_items ?? [];

  const load = async () => {
    try {
      setLoading(true);
      setCart(await cartApi.getCart());
      setError('');
    } catch (err: any) {
      setError(err?.error || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Selecting 0 removes the line; any other value updates its quantity.
  const handleQuantityChange = async (item: CartItem, quantity: number) => {
    try {
      if (quantity <= 0) {
        await cartApi.removeFromCart(item.id);
        trackRemoveFromCart(item.media_type);
      } else {
        await cartApi.updateCartItem(item.id, quantity);
      }
      await load();
    } catch (err: any) {
      alert(err?.error || 'Failed to update cart');
    }
  };

  const handleClear = async () => {
    if (items.length === 0) return;
    if (!window.confirm('Remove all items from your cart?')) return;
    try {
      await Promise.all(items.map((item) => cartApi.removeFromCart(item.id)));
      items.forEach((item) => trackRemoveFromCart(item.media_type));
      await load();
    } catch (err: any) {
      alert(err?.error || 'Failed to clear cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} setUser={setUser} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          {items.length > 0 && (
            <Button variant="outline" onClick={handleClear}>
              Clear cart
            </Button>
          )}
        </div>

        {error && <ErrorMessage message={error} className="mb-6" />}

        {loading ? (
          <LoadingSpinner size="lg" className="py-12" />
        ) : items.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-4">Your cart is empty.</p>
            <Button onClick={() => (window.location.href = '/media')}>Browse the catalog</Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {items.map((item) => {
                const maxQty = Math.max(10, item.quantity);
                return (
                  <div key={item.id} className="flex justify-between items-center px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.media_type.title}</p>
                      <p className="text-sm text-gray-500">
                        {item.media_type.type} · ${item.media_type.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item, parseInt(e.target.value, 10))
                        }
                        aria-label={`Quantity for ${item.media_type.title}`}
                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: maxQty + 1 }, (_, i) => i).map((n) => (
                          <option key={n} value={n}>
                            {n === 0 ? '0 (remove)' : n}
                          </option>
                        ))}
                      </select>
                      <span className="font-semibold text-gray-900 w-20 text-right">
                        ${item.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-6">
              <span className="text-lg text-gray-600">
                {cart?.total_items ?? 0} item{(cart?.total_items ?? 0) === 1 ? '' : 's'}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                Total: ${(cart?.total_price ?? 0).toFixed(2)}
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CartPage;
