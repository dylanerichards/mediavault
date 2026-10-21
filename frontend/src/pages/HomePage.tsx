import React from 'react';
import Button from '../components/ui/Button';
import type { User } from '../types/api';
import { logout } from '../utils/AuthCalls';

interface HomePageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, setUser }) => {

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to BookVault</h1>
          <p className="text-lg text-gray-600 mb-8">Your digital book inventory management system</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/register'}>
              Register
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">BookVault</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Manage your book inventory efficiently
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Books</h3>
              <p className="text-gray-600 mb-4">Browse and manage your book collection</p>
              <Button onClick={() => window.location.href = '/books'}>
                Browse Books
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Favorites</h3>
              <p className="text-gray-600">View your favorite books</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cart</h3>
              <p className="text-gray-600">Manage your shopping cart</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;