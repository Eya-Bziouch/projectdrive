import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api, { setLogoutCallback } from '../services/api';
import tokenService from '../services/tokenService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        user: null,
        isLoading: true,
        isSignout: false,
        isAuthenticated: false,
        error: null,
    });

    /**
     * Perform logout - clears tokens and optionally calls logout API
     * @param {boolean} callApi - Whether to call the backend logout endpoint
     */
    const performLogout = useCallback(async (callApi = false) => {
        try {
            if (callApi) {
                const refreshToken = await tokenService.getRefreshToken();
                if (refreshToken) {
                    try {
                        // Call backend to invalidate the refresh token
                        await api.post('/auth/logout', { refreshToken });
                    } catch (e) {
                        // Ignore logout API errors - we still want to clear local state
                        console.log('Logout API call failed:', e.message);
                    }
                }
            }

            // Clear all stored tokens
            await tokenService.clearTokens();
            await tokenService.clearRememberMe();

            // Reset authentication state
            setState({
                user: null,
                isLoading: false,
                isSignout: true,
                isAuthenticated: false,
                error: null,
            });
        } catch (e) {
            console.error('Logout error:', e);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Register logout callback for API interceptor to use
    useEffect(() => {
        setLogoutCallback(() => performLogout(false));
    }, [performLogout]);

    // Bootstrap - Check for existing tokens on app start
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const accessToken = await tokenService.getAccessToken();
                const refreshToken = await tokenService.getRefreshToken();

                // No tokens stored - user needs to login
                if (!accessToken && !refreshToken) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        isAuthenticated: false,
                    }));
                    return;
                }

                // Check Remember Me preference
                const rememberMe = await tokenService.getRememberMe();
                if (!rememberMe && !accessToken) {
                    // User didn't check "Remember Me" and access token is gone
                    // Clear everything and require new login
                    await tokenService.clearTokens();
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        isAuthenticated: false,
                    }));
                    return;
                }

                // Try to validate token by fetching user profile
                try {
                    const response = await api.get('/users/me');
                    setState(prev => ({
                        ...prev,
                        user: response.data.user,
                        isLoading: false,
                        isAuthenticated: true,
                    }));
                } catch (error) {
                    // Token refresh is handled automatically by the API interceptor
                    // If we still get here with an error, tokens are fully invalid
                    console.log('Token validation failed:', error.message);
                    await tokenService.clearTokens();
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        isAuthenticated: false,
                    }));
                }
            } catch (e) {
                console.error('Bootstrap error:', e);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isAuthenticated: false,
                }));
            }
        };

        bootstrapAsync();
    }, []);

    const authContext = {
        ...state,

        /**
         * Register a new user
         */
        register: async (fullName, cin, governorate, phone, email, password, passwordConfirm, driverLicense, vehicleMatricule) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            try {
                const payload = {
                    fullName,
                    cin,
                    governorate,
                    phone,
                    email,
                    password,
                    passwordConfirm,
                };

                // Add optional driver fields if provided
                if (driverLicense) payload.driverLicense = driverLicense;
                if (vehicleMatricule) payload.vehicleMatricule = vehicleMatricule;

                const response = await api.post('/auth/register', payload);
                const { accessToken, refreshToken, user } = response.data;

                // Store both tokens securely (always remember after registration)
                await tokenService.setTokens(accessToken, refreshToken);
                await tokenService.setRememberMe(true);

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isAuthenticated: true,
                    user,
                }));
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Registration failed',
                }));
                throw error;
            }
        },

        /**
         * Login user with email/name and password
         * @param {string} emailOrName - Email or full name
         * @param {string} password - Password
         * @param {boolean} rememberMe - Whether to persist the session
         */
        login: async (emailOrName, password, rememberMe = false) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            try {
                const response = await api.post('/auth/login', {
                    emailOrName,
                    password,
                });

                const { accessToken, refreshToken, user } = response.data;

                // Store tokens based on remember me preference
                await tokenService.setTokens(accessToken, refreshToken);
                await tokenService.setRememberMe(rememberMe);

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isAuthenticated: true,
                    isSignout: false,
                    user,
                }));
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Login failed',
                }));
                throw error;
            }
        },

        /**
         * Logout - clears local tokens and invalidates server-side refresh token
         */
        logout: async () => {
            setState(prev => ({ ...prev, isLoading: true }));
            await performLogout(true); // Call API to invalidate server-side token
        },

        /**
         * Logout from all devices
         * Requires authentication to invalidate all refresh tokens for the user
         */
        logoutAllDevices: async () => {
            setState(prev => ({ ...prev, isLoading: true }));
            try {
                await api.post('/auth/logout-all');
            } catch (e) {
                console.log('Logout all API call failed:', e.message);
            }
            await performLogout(false);
        },

        /**
         * Update user profile
         * @param {Object} userData - Profile data to update
         */
        updateProfile: async (userData) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            try {
                const response = await api.put('/users/me', userData);
                const updatedUser = response.data.user || response.data;

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    user: { ...prev.user, ...updatedUser },
                }));

                return updatedUser;
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error.message || 'Update failed',
                }));
                throw error;
            }
        },

        /**
         * Clear any authentication error
         */
        clearError: () => {
            setState(prev => ({ ...prev, error: null }));
        },
    };

    return (
        <AuthContext.Provider value={authContext}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
