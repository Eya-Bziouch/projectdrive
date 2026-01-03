import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import rideService from '../../services/rideService';

const ViewPassengersScreen = ({ navigation, route }) => {
    const { rideId } = route.params;
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPassengers();
    }, []);

    const fetchPassengers = async () => {
        try {
            setLoading(true);
            const response = await rideService.getRidePassengers(rideId);
            setPassengers(response.passengers || []);
        } catch (error) {
            console.error('Error fetching passengers:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to load passengers',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } finally {
            setLoading(false);
        }
    };

    const renderPassenger = ({ item }) => (
        <TouchableOpacity
            style={styles.passengerCard}
            onPress={() => navigation.navigate('PassengerProfile', {
                rideId,
                passengerId: item._id,
                passengerName: item.fullName
            })}
        >
            <View style={styles.avatarContainer}>
                {item.profilePicture ? (
                    <Image
                        source={{ uri: item.profilePicture }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={30} color="#fff" />
                    </View>
                )}
            </View>
            <View style={styles.passengerInfo}>
                <Text style={styles.passengerName}>{item.fullName}</Text>
                <View style={styles.roleContainer}>
                    <Ionicons name="briefcase-outline" size={14} color="#666" />
                    <Text style={styles.passengerRole}>{item.isDriver ? 'Driver' : 'Passenger'}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Passengers Yet</Text>
            <Text style={styles.emptySubtitle}>
                When people join your ride, they will appear here
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading passengers...</Text>
            </View>
        );
    }

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
                <Text style={styles.headerTitle}>Passengers</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.passengerCount}>
                        {passengers.length} {passengers.length === 1 ? 'person' : 'people'}
                    </Text>
                </View>
            </View>

            {/* Passengers List */}
            <FlatList
                data={passengers}
                renderItem={renderPassenger}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
            />
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
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        paddingHorizontal: 8,
    },
    passengerCount: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    passengerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    passengerInfo: {
        flex: 1,
    },
    passengerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    passengerRole: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passengerPhone: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    contactButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default ViewPassengersScreen;
