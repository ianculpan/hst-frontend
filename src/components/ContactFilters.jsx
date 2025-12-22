import React, { useState, useRef, useEffect } from 'react';

const ContactFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  // Close filter menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setFilterMenuOpen(false);
      }
    }
    if (filterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterMenuOpen]);

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setFilterMenuOpen(false);
  };

  return (
    <div className="relative" ref={filterMenuRef}>
      <button
        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
        className="px-4 bg-theme-300 text-theme-900 rounded-lg hover:bg-theme-200 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="inline mr-1">
          <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
        </svg>
        Filter
      </button>
      {filterMenuOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-10 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search account number, business name, or contact name..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-brand-300 text-brand-800 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500"
              />
            </div>
            <button
              onClick={handleClearFilters}
              className="w-full px-3 py-2 bg-brand-200 text-brand-700 rounded-md hover:bg-brand-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactFilters;
