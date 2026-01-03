import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRides } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import RideCard from '../../components/ride/RideCard';
const colors = require('../../styles/colors');
const { theme } = require('../../styles/theme');

const HomeScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('announced'); // 'announced' | 'demand'
    const { user } = useAuth();
    const {
        announcedRides,
        passengerDemands,
        isLoading,
        error,
        fetchAnnouncedRides,
        fetchPassengerDemands,
        selectRide,
        clearError,
    } = useRides();

    const loadData = useCallback(() => {
        if (activeTab === 'announced') {
            fetchAnnouncedRides();
        } else {
            fetchPassengerDemands();
        }
    }, [activeTab, fetchAnnouncedRides, fetchPassengerDemands]);

    // Initial load and tab change load
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadData();
        }, 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleRidePress = (ride) => {
        selectRide(ride);
        navigation.navigate('RideDetails', { rideId: ride._id || ride.id });
    };

    const renderRideItem = ({ item }) => (
        <RideCard
            ride={item}
            variant={activeTab === 'announced' ? 'announced' : 'demand'}
            onPress={() => handleRidePress(item)}
            currentUserId={user?._id}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={80} color={colors.sageGreen} />
            <Text style={styles.emptyText}>
                No {activeTab === 'announced' ? 'offers' : 'demands'} found at the moment.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>CoTrajet</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Ionicons name="settings-outline" size={24} color={colors.darkGreen} />
                    </TouchableOpacity>
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabSwitcher}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'announced' && styles.activeTabButton,
                        ]}
                        onPress={() => setActiveTab('announced')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'announced' && styles.activeTabText,
                            ]}
                        >
                            Announced Trajets
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'demand' && styles.activeTabButton,
                        ]}
                        onPress={() => setActiveTab('demand')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'demand' && styles.activeTabText,
                            ]}
                        >
                            Demandes de Trajet
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content Area */}
                <View style={styles.content}>
                    {error && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={clearError}>
                                <Ionicons name="close-circle" size={20} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <FlatList
                        data={activeTab === 'announced' ? announcedRides : passengerDemands}
                        renderItem={renderRideItem}
                        keyExtractor={(item) => item._id || item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={!isLoading ? renderEmptyState : null}
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoading}
                                onRefresh={loadData}
                                colors={[colors.lightGreen]}
                                tintColor={colors.lightGreen}
                            />
                        }
                    />
                </View>

                {/* Floating Action Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('CreateRide')}
                >
                    <Ionicons name="add" size={32} color={colors.darkGreen} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.darkGreen,
    },
    tabSwitcher: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 8,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeTabButton: {
        backgroundColor: colors.lightGreen,
    },
    tabText: {
        fontWeight: '600',
        color: colors.sageGreen,
    },
    activeTabText: {
        color: colors.darkGreen,
    },
    content: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 80, // Space for FAB
    },
    errorBanner: {
        backgroundColor: colors.error || '#ff4444',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    errorText: {
        color: colors.white,
        fontWeight: '500',
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        ...theme.typography.body,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    refreshButton: {
        backgroundColor: colors.lightGreen,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    refreshButtonText: {
        color: colors.darkGreen,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: colors.lightGreen,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default HomeScreen;
