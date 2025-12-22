import React, { useState } from 'react';
import { apiClient, getApiEndpoint } from '../../helpers/apiHelper.js';
import calculatePricesFromMarkup from '../../helpers/data/calculations.jsx';
import StockPurchaseHeader from '../StockPurchaseHeader.jsx';

import ProductLine from '../ProductLine.jsx';

const BulkPurchaseModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    contactId: '',
    totalCost: '',
    location: 'warehouse',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const createNewProductLine = () => ({
    productId: '', // Will be set after product creation
    quantity: '1',
    allocatedCost: '0',
    newProduct: {
      sku: '',
      description: '',
      uoi: 'each',
      taxRate: '20',
      salePrice: '0',
      discountPrice: '0',
      minSalePrice: '0',
      retailMarkupPercent: '40',
      discountMarkupPercent: '25',
      minMarkupPercent: '15',
      showMarkupFields: false,
      skuAuto: false,
    },
  });

  const [items, setItems] = useState([createNewProductLine()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (contactId) => {
    setForm((prev) => ({ ...prev, contactId }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    // Recalculate prices when quantity or cost changes
    if (field === 'quantity' || field === 'allocatedCost') {
      const prices = calculatePricesFromMarkup(newItems[index]);
      newItems[index].newProduct.salePrice = prices.salePrice;
      newItems[index].newProduct.discountPrice = prices.discountPrice;
      newItems[index].newProduct.minSalePrice = prices.minSalePrice;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, createNewProductLine()]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const distributeEvenCost = () => {
    if (!form.totalCost || items.length === 0) return;
    const costPerItem = (parseFloat(form.totalCost) / items.length).toFixed(2);
    const newItems = items.map((item) => ({
      ...item,
      allocatedCost: costPerItem,
    }));
    setItems(newItems);
  };

  const distributeByQuantity = () => {
    if (!form.totalCost || items.length === 0) return;
    const totalQuantity = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    if (totalQuantity === 0) return;

    const costPerUnit = parseFloat(form.totalCost) / totalQuantity;
    const newItems = items.map((item) => ({
      ...item,
      allocatedCost: (costPerUnit * (parseFloat(item.quantity) || 0)).toFixed(2),
    }));
    setItems(newItems);
  };

  const generateSkuFromDescription = (description) => {
    const base = (description || 'NEW')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${base}-${suffix}`.slice(0, 32);
  };

  const handleNewProductFieldChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index].newProduct[field] = value;
    // Track manual SKU edits
    if (field === 'sku') {
      newItems[index].newProduct.skuAuto = false;
    }
    // Auto-generate/regenerate SKU from description when appropriate
    if (field === 'description' && value && value.trim()) {
      const { sku, skuAuto } = newItems[index].newProduct;
      if (!sku || skuAuto) {
        newItems[index].newProduct.sku = generateSkuFromDescription(value);
        newItems[index].newProduct.skuAuto = true;
      }
    }
    if (
      field === 'retailMarkupPercent' ||
      field === 'discountMarkupPercent' ||
      field === 'minMarkupPercent'
    ) {
      const prices = calculatePricesFromMarkup(newItems[index]);
      newItems[index].newProduct.salePrice = prices.salePrice;
      newItems[index].newProduct.discountPrice = prices.discountPrice;
      newItems[index].newProduct.minSalePrice = prices.minSalePrice;
    }
    setItems(newItems);
  };

  const handleRecalculatePrices = (index) => {
    const newItems = [...items];
    const prices = calculatePricesFromMarkup(newItems[index]);
    newItems[index].newProduct.salePrice = prices.salePrice;
    newItems[index].newProduct.discountPrice = prices.discountPrice;
    newItems[index].newProduct.minSalePrice = prices.minSalePrice;
    setItems(newItems);
  };

  const getTotalAllocated = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.allocatedCost) || 0), 0).toFixed(2);
  };

  const getRemainingCost = () => {
    const total = parseFloat(form.totalCost) || 0;
    const allocated = parseFloat(getTotalAllocated());
    return (total - allocated).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    const totalCost = parseFloat(form.totalCost) || 0;
    const allocatedCost = parseFloat(getTotalAllocated());
    if (Math.abs(totalCost - allocatedCost) > 0.01) {
      setErrorMessage(
        `Total allocated cost (£${allocatedCost}) must equal total cost (£${totalCost})`
      );
      return;
    }

    // Validate that we have at least one valid item
    const candidateItems = items.filter(
      (item) =>
        item.newProduct.sku && item.newProduct.description && item.quantity && item.allocatedCost
    );
    if (candidateItems.length === 0) {
      setErrorMessage('Please add at least one product with SKU, description, quantity, and cost');
      return;
    }

    setIsSubmitting(true);

    try {
      const workingItems = [...items];

      // Create all new products first
      for (let i = 0; i < workingItems.length; i++) {
        const it = workingItems[i];

        // Skip if product already has an ID (shouldn't happen, but safety check)
        if (it.productId) {
          console.log(`Item ${i} already has productId:`, it.productId);
          continue;
        }

        // Validate required fields
        if (!it.newProduct.sku || !it.newProduct.description) {
          console.warn(`Item ${i} missing SKU or description, skipping product creation`);
          continue;
        }

        try {
          const createProductUrl = getApiEndpoint('/products');
          const productPayload = {
            sku: it.newProduct.sku,
            description: it.newProduct.description,
            type: 'PHYSICAL',
            uoi: it.newProduct.uoi,
            taxRate: it.newProduct.taxRate,
            salePrice: it.newProduct.salePrice,
            discountPrice: it.newProduct.discountPrice,
            minSalePrice: it.newProduct.minSalePrice,
          };

          console.log(`Creating product ${i}:`, productPayload);
          const productResp = await apiClient.post(createProductUrl, productPayload);
          console.log(`Product creation response ${i}:`, productResp);

          if (productResp.status === 201 || productResp.status === 200) {
            // Try different possible response structures
            const newProductId =
              productResp.data?.id ||
              productResp.data?.data?.id ||
              productResp.data?.product?.id ||
              productResp.data?._id;

            if (newProductId) {
              workingItems[i].productId = newProductId;
              console.log(`Product ${i} created with ID:`, newProductId);
            } else {
              console.error(`Product ${i} created but no ID found in response:`, productResp.data);
              throw new Error(`Product created but no ID returned for item ${i + 1}`);
            }
          } else {
            throw new Error(`Failed to create product: ${productResp.status}`);
          }
        } catch (error) {
          console.error(`Error creating product ${i}:`, error);
          throw new Error(
            `Failed to create product "${it.newProduct.sku}": ${
              error?.response?.data?.message || error?.message || 'Unknown error'
            }`
          );
        }
      }

      // Create the bulk purchase
      const url = getApiEndpoint('/stock-movements/bulk-purchase');

      // Filter to only items with valid product ID, quantity, and cost
      const filteredItems = workingItems.filter((it) => {
        const hasProductId = it.productId && it.productId !== '';
        const hasQuantity = it.quantity && it.quantity !== '0';
        const hasCost = it.allocatedCost && it.allocatedCost !== '0';
        return hasProductId && hasQuantity && hasCost;
      });

      // Debug logging
      console.log('Working items after product creation:', workingItems);
      console.log('Filtered items:', filteredItems);

      const payload = {
        contact_id: form.contactId,
        location: form.location,
        date: form.date,
        description: form.description,
        total_cost: form.totalCost,
        items: filteredItems.map((it) => ({
          product_id: it.productId,
          quantity: it.quantity,
          allocated_cost: it.allocatedCost,
        })),
      };

      console.log('Payload being sent:', payload);

      if (payload.items.length === 0) {
        setErrorMessage(
          'No valid items to submit. Please ensure all items have a product, quantity, and cost.'
        );
        setIsSubmitting(false);
        return;
      }

      const response = await apiClient.post(url, payload);
      if (response.status === 201) {
        onSuccess && onSuccess();
        onClose && onClose();
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || error?.message || 'Failed to record bulk purchase';
      setErrorMessage(errorMsg);
      console.error('Bulk purchase error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingCost = getRemainingCost();
  const isBalanced = Math.abs(parseFloat(remainingCost)) < 0.01;
  return (
    <div className="bg-white p-6 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Bulk Purchase from Contact</h2>
      <p className="text-sm text-gray-600 mb-4">
        Purchase multiple items for a total cost and allocate the cost across products
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Purchase Details */}
        <StockPurchaseHeader
          form={form}
          handleFormChange={handleFormChange}
          handleContactChange={handleContactChange}
        />

        {/* Cost Allocation Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm">
              <span className="font-semibold">Total Cost:</span> £
              {parseFloat(form.totalCost || 0).toFixed(2)}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Allocated:</span> £{getTotalAllocated()}
            </div>
            <div
              className={`text-sm font-semibold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}
            >
              {`Remaining: £${remainingCost}`}
            </div>
          </div>
          {isBalanced && (
            <div role="status" className="text-green-700 text-sm font-semibold">
              ✓ Balanced
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={distributeEvenCost}
              disabled={!form.totalCost}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
            >
              Distribute Evenly
            </button>
            <button
              type="button"
              onClick={distributeByQuantity}
              disabled={!form.totalCost}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
            >
              Distribute by Quantity
            </button>
          </div>
        </div>
        {/* Items */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Products</h3>
            <button
              type="button"
              onClick={addItem}
              data-testid="add-product"
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              + Add Product
            </button>
          </div>

          {items.map((item, index) => (
            <ProductLine
              key={index}
              item={item}
              index={index}
              itemCount={items.length}
              removeItem={removeItem}
              handleItemChange={handleItemChange}
              handleNewProductFieldChange={handleNewProductFieldChange}
              onRecalculatePrices={handleRecalculatePrices}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
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
            disabled={
              isSubmitting ||
              !form.contactId ||
              !form.totalCost ||
              !isBalanced ||
              items.length === 0
            }
            className={`px-6 py-2 text-white rounded-lg transition-colors ${
              isSubmitting ||
              !form.contactId ||
              !form.totalCost ||
              !isBalanced ||
              items.length === 0
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

export default BulkPurchaseModal;
