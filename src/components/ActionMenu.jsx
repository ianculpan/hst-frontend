// ActionMenu.jsx - Flexible dropdown menu for custom actions
import React, { useState, useRef, useEffect } from 'react';

const ActionMenu = ({ actions = [], icon, buttonClassName, menuClassName }) => {
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

  const defaultIcon = (
    <svg
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 20 20"
      className={`transform transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    >
      <path d="M7 4l6 6-6 6V4z" />
    </svg>
  );

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={buttonClassName || 'p-2 rounded hover:bg-gray-200 transition-all duration-200'}
        aria-label="Open actions menu"
      >
        {icon || defaultIcon}
      </button>
      {open && (
        <div
          className={
            menuClassName ||
            'absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10'
          }
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                setOpen(false);
                action.onClick && action.onClick();
              }}
              disabled={action.disabled}
              className={`
                block w-full text-left px-4 py-2 transition-colors
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                ${action.className || 'text-gray-700'}
                ${index < actions.length - 1 ? 'border-b border-gray-100' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                {action.icon && <span className="text-lg">{action.icon}</span>}
                <div className="flex-1">
                  <div className="font-medium">{action.label}</div>
                  {action.description && (
                    <div className="text-xs text-gray-500">{action.description}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
