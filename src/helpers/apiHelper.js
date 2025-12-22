// Axios API client with auth token injection
import axios from 'axios';

/**
 * API URL Helper
 * Determines the correct API URL based on the environment
 */

export const getApiUrl = () => {
  // For development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL_DEV
      ? `${import.meta.env.VITE_API_URL_DEV}/api`
      : 'http://localhost:80/api';
  }

  // For production, use environment variable or fallback
  const productionUrl = import.meta.env.VITE_API_URL;

  if (!productionUrl) {
    console.error('VITE_API_URL is not defined! Check your .env file and rebuild.');
    // Fallback: try to infer from current location
    const currentHost = window.location.hostname;
    const fallbackUrl = `https://${currentHost.replace('www.', '').replace('frontend.', 'api.')}`;
    console.warn(`Using fallback API URL: ${fallbackUrl}/api`);
    return `${fallbackUrl}/api`;
  }

  return `${productionUrl}/api`;
};

/**
 * Get base URL without /api for CSRF cookie endpoint
 */
export const getBaseUrl = () => {
  // For development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL_DEV || 'http://localhost:80';
  }

  // For production, use environment variable or fallback
  const productionUrl = import.meta.env.VITE_API_URL;

  if (!productionUrl) {
    console.error('VITE_API_URL is not defined! Check your .env file and rebuild.');
    // Fallback: try to infer from current location
    const currentHost = window.location.hostname;
    const fallbackUrl = `https://${currentHost.replace('www.', '').replace('frontend.', 'api.')}`;
    console.warn(`Using fallback API URL: ${fallbackUrl}`);
    return fallbackUrl;
  }

  return productionUrl;
};

export const getApiEndpoint = (endpoint) => {
  const baseUrl = getApiUrl();
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

/**
 * Get CSRF token from cookie
 */
export const getCsrfToken = () => {
  const name = 'XSRF-TOKEN';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

/**
 * Fetch CSRF cookie from Laravel Sanctum
 * This must be called before making POST/PUT/DELETE requests
 * Note: With cross-subdomain setup, the cookie may not be readable via document.cookie
 * but will still be sent automatically by the browser with withCredentials: true
 */
export const fetchCsrfCookie = async () => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });

    // Try to get token from cookie (works if same domain or cookie set with .domain)
    const token = getCsrfToken();

    // If cookie not readable, try to get from response headers (if backend provides it)
    // Some Laravel setups return the token in a header
    const tokenFromHeader = response.headers['x-csrf-token'] || response.headers['x-xsrf-token'];

    if (tokenFromHeader) {
      // Store in memory for cross-subdomain scenarios
      csrfTokenInMemory = tokenFromHeader;
      // Also try to store in cookie (may not work cross-subdomain)
      try {
        document.cookie = `XSRF-TOKEN=${encodeURIComponent(tokenFromHeader)}; path=/; SameSite=Lax`;
      } catch {
        // Cookie setting may fail, but we have it in memory
      }
    }

    if (!token && !tokenFromHeader) {
      console.warn('CSRF cookie was not set or is not readable (cross-subdomain issue)');
      console.warn(
        'The cookie may still be sent automatically by the browser with withCredentials: true'
      );
    }

    return token || tokenFromHeader;
  } catch (error) {
    console.error('Failed to fetch CSRF cookie:', error);
    throw error;
  }
};

// Track if we're currently fetching CSRF cookie to avoid multiple simultaneous requests
let csrfFetchPromise = null;
// Store CSRF token in memory for cross-subdomain scenarios
let csrfTokenInMemory = null;

export const apiClient = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config) => {
    // Only set Authorization header from localStorage if it's not already set
    // This allows us to pass a temp token for 2FA verification
    if (!config.headers['Authorization']) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // For state-changing methods (POST, PUT, DELETE, PATCH), ensure CSRF cookie is fetched
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (stateChangingMethods.includes(config.method.toUpperCase())) {
      let csrfToken = getCsrfToken() || csrfTokenInMemory;

      // If no CSRF token available, fetch it
      if (!csrfToken) {
        // If we're already fetching, wait for that promise
        if (csrfFetchPromise) {
          const fetchedToken = await csrfFetchPromise;
          csrfToken = getCsrfToken() || fetchedToken || csrfTokenInMemory;
        } else {
          // Start fetching CSRF cookie
          csrfFetchPromise = fetchCsrfCookie().catch((error) => {
            console.warn('Failed to fetch CSRF cookie in interceptor:', error);
            return null;
          });
          const fetchedToken = await csrfFetchPromise;
          csrfFetchPromise = null; // Clear the promise after it completes

          // Update in-memory token if we got one
          if (fetchedToken) {
            csrfTokenInMemory = fetchedToken;
          }

          csrfToken = getCsrfToken() || fetchedToken || csrfTokenInMemory;
        }
      }

      // Add CSRF token to header if available
      if (csrfToken) {
        config.headers = config.headers ?? {};
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    } else {
      // For GET requests, add CSRF token if available (some APIs might need it)
      const csrfToken = getCsrfToken() || csrfTokenInMemory;
      if (csrfToken) {
        config.headers = config.headers ?? {};
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
