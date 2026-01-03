import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
    SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRides } from '../../context/RideContext';
import userService from '../../services/userService';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EditableField from '../../components/profile/EditableField';
import Button from '../../components/common/Button';
import RideForm from '../../components/ride/RideForm'; // Assuming this exists
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { formatError } from '../../utils/errorUtils'; // Assuming this exists
// Helper for toast/alerts if not global. Assuming toast library is used elsewhere.
import Toast from 'react-native-toast-message';

const colors = require('../../styles/colors');
const { theme } = require('../../styles/theme');

const showSuccess = (msg) => Toast.show({ type: 'success', text1: 'Success', text2: msg });
const showError = (msg) => Toast.show({ type: 'error', text1: 'Error', text2: msg });


const CreateRideScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const { createRide, updateRide, isLoading } = useRides();
    const [showDriverModal, setShowDriverModal] = useState(false);

    // Extract params for Edit Mode
    const { rideId, initialValues, isEditMode } = route.params || {};

    const isUserDriver = () => {
        // Check if user has both driverLicense and vehicleMatricule
        // These field names match the backend User model
        const hasLicense = user?.driverLicense;
        const hasVehicle = user?.vehicleMatricule;
        const isDriver = user?.isDriver; // Virtual field from backend

        console.log('Driver check:', { hasLicense, hasVehicle, isDriver, user });

        return Boolean(isDriver || (hasLicense && hasVehicle));
    };

    const handleSubmit = async (rideData) => {
        // Form-level check for driver type (only for creation or if type changes, though type is locked in edit)
        if (!isEditMode && rideData.type === 'DRIVER' && !isUserDriver()) {
            setShowDriverModal(true);
            return;
        }

        try {
            if (isEditMode) {
                // Filter data to only include allowed updates
                const allowedUpdates = ['date', 'time', 'neededSeats', 'availableSeats', 'price', 'departure', 'destination', 'status', 'description'];
                const filteredData = Object.keys(rideData)
                    .filter(key => allowedUpdates.includes(key))
                    .reduce((obj, key) => {
                        obj[key] = rideData[key];
                        return obj;
                    }, {});

                await updateRide(rideId, filteredData);
                showSuccess('Ride updated successfully! ✅');
                navigation.goBack();
            } else {
                await createRide(rideData);
                showSuccess('Your ride has been published successfully. 🚗');
                // Navigate to Tabs navigator, then to Home screen within it
                navigation.navigate('Tabs', { screen: 'Home' });
            }
        } catch (error) {
            showError(formatError(error) || `Failed to ${isEditMode ? 'update' : 'publish'} ride.`);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.darkGreen} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{isEditMode ? 'Update Ride' : 'Create Ride'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Form */}
                <RideForm
                    initialValues={initialValues}
                    isEditMode={isEditMode}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />

                {/* Driver Profile Modal */}
                <Modal
                    visible={showDriverModal}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Ionicons name="alert-circle" size={50} color={colors.gold} />
                            <Text style={styles.modalTitle}>Incomplete Profile</Text>
                            <Text style={styles.modalMessage}>
                                Complete your driver profile (license & matricule) to publish as a driver.
                            </Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.lightGreen }]}
                                    onPress={() => {
                                        setShowDriverModal(false);
                                        navigation.navigate('Profile');
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Go to Profile</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.cream, marginTop: 8 }]}
                                    onPress={() => setShowDriverModal(false)}
                                >
                                    <Text style={[styles.modalButtonText, { color: colors.darkGreen }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...theme.typography.h3,
        fontSize: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        ...theme.typography.h2,
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        ...theme.typography.body,
        textAlign: 'center',
        marginBottom: 24,
        color: colors.sageGreen,
    },
    modalButtons: {
        width: '100%',
    },
    modalButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        fontWeight: '700',
        color: colors.darkGreen,
    }
});

export default CreateRideScreen;
