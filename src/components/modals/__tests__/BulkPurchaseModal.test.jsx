import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BulkPurchaseModal from '../BulkPurchaseModal.jsx';
import { apiClient } from '../../../helpers/apiHelper.js';

// Mock the API helper
jest.mock('../../../helpers/apiHelper.js', () => ({
  apiClient: {
    post: jest.fn(),
  },
  getApiEndpoint: jest.fn((url) => `http://localhost:8000/api${url}`),
}));

// Mock the picker components
jest.mock('../../ProductPicker.jsx', () => {
  return function MockProductPicker({ value, onChange, label, required }) {
    return (
      <div>
        <label htmlFor="product-picker">{label}</label>
        <select
          id="product-picker"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          data-testid="product-picker"
        >
          <option value="">Select a product</option>
          <option value="1">Product 1</option>
          <option value="2">Product 2</option>
        </select>
      </div>
    );
  };
});

jest.mock('../../ContactPicker.jsx', () => {
  return function MockContactPicker({ value, onChange, label, required }) {
    return (
      <div>
        <label htmlFor="contact-picker">{label}</label>
        <select
          id="contact-picker"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          data-testid="contact-picker"
        >
          <option value="">Select a contact</option>
          <option value="1">Contact 1</option>
          <option value="2">Contact 2</option>
        </select>
      </div>
    );
  };
});

jest.mock('../../UoiSelect.jsx', () => {
  return function MockUoiSelect({ value, onChange, required }) {
    return (
      <div>
        <label htmlFor="uoi-select">Unit of Issue</label>
        <select
          id="uoi-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          data-testid="uoi-select"
        >
          <option value="each">Each</option>
          <option value="box">Box</option>
          <option value="kg">Kilogram</option>
        </select>
      </div>
    );
  };
});

