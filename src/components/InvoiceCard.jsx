import { useState } from 'react';
import CrudButtons from './CrudButtons';
import { useModal } from './modals/ModalContext.jsx';
import InvoiceView from './modals/crud/invoice/InvoiceView.jsx';
import InvoiceEdit from './modals/crud/invoice/InvoiceEdit.jsx';
import InvoiceDelete from './modals/crud/invoice/InvoiceDelete.jsx';
import ShortContact from './ShortContact.jsx';
import { apiClient } from '../helpers/apiHelper.js';

const InvoiceCard = ({ invoice, onUpdate }) => {
  const {
    _id,
    invoice_number,
    invoice_date,
    due_date,
    contact,
    status,
    details,
    net_total,
    tax_total,
    gross_total,
    updated_at,
  } = invoice;

  const { openModal } = useModal();
  const { closeModal } = useModal();
  const [isFinalising, setIsFinalising] = useState(false);
  const [finaliseError, setFinaliseError] = useState('');

  const invoiceId = invoice.id || _id;
  const hasLineItems = Array.isArray(details) && details.length > 0;

  const viewModal = () => {
    openModal(<InvoiceView invoice={invoice} />);
  };
  const editModal = () => {
    openModal(<InvoiceEdit invoice={invoice} closeModal={closeModal} onUpdate={onUpdate} />);
  };
  const deleteModal = () => {
    openModal(<InvoiceDelete invoice={invoice} closeModal={closeModal} onUpdate={onUpdate} />);
  };

  const formatCurrency = (amount) => {
    return amount ? `£${parseFloat(amount).toFixed(2)}` : '£0.00';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusColor = (invoiceStatus) => {
    const colors = {
      draft: 'bg-gray-600',
      sent: 'bg-blue-600',
      paid: 'bg-green-600',
      overdue: 'bg-red-600',
      cancelled: 'bg-red-800',
      partial: 'bg-yellow-600',
      finalised: 'bg-emerald-600',
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
      partial: 'Partial',
      finalised: 'Finalised',
    };
    return labels[invoiceStatus] || invoiceStatus;
  };

  const handleFinalise = async () => {
    if (!invoiceId || !hasLineItems || isFinalising) {
      return;
    }

    setIsFinalising(true);
    setFinaliseError('');

    try {
      await apiClient.post(`/invoice-headers/${invoiceId}/finalise`);
      if (typeof onUpdate === 'function') {
        onUpdate();
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to finalise invoice';
      setFinaliseError(message);
    } finally {
      setIsFinalising(false);
    }
  };

  return (
    <div className="rounded-xl card p-4 space-y-3">
      {/* Header Section */}
      <div className="text-xl card-title rounded-lg px-4 flex items-center justify-between">
        <div className="truncate">{invoice_number}</div>
        <div className="flex items-center gap-2">
          {hasLineItems && status !== 'sent' && (
            <button
              type="button"
              onClick={handleFinalise}
              disabled={isFinalising}
              className="px-2 py-1 rounded bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isFinalising ? 'Finalising…' : 'Finalise'}
            </button>
          )}
          <div className={`px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </div>
          <CrudButtons onView={viewModal} onEdit={editModal} onDelete={deleteModal} />
        </div>
      </div>

      {/* Customer Information */}
      <div className="card-text rounded-lg px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ShortContact contact={contact} />
        </div>
      </div>

      {/* Dates */}
      <div className="card-text rounded-lg px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <span className="font-semibold">Invoice Date:</span> {formatDate(invoice_date)}
          </div>
          <div>
            <span className="font-semibold">Due Date:</span> {formatDate(due_date)}
          </div>
        </div>
      </div>

      {/* Line Items Summary */}
      <div className="card-text rounded-lg px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Line Items:</span>
          <span className="text-sm">{details?.length || 0} items</span>
        </div>
        {details && details.length > 0 && (
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {details.slice(0, 3).map((item, index) => (
              <div key={index} className="text-xs card-text-highlight rounded px-2 py-1">
                <span className="font-semibold">
                  {item.sku} {item.lineDescription}:
                </span>{' '}
                {item.lineQuantity} × {formatCurrency(item.lineUnitPrice)} ={' '}
                {formatCurrency(item.lineQuantity * item.lineUnitPrice)}
              </div>
            ))}
            {details.length > 3 && (
              <div className="text-xs text-center text-muted">+{details.length - 3} more items</div>
            )}
          </div>
        )}
      </div>

      {/* Total Amount */}
      <div className="card-text rounded-lg px-4 text-center space-y-1">
        <div className="text-sm">
          Net: {formatCurrency(net_total)} | Tax: {formatCurrency(tax_total)}
        </div>
        <div className="font-semibold text-lg">Total: {formatCurrency(gross_total)}</div>
      </div>

      {/* Footer */}
      <div className="card-text rounded-lg px-4 text-xs text-center">
        <span className="font-semibold">Updated:</span> {formatDate(updated_at)}
      </div>
      {finaliseError && (
        <div className="bg-red-500/80 text-xs px-3 py-2 rounded-lg text-white">{finaliseError}</div>
      )}
    </div>
  );
};

export default InvoiceCard;
