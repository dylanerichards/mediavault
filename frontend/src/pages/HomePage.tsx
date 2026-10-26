import React from 'react';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import type { User } from '../types/api';

interface HomePageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, setUser }) => {
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to MediaVault</h1>
          <p className="text-lg text-gray-600 mb-8">Your digital media catalog — books, podcasts, and more</p>
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
      <Navbar user={user} setUser={setUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Browse and manage your media catalog
          </p>

          <Button onClick={() => window.location.href = '/media'}>
            Browse All Media
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Books</h3>
              <p className="text-gray-600 mb-4">Browse the book collection</p>
              <Button onClick={() => window.location.href = '/media?type=Book'}>
                Browse Books
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Podcasts</h3>
              <p className="text-gray-600 mb-4">Browse the podcast collection</p>
              <Button onClick={() => window.location.href = '/media?type=Podcast'}>
                Browse Podcasts
              </Button>
            </div>

            {user?.role === 'admin' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600 mb-4">View platform-wide activity and events</p>
                <Button variant="outline" onClick={() => window.location.href = '/analytics'}>
                  View Analytics
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
