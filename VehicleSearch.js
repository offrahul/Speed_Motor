import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import { vehicleAPI } from '../../services/api';

const VehicleSearch = ({ onSearch, placeholder = "Search vehicles...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  // Get search suggestions
  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery(
    ['vehicle-suggestions', query],
    () => vehicleAPI.getSearchSuggestions(query),
    {
      enabled: query.length >= 2,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('vehicleSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Load recent searches
  useEffect(() => {
    const savedRecent = localStorage.getItem('vehicleRecentSearches');
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('vehicleSearchHistory', JSON.stringify(newHistory));

    // Add to recent searches
    const newRecent = [searchQuery, ...recentSearches.filter(r => r !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('vehicleRecentSearches', JSON.stringify(newRecent));

    // Perform search
    onSearch(searchQuery);
    setIsOpen(false);
    setQuery('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    onSearch('');
  };

  const removeFromHistory = (searchTerm, e) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== searchTerm);
    setSearchHistory(newHistory);
    localStorage.setItem('vehicleSearchHistory', JSON.stringify(newHistory));
  };

  const removeFromRecent = (searchTerm, e) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter(r => r !== searchTerm);
    setRecentSearches(newRecent);
    localStorage.setItem('vehicleRecentSearches', JSON.stringify(newRecent));
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(e.target.value.length > 0);
            }}
            onFocus={() => setIsOpen(query.length > 0 || searchHistory.length > 0 || recentSearches.length > 0)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                <ClockIcon className="h-4 w-4 mr-2" />
                Recent Searches
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleSearch(search)}
                  >
                    <span className="text-sm text-gray-700">{search}</span>
                    <button
                      onClick={(e) => removeFromRecent(search, e)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                <ClockIcon className="h-4 w-4 mr-2" />
                Search History
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleSearch(search)}
                  >
                    <span className="text-sm text-gray-700">{search}</span>
                    <button
                      onClick={(e) => removeFromHistory(search, e)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {query.length >= 2 && (
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Suggestions
              </div>
              {isLoadingSuggestions ? (
                <div className="text-sm text-gray-500">Loading suggestions...</div>
              ) : suggestions && suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleSearch(suggestion.text)}
                    >
                      <div className="text-sm text-gray-700">{suggestion.text}</div>
                      {suggestion.count && (
                        <div className="text-xs text-gray-500">
                          {suggestion.count} vehicles found
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No suggestions found</div>
              )}
            </div>
          )}

          {/* Quick Search Options */}
          <div className="p-3 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Quick Search
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Available Vehicles',
                'New Arrivals',
                'Featured Vehicles',
                'Under $20k',
                'SUV',
                'Electric',
                'Hybrid',
                'Low Mileage'
              ].map((quickSearch) => (
                <button
                  key={quickSearch}
                  onClick={() => handleSearch(quickSearch)}
                  className="text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                >
                  {quickSearch}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSearch;


