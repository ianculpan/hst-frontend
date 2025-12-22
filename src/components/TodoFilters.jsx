import React, { useState, useEffect, useRef } from 'react';
import { getApiEndpoint, apiClient } from '../helpers/apiHelper.js';

const TodoFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  showClosed,
  onToggleClosed,
  priorityOrder,
  onTogglePriorityOrder,
}) => {
  const [categories, setCategories] = useState({});
  const [statuses, setStatuses] = useState({});
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

  const fetchCategories = async () => {
    try {
      const url = getApiEndpoint('/settings?type=todo_categories');
      const response = await apiClient.get(url);
      setCategories(response.data || {});
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories({});
    }
  };

  const fetchStatuses = async () => {
    try {
      const url = getApiEndpoint('/settings?type=todo_status');
      const response = await apiClient.get(url);
      setStatuses(response.data || {});
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
      setStatuses({});
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatuses();
  }, []);

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setFilterMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-brand-100">Show Closed</label>
          <button
            onClick={onToggleClosed}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              showClosed ? 'bg-theme-600' : 'bg-brand-400'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showClosed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-brand-100">
            Priority: {priorityOrder === 'asc' ? 'Low to High' : 'High to Low'}
          </label>
          <button
            onClick={onTogglePriorityOrder}
            className="px-3 py-1 bg-theme-100 text-theme-700 rounded-lg hover:bg-theme-200 transition-colors text-sm font-medium"
            title={`Sort by priority ${priorityOrder === 'asc' ? 'high to low' : 'low to high'}`}
          >
            {priorityOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      <div className="relative" ref={filterMenuRef}>
        <button
          onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          className="px-4 bg-theme-300 text-theme-900 rounded-lg hover:bg-theme-200 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline mr-1"
          >
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
          </svg>
          Filter
        </button>
        {filterMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10 p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-brand-300 text-brand-800 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500"
                >
                  <option value="">All Status</option>
                  {statuses.todo_status &&
                    Object.entries(statuses.todo_status).map(([name, id]) => (
                      <option key={id} value={name}>
                        {name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-brand-300  text-stone-800 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500"
                >
                  <option value="">All Categories</option>
                  {categories.todo_categories &&
                    Object.entries(categories.todo_categories).map(([name, id]) => (
                      <option key={id} value={name}>
                        {name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-brand-300 text-brand-800 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500"
                >
                  <option value="">All Priorities</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Priority {i + 1}
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
    </div>
  );
};

export default TodoFilters;
