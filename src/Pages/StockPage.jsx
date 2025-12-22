import React, { useState, useEffect, useRef } from 'react';
import { apiClient, getApiEndpoint } from '../helpers/apiHelper.js';
import { usePaginatedData } from '../helpers/usePaginatedData.js';
import ProductPicker from '../components/ProductPicker.jsx';
import StockCard from '../components/StockCard.jsx';
import StockPurchaseModal from '../components/modals/StockPurchaseModal.jsx';
import BulkPurchaseModal from '../components/modals/BulkPurchaseModal.jsx';
import SimpleBulkPurchaseModal from '../components/modals/SimpleBulkPurchaseModal.jsx';
import { useModal } from '../components/modals/ModalContext.jsx';
import { productTypes } from '../helpers/data/productTypes.js';

const Stock = () => {
  const [form, setForm] = useState({
    productId: '',
    location: 'warehouse',
    quantity: '',
    reference: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    stocked: '',
  });

  const {
    data: rows,
    pagination,
    isLoading,
    errorMessage,
    handlePageChange,
    refetch,
  } = usePaginatedData('/stocks', filters, [
    filters.search,
    filters.location,
    filters.type,
    filters.stocked,
  ]);

  const { openModal, closeModal } = useModal();
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (productId) => {
    setForm((prev) => ({ ...prev, productId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        product_id: form.productId,
        location: form.location,
        quantity: form.quantity,
        type: 'IN',
        reference: form.reference,
        date: form.date,
      };
      const url = getApiEndpoint(`/stock-movements`);
      const res = await apiClient.post(url, payload);
      if (res.status === 201 || res.status === 200) {
        setForm((prev) => ({ ...prev, quantity: '', reference: '' }));
        // Refresh list and close modal
        refetch();
        closeModal();
      } else {
        // no-op: rely on server validation messages in future
      }
    } catch {
      // Intentionally suppressed; surface via toast in future
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleFilterChange = (key, value) => setFilters((p) => ({ ...p, [key]: value }));
  const clearFilters = () => {
    setFilters({ search: '', location: '', type: '', stocked: '' });
    setFilterMenuOpen(false);
  };

  const openBookInModal = (product) => {
    if (product?.id) setForm((prev) => ({ ...prev, productId: product.id }));
    openModal(
      <div className="bg-white">
        <h2 className="text-xl font-semibold mb-3">Book In</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-sm text-gray-700">
          <div>
            <ProductPicker value={form.productId} onChange={handleProductChange} label="Product" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Location</label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="warehouse">Warehouse</option>
                <option value="retail-display">Retail Display</option>
                <option value="retail-stock">Retail Stock</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Reference / Notes</label>
            <input
              type="text"
              name="reference"
              value={form.reference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.productId || !form.quantity}
              className={`px-6 py-2 text-white rounded-lg ${
                isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Booking...' : 'Book In'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const openPurchaseModal = (product) => {
    openModal(
      <StockPurchaseModal onClose={closeModal} onSuccess={refetch} preselectedProduct={product} />
    );
  };

  const openBulkPurchaseModal = () => {
    openModal(<BulkPurchaseModal onClose={closeModal} onSuccess={refetch} />);
  };

  const openSimpleBulkPurchaseModal = () => {
    openModal(<SimpleBulkPurchaseModal onClose={closeModal} onSuccess={refetch} />);
  };

  return (
    <div className="">
      <section className="panel rounded-lg py-4 gap-4">
        <div className="flex items-center justify-between" ref={filterMenuRef}>
          <h1 className="panel-title p-4 text-3xl text-center">Stock</h1>
          <div className="relative flex items-center gap-2 pr-2">
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="px-4 bg-highlight-background text-highlight-foreground rounded-lg hover:bg-highlight-hover transition-colors"
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
            <button
              className="px-4 bg-highlight-background text-highlight-foreground rounded-lg hover:bg-highlight-hover transition-colors"
              onClick={() => openSimpleBulkPurchaseModal()}
            >
              SimpleBulk Purchase
            </button>
            <button
              className="px-4 bg-highlight-background text-highlight-foreground rounded-lg hover:bg-highlight-hover transition-colors"
              onClick={() => openBulkPurchaseModal()}
            >
              Bulk Purchase
            </button>
            <button
              className="px-4 bg-highlight-background text-highlight-foreground rounded-lg hover:bg-highlight-hover transition-colors"
              onClick={() => openPurchaseModal()}
            >
              Purchase
            </button>
            <button
              className="px-4 bg-highlight-background text-highlight-foreground rounded-lg hover:bg-highlight-hover transition-colors"
              onClick={() => openBookInModal()}
            >
              Book In
            </button>
            {filterMenuOpen ? (
              <div className="absolute right-0 top-full mt-2 w-[90vw] sm:w-[480px] bg-white border rounded-lg shadow-lg z-10 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="SKU or description..."
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="retail-display">Retail Display</option>
                      <option value="retail-stock">Retail Stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      {productTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stocked</label>
                    <select
                      value={filters.stocked}
                      onChange={(e) => handleFilterChange('stocked', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      <option value="1">Stocked</option>
                      <option value="0">Non-stocked</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <button onClick={clearFilters} className="px-3 py-2 bg-gray-200 rounded-md">
                    Clear
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-4 pt-4">
          {isLoading && <div className="text-cyan-100">Loading...</div>}
          {!isLoading && errorMessage && <div className="text-red-300">Error: {errorMessage}</div>}

          {!isLoading && !errorMessage && rows && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {rows.map((item, idx) => (
                  <StockCard key={idx} item={item} onPurchase={openPurchaseModal} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.lastPage > 1 && (
                <div className="flex items-center justify-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from(
                      {
                        length: Math.min(5, pagination.lastPage),
                      },
                      (_, i) => {
                        let pageNum;
                        if (pagination.lastPage <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.lastPage - 2) {
                          pageNum = pagination.lastPage - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              pageNum === pagination.currentPage
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center mt-4 text-gray-300 text-sm">
                Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{' '}
                {pagination.total} stock items
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Stock;
