import React from 'react';
import { View, Text, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../common/Input';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const COLORS = {
    sageGreen: '#6F826A',
    darkGreen: '#1B211A',
    cream: '#F0F1C5',
    lightGreen: '#BBD8A3',
};

const EditableField = ({
    label,
    value,
    onChangeText,
    isEditing,
    type = 'text', // 'text', 'phone', 'email'
    placeholder,
}) => {
    // Determine keyboard type based on 'type' prop
    const getKeyboardType = () => {
        switch (type) {
            case 'email':
                return 'email-address';
            case 'phone':
                return 'phone-pad';
            default:
                return 'default';
        }
    };

    // Simple layout animation trigger when isEditing changes (optional but nice)
    // React.useEffect(() => {
    //   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // }, [isEditing]);

    if (isEditing) {
        return (
            <Input
                label={label}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={getKeyboardType()}
                autoCapitalize={type === 'email' ? 'none' : 'words'}
            />
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.value}>{value || placeholder || 'Not set'}</Text>
                <Ionicons name="create-outline" size={20} color={COLORS.sageGreen} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(111, 130, 106, 0.2)', // sageGreen with opacity
    },
    label: {
        fontSize: 12,
        color: COLORS.sageGreen,
        marginBottom: 4,
        fontWeight: '500',
    },
    valueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 24, // Matches typical text height
    },
    value: {
        fontSize: 16,
        color: COLORS.darkGreen,
        fontWeight: '400',
        flex: 1,
    },
});

export default EditableField;
