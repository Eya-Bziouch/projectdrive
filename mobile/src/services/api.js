import axios from 'axios';
import { Platform } from 'react-native';
import { API_CONFIG } from '../utils/constants';
import tokenService from './tokenService';

const BASE_URL = API_CONFIG.BASE_URL;

// Track if we're currently refreshing to prevent multiple simultaneous refresh calls
let isRefreshing = false;
// Queue of requests that failed due to 401 while refresh was in progress
let failedQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error if refresh failed
 * @param {string|null} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Logout callback holder - will be set by AuthContext
let logoutCallback = null;

/**
 * Set the logout callback to be called when tokens are invalid
 * @param {Function} callback - Logout function from AuthContext
 */
export const setLogoutCallback = (callback) => {
    logoutCallback = callback;
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Automatically attaches access token to every request
 */
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await tokenService.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles 401 errors by attempting to refresh the access token
 * Implements request queuing to prevent multiple simultaneous refresh calls
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 Unauthorized and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't try to refresh if the refresh endpoint itself failed
            if (originalRequest.url?.includes('/auth/refresh')) {
                // Refresh token is invalid, trigger logout
                if (logoutCallback) {
                    logoutCallback();
                }
                return Promise.reject(error);
            }

            // If we're already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            // Mark that we're now refreshing
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await tokenService.getRefreshToken();

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call the refresh endpoint
                // Use axios directly to avoid interceptors
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken } = response.data;

                // Store the new access token
                await tokenService.setAccessToken(accessToken);

                // Process any queued requests with the new token
                processQueue(null, accessToken);

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed, reject all queued requests
                processQueue(refreshError, null);

                // Clear stored tokens
                await tokenService.clearTokens();

                // Trigger logout to update app state
                if (logoutCallback) {
                    logoutCallback();
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // For non-401 errors or already retried requests, format and reject
        const customError = {
            message: error.response?.data?.message || error.message || 'Something went wrong',
            status: error.response?.status,
            data: error.response?.data,
        };

        return Promise.reject(customError);
    }
);

/**
 * API Service wrapper
 * Provides convenient methods for common HTTP operations
 */
const apiService = {
    get: (endpoint, params = {}) => api.get(endpoint, { params }),
    post: (endpoint, data) => api.post(endpoint, data),
    put: (endpoint, data) => api.put(endpoint, data),
    patch: (endpoint, data) => api.patch(endpoint, data),
    delete: (endpoint) => api.delete(endpoint),
    // Expose the raw axios instance if needed for custom configurations
    axiosInstance: api,
};

export default apiService;
