import React, { useRef } from 'react';
import {
    StyleSheet,
    View,
    Animated,
    Pressable,
    Platform,
} from 'react-native';

const COLORS = {
    white: '#FFFFFF',
    cream: '#F0F1C5',
    sageGreen: '#6F826A',
    shadowColor: '#000',
};

const Card = ({
    children,
    onPress,
    style,
    padding = 16,
    variant = 'default', // 'default' | 'highlighted'
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (onPress) {
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                useNativeDriver: true,
                speed: 20,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
            }).start();
        }
    };

    const backgroundColor = variant === 'highlighted' ? COLORS.cream : COLORS.white;

    const cardStyle = [
        styles.card,
        {
            backgroundColor,
            padding,
        },
        style,
    ];

    if (onPress) {
        return (
            <Animated.View
                style={[
                    styles.container,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={cardStyle}
                >
                    {children}
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={cardStyle}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.sageGreen,
        // Shadow properties
        ...Platform.select({
            ios: {
                shadowColor: COLORS.shadowColor,
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.1, // Adjusted for a subtle 'medium' elevation feel
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            },
        }),
    },
});

export default Card;
