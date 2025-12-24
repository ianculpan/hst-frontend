import React from 'react';

const InvoiceLineItem = ({ item, index, onUpdateLineItem, onRemoveLineItem }) => {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor={`sku_line_${index}`}
            className="block text-gray-700 font-semibold text-xs mb-1"
          >
            SKU
          </label>
          <input
            id={`sku_line_${index}`}
            name="sku"
            type="text"
            value={item.sku}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 text-slate-700 rounded-lg bg-gray-100 text-xs"
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor={`description_line_${index}`}
            className="block text-gray-700 font-semibold text-xs mb-1"
          >
            Description
          </label>
          <input
            id={`description_line_${index}`}
            name="description"
            type="text"
            value={item.lineDescription}
            onChange={(e) => onUpdateLineItem(index, 'lineDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-slate-700 rounded-lg bg-gray-100 text-xs"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor={`line_quantity_${index}`}
            className="block text-gray-700 font-semibold text-xs mb-1"
          >
            Quantity
          </label>
          <input
            id={`line_quantity_${index}`}
            name="lineQuantity"
            type="number"
            value={item.lineQuantity ?? 1}
            onChange={(e) => onUpdateLineItem(index, 'lineQuantity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-slate-700 rounded-lg bg-gray-100 text-xs"
          />
        </div>
        <div>
          <label
            htmlFor={`unitPrice_line_${index}`}
            className="block text-gray-700 font-semibold text-xs mb-1"
          >
            Unit Price
          </label>
          <input
            id={`unitPrice_line_${index}`}
            name="lineUnitPrice"
            type="number"
            value={item.lineUnitPrice}
            onChange={(e) => onUpdateLineItem(index, 'lineUnitPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-slate-700 rounded-lg bg-gray-100 text-xs"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label
              htmlFor={`line_total_line_${index}`}
              className="block text-gray-700 font-semibold text-xs mb-1"
            >
              Line Total
            </label>
            <input
              id={`line_total_line_${index}`}
              name="line_total"
              type="text"
              value={`£${parseFloat(item.lineQuantity * item.lineUnitPrice || 0).toFixed(2)}`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 text-slate-700 rounded-lg bg-gray-100 text-xs font-semibold"
            />
          </div>
          <button
            type="button"
            onClick={() => onRemoveLineItem(index)}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceLineItem;
