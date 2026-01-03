/**
 * Application Constants
 */

import { Platform } from 'react-native';

// Platform-aware API URL
// Android emulator: use 10.0.2.2 to access host machine's localhost
// iOS simulator/Physical device: use machine's local IP address
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        // For Android emulator
        return 'http://10.0.2.2:3000/api';
    }
    // For iOS simulator or physical devices, use your machine's IP
    // Update this IP address with your actual machine IP (run ipconfig/ifconfig)
    return 'http://192.168.1.97:3000/api';
};

export const API_CONFIG = {
    BASE_URL: getBaseUrl(),
    TIMEOUT: 10000,
};

export const NAV_STACKS = {
    AUTH: 'Auth',
    MAIN: 'Main',
    TABS: 'Tabs',
    HOME: 'Home',
    HISTORY: 'History',
    CREATE_RIDE: 'CreateRide',
    PROFILE: 'Profile',
    RIDE_DETAILS: 'RideDetails',
    SETTINGS: 'Settings',
};

export const RIDE_TYPES = {
    DRIVER: 'DRIVER',
    PASSENGER: 'PASSENGER',
};

export const RIDE_STATUS = {
    COMPLETED: 'completed',
    UPCOMING: 'upcoming',
    FULL: 'full',
};

export const MESSAGES = {
    SUCCESS: {
        RIDE_CREATED: 'Your ride has been published successfully. 🚗',
        RIDE_JOINED: 'You have successfully joined the ride.',
        PROFILE_UPDATED: 'Profile updated successfully.',
    },
    ERROR: {
        GENERIC: 'An unexpected error occurred. Please try again later.',
        NETWORK: 'Please check your internet connection and try again.',
        TIMEOUT: 'The request timed out. Please try again.',
        UNAUTHORIZED: 'Session expired. Please log in again.',
        NOT_FOUND: 'Resource not found.',
    },
    VALIDATION: {
        REQUIRED_FIELD: 'This field is required.',
        INVALID_EMAIL: 'Please enter a valid email address.',
        INVALID_PRICE: 'Please enter a valid price greater than 0.',
        MIN_SEATS: 'At least 1 seat is required.',
        PAST_DATE: 'Date cannot be in the past.',
        PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long.',
    },
};

export const GOVERNORATES = [
    'Ariana',
    'Beja',
    'Ben Arous',
    'Bizerte',
    'Gabes',
    'Gafsa',
    'Jendouba',
    'Kairouan',
    'Kasserine',
    'Kebili',
    'Kef',
    'Mahdia',
    'Manouba',
    'Medenine',
    'Monastir',
    'Nabeul',
    'Sfax',
    'Sidi Bouzid',
    'Siliana',
    'Sousse',
    'Tataouine',
    'Tozeur',
    'Tunis',
    'Zaghouan',
];

const CONSTANTS = {
    API_CONFIG,
    NAV_STACKS,
    RIDE_TYPES,
    RIDE_STATUS,
    MESSAGES,
    GOVERNORATES,
};

export default CONSTANTS;
