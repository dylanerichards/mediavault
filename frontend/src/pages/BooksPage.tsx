/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { booksApi, authorsApi, publishersApi, cartApi, favoritesApi } from '../services/api';
import type { Book, Author, Publisher, PaginatedResponse, User } from '../types/api';
import BookCard from '../components/books/BookCard';
import SearchBar from '../components/ui/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';

interface BooksPageProps {
  user: User | null;
}

const BooksPage: React.FC<BooksPageProps> = ({ user }) => {
  const [books, setBooks] = useState<PaginatedResponse<Book>>({ data: [], pagination: { current_page: 1, total_pages: 1, total_count: 0, per_page: 20, has_next: false, has_prev: false } });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params: Record<string, number | string> = {
        page: currentPage,
        per_page: 12
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (selectedAuthor) {
        params.author_id = parseInt(selectedAuthor);
      }
      if (selectedPublisher) {
        params.publisher_id = parseInt(selectedPublisher);
      }

      const response = await booksApi.getBooks(params);
      setBooks(response);
      setError('');
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Failed to fetch books';
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


  useEffect(() => {
    fetchFilters();
    fetchBooks();
  }, []);

  const handleAddToCart = async (bookId: number) => {
    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      await cartApi.addToCart(bookId, 1);
      alert('Book added to cart!');
    } catch (error: any) {
      alert(error.error || 'Failed to add book to cart');
    }
  };

  const handleAddToFavorites = async (bookId: number) => {
    if (!user) {
      alert('Please log in to add favorites');
      return;
    }

    try {
      await favoritesApi.addToFavorites(bookId);
      alert('Book added to favorites!');
    } catch (error: any) {
      alert(error.error || 'Failed to add book to favorites');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAuthor('');
    setSelectedPublisher('');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Catalog</h1>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search books by title..."
              className="md:col-span-2"
            />

            <select
              value={selectedAuthor}
              onChange={(e) => {
                setSelectedAuthor(e.target.value);
                handleFilterChange();
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

            <select
              value={selectedPublisher}
              onChange={(e) => {
                setSelectedPublisher(e.target.value);
                handleFilterChange();
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
          </div>

          {(searchTerm || selectedAuthor || selectedPublisher) && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {books.pagination.total_count} results
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
          {books.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No books found</p>
              {(searchTerm || selectedAuthor || selectedPublisher) && (
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
                {books.data.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={handleAddToCart}
                    onAddToFavorites={handleAddToFavorites}
                  />
                ))}
              </div>

              <Pagination
                pagination={books.pagination}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BooksPage;