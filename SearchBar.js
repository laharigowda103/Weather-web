

import React, { useState } from 'react';

const SearchBar = ({ onSearch, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && !loading) {
      onSearch(searchTerm.trim());
      setSearchTerm('');
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        placeholder="Search for a city..."
        value={searchTerm}
        onChange={handleInputChange}
        className="search-input"
        disabled={loading}
      />
      <button 
        type="submit" 
        className="search-btn"
        disabled={loading || !searchTerm.trim()}
      >
        {loading ? '...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchBar;