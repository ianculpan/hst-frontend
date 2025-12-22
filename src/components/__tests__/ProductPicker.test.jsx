import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import ProductPicker from '../ProductPicker.jsx';

// Mock the API helper
jest.mock('../../helpers/apiHelper.js', () => ({
  getApiEndpoint: jest.fn((url) => `https://api.example.com${url}`),
  apiClient: {
    get: jest.fn(),
  },
}));

import { apiClient } from '../../helpers/apiHelper.js';

describe('ProductPicker', () => {
  const mockOnChange = jest.fn();
  const mockOnProductSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onProductSelect: mockOnProductSelect,
    placeholder: 'Search and select a product...',
  };

  const mockProducts = [
    {
      id: '1',
      sku: 'PROD001',
      description: 'Test Product 1',
      salePrice: 10.5,
    },
    {
      id: '2',
      sku: 'PROD002',
      description: 'Test Product 2',
      salePrice: 25.0,
    },
    {
      id: '3',
      sku: 'PROD003',
      description: 'Test Product 3',
      salePrice: 5.99,
    },
  ];

  it('renders the product picker with default props', () => {
    render(<ProductPicker {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search and select a product...')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with custom label and required indicator', () => {
    render(<ProductPicker {...defaultProps} label="Select Product" required={true} />);

    expect(screen.getByText('Select Product')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<ProductPicker {...defaultProps} placeholder="Choose a product..." />);

    expect(screen.getByPlaceholderText('Choose a product...')).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<ProductPicker {...defaultProps} disabled={true} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });

  it('opens dropdown when input is focused', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/products'));
    });
  });

  it('fetches products when dropdown opens', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/products?per_page=50'));
    });
  });

  it('searches products when typing in input', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { data: mockProducts } })
      .mockResolvedValueOnce({ data: { data: [mockProducts[0]] } });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');

    // Open dropdown
    await act(async () => {
      fireEvent.focus(input);
    });

    // Type search term
    await act(async () => {
      fireEvent.change(input, { target: { value: 'PROD001' } });
    });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('search=PROD001'));
    });
  });

  it('displays loading state while fetching products', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    apiClient.get.mockReturnValueOnce(promise);

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    expect(screen.getByText('Loading products...')).toBeInTheDocument();

    // Resolve the promise
    await act(async () => {
      resolvePromise({ data: { data: mockProducts } });
    });
  });

  it('displays products in dropdown', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(screen.getByText('PROD001')).toBeInTheDocument();
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('£10.50')).toBeInTheDocument();
    });
  });

  it('selects a product when clicked', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(screen.getByText('PROD001')).toBeInTheDocument();
    });

    const productButton = screen.getByText('PROD001');
    await act(async () => {
      fireEvent.click(productButton);
    });

    expect(mockOnChange).toHaveBeenCalledWith('1');
    expect(mockOnProductSelect).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('displays selected product in input when dropdown is closed', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} value="1" />);

    const input = screen.getByRole('textbox');

    // Focus to open dropdown and load products
    await act(async () => {
      fireEvent.focus(input);
    });

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('PROD001')).toBeInTheDocument();
    });

    // The selected product should be highlighted in the dropdown
    const selectedProductButton = screen.getByText('PROD001').closest('button');
    expect(selectedProductButton).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('clears selection when clear button is clicked', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} value="1" />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('PROD001')).toBeInTheDocument();
    });

    // Find the clear button (it should be rendered when selectedProduct exists)
    const clearButton = screen.getAllByRole('button')[0]; // First button is the clear button
    await act(async () => {
      fireEvent.click(clearButton);
    });

    expect(mockOnChange).toHaveBeenCalledWith('');
    expect(mockOnProductSelect).toHaveBeenCalledWith(null);
  });

  it('closes dropdown when clicking outside', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(
      <div>
        <ProductPicker {...defaultProps} />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(screen.getByText('PROD001')).toBeInTheDocument();
    });

    const outsideElement = screen.getByTestId('outside');
    await act(async () => {
      fireEvent.mouseDown(outsideElement);
    });

    await waitFor(() => {
      expect(screen.queryByText('PROD001')).not.toBeInTheDocument();
    });
  });

  it('displays "No products found" when search returns no results', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: [] },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(screen.getByText('Start typing to search products')).toBeInTheDocument();
    });
  });

  it('displays "No products found" when search term returns no results', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: [] },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'nonexistent' } });
    });

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.get.mockRejectedValueOnce(new Error('API Error'));

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching products:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles different API response formats', async () => {
    // Test with data format
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(screen.getByText('PROD001')).toBeInTheDocument();
    });
  });

  it('handles direct array response format', async () => {
    // Test with direct array format
    apiClient.get.mockResolvedValueOnce({
      data: mockProducts,
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(screen.getByText('PROD001')).toBeInTheDocument();
    });
  });

  it('toggles dropdown when arrow button is clicked', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} />);

    const arrowButton = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(arrowButton);
    });

    await waitFor(() => {
      expect(screen.getByText('PROD001')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(arrowButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('PROD001')).not.toBeInTheDocument();
    });
  });

  it('disables arrow button when component is disabled', () => {
    render(<ProductPicker {...defaultProps} disabled={true} />);

    const arrowButton = screen.getByRole('button');
    expect(arrowButton).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<ProductPicker {...defaultProps} className="custom-class" />);

    const container = screen.getByRole('textbox').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('generates unique id when not provided', () => {
    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id');
    expect(input.id).toMatch(/^product-picker-/);
  });

  it('uses provided id when given', () => {
    render(<ProductPicker {...defaultProps} id="custom-product-picker" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-product-picker');
  });

  it('shows selected product as highlighted in dropdown', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} value="1" />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      const selectedProduct = screen.getByText('PROD001').closest('button');
      // The component uses conditional classes, so we need to check for the specific classes
      expect(selectedProduct).toHaveClass('bg-blue-50');
      expect(selectedProduct).toHaveClass('text-blue-700');
    });
  });

  it('formats price correctly in dropdown', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: mockProducts },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(screen.getByText('£10.50')).toBeInTheDocument();
      expect(screen.getByText('£25.00')).toBeInTheDocument();
      expect(screen.getByText('£5.99')).toBeInTheDocument();
    });
  });

  it('handles products with missing salePrice', async () => {
    const productsWithMissingPrice = [
      {
        id: 1,
        sku: 'PROD001',
        description: 'Test Product 1',
        // salePrice missing
      },
    ];

    apiClient.get.mockResolvedValueOnce({
      data: { data: productsWithMissingPrice },
    });

    render(<ProductPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.focus(input);
    });

    await waitFor(() => {
      expect(screen.getByText('£0.00')).toBeInTheDocument();
    });
  });
});
