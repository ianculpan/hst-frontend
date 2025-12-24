import { useState } from 'react';
import CrudButtons from './CrudButtons.jsx';
import { useModal } from './modals/ModalContext.jsx';
import IncidentView from './modals/crud/incident/IncidentView.jsx';
import IncidentEdit from './modals/crud/incident/IncidentEdit.jsx';
import IncidentDelete from './modals/crud/incident/IncidentDelete.jsx';
import ShortContact from './ShortContact.jsx';
import { apiClient } from '../helpers/apiHelper.js';

const IncidentCard = ({ incident, onUpdate }) => {
  const {
    _id,
    incident_number,
    incident_date,
    due_date,
    contact,
    status,
    description,
    details,
    updated_at,
  } = incident;

  const { openModal } = useModal();
  const { closeModal } = useModal();
  const [isFinalising, setIsFinalising] = useState(false);
  const [finaliseError, setFinaliseError] = useState('');

  const incidentId = incident.id || _id;
  const hasLineItems = Array.isArray(details) && details.length > 0;

  const viewModal = () => {
    openModal(<incidentView incident={incident} />);
  };
  const editModal = () => {
    openModal(<incidentEdit incident={incident} closeModal={closeModal} onUpdate={onUpdate} />);
  };
  const deleteModal = () => {
    openModal(<incidentDelete incident={incident} closeModal={closeModal} onUpdate={onUpdate} />);
  };

  const formatCurrency = (amount) => {
    return amount ? `£${parseFloat(amount).toFixed(2)}` : '£0.00';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusColor = (incidentStatus) => {
    const colors = {
      draft: 'bg-gray-600',
      sent: 'bg-blue-600',
      paid: 'bg-green-600',
      overdue: 'bg-red-600',
      cancelled: 'bg-red-800',
      partial: 'bg-yellow-600',
      finalised: 'bg-emerald-600',
    };
    return colors[incidentStatus] || 'bg-gray-600';
  };

  const getStatusLabel = (incidentStatus) => {
    const labels = {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      partial: 'Partial',
      finalised: 'Finalised',
    };
    return labels[incidentStatus] || incidentStatus;
  };

  const handleFinalise = async () => {
    if (!incidentId || !hasLineItems || isFinalising) {
      return;
    }

    setIsFinalising(true);
    setFinaliseError('');

    try {
      await apiClient.post(`/incident-headers/${incidentId}/finalise`);
      if (typeof onUpdate === 'function') {
        onUpdate();
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to finalise incident';
      setFinaliseError(message);
    } finally {
      setIsFinalising(false);
    }
  };

  return (
    <div className="rounded-xl card p-4 space-y-3">
      {/* Header Section */}
      <div className="text-xl card-title rounded-lg px-4 flex items-center justify-between">
        <div className="truncate">{incident_number}</div>
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
            <span className="font-semibold">incident Date:</span> {formatDate(incident_date)}
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

export default IncidentCard;
