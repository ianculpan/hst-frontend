import React, { useState, useEffect, useRef } from 'react';
import { getApiEndpoint, apiClient } from '../helpers/apiHelper.js';

const ContactPicker = ({
  value,
  onChange,
  onContactSelect,
  placeholder = 'Search and select a contact...',
  className = '',
  disabled = false,
  label = '',
  required = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch contacts based on search term
  const fetchContacts = async (search = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('per_page', '50'); // Get more results for selection

      const url = getApiEndpoint(`/contacts?${params.toString()}`);
      const response = await apiClient.get(url);

      if (response.data.items && Array.isArray(response.data.items)) {
        setContacts(response.data.items);
      } else if (Array.isArray(response.data.items)) {
        setContacts(response.data.items);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and search
  useEffect(() => {
    if (isOpen) {
      fetchContacts(searchTerm);
    }
  }, [isOpen, searchTerm]);

  // Set selected contact when value changes
  useEffect(() => {
    if (value && contacts.length > 0) {
      const contact = contacts.find((c) => c.id === value);
      if (contact) {
        setSelectedContact(contact);
      }
    } else if (!value) {
      setSelectedContact(null);
    }
  }, [value, contacts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    onChange(contact.id);
    // Pass the full contact object to the parent
    if (onContactSelect) {
      onContactSelect(contact);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedContact(null);
    onChange('');
    if (onContactSelect) {
      onContactSelect(null);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getDisplayName = (contact) => {
    if (contact.businessName) {
      return contact.businessName;
    }
    const name = [contact.salutation, contact.firstName, contact.secondName]
      .filter(Boolean)
      .join(' ');
    return name || contact.accountNumber || 'Unknown Contact';
  };

  const inputId = id || `contact-picker-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={isOpen ? searchTerm : selectedContact ? getDisplayName(selectedContact) : ''}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
          />

          {/* Clear button */}
          {selectedContact && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Dropdown arrow */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-gray-500 text-sm">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {searchTerm ? 'No contacts found' : 'Start typing to search contacts'}
              </div>
            ) : (
              <div className="py-1">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleContactSelect(contact)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                      selectedContact?.id === contact.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-600 text-sm">
                        {getDisplayName(contact)}
                      </span>
                      {contact.businessName && (
                        <span className="text-xs text-gray-600">
                          {[contact.salutation, contact.firstName, contact.secondName]
                            .filter(Boolean)
                            .join(' ')}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Account: {contact.accountNumber}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPicker;
