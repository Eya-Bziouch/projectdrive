// Define colors inline to avoid import issues
const themeColors = {
    darkGreen: '#1B211A',
    sageGreen: '#6F826A',
    lightGreen: '#BBD8A3',
    cream: '#F0F1C5',
    gold: '#BF9264',
    white: '#FFFFFF',
    gray: '#999999',
    error: '#E74C3C',
};

const theme = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
    },
    typography: {
        h1: { fontSize: 28, fontWeight: '700', color: themeColors.darkGreen },
        h2: { fontSize: 24, fontWeight: '600', color: themeColors.darkGreen },
        h3: { fontSize: 18, fontWeight: '600', color: themeColors.darkGreen },
        body: { fontSize: 14, fontWeight: '400', color: themeColors.sageGreen },
        label: { fontSize: 12, fontWeight: '500', color: themeColors.sageGreen },
    },
    shadows: {
        light: {
            elevation: 2,
            shadowColor: themeColors.darkGreen,
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
        },
        medium: {
            elevation: 4,
            shadowColor: themeColors.darkGreen,
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 6,
        },
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 20,
    },
    buttons: {
        primary: {
            backgroundColor: themeColors.lightGreen,
            borderRadius: 12,
            paddingVertical: 14,
        },
        secondary: {
            backgroundColor: themeColors.sageGreen,
            borderRadius: 12,
            paddingVertical: 14,
        },
    },
};

module.exports = { theme };

