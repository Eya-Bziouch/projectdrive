import Toast from 'react-native-toast-message';

/**
 * Formats an error object into a user-friendly string message.
 * Supports Axios errors, custom error objects, and standard Error objects.
 */
export const formatError = (error) => {
    if (typeof error === 'string') return error;

    // Handle the custom error structure from api.js interceptor
    if (error?.message) {
        return error.message;
    }

    // Handle Axios-like response errors if not caught by interceptor
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    if (error?.response?.data?.error) {
        return error.response.data.error;
    }

    // Handle network errors
    if (error?.message === 'Network Error') {
        return 'Please check your internet connection and try again.';
    }

    if (error?.code === 'ECONNABORTED') {
        return 'The request timed out. Please try again.';
    }

    return 'An unexpected error occurred. Please try again later.';
};

/**
 * Shows an error toast message.
 */
export const showError = (message) => {
    Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
        position: 'bottom',
        visibilityTime: 3000,
        autoHide: true,
    });
};

/**
 * Shows a success toast message.
 */
export const showSuccess = (message) => {
    Toast.show({
        type: 'success',
        text1: 'Success',
        text2: message,
        position: 'bottom',
        visibilityTime: 3000,
        autoHide: true,
    });
};
