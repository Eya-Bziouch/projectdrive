import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';
const colors = require('../../styles/colors');
const { theme } = require('../../styles/theme');

const RideHistoryCard = ({ ride, onPress }) => {
    const {
        departure,
        destination,
        date,
        time,
        type, // 'DRIVER' or 'PASSENGER'
        status, // 'completed', 'upcoming'
    } = ride;

    const isDriver = type === 'DRIVER';
    const isCompleted = status === 'completed';
    const formattedDate = new Date(date).toLocaleDateString();

    return (
        <Card onPress={onPress}>
            <View style={styles.header}>
                <Text style={theme.typography.h3} numberOfLines={1}>
                    {departure} <Ionicons name="arrow-forward" size={16} color={colors.darkGreen} /> {destination}
                </Text>
                <View style={[
                    styles.statusBadge,
                    isCompleted ? styles.statusCompleted : (status === 'cancelled' ? styles.statusCancelled : (status === 'expired' ? styles.statusExpired : styles.statusUpcoming))
                ]}>
                    <Text style={styles.statusBadgeText}>{status || 'Upcoming'}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color={colors.sageGreen} />
                    <Text style={styles.infoText}>{formattedDate} • {time}</Text>
                </View>

                <View style={[styles.roleBadge, isDriver ? styles.driverRole : styles.passengerRole]}>
                    <Text style={styles.roleBadgeText}>{isDriver ? 'Driver' : 'Passenger'}</Text>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusCompleted: {
        backgroundColor: colors.sageGreen,
    },
    statusUpcoming: {
        backgroundColor: colors.gold,
    },
    statusCancelled: {
        backgroundColor: '#FFEBEE', // Light red
    },
    statusExpired: {
        backgroundColor: '#9E9E9E', // Grey
    },
    statusBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        ...theme.typography.label,
        marginLeft: 4,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    driverRole: {
        backgroundColor: colors.lightGreen,
    },
    passengerRole: {
        backgroundColor: colors.cream,
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.darkGreen,
    },
});

export default RideHistoryCard;
