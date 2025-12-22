import { useCallback, useState } from 'react';
import { ModalContext } from './ModalContext.jsx';
import Modal from './Modal.jsx';

// 3. The Modal Provider Component
// This component wraps the entire application and manages the modal's state.
// It also renders the generic Modal component.
export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Use useCallback to memoize these functions, preventing unnecessary re-renders.
  const openModal = useCallback((content) => {
    setModalContent(content);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
  }, []);

  // The value provided by the context.
  const value = {
    isOpen,
    openModal,
    closeModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* The generic modal is rendered here, outside the main application flow. */}
      <Modal isOpen={isOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
};

export default ModalProvider;
