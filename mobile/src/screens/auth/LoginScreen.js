import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/auth/PasswordInput';
import Button from '../../components/common/Button';

const COLORS = {
    cream: '#F0F1C5',
    lightGreen: '#BBD8A3',
    sageGreen: '#6F826A',
    darkGreen: '#1B211A',
    white: '#FFFFFF',
    red: '#FF4444',
    gray: '#666666',
};

const LoginScreen = () => {
    const navigation = useNavigation();
    const { login, isLoading, error: authError, clearError } = useAuth();

    const [formData, setFormData] = useState({
        emailOrName: '',
        password: '',
    });

    const [rememberMe, setRememberMe] = useState(true); // Remember Me toggle - checked by default

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.emailOrName.trim()) {
            newErrors.emailOrName = 'Email or Full Name is required';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        // Clear local error when typing
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: null }));
        }
        // Clear global auth error when typing
        if (authError) {
            clearError();
        }
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            await login(formData.emailOrName, formData.password, rememberMe);
            // Navigation to Home is handled by the root navigator based on userToken state
        } catch (err) {
            // Error is handled in context and exposed via authError
            console.log('Login failed', err);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="briefcase" size={40} color={COLORS.darkGreen} />
                    </View>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                </View>

                {/* Global Error Message */}
                {authError && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color={COLORS.red} />
                        <Text style={styles.globalErrorText}>{authError}</Text>
                    </View>
                )}

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Email or Full Name"
                        placeholder="Enter your email or name"
                        value={formData.emailOrName}
                        onChangeText={(text) => handleChange('emailOrName', text)}
                        error={errors.emailOrName}
                        autoCapitalize="none"
                    />

                    <PasswordInput
                        label="Password"
                        value={formData.password}
                        onChangeText={(text) => handleChange('password', text)}
                        error={errors.password}
                        placeholder="Enter your password"
                    />

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => console.log('Forgot Password pressed')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Remember Me Checkbox */}
                    <TouchableOpacity
                        style={styles.rememberMeContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                            {rememberMe && (
                                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                            )}
                        </View>
                        <Text style={styles.rememberMeText}>Remember Me</Text>
                    </TouchableOpacity>

                    <Button
                        text="Sign In"
                        onPress={handleLogin}
                        loading={isLoading}
                        variant="primary"
                        size="large"
                        style={styles.signInButton}
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.createAccountText}>Create an Account</Text>
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.lightGreen,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.darkGreen,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    forgotPasswordText: {
        color: COLORS.gray,
        fontSize: 14,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.sageGreen,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.sageGreen,
    },
    rememberMeText: {
        color: COLORS.darkGreen,
        fontSize: 14,
    },
    signInButton: {
        width: '100%',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
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
        marginTop: 32,
    },
    footerText: {
        color: COLORS.darkGreen,
        fontSize: 14,
    },
    createAccountText: {
        color: COLORS.sageGreen,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default LoginScreen;
