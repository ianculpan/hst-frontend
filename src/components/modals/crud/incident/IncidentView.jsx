const InvoiceView = ({ invoice }) => {
  const {
    invoice_number,
    invoice_date,
    due_date,
    customer_name,
    customer_reference,
    status,
    notes,
    line_items,
    net_total,
    tax_total,
    gross_total,
    created_at,
    updated_at,
  } = invoice;

  const formatCurrency = (amount) => {
    return amount ? `£${parseFloat(amount).toFixed(2)}` : '£0.00';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (invoiceStatus) => {
    const colors = {
      draft: 'bg-gray-600',
      sent: 'bg-blue-600',
      paid: 'bg-green-600',
      overdue: 'bg-red-600',
      cancelled: 'bg-red-800',
      partial: 'bg-yellow-600',
    };
    return colors[invoiceStatus] || 'bg-gray-600';
  };

  const getStatusLabel = (invoiceStatus) => {
    const labels = {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      partial: 'Partial Payment',
    };
    return labels[invoiceStatus] || invoiceStatus;
  };

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-3">
        Invoice Details
      </h2>

      {/* Header Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Invoice Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Invoice Number:</span> {invoice_number}
              </div>
              <div>
                <span className="font-semibold">Status:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(status)}`}>
                  {getStatusLabel(status)}
                </span>
              </div>
              <div>
                <span className="font-semibold">Invoice Date:</span> {formatDate(invoice_date)}
              </div>
              <div>
                <span className="font-semibold">Due Date:</span> {formatDate(due_date)}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Customer Name:</span> {customer_name}
              </div>
              <div>
                <span className="font-semibold">Reference:</span> {customer_reference || 'N/A'}
              </div>
            </div>
          </div>
        </div>
        {notes && (
          <div className="mt-4 pt-4 border-t">
            <span className="font-semibold">Notes:</span> {notes}
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Line Items</h3>
        {line_items && line_items.length > 0 ? (
          <div className="space-y-3">
            {line_items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Product:</span>
                    <div className="text-gray-600">{item.product_sku || 'N/A'}</div>
                    <div className="text-gray-500 text-xs">{item.description}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Quantity:</span>
                    <div className="text-gray-600">{item.quantity}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Unit Price:</span>
                    <div className="text-gray-600">{formatCurrency(item.unit_price)}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Line Total:</span>
                    <div className="text-gray-600 font-semibold">
                      {formatCurrency(item.line_total)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No line items found for this invoice.
          </div>
        )}
      </div>

      {/* Total and Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-800">Net Total</div>
            <div className="text-xl font-semibold text-gray-600">{formatCurrency(net_total)}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-800">Tax Total</div>
            <div className="text-xl font-semibold text-gray-800">{formatCurrency(tax_total)}</div>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <div className="text-lg font-semibold text-gray-800">Gross Total</div>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(gross_total)}</div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Created:</span> {formatDate(created_at)}
          </div>
          <div>
            <span className="font-semibold">Last Updated:</span> {formatDate(updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
