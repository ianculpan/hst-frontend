import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InvoiceLineItem from '../InvoiceLineItem.jsx';

describe('InvoiceLineItem', () => {
  const baseItem = {
    sku: 'PROD001',
    lineDescription: 'Test Product',
    lineQuantity: 2,
    lineUnitPrice: 10.5,
  };

  const setup = (overrides = {}, index = 0) => {
    const onUpdateLineItem = jest.fn();
    const onRemoveLineItem = jest.fn();
    const item = { ...baseItem, ...overrides };

    render(
      <InvoiceLineItem
        item={item}
        index={index}
        onUpdateLineItem={onUpdateLineItem}
        onRemoveLineItem={onRemoveLineItem}
      />
    );

    return { onUpdateLineItem, onRemoveLineItem };
  };

  it('renders SKU, Description, Quantity, Unit Price and computed Line Total', () => {
    setup();

    // SKU (read-only)
    expect(screen.getByLabelText('SKU')).toHaveValue('PROD001');

    // Description
    expect(screen.getByLabelText('Description')).toHaveValue('Test Product');

    // Quantity (type=number) - label htmlFor is mismatched in component; select by role
    const spinbuttons = screen.getAllByRole('spinbutton');
    const quantityInput = spinbuttons[0];
    const unitPriceInput = spinbuttons[1];
    expect(quantityInput).toHaveValue(2);
    expect(unitPriceInput).toHaveValue(10.5);

    // Line Total
    expect(screen.getByLabelText('Line Total')).toHaveValue('£21.00');
  });

  it('calls onUpdateLineItem when Description changes', async () => {
    const user = userEvent.setup();
    const { onUpdateLineItem } = setup();

    const desc = screen.getByLabelText('Description');
    await user.clear(desc);
    await user.type(desc, 'Updated');

    // Verify at least one call for lineDescription happened
    const calls = onUpdateLineItem.mock.calls.filter((c) => c[1] === 'lineDescription');
    expect(calls.length).toBeGreaterThan(0);
    // And that the value was a string
    expect(typeof calls[calls.length - 1][2]).toBe('string');
  });

  it('calls onUpdateLineItem when Quantity changes', async () => {
    const user = userEvent.setup();
    const { onUpdateLineItem } = setup();

    const quantityInput = screen.getAllByRole('spinbutton')[0];
    await user.clear(quantityInput);
    await user.type(quantityInput, '5');

    const calls = onUpdateLineItem.mock.calls.filter((c) => c[1] === 'lineQuantity');
    expect(calls.length).toBeGreaterThan(0);
    expect(typeof calls[calls.length - 1][2]).toBe('string');
  });

  it('calls onUpdateLineItem when Unit Price changes', async () => {
    const user = userEvent.setup();
    const { onUpdateLineItem } = setup();

    const unitPriceInput = screen.getAllByRole('spinbutton')[1];
    await user.clear(unitPriceInput);
    await user.type(unitPriceInput, '12.34');

    const calls = onUpdateLineItem.mock.calls.filter((c) => c[1] === 'lineUnitPrice');
    expect(calls.length).toBeGreaterThan(0);
    expect(typeof calls[calls.length - 1][2]).toBe('string');
  });

  it('calls onRemoveLineItem when Remove is clicked', async () => {
    const user = userEvent.setup();
    const { onRemoveLineItem } = setup();

    await user.click(screen.getByText('Remove'));
    expect(onRemoveLineItem).toHaveBeenCalledWith(0);
  });
});
