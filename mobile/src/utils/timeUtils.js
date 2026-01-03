/**
 * Time utility functions for formatting timestamps
 */

/**
 * Converts a timestamp to a relative time string (e.g., "2h ago", "Just now")
 * @param {string|Date} timestamp - The timestamp to convert
 * @returns {string} - Formatted relative time string
 */
export const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';

    try {
        const date = new Date(timestamp);
        const now = new Date();

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        // Check if date is in the future
        if (date > now) {
            return 'Just now';
        }

        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else if (days < 7) {
            return `${days}d ago`;
        } else if (weeks < 4) {
            return `${weeks}w ago`;
        } else if (months < 12) {
            return `${months}mo ago`;
        } else {
            return `${years}y ago`;
        }
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return 'Unknown time';
    }
};

/**
 * Formats a date to a readable string (e.g., "Jan 15, 2026")
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return 'No date';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }

        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Formats a full timestamp to a readable string (e.g., "Jan 15, 2026 at 3:30 PM")
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted timestamp string
 */
export const formatFullTimestamp = (timestamp) => {
    if (!timestamp) return 'No timestamp';

    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return 'Invalid timestamp';
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return 'Invalid timestamp';
    }
};
