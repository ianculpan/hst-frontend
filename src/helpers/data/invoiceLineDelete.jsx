import { apiClient } from '../apiHelper.js';

const invoiceLineDelete = async (line) => {
  await apiClient.delete(`/invoice-details/${line.id}/`);
};

export default invoiceLineDelete;
