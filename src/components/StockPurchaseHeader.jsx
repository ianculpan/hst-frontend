import ContactPicker from './ContactPicker.jsx';

const StockPurchaseHeader = ({ form, handleFormChange, handleContactChange }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h3 className="font-semibold text-gray-700">Purchase Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ContactPicker
            value={form.contactId}
            onChange={handleContactChange}
            placeholder="Search a supplier..."
            label="Contact (Supplier)"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Total Cost (£) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="totalCost"
            value={form.totalCost}
            onChange={handleFormChange}
            step="0.01"
            min="0"
            data-testid="total-cost"
            aria-label="Total Cost (£)"
            required
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <select
            name="location"
            value={form.location}
            onChange={handleFormChange}
            data-testid="location"
            aria-label="Location"
            required
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="warehouse">Warehouse</option>
            <option value="retail-display">Retail Display</option>
            <option value="retail-stock">Retail Stock</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleFormChange}
            aria-label="Date"
            required
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1 text-gray-700">Description / Notes</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleFormChange}
          rows={2}
          placeholder="e.g., Invoice #12345, Box of mixed items, etc."
          aria-label="Description / Notes"
          className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default StockPurchaseHeader;
