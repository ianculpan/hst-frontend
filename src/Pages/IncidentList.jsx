import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getApiEndpoint, apiClient } from '../helpers/apiHelper.js';
import IncidentCard from '../components/IncidentCard.jsx';
import IncidentFilters from '../components/IncidentFilters.jsx';
import { useModal } from '../components/modals/ModalContext.jsx';
import IncidentCreate from '../components/modals/crud/incident/IncidentCreate.jsx';

const incidentList = () => {
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
      return data?.filter((incident) => {
        if (!filters.search && !filters.status && !filters.dateFrom && !filters.dateTo) return true;

        const searchTerm = filters.search.toLowerCase();
        const incidentNumber = String(incident_number);
        const customerName = incident.contact?.businessName?.toLowerCase() || '';
        const customerRef = incident.customer_reference?.toLowerCase() || '';

        const searchMatch =
          !filters.search ||
          incidentNumber.includes(searchTerm) ||
          customerName.includes(searchTerm) ||
          customerRef.includes(searchTerm);

        const statusMatch = !filters.status || incident.status === filters.status;

        let dateMatch = true;
        if (filters.dateFrom) {
          const incidentDate = new Date(incident.incident_date);
          const fromDate = new Date(filters.dateFrom);
          dateMatch = dateMatch && incidentDate >= fromDate;
        }
        if (filters.dateTo) {
          const incidentDate = new Date(incident.incident_date);
          const toDate = new Date(filters.dateTo);
          dateMatch = dateMatch && incidentDate <= toDate;
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
      // Fetch incident headers
      const headersUrl = getApiEndpoint('/incident-headers');
      const headersResponse = await apiClient.get(headersUrl);

      // Use response.data.items for the data array
      const incidentHeaders = headersResponse.data?.items || headersResponse.data || [];

      setResponseData(Array.isArray(incidentHeaders) ? incidentHeaders : []);
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

  const handleincidentUpdate = () => {
    setResponseData(null);
    fetchIndexData();
  };

  const handleincidentCreate = async (newItem) => {
    // Re-fetch the complete incident data to get all details including contact info
    try {
      const headersUrl = getApiEndpoint('/incidents');
      const headersResponse = await apiClient.get(headersUrl);
      const updatedincidentHeaders = headersResponse.data?.items || headersResponse.data || [];

      // Find the newly created incident in the updated data
      const createdincident = Array.isArray(updatedincidentHeaders)
        ? updatedincidentHeaders.find((incident) => incident.id === newItem.id)
        : null;

      if (createdincident) {
        setResponseData((prevData) => {
          // Remove any existing incident with the same ID and add the complete one
          const filteredData = prevData.filter((item) => item.id !== newItem.id);
          return [...filteredData, createdincident];
        });
      }
    } catch (error) {
      console.error('Error fetching updated incident data:', error);
      // Fallback to the original behavior if re-fetch fails
      setResponseData((prevData) => [...prevData, newItem]);
    }
  };

  const openCreateModal = () => {
    openModal(<incidentCreate closeModal={closeModal} onUpdate={handleincidentCreate} />);
  };

  return (
    <div className="">
      <section className="panel rounded-lg py-4 gap-4">
        <div className="flex items-center justify-between">
          <h1 className="panel-title p-4 text-3xl text-center">incidents</h1>
          <div className="flex items-center gap-2 pr-2">
            <incidentFilters
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
              {filteredData?.map((incident, index) => (
                <incidentCard key={index} incident={incident} onUpdate={handleincidentUpdate} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default incidentList;
