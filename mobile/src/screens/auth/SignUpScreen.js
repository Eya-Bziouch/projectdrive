import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/auth/PasswordInput';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword, validatePhone, validateCIN } from '../../utils/validation';

const COLORS = {
    cream: '#F0F1C5',
    lightGreen: '#BBD8A3',
    sageGreen: '#6F826A',
    darkGreen: '#1B211A',
    white: '#FFFFFF',
    red: '#FF4444',
    gray: '#666666',
};

const GOVERNORATES = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
    'Beja', 'Jendouba', 'Kef', 'Siliana', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
    'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Gafsa', 'Tozeur', 'Kebili', 'Gabes',
    'Medenine', 'Tataouine'
];

const SignUpScreen = () => {
    const navigation = useNavigation();
    const { register, isLoading, error: authError, clearError } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        cin: '',
        governorate: '',
        phone: '',
        email: '',
        password: '',
        passwordConfirm: '',
        driverLicense: null, // Store license image URI
        vehiclePlate: '',
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';

        // Validate CIN
        const cinCheck = validateCIN(formData.cin);
        if (!cinCheck.isValid) newErrors.cin = cinCheck.error;

        if (!formData.governorate) newErrors.governorate = 'Governorate is required';

        // Validate Phone
        const phoneCheck = validatePhone(formData.phone);
        if (!phoneCheck.isValid) newErrors.phone = phoneCheck.error;

        // Validate Email
        const emailCheck = validateEmail(formData.email);
        if (!emailCheck.isValid) newErrors.email = emailCheck.error;

        // Validate Password
        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.isValid) newErrors.password = passwordCheck.error;

        if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = 'Passwords do not match';
        }

        // Note: Driver fields (license and vehicle plate) are truly optional
        // User will only be registered as a driver if BOTH fields are provided
        // Partial data is allowed and will be ignored during registration

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
        if (authError) clearError();
    };

    const handleRegister = async () => {
        if (!validate()) return;

        try {
            // Only register as driver if BOTH license and vehicle plate are provided
            // Otherwise, register as passenger (ignore partial driver data)
            const hasCompleteDriverInfo = formData.driverLicense && formData.vehiclePlate.trim();

            await register(
                formData.fullName,
                formData.cin,
                formData.governorate,
                formData.phone,
                formData.email,
                formData.password,
                formData.passwordConfirm,
                hasCompleteDriverInfo ? formData.driverLicense : null,  // Only pass if complete
                hasCompleteDriverInfo ? formData.vehiclePlate : null    // Only pass if complete
            );
            // Navigation handled by root navigator
        } catch (err) {
            console.log('Registration failed', err);
        }
    };

    const handleDocumentPick = async () => {
        try {
            // Request permission to access media library
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert(
                    'Permission Required',
                    'Please grant permission to access your photos to upload your driver license.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setFormData(prev => ({
                    ...prev,
                    driverLicense: selectedImage.uri
                }));
                if (errors.driverLicense) {
                    setErrors(prev => ({ ...prev, driverLicense: null }));
                }
                Alert.alert('Success', 'Driver license uploaded successfully!');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.darkGreen} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Create Your Account</Text>
                    <Text style={styles.subtitle}>Join RideShare Students today!</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {authError && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color={COLORS.red} />
                        <Text style={styles.globalErrorText}>{authError}</Text>
                    </View>
                )}

                {/* Required Fields */}
                <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChangeText={(text) => handleChange('fullName', text)}
                    error={errors.fullName}
                />

                <Input
                    label="National ID (CIN)"
                    placeholder="8 digit CIN"
                    value={formData.cin}
                    onChangeText={(text) => handleChange('cin', text)}
                    keyboardType="numeric"
                    maxLength={8}
                    error={errors.cin}
                />

                {/* Simplistic Governorate Input - Could be a Modal/Picker in future */}
                <Input
                    label="Governorate"
                    placeholder="e.g., Tunis"
                    value={formData.governorate}
                    onChangeText={(text) => handleChange('governorate', text)}
                    error={errors.governorate}
                />

                <Input
                    label="Phone Number"
                    placeholder="+216 or 8 digits"
                    value={formData.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    keyboardType="phone-pad"
                    error={errors.phone}
                />

                <Input
                    label="Email Value"
                    placeholder="student@university.tn"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />

                <PasswordInput
                    label="Password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    error={errors.password}
                />

                <PasswordInput
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    value={formData.passwordConfirm}
                    onChangeText={(text) => handleChange('passwordConfirm', text)}
                    error={errors.passwordConfirm}
                />

                {/* Optional Fields Section */}
                <Text style={styles.sectionHeader}>Optional (For Drivers)</Text>

                <View style={styles.uploadContainer}>
                    <Text style={styles.uploadLabel}>Driver's License</Text>
                    <TouchableOpacity
                        style={[styles.uploadButton, errors.driverLicense && styles.uploadButtonError]}
                        onPress={handleDocumentPick}
                    >
                        <Ionicons
                            name={formData.driverLicense ? "checkmark-circle" : "cloud-upload-outline"}
                            size={24}
                            color={formData.driverLicense ? COLORS.lightGreen : COLORS.darkGreen}
                        />
                        <Text style={[styles.uploadButtonText, formData.driverLicense && styles.uploadButtonTextSuccess]}>
                            {formData.driverLicense ? 'License Uploaded ✓' : 'Upload Document'}
                        </Text>
                    </TouchableOpacity>
                    {errors.driverLicense && (
                        <Text style={styles.errorText}>{errors.driverLicense}</Text>
                    )}
                </View>

                <Input
                    label="Vehicle Plate (Matricule)"
                    placeholder="e.g., 123 TUN 4567"
                    value={formData.vehiclePlate}
                    onChangeText={(text) => handleChange('vehiclePlate', text)}
                    error={errors.vehiclePlate}
                />

                <Button
                    text="Create Account"
                    onPress={handleRegister}
                    loading={isLoading}
                    variant="primary"
                    size="large"
                    style={styles.submitButton}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.signInText}>Sign In</Text>
                    </TouchableOpacity>
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
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: COLORS.cream,
        zIndex: 10,
    },
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.darkGreen,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 0,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.darkGreen,
        marginTop: 16,
        marginBottom: 8,
    },
    helperText: {
        fontSize: 13,
        color: COLORS.gray,
        marginBottom: 16,
        lineHeight: 18,
    },
    uploadContainer: {
        marginBottom: 16,
    },
    uploadLabel: {
        fontSize: 14,
        color: COLORS.darkGreen,
        marginBottom: 8,
        fontWeight: '500',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.sageGreen,
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 16,
    },
    uploadButtonText: {
        marginLeft: 8,
        color: COLORS.darkGreen,
    },
    uploadButtonTextSuccess: {
        color: COLORS.lightGreen,
        fontWeight: '600',
    },
    uploadButtonError: {
        borderColor: COLORS.red,
    },
    errorText: {
        color: COLORS.red,
        fontSize: 12,
        marginTop: 4,
    },
    submitButton: {
        marginTop: 24,
        width: '100%',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    globalErrorText: {
        color: COLORS.red,
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 40,
    },
    footerText: {
        color: COLORS.darkGreen,
        fontSize: 14,
    },
    signInText: {
        color: COLORS.sageGreen,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default SignUpScreen;
