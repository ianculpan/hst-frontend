// CrudButtons.jsx
import React, { useState, useRef, useEffect } from 'react';

const CrudButtons = ({ onEdit, onDelete, onView }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded hover:bg-gray-200 transition-all duration-200"
        aria-label="Open actions menu"
      >
        {/* Right arrow that rotates down when open */}
        <svg
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 20 20"
          className={`transform transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        >
          <path d="M7 4l6 6-6 6V4z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-light border rounded shadow-lg z-10">
          <button
            onClick={() => {
              setOpen(false);
              onView && onView();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-muted hover:text-indigo-700"
          >
            View
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onEdit && onEdit();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-muted hover:text-indigo-700"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete && onDelete();
            }}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-muted "
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default CrudButtons;
