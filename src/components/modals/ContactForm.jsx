import React, { useState } from 'react';
import { getApiUrl } from '../../helpers/apiHelper.js';
import { capchaSum } from '../../helpers/capchaSum.jsx';

const ContactForm = ({ setSubmitted, closeModal }) => {
  const capcha = capchaSum();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    reason: '',
    phone: '',
    details: '',
    captchaQuestion: capcha.toString(),
    captchaAnswer: '',
  });

  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');

    const apiUrl = getApiUrl() + '/contactme';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Handle successful response
      if (response.ok) {
        setFormData({
          name: '',
          email: '',
          message: '',
          reason: '',
          phone: '',
          details: '',
          captchaQuestion: capcha.toString(),
          captchaAnswer: '',
        });
        setStatus('success');
        setTimeout(() => {
          closeModal();
          setSubmitted(true);
        }, 2000);
      } else {
        // Handle server-side validation or other errors
        const errorData = await response.json();
        setStatus(errorData.message || 'An unexpected error occurred.');
      }
    } catch {
      // Handle network errors (e.g., server is down)
      setStatus('Failed to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xl w-full max-w-2xl">
      <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-3">Get in touch</h2>
      <p className="text-center text-sm text-gray-600 mb-1">
        Have a question or want to work together? Fill out the form below and i'll get back to you
        soon.
      </p>

      {/* Display success message */}
      {status === 'success' && (
        <div className="p-4 mb-3 text-sm text-green-700 bg-green-100 rounded-lg">
          Thank you for your message! We will be in touch shortly.
        </div>
      )}

      {/* Display error message */}
      {status !== 'success' && status !== '' && (
        <div className="p-4 mb-3 text-sm text-red-700 bg-red-100 rounded-lg">{status}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 text-sm text-gray-600">
        <div className="text-white text-xs">
          <label htmlFor="details">Details</label>
          <input
            value={formData.details}
            onChange={handleChange}
            type="text"
            name="details"
            tabIndex="-1"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-gray-700 font-semibold">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 font-semibold">
            Phone Number
          </label>
          <input
            type="number"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label htmlFor="reason" className="block text-gray-700 font-semibold">
            Reason for contact
          </label>
          <select
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 text-grey-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            <option value="" disabled>
              Select a reason...
            </option>
            <option value="freelance">Freelance work</option>
            <option value="full-time">Full time work</option>
            <option value="it-support">IT Support</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-gray-700 font-semibold">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          ></textarea>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="captcha" className="block text-gray-700 font-semibold">
            {`What is ${formData.captchaQuestion}?`}
          </label>
          <input
            type="text"
            id="captchaAnswer"
            name="captchaAnswer"
            value={formData.captchaAnswer}
            onChange={handleChange}
            required
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
