import React, { useState, useEffect, useCallback } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    (searchQuery) => {
      const timeoutId = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);
      return timeoutId;
    },
    [onSearch]
  );

  useEffect(() => {
    const timeoutId = debouncedSearch(query);
    return () => clearTimeout(timeoutId);
  }, [query, debouncedSearch]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search images by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default SearchBar;