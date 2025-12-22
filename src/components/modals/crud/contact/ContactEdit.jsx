import React, { useState } from 'react';
import { apiClient } from '../../../../helpers/apiHelper.js';

const ContactEdit = ({ item, closeModal, onUpdate }) => {
  const {
    id,
    accountNumber,
    salutation,
    firstName,
    secondName,
    businessName,
    address1,
    address2,
    address3,
    postTown,
    county,
    postCode,
    contactPhone,
    active,
    businessAccount,
    businessContact,
  } = item;

  const [formData, setFormData] = useState({
    accountNumber,
    salutation,
    firstName,
    secondName,
    businessName,
    address1,
    address2,
    address3,
    postTown,
    county,
    postCode,
    contactPhone,
    active,
    businessAccount,
    businessContact,
  });

  const [formStatus, setFormStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormStatus('');

    try {
      const response = await apiClient.patch(`/contacts/${id}`, formData);

      // Handle successful response
      if (response.status === 200) {
        setFormStatus('success');
        // Call the update callback with the updated item data
        if (onUpdate) {
          onUpdate({
            id,
            ...formData,
          });
        }
        setTimeout(() => {
          closeModal();
        }, 1000);
      }
    } catch (error) {
      // Handle server-side validation or other errors
      const errorMessage = error?.response?.data?.message || 'An unexpected error occurred.';
      setFormStatus(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-3">Edit Contact</h2>

      {/* Display success message */}
      {formStatus === 'success' && (
        <div className="p-4 mb-3 text-sm text-green-700 bg-green-100 rounded-lg">
          Contact updated successfully.
        </div>
      )}

      {/* Display error message */}
      {formStatus !== 'success' && formStatus !== '' && (
        <div className="p-4 mb-3 text-sm text-red-700 bg-red-100 rounded-lg">{formStatus}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="accountNumber" className="block text-gray-700 font-semibold">
              Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="contactPhone" className="block text-gray-700 font-semibold">
              Phone
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="businessContact"
              checked={formData.businessContact}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-700 font-semibold">Business Contact</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-700 font-semibold">Active</span>
          </label>
        </div>

        {formData.businessContact ? (
          <div>
            <label htmlFor="businessName" className="block text-gray-700 font-semibold">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="salutation" className="block text-gray-700 font-semibold">
                Salutation
              </label>
              <select
                id="salutation"
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="">Select</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
                <option value="Prof">Prof</option>
              </select>
            </div>

            <div>
              <label htmlFor="firstName" className="block text-gray-700 font-semibold">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>

            <div>
              <label htmlFor="secondName" className="block text-gray-700 font-semibold">
                Second Name
              </label>
              <input
                type="text"
                id="secondName"
                name="secondName"
                value={formData.secondName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
          </div>
        )}

        {formData.businessContact && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="businessAccount"
                checked={formData.businessAccount}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700 font-semibold">Business Account</span>
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="address1" className="block text-gray-700 font-semibold">
              Address Line 1
            </label>
            <input
              type="text"
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="address2" className="block text-gray-700 font-semibold">
              Address Line 2
            </label>
            <input
              type="text"
              id="address2"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="address3" className="block text-gray-700 font-semibold">
              Address Line 3
            </label>
            <input
              type="text"
              id="address3"
              name="address3"
              value={formData.address3}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="postTown" className="block text-gray-700 font-semibold">
              Post Town
            </label>
            <input
              type="text"
              id="postTown"
              name="postTown"
              value={formData.postTown}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="county" className="block text-gray-700 font-semibold">
              County
            </label>
            <input
              type="text"
              id="county"
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
        </div>

        <div>
          <label htmlFor="postCode" className="block text-gray-700 font-semibold">
            Post Code
          </label>
          <input
            type="text"
            id="postCode"
            name="postCode"
            value={formData.postCode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-6 py-2 font-semibold text-white rounded-lg transition duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default ContactEdit;
