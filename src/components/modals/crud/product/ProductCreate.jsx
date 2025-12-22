import React, { useState } from 'react';
import { apiClient } from '../../../../helpers/apiHelper.js';
import UoiSelect from '../../../UoiSelect.jsx';
import { productTypes } from '../../../../helpers/data/productTypes.js';

const ProductCreate = ({ closeModal, onUpdate }) => {
  const [formData, setFormData] = useState({
    sku: '',
    description: '',
    type: '',
    uoi: '',
    salePrice: '',
    discountPrice: '',
    minSalePrice: '',
    taxRate: 20,
  });

  const [formStatus, setFormStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormStatus('');

    try {
      const response = await apiClient.post('/products', formData);

      // Handle successful response
      if (response.status === 201) {
        setFormStatus('success');
        // Call the update callback with the new item data
        if (onUpdate) {
          onUpdate({
            id: response.data.id,
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        setTimeout(() => {
          closeModal();
        }, 1000);
      }
    } catch (error) {
      // Handle server-side validation or other errors
      const errorMessage = error?.response?.data?.message || 'An unexpected error occurred.';
      setFormStatus(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-3">
        Create Product
      </h2>

      {/* Display success message */}
      {formStatus === 'success' && (
        <div className="p-4 mb-3 text-sm text-green-700 bg-green-100 rounded-lg">
          Product created successfully.
        </div>
      )}

      {/* Display error message */}
      {formStatus !== 'success' && formStatus !== '' && (
        <div className="p-4 mb-3 text-sm text-red-700 bg-red-100 rounded-lg">{formStatus}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="sku" className="block text-gray-700 font-semibold">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-gray-700 font-semibold">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value="">Select Type</option>
              {productTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-semibold">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <UoiSelect value={formData.uoi} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="taxRate" className="block text-gray-700 font-semibold">
              Tax Rate (%)
            </label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              value={formData.taxRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="salePrice" className="block text-gray-700 font-semibold">
              Sale Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">£</span>
              <input
                type="number"
                id="salePrice"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="discountPrice" className="block text-gray-700 font-semibold">
              Discount Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">£</span>
              <input
                type="number"
                id="discountPrice"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="minSalePrice" className="block text-gray-700 font-semibold">
              Min Sale Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">£</span>
              <input
                type="number"
                id="minSalePrice"
                name="minSalePrice"
                value={formData.minSalePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-6 py-2 font-semibold text-white rounded-lg transition duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductCreate;