describe('BulkPurchaseModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with initial form', () => {
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByText('Bulk Purchase from Contact')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Purchase multiple items for a total cost and allocate the cost across products'
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Contact (Supplier)')).toBeInTheDocument();
    expect(screen.getByLabelText('Total Cost (£)')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Description / Notes')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('renders initial product item with correct default values', () => {
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const productPicker = screen.getByTestId('product-picker');
    const quantityInput = screen.getByTestId('quantity_0');
    const allocatedCostInput = screen.getByTestId('allocatedCost_0');

    expect(productPicker).toHaveValue('');
    expect(quantityInput).toHaveValue(1);
    expect(allocatedCostInput).toHaveValue(0);
  });

  it('allows adding and removing items', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Add an item
    await user.click(screen.getByTestId('add-product'));
    expect(screen.getAllByTestId('product-picker')).toHaveLength(2);

    // Remove an item (should not remove the last one)
    const removeButtons = screen.getAllByTestId('remove-product');
    await user.click(removeButtons[0]);
    expect(screen.getAllByTestId('product-picker')).toHaveLength(1);
  });

  it('handles form field changes', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const totalCostInput = screen.getByTestId('total-cost');
    await user.type(totalCostInput, '100');
    expect(totalCostInput).toHaveValue(100);

    const locationSelect = screen.getByTestId('location');
    await user.selectOptions(locationSelect, 'retail-display');
    expect(locationSelect).toHaveValue('retail-display');
  });

  it('handles item field changes', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const quantityInput = screen.getByLabelText('Quantity');
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');
    expect(quantityInput).toHaveValue(10);

    const costInput = screen.getByLabelText('Allocated Cost (£)');
    await user.type(costInput, '50');
    expect(costInput).toHaveValue(50);
  });

  it('toggles new product mode', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const newProductCheckbox = screen.getByLabelText('Create new product');
    await user.click(newProductCheckbox);

    expect(screen.getByLabelText('SKU')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('uoi-select')).toBeInTheDocument();
  });

  it('generates SKU from description when creating new product', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Toggle new product mode
    const newProductCheckbox = screen.getByLabelText('Create new product');
    await user.click(newProductCheckbox);

    // Type description
    const descriptionInput = screen.getByLabelText('Description');
    await user.type(descriptionInput, 'Test Product');

    // Check if SKU was generated
    const skuInput = screen.getByLabelText('SKU');
    expect(skuInput.value).toMatch(/TEST-PRODUCT-[A-Z0-9]{4}/);
  });

  it('shows markup fields when toggle is enabled', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Toggle new product mode
    const newProductCheckbox = screen.getByLabelText('Create new product');
    await user.click(newProductCheckbox);

    // Initially markup fields should be hidden
    expect(screen.queryByLabelText('Retail Markup %')).not.toBeInTheDocument();

    // Toggle markup fields
    const markupToggle = screen.getByLabelText('Show markup settings');
    await user.click(markupToggle);

    // Now markup fields should be visible
    expect(screen.getByLabelText('Retail Markup %')).toBeInTheDocument();
    expect(screen.getByLabelText('Discount Markup %')).toBeInTheDocument();
    expect(screen.getByLabelText('Min Markup %')).toBeInTheDocument();
  });

  it('calculates prices from markup when quantity and cost are entered', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Toggle new product mode
    const newProductCheckbox = screen.getByLabelText('Create new product');
    await user.click(newProductCheckbox);

    // Toggle markup fields
    const markupToggle = screen.getByLabelText('Show markup settings');
    await user.click(markupToggle);

    // Enter quantity and cost
    const quantityInput = screen.getByLabelText('Quantity');
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');

    const costInput = screen.getByLabelText('Allocated Cost (£)');
    await user.clear(costInput);
    await user.type(costInput, '100');

    // Check if prices were calculated
    await waitFor(() => {
      const retailPriceInput = screen.getByLabelText('Retail Price (£)');
      expect(retailPriceInput.value).toBe('14.00'); // 100/10 * 1.4
    });
  });

  it('distributes cost evenly across items', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Set total cost
    const totalCostInput = screen.getByLabelText('Total Cost (£)');
    await user.type(totalCostInput, '100');

    const addProductButton = screen.getByTestId('add-product');
    await user.click(addProductButton);

    // Distribute evenly
    await user.click(screen.getByText('Distribute Evenly'));

    // Check that both items have 50 allocated cost
    const costInputs = screen.getAllByLabelText('Allocated Cost (£)');
    expect(costInputs[0]).toHaveValue(50);
    expect(costInputs[1]).toHaveValue(50);
  });

  it('distributes cost by quantity', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Set total cost
    const totalCostInput = screen.getByLabelText('Total Cost (£)');
    await user.type(totalCostInput, '100');

    // Add a second product item
    const addProductButton = screen.getByTestId('add-product');
    await user.click(addProductButton);

    // Set quantities
    const quantityInputs = screen.getAllByLabelText('Quantity');
    await user.clear(quantityInputs[0]);
    await user.clear(quantityInputs[1]);
    await user.type(quantityInputs[0], '2');
    await user.type(quantityInputs[1], '3');

    // Distribute by quantity
    await user.click(screen.getByText('Distribute by Quantity'));

    // Check allocation (100/5 = 20 per unit)
    const costInputs = screen.getAllByLabelText('Allocated Cost (£)');
    expect(costInputs[0]).toHaveValue(40); // 2 * 20
    expect(costInputs[1]).toHaveValue(60); // 3 * 20
  });

  it('submits form successfully with existing products', async () => {
    const user = userEvent.setup();
    apiClient.post.mockResolvedValue({ status: 201 });

    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill form
    const contactPicker = screen.getByTestId('contact-picker');
    await user.selectOptions(contactPicker, '1');

    const totalCostInput = screen.getByLabelText('Total Cost (£)');
    await user.type(totalCostInput, '100');

    const productPicker = screen.getByTestId('product-picker');
    await user.selectOptions(productPicker, '1');

    const quantityInput = screen.getByLabelText('Quantity');
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');

    const costInput = screen.getByLabelText('Allocated Cost (£)');
    await user.clear(costInput);
    await user.type(costInput, '100');

    // Submit
    await user.click(screen.getByText('Record Purchase'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/stock-movements/bulk-purchase',
        expect.objectContaining({
          contact_id: '1',
          total_cost: '100',
          items: expect.arrayContaining([
            expect.objectContaining({
              product_id: '1',
              quantity: '10',
              allocated_cost: '100',
            }),
          ]),
        })
      );
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('creates new products before submitting bulk purchase', async () => {
    const user = userEvent.setup();
    apiClient.post
      .mockResolvedValueOnce({ status: 201, data: { data: { id: 'new-product-1' } } }) // Product creation
      .mockResolvedValueOnce({ status: 201 }); // Bulk purchase

    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill form
    const contactPicker = screen.getByTestId('contact-picker');
    await user.selectOptions(contactPicker, '1');

    const totalCostInput = screen.getByLabelText('Total Cost (£)');
    await user.type(totalCostInput, '100');

    // Toggle new product mode
    const newProductCheckbox = screen.getByLabelText('Create new product');
    await user.click(newProductCheckbox);

    // Fill new product details - description first to generate SKU
    const descriptionInput = screen.getByLabelText('Description');
    await user.type(descriptionInput, 'Test Product');

    // Then manually set the SKU (this should override the auto-generated one)
    const skuInput = screen.getByLabelText('SKU');
    await user.clear(skuInput);
    await user.type(skuInput, 'TEST-SKU');

    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, '10');

    const costInput = screen.getByLabelText('Allocated Cost (£)');
    await user.type(costInput, '100');

    // Submit
    await user.click(screen.getByText('Record Purchase'));

    await waitFor(() => {
      // Should create product first
      expect(apiClient.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/products',
        expect.objectContaining({
          sku: 'TEST-SKU',
          description: 'Test Product',
          type: 'PHYSICAL',
        })
      );

      // Then create bulk purchase
      expect(apiClient.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/stock-movements/bulk-purchase',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              product_id: 'new-product-1',
            }),
          ]),
        })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    apiClient.post.mockRejectedValue(new Error('API Error'));

    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Fill and submit form
    const contactPicker = screen.getByTestId('contact-picker');
    await user.selectOptions(contactPicker, '1');

    const totalCostInput = screen.getByLabelText('Total Cost (£)');
    await user.type(totalCostInput, '100');

    const productPicker = screen.getByTestId('product-picker');
    await user.selectOptions(productPicker, '1');

    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, '10');

    const costInput = screen.getByLabelText('Allocated Cost (£)');
    await user.type(costInput, '100');

    await user.click(screen.getByText('Record Purchase'));

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // it('shows loading state during submission', async () => {
  //   const user = userEvent.setup();
  //   apiClient.post.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

  //   render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

  //   // Fill and submit form
  //   const contactPicker = screen.getByTestId('contact-picker');
  //   await user.selectOptions(contactPicker, '1');

  //   const totalCostInput = screen.getByLabelText('Total Cost (£)');
  //   await user.type(totalCostInput, '100');

  //   const productPicker = screen.getByTestId('product-picker');
  //   await user.selectOptions(productPicker, '1');

  //   const quantityInput = screen.getByLabelText('Quantity');
  //   await user.type(quantityInput, '10');

  //   const costInput = screen.getByLabelText('Allocated Cost (£)');
  //   await user.type(costInput, '100');

  //   await user.click(screen.getByText('Record Purchase'));

  //   // Should show loading state
  //   expect(screen.getByText('Recording...')).toBeInTheDocument();
  //   expect(screen.getByText('Record Purchase')).toBeDisabled();
  // });

  it('displays remaining cost correctly', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Set total cost
    const totalCostInput = screen.getByLabelText('Total Cost (£)');
    await user.type(totalCostInput, '100');

    // Set allocated cost
    const costInput = screen.getByLabelText('Allocated Cost (£)');
    await user.type(costInput, '60');

    // Should show remaining cost
    expect(screen.getByText('Remaining: £40.00')).toBeInTheDocument();
  });

  it('shows balanced status when costs match', async () => {
    const user = userEvent.setup();
    render(<BulkPurchaseModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Set total cost
    const totalCostInput = screen.getByLabelText('Total Cost (£)');
    await user.type(totalCostInput, '100');

    // Set allocated cost to match
    const costInput = screen.getByLabelText('Allocated Cost (£)');
    await user.type(costInput, '100');

    // Should show balanced status
    expect(screen.getByText('✓ Balanced')).toBeInTheDocument();
  });
});
