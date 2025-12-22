import { useAuth } from './AuthContext.js';
import { useNavigate } from 'react-router-dom';

export default function LoginButtons() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };
  return (
    <>
      {isLoggedIn ? (
        <button
          className="border-highlight border bg-highlight rounded-lg px-4 p-1"
          onClick={handleLogout}
        >
          Logout
        </button>
      ) : (
        <button
          className="items-end border-highlight bg-highlight rounded-lg px-4 p-1"
          onClick={handleLogin}
        >
          Login
        </button>
      )}
    </>
  );
}
