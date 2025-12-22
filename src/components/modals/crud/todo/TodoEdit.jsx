import React, { useState, useEffect } from 'react';
import { apiClient, getApiEndpoint } from '../../../../helpers/apiHelper.js';

const TodoEdit = ({ item, closeModal, onUpdate }) => {
  const { id, task, description, status, category, priority } = item;
  const [formData, setFormData] = useState({
    id,
    task,
    description,
    status,
    category,
    priority: priority || 5,
  });

  /* task, description, status, category */
  const [formStatus, setFormStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const url = getApiEndpoint('/settings?type=todo_categories');
      console.log('Fetching categories from:', url);
      const response = await apiClient.get(url);
      console.log('Categories response:', response.data);
      setCategories(response.data || {});
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories({});
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const url = getApiEndpoint('/settings?type=todo_status');
      const response = await apiClient.get(url);
      setStatusList(response.data || {});
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setStatusList({});
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatus();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormStatus('');

    try {
      const response = await apiClient.patch(`/todos/${formData.id}`, formData);
      console.log(formData);
      // Handle successful response
      if (response.status === 200) {
        setFormData({
          task: '',
          description: '',
          status: '',
          category: '',
          priority: 5,
        });
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
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-xl w-full max-w-2xl">
      <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-3">Edit Todo</h2>

      {/* Display success message */}
      {formStatus === 'success' && (
        <div className="p-4 mb-3 text-sm text-green-700 bg-green-100 rounded-lg">
          Todo updated successfully.
        </div>
      )}

      {/* Display error message */}
      {formStatus !== 'success' && formStatus !== '' && (
        <div className="p-4 mb-3 text-sm text-red-700 bg-red-100 rounded-lg">{formStatus}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 text-sm text-gray-600">
        <div>
          <label htmlFor="task" className="block text-gray-700 font-semibold">
            Task
          </label>
          <input
            type="text"
            id="task"
            name="task"
            value={formData.task}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-700 font-semibold">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-gray-700 font-semibold">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={categoriesLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            <option value="">Select a category</option>
            {categories.todo_categories &&
              Object.entries(categories.todo_categories).map(([name, id]) => (
                <option key={id} value={name}>
                  {name}
                </option>
              ))}
          </select>
          {categoriesLoading && (
            <div className="text-sm text-gray-500 mt-1">Loading categories...</div>
          )}
        </div>
        <div>
          <label htmlFor="status" className="block text-gray-700 font-semibold">
            status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            disabled={statusLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            <option value="">Select a status</option>
            {statusList.todo_status &&
              Object.entries(statusList.todo_status).map(([name, id]) => (
                <option key={id} value={name}>
                  {name}
                </option>
              ))}
          </select>
          {statusLoading && <div className="text-sm text-gray-500 mt-1">Loading status...</div>}
        </div>

        <div>
          <label htmlFor="priority" className="block text-gray-700 font-semibold">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
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

export default TodoEdit;
