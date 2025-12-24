import React from 'react';
import IncidentLineItem from './IncidentLineItem.jsx';

const IncidentLines = ({ lineItems, onAddLineItem, onUpdateLineItem, onRemoveLineItem }) => {
  return (
    <div className="border-t pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Line Items</h3>
      </div>

      {lineItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No line items added yet. You can save the incident header now and add line items later, or
          click "Add Line Item" to get started.
        </div>
      )}

      {lineItems.map((item, index) => (
        <IncidentLineItem
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

export default IncidentLines;
