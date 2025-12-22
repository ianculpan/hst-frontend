import React, { useState, useEffect } from 'react';
import { apiClient, getApiEndpoint } from '../../../../helpers/apiHelper.js';
import ShortContact from '../../../ShortContact.jsx';

const StockView = ({ item, closeModal }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stockMovements, setStockMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'movements') {
      const fetchStockMovements = async () => {
        try {
          setIsLoading(true);
          setError('');
          // Fetch stock movements for this product and location
          const url = getApiEndpoint(
            `/stock-movements?product_id=${item.product_id}&location=${item.location}`
          );
          const response = await apiClient.get(url);
          // API returns { data: [...] }, so access response.data.data
          setStockMovements(response.data?.data || []);
        } catch (err) {
          console.error('Failed to fetch stock movements:', err);
          setError('Failed to load stock movements');
        } finally {
          setIsLoading(false);
        }
      };

      fetchStockMovements();
    }
  }, [activeTab, item.product_id, item.location]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'movements', label: 'Movements', icon: '📦' },
    { id: 'product', label: 'Product Info', icon: '🏷️' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    return value ? `£${parseFloat(value).toFixed(2)}` : '£0.00';
  };

  const getMovementTypeColor = (type) => {
    const colors = {
      PURCHASE: 'bg-green-100 text-green-800',
      SALE: 'bg-blue-100 text-blue-800',
      ADJUSTMENT: 'bg-yellow-100 text-yellow-800',
      RETURN: 'bg-purple-100 text-purple-800',
      TRANSFER: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
          <div className="text-sm text-gray-600 mb-1">Current Stock</div>
          <div className="text-3xl font-bold text-indigo-600">
            {parseFloat(item.quantity || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">{item.product?.uoi}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Location</div>
          <div className="text-2xl font-bold text-green-600">{item.location}</div>
          <div className="text-xs text-gray-500 mt-1">Storage location</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Value</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency((item.quantity || 0) * (item.product?.salePrice || 0))}
          </div>
          <div className="text-xs text-gray-500 mt-1">At sale price</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="font-semibold text-gray-700 mb-2">Product</div>
        <div className="text-xl text-indigo-600">{item.product?.sku}</div>
        <div className="text-gray-600 mt-1">{item.product?.description}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Created</div>
          <div className="text-gray-900">{formatDate(item.created_at)}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Last Updated</div>
          <div className="text-gray-900">{formatDate(item.updated_at)}</div>
        </div>
      </div>
    </div>
  );

  const renderProductInfo = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-600">SKU</div>
            <div className="text-lg text-gray-900">{item.product?.sku}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-600">Type</div>
            <div className="text-lg text-gray-900">{item.product?.type}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="text-sm font-semibold text-gray-600 mb-2">Description</div>
        <div className="text-gray-900">{item.product?.description}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-semibold text-gray-600">Unit of Issue</div>
          <div className="text-gray-900">{item.product?.uoi}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-semibold text-gray-600">Tax Rate</div>
          <div className="text-gray-900">{item.product?.taxRate}%</div>
        </div>
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Sale Price</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(item.product?.salePrice)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Standard retail price</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 mb-1">Discount Price</div>
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency(item.product?.discountPrice)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Promotional price</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-1">Minimum Price</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(item.product?.minSalePrice)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Lowest acceptable</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="text-sm font-semibold text-gray-600 mb-3">Stock Value Breakdown</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">At Sale Price:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency((item.quantity || 0) * (item.product?.salePrice || 0))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">At Discount Price:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency((item.quantity || 0) * (item.product?.discountPrice || 0))}
            </span>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="text-gray-600">At Minimum Price:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency((item.quantity || 0) * (item.product?.minSalePrice || 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMovements = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <div className="text-gray-500 mt-2">Loading movements...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">⚠️ {error}</div>
          <button
            onClick={() => setActiveTab('movements')}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : stockMovements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <div>No movements found for this stock item</div>
        </div>
      ) : (
        <div className="space-y-3">
          {stockMovements &&
            Array.isArray(stockMovements) &&
            stockMovements.map((movement, index) => (
              <div
                key={movement.id || index}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getMovementTypeColor(movement.type)}`}
                    >
                      {movement.type}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(movement.created_at)}</span>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        parseFloat(movement.quantity) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {parseFloat(movement.quantity) > 0 ? '+' : ''}
                      {parseFloat(movement.quantity || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {movement.contact && (
                    <div>
                      <span className="font-semibold text-gray-600">Contact:</span>
                      <div className="text-gray-900">
                        <ShortContact contact={movement.contact} />
                      </div>
                    </div>
                  )}

                  {movement.allocated_cost && (
                    <div>
                      <span className="font-semibold text-gray-600">Cost:</span>
                      <div className="text-gray-900">
                        {formatCurrency(movement.allocated_cost)}
                        {movement.unit_cost && (
                          <span className="text-gray-500 text-xs ml-2">
                            ({formatCurrency(movement.unit_cost)}/unit)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {movement.description && (
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-600">Description:</span>
                      <div className="text-gray-900">{movement.description}</div>
                    </div>
                  )}

                  {movement.reference && (
                    <div>
                      <span className="font-semibold text-gray-600">Reference:</span>
                      <div className="text-gray-900">{movement.reference}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-semibold">Stock Details</h2>
        <p className="text-indigo-200 text-sm mt-1">{item.product?.sku}</p>
      </div>

      {/* Mini Menu Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'product' && renderProductInfo()}
        {activeTab === 'pricing' && renderPricing()}
        {activeTab === 'movements' && renderMovements()}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end rounded-b-lg">
        <button
          onClick={closeModal}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StockView;
