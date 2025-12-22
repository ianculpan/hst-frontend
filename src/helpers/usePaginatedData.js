import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { getApiEndpoint, apiClient } from './apiHelper.js';

/**
 * Custom hook for fetching and managing paginated API data
 * Handles both paginated (with items/meta/links) and non-paginated responses
 *
 * @param {string} endpoint - API endpoint (e.g., '/products', '/contacts')
 * @param {object} filters - Filter object to be converted to query params
 * @param {array} filterDependencies - Array of filter values to watch for changes
 * @returns {object} { data, pagination, isLoading, errorMessage, fetchData, handlePageChange }
 */
export const usePaginatedData = (endpoint, filters = {}, filterDependencies = []) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });

  const fetchData = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page);

        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            params.append(key, value);
          }
        });

        const url = getApiEndpoint(`${endpoint}?${params.toString()}`);
        const response = await apiClient.get(url);

        // Handle paginated response with items/meta/links structure
        if (response.data && response.data.items && Array.isArray(response.data.items)) {
          setData(response.data.items);

          // Handle Laravel pagination structure where meta values might be arrays
          const meta = response.data.meta || {};
          setPagination({
            currentPage: Array.isArray(meta.current_page)
              ? meta.current_page[0]
              : meta.current_page || page,
            lastPage: Array.isArray(meta.last_page) ? meta.last_page[0] : meta.last_page || 1,
            perPage: Array.isArray(meta.per_page) ? meta.per_page[0] : meta.per_page || 10,
            total: Array.isArray(meta.total) ? meta.total[0] : meta.total || 0,
          });
        } else if (Array.isArray(response.data)) {
          // Fallback for non-paginated response (direct array)
          setData(response.data);
          setPagination({
            currentPage: 1,
            lastPage: 1,
            perPage: response.data.length,
            total: response.data.length,
          });
        } else {
          // Unexpected structure - log and set empty
          console.error('API returned unexpected data structure:', response.data);
          setData([]);
          setPagination({
            currentPage: 1,
            lastPage: 1,
            perPage: 10,
            total: 0,
          });
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        const message = error?.response?.data?.message || error?.message || 'Request failed';
        setErrorMessage(message);
        setData([]);
        setPagination({
          currentPage: 1,
          lastPage: 1,
          perPage: 10,
          total: 0,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, ...filterDependencies]
  );

  // Auto-fetch when filters change
  useEffect(() => {
    const controller = new AbortController();
    fetchData(1); // Reset to page 1 when filters change
    return () => controller.abort();
  }, [fetchData]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= pagination.lastPage) {
        fetchData(page);
      }
    },
    [fetchData, pagination.lastPage]
  );

  const refetch = useCallback(() => {
    fetchData(pagination.currentPage);
  }, [fetchData, pagination.currentPage]);

  return {
    data,
    pagination,
    isLoading,
    errorMessage,
    fetchData,
    handlePageChange,
    refetch,
  };
};
