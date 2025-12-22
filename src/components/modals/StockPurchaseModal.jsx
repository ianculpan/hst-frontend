import React, { useState } from 'react';
import { apiClient, getApiEndpoint } from '../../helpers/apiHelper.js';
import ProductPicker from '../ProductPicker.jsx';
import ContactPicker from '../ContactPicker.jsx';

const StockPurchaseModal = ({ onClose, onSuccess, preselectedProduct }) => {
  const [form, setForm] = useState({
    productId: preselectedProduct?.id || '',
    contactId: '',
    location: 'warehouse',
    quantity: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (productId) => {
    setForm((prev) => ({ ...prev, productId }));
  };

  const handleContactChange = (contactId) => {
    setForm((prev) => ({ ...prev, contactId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        product_id: form.productId,
        contact_id: form.contactId,
        location: form.location,
        quantity: form.quantity,
        type: 'PURCHASE',
        description: form.description,
        date: form.date,
      };

      const url = getApiEndpoint(`/stock-movements`);
      const res = await apiClient.post(url, payload);

      if (res.status === 201 || res.status === 200) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage('Failed to record purchase');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to record purchase';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Purchase from Contact</h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <ProductPicker
            value={form.productId}
            onChange={handleProductChange}
            label="Product"
            required
          />
        </div>

        <div>
          <ContactPicker
            value={form.contactId}
            onChange={handleContactChange}
            placeholder="Search and select a supplier..."
            label="Contact (Supplier)"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="warehouse">Warehouse</option>
              <option value="retail-display">Retail Display</option>
              <option value="retail-stock">Retail Stock</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">Description / Notes</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., Box of 50 units, Invoice #12345, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !form.productId || !form.contactId || !form.quantity}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${
              isSubmitting || !form.productId || !form.contactId || !form.quantity
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Recording...' : 'Record Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockPurchaseModal;
