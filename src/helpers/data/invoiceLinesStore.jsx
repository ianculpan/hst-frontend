import { apiClient } from '../apiHelper.js';

const invoiceLinesStore = async (formData) => {
  const invoiceHeaderId = formData?.invoice_header_id;
  if (!invoiceHeaderId || !Array.isArray(formData?.details) || formData.details.length === 0) {
    return;
  }

  const requests = formData.details.map((line) => {
    const payload = {
      invoiceHeaderId,
      ...line,
    };

    if (line.id) {
      return apiClient.put(`/invoice-details/${line.id}`, payload);
    }

    return apiClient.post('/invoice-details', payload);
  });

  await Promise.all(requests);
};

export default invoiceLinesStore;
