import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import authHelper from '../helpers/authHelper.js';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
const PrivateRoute = ({ children }) => {
  const isLoggedIn = authHelper.isLoggedIn();
  let navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: { from: location.pathname },
      });
    }
  }, [isLoggedIn, navigate]);
  return isLoggedIn ? children : null;
};

export default PrivateRoute;
