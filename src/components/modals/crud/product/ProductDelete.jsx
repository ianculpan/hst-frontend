import React, { useState } from 'react';
import { apiClient } from '../../../../helpers/apiHelper.js';

const ProductDelete = ({ item, closeModal, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await apiClient.delete(`/products/${item.id}`);

      if (response.status === 200 || response.status === 204) {
        // Call the update callback with deletion info
        if (onUpdate) {
          onUpdate({
            ...item,
            deleted: true,
          });
        }
        closeModal();
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to delete product';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xl w-full max-w-md">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-3">
        Delete Product
      </h2>

      <div className="text-center mb-6">
        <div className="text-red-600 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-gray-700 mb-2">Are you sure you want to delete this product?</p>
        <div className="bg-gray-50 p-3 rounded-lg text-left">
          <p className="font-semibold text-gray-800">{item.sku}</p>
          <p className="text-sm text-gray-600">{item.description}</p>
          <p className="text-sm text-gray-600">
            Type: {item.type} | UOI: {item.uoi}
          </p>
          <p className="text-sm text-gray-600">
            Sale Price: £{parseFloat(item.salePrice || 0).toFixed(2)}
          </p>
        </div>
        <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
      </div>

      {errorMessage && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{errorMessage}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={closeModal}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Deleting...' : 'Delete Product'}
        </button>
      </div>
    </div>
  );
};

export default ProductDelete;
