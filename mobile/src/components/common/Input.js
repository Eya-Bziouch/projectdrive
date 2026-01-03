import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Animated,
    Platform,
} from 'react-native';

const COLORS = {
    sageGreen: '#6F826A',
    lightGreen: '#BBD8A3',
    cream: '#F0F1C5',
    darkGreen: '#1B211A',
    red: '#FF4444', // Using a standard red for errors, or could be passed in theme
};

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType = 'default',
    editable = true,
    style,
    rightElement, // New prop for icons/buttons inside the input
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.sageGreen, COLORS.lightGreen],
    });

    const finalBorderColor = error ? COLORS.red : borderColor;

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: finalBorderColor,
                    },
                ]}
            >
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    editable={editable}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={COLORS.darkGreen}
                    {...props}
                />
                {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
            </Animated.View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: COLORS.darkGreen,
        marginBottom: 4,
        fontWeight: '500',
    },
    inputContainer: {
        width: '100%',
        backgroundColor: COLORS.cream,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        flexDirection: 'row', // Align text input and right element horizontally
        alignItems: 'center',
    },
    input: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.darkGreen,
        flex: 1, // Take up remaining space
        minHeight: 48,
    },
    rightElement: {
        paddingRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.red,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default Input;
