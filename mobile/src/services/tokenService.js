import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const REMEMBER_ME_KEY = 'rememberMe';

// Use SecureStore on native platforms, AsyncStorage on web
const isWeb = Platform.OS === 'web';

/**
 * Secure token storage service
 * Uses SecureStore on iOS/Android for secure storage (Keychain/Keystore)
 * Falls back to AsyncStorage on web
 */
const tokenService = {
    /**
     * Store access token securely
     * @param {string} token - The access token to store
     */
    async setAccessToken(token) {
        if (isWeb) {
            await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
        } else {
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
        }
    },

    /**
     * Retrieve access token
     * @returns {Promise<string|null>} The stored access token or null
     */
    async getAccessToken() {
        if (isWeb) {
            return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        }
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    },

    /**
     * Store refresh token securely
     * @param {string} token - The refresh token to store
     */
    async setRefreshToken(token) {
        if (isWeb) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
        } else {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
        }
    },

    /**
     * Retrieve refresh token
     * @returns {Promise<string|null>} The stored refresh token or null
     */
    async getRefreshToken() {
        if (isWeb) {
            return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        }
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },

    /**
     * Store both access and refresh tokens
     * @param {string} accessToken - The access token
     * @param {string} refreshToken - The refresh token
     */
    async setTokens(accessToken, refreshToken) {
        await Promise.all([
            this.setAccessToken(accessToken),
            this.setRefreshToken(refreshToken),
        ]);
    },

    /**
     * Clear all authentication tokens
     * Used during logout to remove all stored credentials
     */
    async clearTokens() {
        if (isWeb) {
            await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
        } else {
            await Promise.all([
                SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
                SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
            ]);
        }
    },

    /**
     * Store remember me preference
     * @param {boolean} value - Whether to remember the user
     */
    async setRememberMe(value) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, value ? 'true' : 'false');
    },

    /**
     * Get remember me preference
     * @returns {Promise<boolean>} Whether remember me is enabled
     */
    async getRememberMe() {
        const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        return value === 'true';
    },

    /**
     * Clear remember me preference
     */
    async clearRememberMe() {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    },

    /**
     * Check if user has valid tokens stored
     * @returns {Promise<boolean>} Whether tokens exist
     */
    async hasTokens() {
        const accessToken = await this.getAccessToken();
        const refreshToken = await this.getRefreshToken();
        return !!(accessToken || refreshToken);
    },
};

export default tokenService;
