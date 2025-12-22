import React from 'react';
import InvoiceLineItem from './InvoiceLineItem.jsx';
import ProductPicker from './ProductPicker.jsx';

const InvoiceLines = ({
  lineItems,
  onAddLineItem,
  onUpdateLineItem,
  onRemoveLineItem,
  calculateTotals,
}) => {
  const [selectedProductId, setSelectedProductId] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  return (
    <div className="border-t pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Line Items</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ProductPicker
            value={selectedProductId}
            onChange={setSelectedProductId}
            onProductSelect={setSelectedProduct}
            placeholder="Search and select a product..."
            className="w-full sm:w-64 md:w-80 lg:w-96"
          />
          <button
            type="button"
            onClick={() => {
              if (selectedProduct) {
                onAddLineItem(selectedProduct);
                setSelectedProductId(''); // Clear selection after adding
                setSelectedProduct(null); // Clear selected product
              }
            }}
            className="flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={!selectedProduct}
          >
            Add Line Item
          </button>
        </div>
      </div>

      {lineItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No line items added yet. You can save the invoice header now and add line items later, or
          click "Add Line Item" to get started.
        </div>
      )}

      {lineItems.map((item, index) => (
        <InvoiceLineItem
          key={index}
          item={item}
          index={index}
          onUpdateLineItem={onUpdateLineItem}
          onRemoveLineItem={onRemoveLineItem}
        />
      ))}

      {/* Totals */}
      <div className="text-right space-y-2">
        <div className="text-lg text-gray-700">
          Net Total: £{calculateTotals().netTotal.toFixed(2)}
        </div>
        <div className="text-lg text-gray-700">
          Tax Total: £{calculateTotals().taxTotal.toFixed(2)}
        </div>
        <div className="text-2xl font-bold text-gray-800 border-t pt-2">
          Gross Total: £{calculateTotals().grossTotal.toFixed(2)}
        </div>
        {lineItems.length === 0 && (
          <div className="text-sm text-gray-500 italic">No line items - totals will be £0.00</div>
        )}
      </div>
    </div>
  );
};

export default InvoiceLines;
