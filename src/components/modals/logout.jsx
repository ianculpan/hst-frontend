import { useModal } from './ModalContext.jsx';
import { useNavigate } from 'react-router-dom';
import authHelper from '../../helpers/authHelper.js';
const Logout = () => {
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const handleLogoutConfirm = () => {
    authHelper.logout();
    closeModal();
    navigate('/');
  };

  return (
    <div className="text-center p-4">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Confirm Logout</h2>
      <p className="text-lg text-gray-700 mb-6">Are you sure you want to log out?</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleLogoutConfirm}
          className="px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
        >
          Yes, Logout
        </button>
        <button
          onClick={closeModal}
          className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Logout;
