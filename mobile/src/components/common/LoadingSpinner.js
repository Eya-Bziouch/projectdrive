import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from 'react-native';
const colors = require('../../styles/colors');

const LoadingSpinner = ({ visible, message }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color={colors.lightGreen} />
                    {message && (
                        <Text style={styles.message}>{message}</Text>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: colors.white,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        minWidth: 120,
        // Elevation for Android
        elevation: 5,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    message: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkGreen,
        textAlign: 'center',
    },
});

export default LoadingSpinner;
