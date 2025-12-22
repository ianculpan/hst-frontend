import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getApiEndpoint, apiClient } from '../helpers/apiHelper.js';
import InvoiceCard from '../components/InvoiceCard.jsx';
import InvoiceFilters from '../components/InvoiceFilters.jsx';
import { useModal } from '../components/modals/ModalContext.jsx';
import InvoiceCreate from '../components/modals/crud/invoice/InvoiceCreate.jsx';

const InvoiceList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const { openModal, closeModal } = useModal();

  const applyFilters = useCallback(
    (data) => {
      if (!data) return [];
      console.log(data);
      return data?.filter((invoice) => {
        if (!filters.search && !filters.status && !filters.dateFrom && !filters.dateTo) return true;

        const searchTerm = filters.search.toLowerCase();
        const invoiceNumber = String(invoice.invoice_number);
        const customerName = invoice.contact?.businessName?.toLowerCase() || '';
        const customerRef = invoice.customer_reference?.toLowerCase() || '';

        const searchMatch =
          !filters.search ||
          invoiceNumber.includes(searchTerm) ||
          customerName.includes(searchTerm) ||
          customerRef.includes(searchTerm);

        const statusMatch = !filters.status || invoice.status === filters.status;

        let dateMatch = true;
        if (filters.dateFrom) {
          const invoiceDate = new Date(invoice.invoice_date);
          const fromDate = new Date(filters.dateFrom);
          dateMatch = dateMatch && invoiceDate >= fromDate;
        }
        if (filters.dateTo) {
          const invoiceDate = new Date(invoice.invoice_date);
          const toDate = new Date(filters.dateTo);
          dateMatch = dateMatch && invoiceDate <= toDate;
        }

        return searchMatch && statusMatch && dateMatch;
      });
    },
    [filters]
  );

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', dateFrom: '', dateTo: '' });
  };

  const fetchIndexData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Fetch invoice headers
      const headersUrl = getApiEndpoint('/invoice-headers');
      const headersResponse = await apiClient.get(headersUrl);

      // Use response.data.items for the data array
      const invoiceHeaders = headersResponse.data?.items || headersResponse.data || [];

      setResponseData(Array.isArray(invoiceHeaders) ? invoiceHeaders : []);
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      const message = error?.response?.data?.message || error?.message || 'Request failed';
      setErrorMessage(message);
      setResponseData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchIndexData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setFilteredData(applyFilters(responseData));
  }, [responseData, applyFilters]);

  const handleInvoiceUpdate = () => {
    setResponseData(null);
    fetchIndexData();
  };

  const handleInvoiceCreate = async (newItem) => {
    // Re-fetch the complete invoice data to get all details including contact info
    try {
      const headersUrl = getApiEndpoint('/invoice-headers');
      const headersResponse = await apiClient.get(headersUrl);
      const updatedInvoiceHeaders = headersResponse.data?.items || headersResponse.data || [];

      // Find the newly created invoice in the updated data
      const createdInvoice = Array.isArray(updatedInvoiceHeaders)
        ? updatedInvoiceHeaders.find((invoice) => invoice.id === newItem.id)
        : null;

      if (createdInvoice) {
        setResponseData((prevData) => {
          // Remove any existing invoice with the same ID and add the complete one
          const filteredData = prevData.filter((item) => item.id !== newItem.id);
          return [...filteredData, createdInvoice];
        });
      }
    } catch (error) {
      console.error('Error fetching updated invoice data:', error);
      // Fallback to the original behavior if re-fetch fails
      setResponseData((prevData) => [...prevData, newItem]);
    }
  };

  const openCreateModal = () => {
    openModal(<InvoiceCreate closeModal={closeModal} onUpdate={handleInvoiceCreate} />);
  };

  return (
    <div className="">
      <section className="panel rounded-lg py-4 gap-4">
        <div className="flex items-center justify-between">
          <h1 className="panel-title p-4 text-3xl text-center">Invoices</h1>
          <div className="flex items-center gap-2 pr-2">
            <InvoiceFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
            <button
              className="px-4 bg-highlight-background text-highlight-foreground rounded-lg hover:bg-highlight-hover transition-colors"
              onClick={openCreateModal}
            >
              Add New
            </button>
          </div>
        </div>

        <div className="px-4 pt-4">
          {isLoading && <div className="text-theme-100">Loading...</div>}
          {!isLoading && errorMessage && <div className="text-red-300">Error: {errorMessage}</div>}
          {!isLoading && !errorMessage && filteredData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredData?.map((invoice, index) => (
                <InvoiceCard key={index} invoice={invoice} onUpdate={handleInvoiceUpdate} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InvoiceList;
