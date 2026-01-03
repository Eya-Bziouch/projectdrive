import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import rideService from '../../services/rideService';
import chatService from '../../services/chatService';
import Button from '../../components/common/Button';

const COLORS = {
    cream: '#F0F1C5',
    lightGreen: '#BBD8A3',
    sageGreen: '#6F826A',
    darkGreen: '#1B211A',
    red: '#FF4444',
    white: '#FFFFFF',
    grey: '#888'
};

const PublicProfileScreen = ({ route, navigation }) => {
    const { userId } = route.params;
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [rides, setRides] = useState({ hosted: [], joined: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hosted'); // 'hosted' | 'joined'

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, ridesRes] = await Promise.all([
                userService.getPublicProfile(userId),
                rideService.getUserPublicRides(userId)
            ]);

            setProfile(profileRes.user);
            setRides(ridesRes.history);
        } catch (error) {
            console.error('Error fetching public profile:', error);
            Alert.alert('Error', 'Could not load user profile');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!currentUser) {
            Alert.alert('Login Required', 'You must be logged in to send a message');
            return;
        }

        // Prevent chatting with self
        if (currentUser._id === userId || currentUser.id === userId) {
            Alert.alert('Note', 'You cannot message yourself');
            return;
        }

        try {
            navigation.navigate('Chat', {
                receiverId: userId,
                receiverName: profile.fullName
            });
        } catch (error) {
            console.error('Nav to chat error:', error);
        }
    };

    const handleRidePress = (rideId) => {
        navigation.push('RideDetails', { rideId });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.sageGreen} />
            </View>
        );
    }

    if (!profile) return null;

    const displayRides = activeTab === 'hosted' ? rides.hosted : rides.joined;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={profile.profileImage ? { uri: profile.profileImage } : null}
                    style={styles.avatar}
                />
                {!profile.profileImage && (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                        <Ionicons name="person" size={40} color={COLORS.cream} />
                    </View>
                )}

                <Text style={styles.name}>{profile.fullName}</Text>
                <Text style={styles.role}>{profile.isDriver ? 'Driver' : 'Passenger'}</Text>

                <View style={styles.contactContainer}>
                    <View style={styles.contactItem}>
                        <Ionicons name="call-outline" size={16} color={COLORS.sageGreen} />
                        <Text style={styles.contactText}>{profile.phone || 'No phone'}</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Ionicons name="mail-outline" size={16} color={COLORS.sageGreen} />
                        <Text style={styles.contactText}>{profile.email || 'No email'}</Text>
                    </View>
                </View>

                <Button
                    text="Message"
                    icon="chatbubble-ellipses-outline"
                    onPress={handleMessage}
                    style={styles.messageButton}
                />
            </View>

            {/* Ride History Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'hosted' && styles.activeTab]}
                    onPress={() => setActiveTab('hosted')}
                >
                    <Text style={[styles.tabText, activeTab === 'hosted' && styles.activeTabText]}>
                        Hosted ({rides.hosted.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'joined' && styles.activeTab]}
                    onPress={() => setActiveTab('joined')}
                >
                    <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
                        Joined ({rides.joined.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Rides List */}
            <View style={styles.listContainer}>
                {displayRides.length === 0 ? (
                    <Text style={styles.emptyText}>No rides found.</Text>
                ) : (
                    displayRides.map((ride) => (
                        <TouchableOpacity
                            key={ride._id}
                            style={styles.rideCard}
                            onPress={() => handleRidePress(ride._id)}
                        >
                            <View style={styles.rideHeader}>
                                <Text style={styles.rideDate}>
                                    {new Date(ride.date).toLocaleDateString()} at {ride.time}
                                </Text>
                                <Text style={styles.ridePrice}>{ride.price} DT</Text>
                            </View>
                            <View style={styles.rideRoute}>
                                <Text style={styles.routeText} numberOfLines={1}>
                                    {ride.departure}  ➜  {ride.destination}
                                </Text>
                            </View>
                            <Text style={styles.rideStatus}>Status: {ride.status || 'Active'}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.cream,
    },
    header: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: COLORS.sageGreen,
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.darkGreen,
    },
    role: {
        fontSize: 16,
        color: COLORS.sageGreen,
        marginTop: 4,
        marginBottom: 16,
    },
    contactContainer: {
        width: '100%',
        marginBottom: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    contactText: {
        marginLeft: 8,
        color: COLORS.darkGreen,
        fontSize: 14,
    },
    messageButton: {
        width: '80%',
    },
    tabsContainer: {
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'center',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: COLORS.sageGreen,
    },
    activeTab: {
        backgroundColor: COLORS.sageGreen,
    },
    tabText: {
        color: COLORS.sageGreen,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.white,
    },
    listContainer: {
        padding: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.grey,
        marginTop: 20,
    },
    rideCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    rideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    rideDate: {
        color: COLORS.sageGreen,
        fontSize: 14,
    },
    ridePrice: {
        fontWeight: 'bold',
        color: COLORS.darkGreen,
    },
    rideRoute: {
        marginBottom: 8,
    },
    routeText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkGreen,
    },
    rideStatus: {
        fontSize: 12,
        color: COLORS.grey,
        fontStyle: 'italic',
    }
});

export default PublicProfileScreen;
