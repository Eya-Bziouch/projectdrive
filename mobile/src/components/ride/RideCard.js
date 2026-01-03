import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';
import { getRelativeTime, formatDate } from '../../utils/timeUtils';
const colors = require('../../styles/colors');
const { theme } = require('../../styles/theme');

/**
 * RideCard Component
 * Displays ride information with creator details (populated from MongoDB)
 * 
 * The `creator` field is populated by the backend using Mongoose's .populate()
 * which performs a "join" to fetch user information:
 * 
 * Example backend code:
 *   Ride.find(query).populate('creator', '-password')
 * 
 * This returns:
 *   creator: {
 *     _id: "...",
 *     fullName: "John Doe",
 *     profileImage: "https://..." or null,
 *     isDriver: true/false (virtual field),
 *     ...other user fields (except password)
 *   }
 */
const RideCard = ({ ride, onPress, variant = 'announced', currentUserId }) => {
    const {
        departure,
        destination,
        date,
        time,
        availableSeats,
        price,
        type, // 'DRIVER' or 'PASSENGER'
        creator, // Populated user object from MongoDB
        passengers = [],
        status, // 'completed', 'upcoming' etc
        createdAt, // Timestamp when ride was created
    } = ride;

    const isDriverRide = type === 'DRIVER';

    // Check if current user has joined this ride
    const hasUserJoined = currentUserId && passengers.some(
        passenger => (passenger._id || passenger) === currentUserId
    );

    // Extract creator information (safely handles missing data)
    const creatorName = creator?.fullName || 'Unknown User';
    const creatorProfileImage = creator?.profileImage || null;
    const creatorRole = type === 'DRIVER' ? 'Driver' : 'Passenger';

    // Format date and time
    const formattedDate = formatDate(date);
    const postedTime = getRelativeTime(createdAt);

    // Render creator avatar (profile picture or default icon)
    const renderCreatorAvatar = () => {
        if (creatorProfileImage) {
            return (
                <Image
                    source={{ uri: creatorProfileImage }}
                    style={styles.creatorAvatar}
                />
            );
        }
        return (
            <View style={styles.creatorAvatarPlaceholder}>
                <Ionicons name="person" size={18} color={colors.sageGreen} />
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.routeContainer}>
                <Text style={theme.typography.h3} numberOfLines={1}>
                    {departure} <Ionicons name="arrow-forward" size={16} color={colors.darkGreen} /> {destination}
                </Text>
            </View>
            <View style={styles.dateTimeContainer}>
                <Ionicons name="calendar-outline" size={14} color={colors.sageGreen} />
                <Text style={styles.dateTimeText}>{formattedDate} • {time}</Text>
                <Text style={styles.postedTimeText}>• {postedTime}</Text>
            </View>
        </View>
    );

    const renderInfoRow = () => (
        <View style={styles.infoRow}>
            <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={18} color={colors.sageGreen} />
                <Text style={styles.infoText}>{availableSeats} seats</Text>
            </View>

            {isDriverRide && price != null && (
                <View style={styles.infoItem}>
                    <Text style={styles.priceText}>{price} TND</Text>
                </View>
            )}

            <View style={[styles.badge, isDriverRide ? styles.driverBadge : styles.passengerBadge]}>
                <Text style={styles.badgeText}>{creatorRole}</Text>
            </View>
        </View>
    );

    // Creator info section - displays name, role badge, and profile picture
    const renderCreatorInfo = () => (
        <View style={styles.creatorContainer}>
            {renderCreatorAvatar()}
            <View style={styles.creatorDetails}>
                <Text style={styles.creatorName} numberOfLines={1}>
                    {creatorName}
                </Text>
                <View style={styles.creatorRoleContainer}>
                    <Ionicons
                        name={isDriverRide ? "car" : "person"}
                        size={12}
                        color={colors.sageGreen}
                    />
                    <Text style={styles.creatorRoleText}>
                        {creatorRole}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderFooter = () => {
        if (variant === 'announced') {
            const isFull = availableSeats <= 0;

            return (
                <View style={styles.footer}>
                    {renderCreatorInfo()}
                    {hasUserJoined ? (
                        <View style={styles.joinedBadge}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.darkGreen} />
                            <Text style={styles.joinedBadgeText}>Joined</Text>
                        </View>
                    ) : isFull ? (
                        <View style={styles.fullBadge}>
                            <Text style={styles.fullBadgeText}>Full</Text>
                        </View>
                    ) : (
                        <View style={styles.joinButton}>
                            <Text style={styles.joinButtonText}>View</Text>
                        </View>
                    )}
                </View>
            );
        }

        if (variant === 'demand') {
            return (
                <View style={styles.footer}>
                    {renderCreatorInfo()}
                    <Text style={styles.interestedText}>
                        {passengers.length} interested
                    </Text>
                </View>
            );
        }

        if (variant === 'history') {
            const isCompleted = status === 'completed';
            return (
                <View style={styles.footer}>
                    {renderCreatorInfo()}
                    <View style={[styles.statusBadge, isCompleted ? styles.statusCompleted : styles.statusUpcoming]}>
                        <Text style={styles.statusBadgeText}>{status || 'Upcoming'}</Text>
                    </View>
                </View>
            );
        }

        return null;
    };

    return (
        <Card onPress={onPress}>
            {renderHeader()}
            <View style={styles.divider} />
            {renderInfoRow()}
            <View style={styles.divider} />
            {renderFooter()}
        </Card>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 8,
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTimeText: {
        ...theme.typography.label,
        marginLeft: 4,
    },
    postedTimeText: {
        ...theme.typography.label,
        color: colors.sageGreen,
        fontStyle: 'italic',
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
        ...theme.typography.body,
        marginLeft: 4,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.gold,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    driverBadge: {
        backgroundColor: colors.lightGreen,
    },
    passengerBadge: {
        backgroundColor: colors.cream,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.darkGreen,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    // Creator info styles
    creatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    creatorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    creatorAvatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.lightGreen,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    creatorDetails: {
        flex: 1,
    },
    creatorName: {
        ...theme.typography.body,
        fontWeight: '600',
        color: colors.darkGreen,
    },
    creatorRoleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    creatorRoleText: {
        ...theme.typography.label,
        fontSize: 11,
        color: colors.sageGreen,
        marginLeft: 4,
    },
    joinButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.lightGreen,
        borderRadius: 8,
    },
    joinButtonText: {
        color: colors.darkGreen,
        fontWeight: '600',
        fontSize: 12,
    },
    statusText: {
        ...theme.typography.label,
    },
    interestedText: {
        ...theme.typography.label,
        color: colors.sageGreen,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusCompleted: {
        backgroundColor: colors.sageGreen,
    },
    statusUpcoming: {
        backgroundColor: colors.gold,
    },
    statusBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    historyDate: {
        ...theme.typography.label,
    },
    joinedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: colors.lightGreen,
        borderRadius: 8,
    },
    joinedBadgeText: {
        color: colors.darkGreen,
        fontWeight: '600',
        fontSize: 11,
        marginLeft: 4,
    },
    fullBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: colors.sageGreen,
        borderRadius: 8,
        opacity: 0.7,
    },
    fullBadgeText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 11,
    }
});

export default RideCard;
