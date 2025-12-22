import React, { useState, useEffect, useRef } from 'react';
import { getApiEndpoint, apiClient } from '../helpers/apiHelper.js';

const ProductPicker = ({
  value,
  onChange,
  onProductSelect,
  placeholder = 'Search and select a product...',
  className = '',
  disabled = false,
  label = '',
  required = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch products based on search term
  const fetchProducts = async (search = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('per_page', '50'); // Get more results for selection

      const url = getApiEndpoint(`/products?${params.toString()}`);
      const response = await apiClient.get(url);

      if (response.data.items && Array.isArray(response.data.items)) {
        setProducts(response.data.items);
      } else if (Array.isArray(response.data.items)) {
        setProducts(response.data.items);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and search
  useEffect(() => {
    if (isOpen) {
      fetchProducts(searchTerm);
    }
  }, [isOpen, searchTerm]);

  // Set selected product when value changes
  useEffect(() => {
    if (value && products.length > 0) {
      const product = products.find((p) => p.id === value);
      if (product) {
        setSelectedProduct(product);
      }
    } else if (!value) {
      setSelectedProduct(null);
    }
  }, [value, products]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    onChange(product.id);
    // Pass the full product object to the parent
    if (onProductSelect) {
      onProductSelect(product);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedProduct(null);
    onChange('');
    if (onProductSelect) {
      onProductSelect(null);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const inputId = id || `product-picker-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={
              isOpen
                ? searchTerm
                : selectedProduct
                  ? `${selectedProduct.sku} - ${selectedProduct.description}`
                  : ''
            }
            data-testid="product-picker"
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
          />

          {/* Clear button */}
          {selectedProduct && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-38 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Dropdown arrow */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-gray-500 text-sm">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {searchTerm ? 'No products found' : 'Start typing to search products'}
              </div>
            ) : (
              <div className="py-1">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                      selectedProduct?.id === product.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-blue-50 text-gray-500'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-700-700 text-sm">{product.sku}</span>
                      <span className="text-xs text-gray-600 truncate">{product.description}</span>
                      <span className="text-xs text-gray-500">
                        £{parseFloat(product.salePrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPicker;
