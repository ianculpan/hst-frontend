import React, { useState, useRef, useEffect } from 'react';
import { productTypes } from '../helpers/data/productTypes.js';

const ProductFilters = ({ filters, onFilterChange, onClearFilters }) => {
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

  const handleStockedChange = (value) => {
    onFilterChange('stocked', value);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setFilterMenuOpen(false);
  };

  const uoiOptions = [
    { value: 'each', label: 'Each' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'l', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
    { value: 'set', label: 'Set' },
    { value: 'hour', label: 'Hour' },
    { value: 'day', label: 'Day' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

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
                placeholder="Search SKU or description..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-brand-300 text-brand-800 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">Product Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-brand-300 text-brand-800 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500"
              >
                <option value="">All Types</option>
                {productTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">Stock Status</label>
              <select
                value={filters.stocked ?? ''}
                onChange={(e) => handleStockedChange(e.target.value)}
                className="w-full px-3 py-2 border border-brand-300 text-brand-800 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500"
              >
                <option value="">All</option>
                <option value="1">Stocked</option>
                <option value="0">Non-stocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">Unit of Issue</label>
              <select
                value={filters.uoi || ''}
                onChange={(e) => handleFilterChange('uoi', e.target.value)}
                className="w-full px-3 py-2 border border-brand-300 text-brand-800 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500"
              >
                <option value="">All UOIs</option>
                {uoiOptions.map((uoi) => (
                  <option key={uoi.value} value={uoi.value}>
                    {uoi.label}
                  </option>
                ))}
              </select>
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

export default ProductFilters;
