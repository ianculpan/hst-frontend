import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../../helpers/apiHelper.js';
import MediumContact from '../../../MediumContact.jsx';
import InvoiceLines from '../../../IncidentLines.jsx';
import ContactPicker from '../../../ContactPicker.jsx';
import invoiceLinesSave from '../../../../helpers/data/invoiceLinesStore.jsx';
import invoiceLineDelete from '../../../../helpers/data/invoiceLineDelete.jsx';

const InvoiceEdit = ({ invoice, closeModal, onUpdate }) => {
  const [formData, setFormData] = useState({
    invoice_header_id: invoice.id || '',
    invoice_number: invoice.invoice_number || '',
    invoice_date: invoice.invoice_date
      ? new Date(invoice.invoice_date).toISOString().split('T')[0]
      : '',
    due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
    contact_id: invoice.contact?.id || '',
    contact_reference: invoice.contact?.accountNumber || '',
    status: invoice.status || 'draft',
    notes: invoice.notes || '',
    details: invoice.details ? [...invoice.details] : [],
    net_total: invoice.net_total || 0,
    tax_total: invoice.tax_total || 0,
    gross_total: invoice.gross_total || 0,
  });

  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isDisabled, setIsDisabled] = useState(invoice.status === 'sent');
  const [isSaving, setIsSaving] = useState(false);
  const [formStatus, setFormStatus] = useState('');
  const [selectedContact, setSelectedContact] = useState(invoice.contact || null);

  // Fetch contacts and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsResponse, productsResponse] = await Promise.all([
          apiClient.get('/contacts?page=all'),
          apiClient.get('/products?page=all'),
        ]);
        setContacts(contactsResponse.data || []);
        setProducts(productsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedContact(contacts.find((c) => String(c.id) === String(formData.contact_id)));
  }, [formData.contact_id, contacts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactSelect = (contact) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData((prev) => ({
        ...prev,
        contact_id: contact.id,
      }));
    } else {
      setSelectedContact(null);
      setFormData((prev) => ({
        ...prev,
        contact_id: '',
      }));
    }
  };

  const addLineItem = (chosen) => {
    const newLineItem = {
      lineNumber: formData.details.length + 1,
      id: null, // Temporary ID for frontend
      productId: chosen?.id || '',
      sku: chosen?.sku || '',
      lineDescription: chosen?.description || '',
      lineQuantity: 1,
      lineUnitPrice: chosen?.salePrice ?? 0,
      lineTotal: chosen ? (parseFloat(chosen.salePrice) || 0) * 1 : 0,
      lineTaxAmount: chosen
        ? ((parseFloat(chosen.salePrice) || 0) * (parseFloat(chosen.taxRate) || 0)) / 100
        : 0,
      lineTaxRate: chosen?.taxRate ?? 0,
    };

    setFormData((prev) => {
      const nextDetails = [...prev.details, newLineItem];
      invoiceLinesSave(nextDetails);
      return { ...prev, details: nextDetails };
    });
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
    invoiceLineDelete(formData.details[index]);
  };

  const updateLineItem = (index, field, value) => {
    setFormData((prev) => {
      const updatedLineItems = [...prev.details];
      const current = { ...updatedLineItems[index] };

      if (field === 'productId') {
        const product = products.find((p) => String(p.id) === String(value));
        if (product) {
          current.productId = product.id;
          current.sku = product.sku;
          current.lineDescription = product.description;
          current.lineUnitPrice = product.salePrice ?? 0;
          current.lineTaxRate = product.taxRate ?? 0;
        }
      } else {
        current[field] = value;
      }

      const quantity = parseFloat(current.lineQuantity ?? 0) || 0;
      const unit = parseFloat(current.lineUnitPrice ?? 0) || 0;
      current.lineTotal = quantity * unit;

      updatedLineItems[index] = current;

      return { ...prev, details: updatedLineItems };
    });
  };

  const calculateTotals = () => {
    const netTotal = formData.details.reduce((sum, item) => {
      const qty = parseFloat(item.lineQuantity) || 0;
      const price = parseFloat(item.lineUnitPrice) || 0;
      return sum + qty * price;
    }, 0);

    // Calculate tax total based on tax rate from products
    const taxTotal = formData.details.reduce((sum, item) => {
      const product = products.find((p) => String(p.id) === String(item.productId));
      const taxRate = product ? (parseFloat(product.taxRate) || 0) / 100 : 0;
      const qty = parseFloat(item.lineQuantity) || 0;
      const price = parseFloat(item.lineUnitPrice) || 0;
      return sum + qty * price * taxRate;
    }, 0);

    const grossTotal = netTotal + taxTotal;

    return { netTotal, taxTotal, grossTotal };
  };

  // Update form data when selectedContact changes
  useEffect(() => {
    if (selectedContact) {
      setFormData((prev) => ({
        ...prev,
        contact_name: selectedContact.businessContact
          ? selectedContact.businessName
          : `${selectedContact.salutation} ${selectedContact.firstName} ${selectedContact.secondName}`.trim(),
        contact_reference: selectedContact.accountNumber || 'xxxx',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        contact_name: '',
        contact_reference: 'undefined',
      }));
    }
  }, [selectedContact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDisabled && invoice.status === 'sent') {
      return;
    }

    setIsSaving(true);
    setFormStatus('');

    try {
      // Update invoice header
      const { netTotal, taxTotal, grossTotal } = calculateTotals();
      const headerData = {
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        contact_id: formData.contact_id,
        contact_name: formData.contact_name,
        contact_reference: formData.contact_reference,
        status: formData.status,
        notes: formData.notes,
        net_total: netTotal,
        tax_total: taxTotal,
        gross_total: grossTotal,
      };

      await apiClient.patch(`/invoice-headers/${invoice.id}`, headerData);

      await invoiceLinesSave({
        ...formData,
        invoice_header_id: invoice.id,
      });
      setFormStatus('success');
      setIsDisabled(formData.status === 'sent');
      if (onUpdate) {
        onUpdate({
          ...invoice,
          ...headerData,
          details: formData.details,
          net_total: netTotal,
          tax_total: taxTotal,
          gross_total: grossTotal,
          updated_at: new Date().toISOString(),
        });
      }
      setTimeout(() => closeModal(), 1000);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'An unexpected error occurred.';
      setFormStatus(errorMessage);
      setIsDisabled(invoice.status === 'sent');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-3">Edit Invoice</h2>

      {isDisabled && (
        <div className="p-4 mb-3 text-sm text-yellow-800 bg-yellow-100 rounded-lg">
          This invoice has been sent and can no longer be edited.
        </div>
      )}

      {formStatus === 'success' && (
        <div className="p-4 mb-3 text-sm text-green-700 bg-green-100 rounded-lg">
          Invoice updated successfully.
        </div>
      )}

      {formStatus !== 'success' && formStatus !== '' && (
        <div className="p-4 mb-3 text-sm text-red-700 bg-red-100 rounded-lg">{formStatus}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-600">
        <fieldset disabled={isDisabled || isSaving} className="space-y-4">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="invoice_number" className="block text-gray-700 font-semibold">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoice_number"
                name="invoice_number"
                value={formData.invoice_number}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="invoice_date" className="block text-gray-700 font-semibold">
                Invoice Date
              </label>
              <input
                type="date"
                id="invoice_date"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="due_date" className="block text-gray-700 font-semibold">
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="contact_id" className="block text-gray-700 font-semibold">
                Contact
              </label>
              <ContactPicker
                value={formData.contact_id}
                onChange={(contactId) => {
                  setFormData((prev) => ({
                    ...prev,
                    contact_id: contactId,
                  }));
                }}
                onContactSelect={handleContactSelect}
                placeholder="Search and select a contact..."
                className="w-full"
              />
            </div>
            {selectedContact && (
              <MediumContact key={formData.contact_id} contact={selectedContact} />
            )}
            <div>
              <label htmlFor="contact_reference" className="block text-gray-700 font-semibold">
                Contact Reference
              </label>
              <input
                type="text"
                id="contact_reference"
                name="contact_reference"
                value={formData.contact_reference}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* Status and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-gray-700 font-semibold">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="block text-gray-700 font-semibold">
                Notes
              </label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <InvoiceLines
            lineItems={formData.details}
            products={products}
            onAddLineItem={addLineItem}
            onUpdateLineItem={updateLineItem}
            onRemoveLineItem={removeLineItem}
            calculateTotals={calculateTotals}
          />
        </fieldset>

        <button
          type="submit"
          disabled={isDisabled || isSaving}
          className={`w-full px-6 py-3 font-semibold text-white rounded-lg transition duration-200 ${
            isDisabled || isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isSaving ? 'Saving...' : isDisabled ? 'Invoice Sent' : 'Save Invoice'}
        </button>
      </form>
    </div>
  );
};

export default InvoiceEdit;
