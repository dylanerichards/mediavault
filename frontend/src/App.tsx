import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MediaCatalogPage from './pages/MediaCatalogPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import { useEffect, useState } from 'react';
import type { User } from './types/api';
import { getUserProfile } from './utils/AuthCalls';

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore the signed-in user from the persisted token on load, so a page
  // refresh doesn't drop the session.
  useEffect(() => {
    getUserProfile()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return null
  }

  return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
            <Route path="/media" element={<MediaCatalogPage user={user} setUser={setUser} />} />
            {/* Back-compat alias for the former books-only catalog */}
            <Route path="/books" element={<MediaCatalogPage user={user} setUser={setUser} />} />
            <Route
              path="/cart"
              element={
                user
                  ? <CartPage user={user} setUser={setUser} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/favorites"
              element={
                user
                  ? <FavoritesPage user={user} setUser={setUser} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/analytics"
              element={
                user?.role === 'admin'
                  ? <AnalyticsDashboardPage user={user} />
                  : <Navigate to="/" replace />
              }
            />
            <Route path="/login" element={<LoginPage user={user} setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage user={user} setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
