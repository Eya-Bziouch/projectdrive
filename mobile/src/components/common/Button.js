import React, { useRef } from 'react';
import {
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Pressable,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    primaryBg: '#BBD8A3', // lightGreen
    primaryText: '#1B211A', // darkGreen
    secondaryBg: '#6F826A', // sageGreen
    secondaryText: '#FFFFFF',
    outlineBorder: '#BBD8A3', // lightGreen
    disabledOpacity: 0.5,
};

const Button = ({
    text,
    onPress,
    variant = 'primary', // 'primary', 'secondary', 'outline'
    size = 'medium', // 'small', 'medium', 'large'
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            case 'primary':
            default:
                return styles.primaryButton;
        }
    };

    const getTextVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            case 'primary':
            default:
                return styles.primaryText;
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return styles.smallButton;
            case 'large':
                return styles.largeButton;
            case 'medium':
            default:
                return styles.mediumButton;
        }
    };

    const getTextSizeStyles = () => {
        switch (size) {
            case 'small':
                return styles.smallText;
            case 'large':
                return styles.largeText;
            case 'medium':
            default:
                return styles.mediumText;
        }
    };

    const isInteractive = !disabled && !loading;

    return (
        <Animated.View
            style={[
                { transform: [{ scale: scaleAnim }] },
                style,
                disabled && { opacity: COLORS.disabledOpacity },
            ]}
        >
            <Pressable
                onPress={isInteractive ? onPress : null}
                onPressIn={isInteractive ? handlePressIn : null}
                onPressOut={isInteractive ? handlePressOut : null}
                style={[
                    styles.baseButton,
                    getVariantStyles(),
                    getSizeStyles(),
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={variant === 'secondary' ? '#FFFFFF' : '#1B211A'}
                    />
                ) : (
                    <View style={styles.contentContainer}>
                        {icon && (
                            <Ionicons
                                name={icon}
                                size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
                                color={variant === 'secondary' ? '#FFFFFF' : '#1B211A'}
                                style={styles.icon}
                            />
                        )}
                        <Text
                            style={[
                                styles.baseText,
                                getTextVariantStyles(),
                                getTextSizeStyles(),
                                textStyle,
                            ]}
                        >
                            {text}
                        </Text>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    baseButton: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    baseText: {
        fontWeight: '600',
    },
    // Variants
    primaryButton: {
        backgroundColor: COLORS.primaryBg,
    },
    primaryText: {
        color: COLORS.primaryText,
    },
    secondaryButton: {
        backgroundColor: COLORS.secondaryBg,
    },
    secondaryText: {
        color: COLORS.secondaryText,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.outlineBorder,
    },
    outlineText: {
        color: '#1B211A', // Using darkGreen for outline text usually
    },
    // Sizes
    smallButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    smallText: {
        fontSize: 12,
    },
    mediumButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    mediumText: {
        fontSize: 14,
    },
    largeButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    largeText: {
        fontSize: 16,
    },
});

export default Button;
