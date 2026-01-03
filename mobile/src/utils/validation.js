/**
 * Validates an email address.
 * @param {string} email
 * @returns {{isValid: boolean, error: string}}
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email address' };
    }
    return { isValid: true, error: '' };
};

/**
 * Validates a password (min 6 characters).
 * @param {string} password
 * @returns {{isValid: boolean, error: string}}
 */
export const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    return { isValid: true, error: '' };
};

/**
 * Validates a phone number (Tunisian format preferred).
 * Accepts: +216xxxxxxxx, 00216xxxxxxxx, or xxxxxxxx (8 digits).
 * @param {string} phone
 * @returns {{isValid: boolean, error: string}}
 */
export const validatePhone = (phone) => {
    // Matches +216, 00216, or nothing, followed by 8 digits
    const phoneRegex = /^(?:\+216|00216)?[2459]\d{7}$/;
    if (!phone || !phoneRegex.test(phone)) {
        return { isValid: false, error: 'Invalid phone number (e.g., +216 12345678)' };
    }
    return { isValid: true, error: '' };
};

/**
 * Validates a CIN (Tunisian National ID).
 * Standard format is 8 digits.
 * @param {string} cin
 * @returns {{isValid: boolean, error: string}}
 */
export const validateCIN = (cin) => {
    const cinRegex = /^\d{8}$/;
    if (!cin || !cinRegex.test(cin)) {
        return { isValid: false, error: 'CIN must be exactly 8 digits' };
    }
    return { isValid: true, error: '' };
};

/**
 * Validates the ride creation form data.
 * @param {Object} formData
 * @param {string} formData.departure
 * @param {string} formData.destination
 * @param {string} formData.date
 * @param {string} formData.time
 * @param {number} formData.seats
 * @param {number} [formData.price]
 * @param {string} [formData.type] - 'DRIVER' or 'PASSENGER'
 * @returns {{isValid: boolean, errors: Object.<string, string>}}
 */
export const validateRideForm = (formData) => {
    const errors = {};

    if (!formData.departure || formData.departure.trim() === '') {
        errors.departure = 'Departure location is required';
    }

    if (!formData.destination || formData.destination.trim() === '') {
        errors.destination = 'Destination is required';
    }

    if (!formData.date) {
        errors.date = 'Date is required';
    }

    if (!formData.time) {
        errors.time = 'Time is required';
    }

    if (!formData.seats || formData.seats < 1) {
        errors.seats = 'At least 1 seat is required';
    }

    // If the user is a driver offering a ride, price is required
    if (formData.type === 'DRIVER') {
        if (formData.price === undefined || formData.price === null || formData.price < 0) {
            errors.price = 'Price is required for driver offers';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
