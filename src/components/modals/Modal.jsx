import React, { useEffect } from 'react';

// The main Modal component.
// It accepts three props:
// - isOpen: a boolean to control the modal's visibility.
// - onClose: a function to call when the modal should be closed.
// - children: the content to be displayed inside the modal.
const Modal = ({ isOpen, onClose, children }) => {
  // useEffect hook to handle the 'Escape' key press.
  useEffect(() => {
    // If the modal is not open, do nothing.
    if (!isOpen) return;

    // Define the handler for the keydown event.
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add the event listener when the modal is open.
    document.addEventListener('keydown', handleEscape);

    // Clean up the event listener when the component unmounts or isOpen changes.
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]); // Rerun the effect if isOpen or onClose changes.

  // If the modal is not open, don't render anything.
  if (!isOpen) return null;

  return (
    // The main modal container with a semi-transparent backdrop.
    // It's fixed to the viewport and covers the entire screen.
    // The 'onClick' handler closes the modal if the user clicks the backdrop.
    <div
      className="fixed inset-0 bg-gray-600/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out"
      onClick={onClose}
    >
      {/*
        The modal content container.
        We use 'event.stopPropagation()' to prevent the click event from bubbling up to the backdrop,
        which would cause the modal to close immediately when clicking the content.
      */}
      <div
        className="max-h-[90vh] overflow-y-auto relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl mx-auto transform transition-all duration-300 ease-out scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button with an SVG icon. */}
        <button
          className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
          onClick={onClose}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* The children content passed into the modal. */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
