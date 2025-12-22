import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../../helpers/apiHelper.js';
import InvoiceLines from '../../../InvoiceLines.jsx';
import ContactPicker from '../../../ContactPicker.jsx';

const InvoiceCreate = ({ closeModal, onUpdate }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contact_id: '',
    contact_name: '',
    contact_reference: '',
    status: 'draft',
    notes: '',
    line_items: [],
    net_total: 0,
    tax_total: 0,
    gross_total: 0,
  });

  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);

  // Fetch contacts and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsResponse, productsResponse] = await Promise.all([
          apiClient.get('/contacts'),
          apiClient.get('/products'),
        ]);
        setContacts(contactsResponse.data || []);
        setProducts(productsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // Update form data when selectedContact changes
  useEffect(() => {
    if (selectedContact) {
      setFormData((prev) => ({
        ...prev,
        contact_id: selectedContact.id,
        contact_name: selectedContact.businessContact
          ? selectedContact.businessName
          : `${selectedContact.salutation} ${selectedContact.firstName} ${selectedContact.secondName}`.trim(),
        contact_reference: selectedContact.accountNumber || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        contact_id: '',
        contact_name: '',
        contact_reference: '',
      }));
    }
  }, [selectedContact]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If contact_id changes, update selectedContact
    if (name === 'contact_id') {
      const contact = contacts.find((c) => {
        return c.id == value;
      });
      setSelectedContact(contact || null);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const addLineItem = (product = null) => {
    const newLineItem = {
      id: Date.now(), // Temporary ID for frontend
      product_id: product ? product.id : '',
      sku: product ? product.sku : '',
      lineDescription: product ? product.description : '',
      lineQuantity: 1,
      lineUnitPrice: product ? product.sale_price : 0,
      line_total: product ? product.sale_price : 0,
    };
    setFormData((prev) => ({
      ...prev,
      line_items: [...prev.line_items, newLineItem],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData((prev) => {
      const updatedLineItems = [...prev.line_items];
      updatedLineItems[index] = {
        ...updatedLineItems[index],
        [field]: value,
      };

      // Calculate line total
      if (field === 'lineQuantity' || field === 'lineUnitPrice') {
        const quantity = parseFloat(updatedLineItems[index].lineQuantity) || 0;
        const unitPrice = parseFloat(updatedLineItems[index].lineUnitPrice) || 0;
        updatedLineItems[index].line_total = quantity * unitPrice;
      }

      // Update product details if product_id changes
      if (field === 'product_id') {
        const product = products.find((p) => p.id === value);
        if (product) {
          updatedLineItems[index].sku = product.sku;
          updatedLineItems[index].lineDescription = product.description;
          updatedLineItems[index].lineUnitPrice = product.sale_price || 0;
          updatedLineItems[index].line_total =
            (parseFloat(updatedLineItems[index].lineQuantity) || 0) *
            (parseFloat(product.sale_price) || 0);
        }
      }

      return {
        ...prev,
        line_items: updatedLineItems,
      };
    });
  };

  const calculateTotals = () => {
    const netTotal = formData.line_items.reduce(
      (sum, item) => sum + (parseFloat(item.line_total) || 0),
      0
    );

    // Calculate tax total based on tax rate from products
    const taxTotal = formData.line_items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      const taxRate = product ? (parseFloat(product.tax_rate) || 0) / 100 : 0;
      return sum + (parseFloat(item.line_total) || 0) * taxRate;
    }, 0);

    const grossTotal = netTotal + taxTotal;

    return { netTotal, taxTotal, grossTotal };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormStatus('');

    try {
      // Create invoice header
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

      const headerResponse = await apiClient.post('/invoice-headers', headerData);
      const invoiceId = headerResponse.data.id;

      // Create line items
      if (formData.line_items.length > 0) {
        const lineItemsData = formData.line_items.map((item) => ({
          invoice_id: invoiceId,
          product_id: item.product_id,
          product_sku: item.product_sku,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
        }));

        await apiClient.post(`/invoice-details/${invoiceId}`, lineItemsData);
      }

      setFormStatus('success');
      if (onUpdate) {
        onUpdate({
          id: invoiceId,
          ...headerData,
          line_items: formData.line_items,
          net_total: netTotal,
          tax_total: taxTotal,
          gross_total: grossTotal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      setTimeout(() => closeModal(), 1000);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'An unexpected error occurred.';
      setFormStatus(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-3">
        Create Invoice
      </h2>

      {formStatus === 'success' && (
        <div className="p-4 mb-3 text-sm text-green-700 bg-green-100 rounded-lg">
          Invoice created successfully.
        </div>
      )}

      {formStatus !== 'success' && formStatus !== '' && (
        <div className="p-4 mb-3 text-sm text-red-700 bg-red-100 rounded-lg">{formStatus}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-600">
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

        {/* Customer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="contact_id" className="block text-gray-700 font-semibold">
              Customer
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
              placeholder="Search and select a customer..."
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="contact_name" className="block text-gray-700 font-semibold">
              Customer Name
            </label>
            <input
              type="text"
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="contact_reference" className="block text-gray-700 font-semibold">
              Customer Reference
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
          lineItems={formData.line_items}
          onAddLineItem={addLineItem}
          onUpdateLineItem={updateLineItem}
          onRemoveLineItem={removeLineItem}
          calculateTotals={calculateTotals}
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-6 py-3 font-semibold text-white rounded-lg transition duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
};

export default InvoiceCreate;
