import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    cream: '#F0F1C5',
    lightGreen: '#BBD8A3',
    sageGreen: '#6F826A',
    darkGreen: '#1B211A',
    white: '#FFFFFF',
};

const ProfileHeader = ({ user, onEditPress, onImagePress, isEditing }) => {
    // Default values if user object fields are missing
    const fullName = user?.fullName || 'User Name';
    const email = user?.email || 'email@example.com';
    const governorate = user?.governorate || 'Tunis';
    const profileImage = user?.profileImage;

    return (
        <View style={styles.container}>
            {/* Edit Icon - changes based on edit mode */}
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={onEditPress}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={isEditing ? "close-circle" : "pencil"}
                    size={26}
                    color={isEditing ? COLORS.sageGreen : COLORS.darkGreen}
                />
            </TouchableOpacity>

            {/* Profile Image */}
            <TouchableOpacity onPress={onImagePress} activeOpacity={0.8}>
                <View style={styles.imageContainer}>
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.image}
                        />
                    ) : (
                        <View style={[styles.image, styles.placeholderImage]}>
                            <Ionicons name="person" size={40} color={COLORS.sageGreen} />
                        </View>
                    )}
                    <View style={styles.editIconBadge}>
                        <Ionicons name="camera" size={12} color={COLORS.white} />
                    </View>
                </View>
            </TouchableOpacity>

            {/* User Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{fullName}</Text>
                <Text style={styles.email}>{email}</Text>
                <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color={COLORS.sageGreen} />
                    <Text style={styles.location}>{governorate}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cream,
        padding: 16,
        paddingTop: 24,
        alignItems: 'center',
        position: 'relative',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    settingsButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 10,
    },
    imageContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: COLORS.lightGreen,
    },
    placeholderImage: {
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.sageGreen,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.cream,
    },
    infoContainer: {
        alignItems: 'center',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.darkGreen,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: COLORS.sageGreen,
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(111, 130, 106, 0.1)', // sageGreen with opacity
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    location: {
        fontSize: 12,
        color: COLORS.sageGreen,
        marginLeft: 4,
        fontWeight: '500',
    },
});

export default ProfileHeader;
