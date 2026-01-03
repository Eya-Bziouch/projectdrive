import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatHeader = ({ receiverName, receiverProfileImage }) => {
    const navigation = useNavigation();

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#007AFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.profileContainer}
                        activeOpacity={0.7}
                        onPress={() => {
                            // Optional: navigating to profile could go here
                        }}
                    >
                        <View style={styles.avatarContainer}>
                            {receiverProfileImage ? (
                                <Image
                                    source={{ uri: receiverProfileImage }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={20} color="#FFF" />
                                </View>
                            )}
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.name} numberOfLines={1}>
                                {receiverName || 'User'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Right side actions - kept minimal as requested */}
                <View style={styles.rightContainer}>
                    {/* Add calls/video icons here if needed in future */}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#F6F6F6', // Light gray/white standard header bg
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    container: {
        height: 44, // Standard nav bar height
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 4,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 10,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        resizeMode: 'cover',
    },
    avatarPlaceholder: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#BBD8A3', // Light Green app theme
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default ChatHeader;
