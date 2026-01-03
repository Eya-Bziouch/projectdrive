import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Alert,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import rideService from '../../services/rideService';

const PassengerProfileScreen = ({ navigation, route }) => {
    const { rideId, passengerId, passengerName } = route.params;
    const [passenger, setPassenger] = useState(null);
    const [rideHistory, setRideHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPassengerDetails();
    }, []);

    const fetchPassengerDetails = async () => {
        try {
            setLoading(true);
            const response = await rideService.getPassengerDetails(rideId, passengerId);
            setPassenger(response.passenger);
            setRideHistory(response.rideHistory);
        } catch (error) {
            console.error('Error fetching passenger details:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to load passenger details',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        if (passenger?.phone) {
            Linking.openURL(`tel:${passenger.phone}`);
        }
    };

    const handleEmail = () => {
        if (passenger?.email) {
            Linking.openURL(`mailto:${passenger.email}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!passenger) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
                <Text style={styles.errorText}>Passenger not found</Text>
            </View>
        );
    }

    const handleMessage = () => {
        if (!passenger) return;

        navigation.navigate('Chat', {
            conversationId: null, // Let backend find/create it
            receiverName: passenger.fullName,
            receiverId: passenger._id
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Passenger Profile</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {passenger.profileImage ? (
                            <Image
                                source={{ uri: passenger.profileImage }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={60} color="#fff" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{passenger.fullName}</Text>
                    <View style={styles.roleBadge}>
                        <Ionicons
                            name={passenger.isDriver ? 'car' : 'person'}
                            size={16}
                            color="#007AFF"
                        />
                        <Text style={styles.roleText}>
                            {passenger.isDriver ? 'Driver' : 'Passenger'}
                        </Text>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={handleEmail}
                    >
                        <Ionicons name="mail-outline" size={24} color="#007AFF" />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Email</Text>
                            <Text style={styles.contactValue}>{passenger.email}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={handleCall}
                    >
                        <Ionicons name="call-outline" size={24} color="#007AFF" />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Phone</Text>
                            <Text style={styles.contactValue}>{passenger.phone}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <View style={styles.contactItem}>
                        <Ionicons name="location-outline" size={24} color="#007AFF" />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Governorate</Text>
                            <Text style={styles.contactValue}>{passenger.governorate}</Text>
                        </View>
                    </View>
                </View>

                {/* Ride History */}
                {rideHistory && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ride History</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Ionicons name="car-outline" size={30} color="#007AFF" />
                                <Text style={styles.statNumber}>{rideHistory.total}</Text>
                                <Text style={styles.statLabel}>Total Rides</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="car-sport-outline" size={30} color="#28a745" />
                                <Text style={styles.statNumber}>{rideHistory.asDriver}</Text>
                                <Text style={styles.statLabel}>As Driver</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="person-outline" size={30} color="#ffc107" />
                                <Text style={styles.statNumber}>{rideHistory.asPassenger}</Text>
                                <Text style={styles.statLabel}>As Passenger</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Joined Date */}
                <View style={styles.section}>
                    <View style={styles.joinedInfo}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.joinedText}>
                            Member since {new Date(passenger.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Chat Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleMessage}
            >
                <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 16,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#e3f2fd',
        borderRadius: 20,
    },
    roleText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    contactInfo: {
        flex: 1,
        marginLeft: 16,
    },
    contactLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginHorizontal: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    joinedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    joinedText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF', // Blue
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default PassengerProfileScreen;
