import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { apiClient, fetchCsrfCookie } from '../helpers/apiHelper.js';
import authHelper from '../helpers/authHelper';
import { useNavigate } from 'react-router-dom';
export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [needsTwoFactorSetup, setNeedsTwoFactorSetup] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(authHelper.isLoggedIn());

  // Fetch the logged-in user
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/user');
      setUser(data);
      setIsLoggedIn(true);
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authHelper.isLoggedIn()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  // Login (step 1)
  const login = async (email, password) => {
    setLoading(true);
    setNeedsTwoFactor(false);
    setNeedsTwoFactorSetup(false);
    setTwoFactorSetupData(null);
    setTempToken(null);

    try {
      await fetchCsrfCookie();

      const response = await apiClient.post('/login', {
        email,
        password,
      });

      const responseData = response.data;
      const requiresTwoFactor = responseData?.two_factor_required;
      const requiresTwoFactorSetup = responseData?.two_factor_setup_required;
      const tempToken = responseData?.temp_token;

      if (requiresTwoFactorSetup && tempToken) {
        // 2FA setup is required - store temp token and fetch QR code data
        setTempToken(tempToken);
        setNeedsTwoFactorSetup(true);

        // Fetch QR code URL and secret using temp token
        try {
          const qrResponse = await apiClient.get('/user/two-factor/secret', {
            headers: {
              Authorization: `Bearer ${tempToken}`,
            },
          });

          const qrData = qrResponse.data;
          setTwoFactorSetupData({
            qr_code_url: qrData?.qr_code_url,
            secret: qrData?.secret,
            message: qrData?.message,
          });
        } catch (qrError) {
          console.error('Error fetching QR code:', qrError);
          // If QR code endpoint doesn't exist, use data from login response
          if (responseData?.qr_code_url || responseData?.secret) {
            setTwoFactorSetupData({
              qr_code_url: responseData?.qr_code_url,
              secret: responseData?.secret,
              message: responseData?.message,
            });
          }
        }
        return; // Don't fetch user or set token yet
      }

      if (requiresTwoFactor) {
        // 2FA verification is required - set state and return early
        if (tempToken) {
          setTempToken(tempToken);
        }
        setNeedsTwoFactor(true);
        return; // Don't fetch user or set token yet
      }

      // Normal login success - set token and fetch user
      if (tempToken) {
        authHelper.login(tempToken);
        await fetchUser();
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2FA verification (step 2)
  const verifyTwoFactor = async (code) => {
    setLoading(true);

    try {
      // Use temp token for authorization if available
      const headers = tempToken
        ? {
            Authorization: `Bearer ${tempToken}`,
          }
        : {};

      const response = await apiClient.post('/user/two-factor/verify', { code }, { headers });

      // Extract token from response - handle both nested and flat structures
      const responseData = response.data?.data || response.data;
      const token = responseData?.token || response.data?.token;

      if (token) {
        // Store the final authentication token
        authHelper.login(token);

        setTempToken(null); // Clear temp token
        setNeedsTwoFactor(false);
        setNeedsTwoFactorSetup(false);
        setTwoFactorSetupData(null);
        navigate('/');
        // await fetchUser();
      } else {
        throw new Error('No token received from verification response');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Optional: recovery code
  const verifyRecoveryCode = async (recoveryCode) => {
    setLoading(true);

    try {
      // Use temp token for authorization if available
      const headers = tempToken
        ? {
            Authorization: `Bearer ${tempToken}`,
          }
        : {};

      const response = await apiClient.post(
        '/two-factor-challenge',
        {
          recovery_code: recoveryCode,
        },
        { headers }
      );

      // Extract token from response - handle both nested and flat structures
      const responseData = response.data?.data || response.data;
      const token = responseData?.token || response.data?.token;

      if (token) {
        // Store the final authentication token
        authHelper.login(token);
        setTempToken(null); // Clear temp token
        setNeedsTwoFactor(false);
        setNeedsTwoFactorSetup(false);
        setTwoFactorSetupData(null);
        await fetchUser();
      } else {
        throw new Error('No token received from recovery code verification response');
      }
    } catch (error) {
      console.error('Recovery code verification error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.post('/logout');
    authHelper.logout();
    setUser(null);
    setIsLoggedIn(false);
    setNeedsTwoFactor(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        needsTwoFactor,
        needsTwoFactorSetup,
        twoFactorSetupData,
        tempToken,
        isLoggedIn,
        login,
        verifyTwoFactor,
        verifyRecoveryCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
