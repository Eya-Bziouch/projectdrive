import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useRides } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { getRelativeTime, formatDate } from '../../utils/timeUtils';
const colors = require('../../styles/colors');
const { theme } = require('../../styles/theme');

const RideDetailsScreen = ({ route, navigation }) => {
    const { rideId } = route.params;
    const { user } = useAuth();
    const {
        selectedRide,
        selectRide,
        isLoading,
        joinRide,
        leaveRide,
        cancelRide,
        updateRide
    } = useRides();

    useEffect(() => {
        selectRide(rideId);
    }, [rideId, selectRide]);

    if (isLoading && !selectedRide) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.lightGreen} />
            </View>
        );
    }

    if (!selectedRide) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Ride details not found.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const {
        departure,
        destination,
        date,
        time,
        availableSeats,
        neededSeats,
        price,
        description,
        type,
        creator,
        passengers = [],
        status,
        createdAt,
    } = selectedRide;

    // Format dates with defensive checks
    const formattedDate = formatDate(date);
    const postedTime = getRelativeTime(createdAt);

    // Fix: Convert ObjectIds to strings for proper comparison
    // robustness: check both _id and id (virtual)
    const userId = user?._id?.toString() || user?.id?.toString();
    const creatorId = creator?._id?.toString() || creator?.toString();
    const isCreator = userId && creatorId && userId === creatorId;
    const isDriverRide = type === 'DRIVER';
    const isFull = isDriverRide && availableSeats <= 0;
    const isUpcoming = new Date(date) > new Date();
    const isCompleted = status === 'completed';
    const isExpired = status === 'expired'; // Define isExpired

    // Check if current user has already joined this ride
    const hasUserJoined = passengers && passengers.some(
        passenger => {
            const passengerId = passenger._id?.toString() || passenger?.toString();
            return passengerId === userId;
        }
    );

    const handleJoinPress = () => {
        Alert.alert(
            'Join Ride',
            `Are you sure you want to join this ride${isDriverRide && price ? ` for ${price} TND` : ''}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await joinRide(rideId);
                            Toast.show({
                                type: 'success',
                                text1: 'Joined!',
                                text2: 'You have successfully joined the ride.',
                            });
                            navigation.goBack();
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: error.message || 'Failed to join ride.',
                            });
                        }
                    }
                },
            ]
        );
    };

    const handleCancelPress = () => {
        Alert.alert(
            'Cancel Ride',
            'Are you sure you want to cancel this ride? All passengers will be notified.',
            [
                { text: 'No, Keep it', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelRide(rideId);
                            Toast.show({
                                type: 'success',
                                text1: 'Ride Cancelled',
                                text2: 'The ride has been cancelled successfully.',
                            });
                            navigation.goBack();
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: error.message || 'Failed to cancel ride.',
                            });
                        }
                    }
                }
            ]
        );
    };

    const handleLeavePress = () => {
        Alert.alert(
            'Cancel Reservation',
            'Are you sure you want to leave this ride? Your seat will be made available to others.',
            [
                { text: 'No, Keep Seat', style: 'cancel' },
                {
                    text: 'Yes, Leave',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await leaveRide(rideId);
                            Toast.show({
                                type: 'success',
                                text1: 'Reservation Cancelled',
                                text2: 'You have left the ride.',
                            });
                            navigation.goBack();
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: error.message || 'Failed to leave ride.',
                            });
                        }
                    }
                }
            ]
        );
    };

    const handleEditPress = () => {
        navigation.navigate('CreateRide', {
            rideId,
            initialValues: selectedRide,
            isEditMode: true
        });
    };

    const renderStatusBadge = () => {
        let badgeColor = colors.sageGreen;
        let label = status || 'Upcoming';

        if (status === 'completed') {
            badgeColor = colors.sageGreen;
            label = 'Completed';
        } else if (status === 'cancelled') {
            badgeColor = '#FFEBEE';
            label = 'Cancelled';
        } else if (status === 'expired') {
            badgeColor = '#9E9E9E'; // Grey for expired
            label = 'Expired';
        } else if (isFull) {
            badgeColor = colors.gold;
            label = 'Full';
        }

        return (
            <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                <Text style={styles.statusBadgeText}>{label}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.darkGreen} />
                </TouchableOpacity>
                {renderStatusBadge()}
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Location Section */}
                <View style={styles.section}>
                    <View style={styles.locationHeader}>
                        <View style={styles.mapIconContainer}>
                            <Ionicons name="navigate-circle" size={40} color={colors.lightGreen} />
                        </View>
                        <View style={styles.routeContainer}>
                            <Text style={theme.typography.h2}>{departure}</Text>
                            <Ionicons name="arrow-down" size={20} color={colors.sageGreen} style={{ marginVertical: 4 }} />
                            <Text style={theme.typography.h2}>{destination}</Text>
                        </View>
                    </View>
                </View>

                {/* Date & Time Section */}
                <View style={styles.section}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={24} color={colors.sageGreen} />
                            <Text style={styles.infoText}>{formattedDate}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={24} color={colors.sageGreen} />
                            <Text style={styles.infoText}>{time || 'No time'}</Text>
                        </View>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.section}>
                    <View style={styles.detailsRow}>
                        <View>
                            <Text style={styles.detailLabel}>
                                {isDriverRide ? 'Available Seats' : 'Needed Seats'}
                            </Text>
                            <Text style={[styles.detailValue, isFull && { color: colors.gold }]}>
                                {isDriverRide
                                    ? (availableSeats != null ? (isFull ? 'Full' : `${availableSeats} seats left`) : 'undefined')
                                    : (neededSeats != null ? `${neededSeats} seats needed` : 'undefined')
                                }
                            </Text>
                        </View>
                        {isDriverRide && price != null && (
                            <View>
                                <Text style={[styles.detailLabel, { textAlign: 'right' }]}>Price</Text>
                                <Text style={styles.priceValue}>{price} TND</Text>
                            </View>
                        )}
                    </View>
                    {description && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.detailLabel}>Description</Text>
                            <Text style={styles.descriptionText}>{description}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.divider} />

                {/* Posted Time Section */}
                <View style={styles.section}>
                    <View style={styles.postedTimeContainer}>
                        <Ionicons name="time-outline" size={16} color={colors.sageGreen} />
                        <Text style={styles.postedTimeText}>Posted {postedTime}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Creator Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{isDriverRide ? 'Driver' : 'Passenger Request'}</Text>

                    <TouchableOpacity
                        style={styles.profileRow}
                        onPress={() => navigation.navigate('PublicProfile', { userId: creator?._id })}
                    >
                        <View style={styles.avatarContainer}>
                            {creator?.profileImage ? (
                                <Image
                                    source={{ uri: creator.profileImage }}
                                    style={styles.profileAvatar}
                                />
                            ) : (
                                <View style={styles.profileAvatarPlaceholder}>
                                    <Ionicons name="person" size={30} color={colors.sageGreen} />
                                </View>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{creator?.fullName || 'Unknown User'}</Text>
                            <View style={styles.profileMeta}>
                                <View style={[styles.roleBadge, isDriverRide ? styles.driverBadge : styles.passengerBadge]}>
                                    <Ionicons
                                        name={isDriverRide ? "car" : "person"}
                                        size={12}
                                        color={colors.darkGreen}
                                    />
                                    <Text style={styles.roleBadgeText}>
                                        {isDriverRide ? 'Driver' : 'Passenger'}
                                    </Text>
                                </View>
                                {/* Rating Placeholder */}
                                {isCompleted && (
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={12} color="#FFD700" style={{ marginLeft: 8 }} />
                                        <Text style={styles.ratingText}>4.8</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Action Button */}
                < View style={styles.actionSection} >
                    {
                        isCreator ? (
                            // Creator of PASSENGER ride - show Edit + Delete only (unless completed)
                            // Creator of PASSENGER ride - show Edit + Delete only (unless completed)
                            isCompleted ? (
                                <View style={styles.completedMessageContainer}>
                                    <Ionicons name="checkmark-circle" size={48} color={colors.sageGreen} />
                                    <Text style={styles.completedMessageText}>This ride is completed</Text>
                                </View>
                            ) : isExpired ? (
                                <View style={styles.completedMessageContainer}>
                                    <Ionicons name="time-outline" size={48} color={colors.grey || '#9E9E9E'} />
                                    <Text style={[styles.completedMessageText, { color: colors.grey || '#9E9E9E' }]}>Ride Expired</Text>
                                    <Text style={{ color: colors.grey || '#9E9E9E', marginTop: 4 }}>No passengers joined.</Text>
                                </View>
                            ) : (
                                <View style={styles.creatorButtonsContainer}>
                                    {/* Mark as Done / Fulfilled Logic */}
                                    {/* Show MARK AS DONE only if: 
                                             - Driver: passengers > 0 (Strict Rule)
                                             - Passenger: Always allowed (fulfilled)
                                         */}
                                    {(isDriverRide ? passengers.length > 0 : true) && (
                                        <TouchableOpacity
                                            style={[
                                                styles.button,
                                                styles.markDoneButton,
                                                (isDriverRide && isUpcoming) && styles.disabledButton // Driver can't mark done if upcoming
                                            ]}
                                            onPress={async () => {
                                                if (isDriverRide && isUpcoming) {
                                                    Alert.alert("Cannot Mark as Done", "You can only mark a ride as done after its scheduled time.");
                                                    return;
                                                }
                                                Alert.alert(
                                                    isDriverRide ? "Mark as Done" : "Mark as Fulfilled",
                                                    isDriverRide
                                                        ? "Confirm that this ride has been completed? It will be moved to history."
                                                        : "found a ride? This will close the demand.",
                                                    [
                                                        { text: "Cancel", style: "cancel" },
                                                        {
                                                            text: "Confirm",
                                                            onPress: async () => {
                                                                try {
                                                                    await updateRide(rideId, { status: 'completed' });
                                                                    Toast.show({ type: 'success', text1: 'Ride Completed' });
                                                                    navigation.goBack();
                                                                } catch (err) {
                                                                    if (err.message && err.message.includes('expired')) {
                                                                        Toast.show({ type: 'info', text1: 'Expired', text2: 'Ride marked as expired.' });
                                                                        navigation.goBack();
                                                                    } else {
                                                                        Toast.show({ type: 'error', text1: 'Error', text2: err.message });
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    ]
                                                );
                                            }}
                                            disabled={isDriverRide && isUpcoming}
                                        >
                                            <Ionicons name="checkmark-done-circle-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                                            <Text style={[styles.buttonText, { color: colors.white }]}>
                                                {isDriverRide ? "Mark as Done" : "Mark as Fulfilled"}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    <View style={[styles.divider, { marginTop: 16 }]} />

                                    {isDriverRide ? (
                                        <View style={styles.topRowButtons}>
                                            <TouchableOpacity
                                                style={[styles.button, styles.viewPassengersButton]}
                                                onPress={() => navigation.navigate('ViewPassengers', { rideId })}
                                            >
                                                <Ionicons name="people-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                                                <Text style={[styles.buttonText, { color: colors.white }]}>Passengers</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.button, styles.editButton]}
                                                onPress={handleEditPress}
                                            >
                                                <Ionicons name="create-outline" size={20} color={colors.darkGreen} style={{ marginRight: 8 }} />
                                                <Text style={styles.buttonText}>Edit</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.button, styles.editButton, { marginBottom: 10, backgroundColor: colors.cream, width: '100%' }]}
                                            onPress={handleEditPress}
                                        >
                                            <Text style={styles.buttonText}>Edit Demand</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.button, styles.deleteButton, { marginTop: isDriverRide ? 10 : 0 }]}
                                        onPress={handleCancelPress}
                                    >
                                        <Ionicons name="close-circle-outline" size={20} color={colors.darkGreen} style={{ marginRight: 8 }} />
                                        <Text style={styles.buttonText}>Cancel Ride</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        ) : hasUserJoined ? (
                            <View style={styles.joinedContainer}>
                                <View style={[styles.button, styles.alreadyJoinedButton]}>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.darkGreen} style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>Already Joined</Text>
                                </View>

                                {isUpcoming && !isCompleted && !isExpired && (
                                    <TouchableOpacity
                                        style={[styles.button, styles.leaveButton]}
                                        onPress={handleLeavePress}
                                    >
                                        <Text style={[styles.buttonText, { color: '#D32F2F' }]}>Cancel Reservation</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.joinButton,
                                    (isFull || !isUpcoming) && styles.disabledButton
                                ]}
                                onPress={handleJoinPress}
                                disabled={isFull || !isUpcoming || isLoading}
                            >
                                <Text style={styles.buttonText}>
                                    {isFull ? 'Full' : (isDriverRide ? 'Join Ride' : 'Interested')}
                                </Text>
                            </TouchableOpacity>
                        )}

                    {/* Chat Button / Rate Button Logic */}
                    {
                        !isCreator && (
                            <View>
                                {isCompleted ? (
                                    <TouchableOpacity
                                        style={[styles.button, styles.rateButton]}
                                        onPress={() => {
                                            Alert.alert('Rate Driver', 'Rating feature coming soon!');
                                        }}
                                    >
                                        <Ionicons name="star-outline" size={20} color={colors.darkGreen} style={{ marginRight: 8 }} />
                                        <Text style={styles.buttonText}>Rate Driver</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.button, styles.messageButton]}
                                        onPress={() => {
                                            navigation.navigate('Chat', {
                                                conversationId: null,
                                                receiverName: creator?.fullName || 'User',
                                                receiverId: creatorId
                                            });
                                        }}
                                    >
                                        <Ionicons name="chatbubble-outline" size={20} color={colors.darkGreen} style={{ marginRight: 8 }} />
                                        <Text style={styles.buttonText}>
                                            {isDriverRide ? 'Message Driver' : 'Message Passenger'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )
                    }
                </View >
            </ScrollView >

        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        ...theme.typography.body,
        marginBottom: 20,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backIconButton: {
        padding: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusBadgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    locationHeader: {
        flexDirection: 'row',
    },
    mapIconContainer: {
        marginRight: 16,
        justifyContent: 'flex-start',
    },
    routeContainer: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.cream,
        padding: 16,
        borderRadius: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        ...theme.typography.body,
        marginLeft: 8,
        fontWeight: '600',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailLabel: {
        ...theme.typography.label,
        marginBottom: 4,
    },
    detailValue: {
        ...theme.typography.h3,
        color: colors.darkGreen,
    },
    priceValue: {
        ...theme.typography.h2,
        color: colors.gold,
    },
    descriptionContainer: {
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 12,
    },
    descriptionText: {
        ...theme.typography.body,
        color: colors.darkGreen,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginBottom: 24,
    },
    sectionTitle: {
        ...theme.typography.label,
        fontWeight: '700',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        ...theme.typography.h3,
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        ...theme.typography.label,
        marginLeft: 4,
    },
    actionSection: {
        marginTop: 10,
        marginBottom: 40,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.darkGreen,
    },
    joinButton: {
        backgroundColor: colors.lightGreen,
    },
    disabledButton: {
        backgroundColor: colors.sageGreen,
        opacity: 0.5,
    },
    creatorButtonsContainer: {
        width: '100%',
    },
    topRowButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    creatorButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    viewPassengersButton: {
        flex: 3,
        flexDirection: 'row',
        backgroundColor: colors.lightGreen,
        marginRight: 10,
    },
    editButton: {
        flex: 2,
        backgroundColor: colors.cream,
        marginRight: 10,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#FFEBEE', // Subtle red
    },
    backButton: {
        backgroundColor: colors.lightGreen,
        padding: 10,
        borderRadius: 8,
    },
    backButtonText: {
        fontWeight: '700',
    },
    // Profile avatar styles
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileAvatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.lightGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    driverBadge: {
        backgroundColor: colors.lightGreen,
    },
    passengerBadge: {
        backgroundColor: colors.cream,
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.darkGreen,
        marginLeft: 4,
    },
    postedTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cream,
        padding: 12,
        borderRadius: 8,
    },
    postedTimeText: {
        ...theme.typography.label,
        marginLeft: 6,
        color: colors.sageGreen,
        fontStyle: 'italic',
    },
    alreadyJoinedButton: {
        backgroundColor: colors.cream,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.darkGreen,
        marginTop: 10,
        flexDirection: 'row',
    },
    markDoneButton: {
        backgroundColor: colors.darkGreen,
        marginBottom: 10,
        width: '100%',
    },
    rateButton: {
        backgroundColor: colors.gold,
        marginTop: 10,
        flexDirection: 'row',
    },
    completedMessageContainer: {
        alignItems: 'center',
        padding: 20,
    },
    completedMessageText: {
        ...theme.typography.h3,
        color: colors.sageGreen,
        marginTop: 10,
    },
});

export default RideDetailsScreen;
