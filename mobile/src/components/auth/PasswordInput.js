import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../common/Input';



const COLORS = {
    sageGreen: '#6F826A',
    lightGreen: '#BBD8A3',
    darkGreen: '#1B211A',
};

const PasswordInput = ({
    value,
    onChangeText,
    label,
    error,
    placeholder = 'Enter password',
    style,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);


    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };



    return (
        <Input
            label={label}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            error={error}
            secureTextEntry={!isVisible}
            style={style}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rightElement={
                <TouchableOpacity onPress={toggleVisibility} activeOpacity={0.7}>
                    <Ionicons
                        name={isVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={24}
                        color={isFocused ? COLORS.lightGreen : COLORS.sageGreen}
                    />
                </TouchableOpacity>
            }
            {...props}
        />
    );
};

const styles = StyleSheet.create({});

export default PasswordInput;
