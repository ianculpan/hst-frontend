import { createContext, useContext } from 'react';

export const ModalContext = createContext(false);

// 2. The Custom Hook to use the Modal
// This hook provides a simple API for any component to open and close the modal.
// It abstracts away the complexity of the context.
export const useModal = () => useContext(ModalContext);
