import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Text,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import chatService from '../../services/chatService';
import { useFocusEffect } from '@react-navigation/native';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EditableField from '../../components/profile/EditableField';
import Button from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
    cream: '#F0F1C5',
    lightGreen: '#BBD8A3',
    sageGreen: '#6F826A',
    darkGreen: '#1B211A',
    red: '#FF4444',
    white: '#FFFFFF',
};

const ProfileScreen = ({ navigation }) => {
    const { user, logout, updateProfile: updateLocalUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        phone: '',
        governorate: '',
        vehicleMatricule: '',
    });
    const [totalUnread, setTotalUnread] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const fetchUnreadCount = async () => {
                try {
                    const data = await chatService.getConversations();
                    if (data && data.conversations) {
                        const count = data.conversations.reduce((sum, conv) => {
                            // Backend already calculates unreadCount per conversation for us
                            return sum + (conv.unreadCount || 0);
                        }, 0);
                        setTotalUnread(count);
                    }
                } catch (error) {
                    console.error('Error fetching unread count:', error);
                }
            };
            fetchUnreadCount();
        }, [])
    );

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userService.getProfile();
            setProfileData(data);
            setFormData({
                phone: data.phone || '',
                governorate: data.governorate || '',
                vehicleMatricule: data.vehicleMatricule || '',
            });
        } catch (error) {
            console.error('Failed to load profile', error);
            Alert.alert('Error', 'Could not load profile data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleToggleEdit = () => {
        const newEditState = !isEditing;
        setIsEditing(newEditState);

        // If cancelling edit, reset form data
        if (!newEditState && profileData) {
            setFormData({
                phone: profileData.phone || '',
                governorate: profileData.governorate || '',
                vehicleMatricule: profileData.vehicleMatricule || '',
            });
            Alert.alert('Edit Cancelled', 'Changes have been discarded.');
        } else {
            // Entering edit mode
            Alert.alert('Edit Mode', 'You can now edit your profile fields.');
        }
    };

    const handleSave = async () => {
        if (!formData.phone || !formData.governorate) {
            Alert.alert('Validation Error', 'Phone and Governorate are required');
            return;
        }

        try {
            setLoading(true);
            const updatedUser = await userService.updateProfile(formData);

            // Update local state and context
            setProfileData(updatedUser);
            updateLocalUser(updatedUser);

            setIsEditing(false);
            Alert.alert('Success! ✓', 'Profile updated successfully');
        } catch (error) {
            console.error('Update failed', error);
            Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async () => {
        // Basic image picker request
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission to access camera roll is required!');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!pickerResult.canceled) {
            const uri = pickerResult.assets[0].uri;
            try {
                setLoading(true);
                const imageUrl = await userService.uploadProfileImage(uri);
                // After upload, update profile with new image URL
                const updatedUser = await userService.updateProfile({ profileImage: imageUrl });
                setProfileData(updatedUser);
                updateLocalUser(updatedUser);
            } catch (error) {
                Alert.alert('Upload Failed', 'Could not upload image');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLicenseUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!pickerResult.canceled) {
            const uri = pickerResult.assets[0].uri;
            try {
                setLoading(true);
                const imageUrl = await userService.uploadDriverLicense(uri);
                // After upload, update profile with new license URL
                const updatedUser = await userService.updateProfile({ driverLicense: imageUrl });
                setProfileData(updatedUser);
                updateLocalUser(updatedUser);
                Alert.alert('Success', 'Driver license uploaded successfully');
            } catch (error) {
                Alert.alert('Upload Failed', 'Could not upload driver license');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    if (!profileData && loading) {
        // Initial loading state could be a spinner
        return (
            <View style={[styles.container, styles.center]}>
                <Ionicons name="sync" size={32} color={COLORS.sageGreen} />
            </View>
        );
    }

    // Fallback if data is missing but not loading (e.g. error) or using context user
    const displayUser = profileData || user;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ProfileHeader
                    user={displayUser}
                    onEditPress={handleToggleEdit}
                    onImagePress={handleImagePick}
                />

                <View style={styles.section}>
                    <View>
                        <Button
                            text="My Messages"
                            onPress={() => navigation.navigate('ConversationList')}
                            icon="chatbubbles-outline"
                            style={{ marginBottom: 16 }}
                            variant="secondary"
                        />
                        {totalUnread > 0 && (
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>
                                    {totalUnread > 99 ? '99+' : totalUnread}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    {/* Non-editable display fields */}
                    <View style={styles.readOnlyField}>
                        <Text style={styles.label}>Full Name</Text>
                        <Text style={styles.value}>{displayUser?.fullName}</Text>
                    </View>

                    <View style={styles.readOnlyField}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{displayUser?.email}</Text>
                    </View>

                    <EditableField
                        label="Phone Number"
                        value={isEditing ? formData.phone : displayUser?.phone}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                        isEditing={isEditing}
                        type="phone"
                        placeholder="Enter phone number"
                    />

                    <EditableField
                        label="Governorate"
                        value={isEditing ? formData.governorate : displayUser?.governorate}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, governorate: text }))}
                        isEditing={isEditing} // ideally this would be a picker in a real app
                        placeholder="Select governorate"
                    />
                </View>

                {/* Driver Section - checking either specific flag or existence of license info */}
                {/* For this demo, we assume if they have a license or plate, they are a driver or aspiring one */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Driver Information</Text>

                    <View style={styles.licenseRow}>
                        <Text style={styles.label}>Driver's License</Text>
                        <Button
                            text={displayUser?.driverLicense ? "View License" : "Upload License"}
                            variant="outline"
                            size="small"
                            icon="card-outline"
                            onPress={handleLicenseUpload}
                        />
                    </View>

                    <EditableField
                        label="Vehicle License Plate"
                        value={isEditing ? formData.vehicleMatricule : displayUser?.vehicleMatricule}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, vehicleMatricule: text }))}
                        isEditing={isEditing}
                        placeholder="e.g. 123 TUN 4567"
                    />
                </View>

                <View style={styles.actionContainer}>
                    {isEditing && (
                        <Button
                            text="Save Changes"
                            onPress={handleSave}
                            loading={loading}
                            style={styles.saveButton}
                        />
                    )}

                    <Button
                        text="Logout"
                        onPress={handleLogout}
                        variant="outline"
                        textStyle={{ color: COLORS.red }}
                        style={{ borderColor: COLORS.red, marginTop: 16 }}
                        icon="log-out-outline"
                    />
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    section: {
        padding: 24,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkGreen,
        marginBottom: 16,
    },
    readOnlyField: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(111, 130, 106, 0.2)',
        paddingBottom: 8,
    },
    label: {
        fontSize: 12,
        color: COLORS.sageGreen,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: COLORS.darkGreen,
    },
    licenseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    actionContainer: {
        padding: 24,
        paddingTop: 0,
    },
    saveButton: {
        marginBottom: 8,
    },
    badgeContainer: {
        position: 'absolute',
        top: -6,
        right: -6, // Place it slightly outside the button or on the corner
        backgroundColor: '#FF4444',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.cream, // Match background to simulate cutout
        zIndex: 10,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 4,
    },
});

export default ProfileScreen;
