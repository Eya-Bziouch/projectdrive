import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRides } from '../../context/RideContext';
import RideHistoryCard from '../../components/ride/RideHistoryCard';
const colors = require('../../styles/colors');
const { theme } = require('../../styles/theme');

const HistoryScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('hosted'); // 'hosted' | 'joined'
    const {
        myRides,
        isLoading,
        error,
        fetchMyRideHistory,
        selectRide,
    } = useRides();

    const loadData = useCallback(() => {
        fetchMyRideHistory();
    }, [fetchMyRideHistory]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRidePress = (ride) => {
        selectRide(ride);
        navigation.navigate('RideDetails', { rideId: ride._id || ride.id });
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={80} color={colors.sageGreen} />
            <Text style={styles.emptyText}>
                You haven't {activeTab === 'hosted' ? 'hosted' : 'joined'} any rides yet.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    const ridesData = activeTab === 'hosted' ? (myRides.hosted?.rides || []) : (myRides.joined?.rides || []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.darkGreen} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ride History</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabSwitcher}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'hosted' && styles.activeTabButton,
                        ]}
                        onPress={() => setActiveTab('hosted')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'hosted' && styles.activeTabText,
                            ]}
                        >
                            Rides Hosted by Me
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'joined' && styles.activeTabButton,
                        ]}
                        onPress={() => setActiveTab('joined')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'joined' && styles.activeTabText,
                            ]}
                        >
                            Rides I Joined
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <FlatList
                    data={ridesData}
                    renderItem={({ item }) => (
                        <RideHistoryCard
                            ride={item}
                            onPress={() => handleRidePress(item)}
                        />
                    )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        ...theme.typography.h3,
        fontSize: 20,
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
    },
    activeTabButton: {
        backgroundColor: colors.lightGreen,
    },
    tabText: {
        fontWeight: '600',
        color: colors.sageGreen,
        fontSize: 12,
        textAlign: 'center',
    },
    activeTabText: {
        color: colors.darkGreen,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
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
});

export default HistoryScreen;
