import UoiSelect from './UoiSelect.jsx';

const ProductLine = ({
  item,
  index,
  itemCount,
  removeItem,
  handleItemChange,
  handleNewProductFieldChange,
  onRecalculatePrices,
}) => {
  return (
    <div>
      {' '}
      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-700">Product {index + 1}</span>
          {itemCount > 1 && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              data-testid="remove-product"
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor={`quantity_${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id={`quantity_${index}`}
              data-testid={`quantity_${index}`}
              name="quantity"
              value={item.quantity ?? 0}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              step="1"
              min="1"
              aria-label="Quantity"
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor={`allocatedCost_${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Allocated Cost (£) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id={`allocatedCost_${index}`}
              data-testid={`allocatedCost_${index}`}
              name="allocatedCost"
              value={item.allocatedCost}
              onChange={(e) => handleItemChange(index, 'allocatedCost', e.target.value)}
              step="0.01"
              min="0"
              aria-label="Allocated Cost (£)"
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-3 bg-white p-3 rounded border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={item.newProduct.sku}
                onChange={(e) => handleNewProductFieldChange(index, 'sku', e.target.value)}
                aria-label="SKU"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={item.newProduct.description}
                onChange={(e) => handleNewProductFieldChange(index, 'description', e.target.value)}
                aria-label="Description"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <UoiSelect
                value={item.newProduct.uoi}
                onChange={(e) => handleNewProductFieldChange(index, 'uoi', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={item.newProduct.taxRate}
                onChange={(e) => handleNewProductFieldChange(index, 'taxRate', e.target.value)}
                aria-label="Tax Rate (%)"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id={`show-markup-${index}`}
                type="checkbox"
                checked={item.newProduct.showMarkupFields}
                onChange={(e) =>
                  handleNewProductFieldChange(index, 'showMarkupFields', e.target.checked)
                }
              />
              <label htmlFor={`show-markup-${index}`} className="text-sm text-gray-700">
                Show markup settings
              </label>
            </div>
          </div>

          {item.newProduct.showMarkupFields && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retail Markup %
                </label>
                <input
                  type="number"
                  value={item.newProduct.retailMarkupPercent}
                  onChange={(e) =>
                    handleNewProductFieldChange(index, 'retailMarkupPercent', e.target.value)
                  }
                  aria-label="Retail Markup %"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Markup %
                </label>
                <input
                  type="number"
                  value={item.newProduct.discountMarkupPercent}
                  onChange={(e) =>
                    handleNewProductFieldChange(index, 'discountMarkupPercent', e.target.value)
                  }
                  aria-label="Discount Markup %"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Markup %</label>
                <input
                  type="number"
                  value={item.newProduct.minMarkupPercent}
                  onChange={(e) =>
                    handleNewProductFieldChange(index, 'minMarkupPercent', e.target.value)
                  }
                  aria-label="Min Markup %"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retail Price (£)
              </label>
              <input
                type="number"
                value={item.newProduct.salePrice}
                onChange={(e) => handleNewProductFieldChange(index, 'salePrice', e.target.value)}
                aria-label="Retail Price (£)"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price (£)
              </label>
              <input
                type="number"
                value={item.newProduct.discountPrice}
                onChange={(e) =>
                  handleNewProductFieldChange(index, 'discountPrice', e.target.value)
                }
                aria-label="Discount Price (£)"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Sale Price (£)
              </label>
              <input
                type="number"
                value={item.newProduct.minSalePrice}
                onChange={(e) => handleNewProductFieldChange(index, 'minSalePrice', e.target.value)}
                aria-label="Min Sale Price (£)"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => onRecalculatePrices(index)}
            >
              Recalculate from markup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductLine;
