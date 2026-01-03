import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import { getRelativeTime } from '../../utils/timeUtils';
import { useFocusEffect } from '@react-navigation/native';
const colors = require('../../styles/colors');
const { theme } = require('../../styles/theme');

const ConversationListScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConversations = async () => {
        try {
            const data = await chatService.getConversations();
            console.log('Fetched Conversations:', JSON.stringify(data.conversations, null, 2)); // DEBUG LOG
            setConversations(data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const handlePress = (conversation) => {
        // Find the other participant
        const currentUserId = user?._id || user?.id;
        const otherParticipant = conversation.participants.find(
            p => (p._id || p) !== currentUserId
        );

        navigation.navigate('Chat', {
            conversationId: conversation._id,
            receiverName: otherParticipant?.fullName || 'Chat',
            receiverId: otherParticipant?._id // Just in case
        });
    };

    const renderItem = ({ item }) => {
        const currentUserId = user?._id || user?.id;
        const otherParticipant = item.participants.find(
            p => (p._id || p) !== currentUserId
        );
        const lastMsg = item.lastMessage;
        const hasUnread = item.unreadCount > 0;

        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => handlePress(item)}>
                <View style={styles.avatarContainer}>
                    {otherParticipant?.profileImage ? (
                        <Image source={{ uri: otherParticipant.profileImage }} style={styles.avatar} />
                    ) : (
                        <View style={styles.placeholderAvatar}>
                            <Ionicons name="person" size={24} color={colors.white} />
                        </View>
                    )}
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.topRow}>
                        <Text style={[styles.name, hasUnread && styles.unreadName]}>
                            {otherParticipant?.fullName || 'Unknown'}
                        </Text>
                        {item.updatedAt && (
                            <Text style={[styles.time, hasUnread && styles.unreadTime]}>
                                {getRelativeTime(item.updatedAt)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.bottomRow}>
                        <Text numberOfLines={1} style={[styles.lastMessage, hasUnread && styles.unreadMessage]}>
                            {lastMsg ? (
                                (lastMsg.sender === currentUserId ? 'You: ' : '') + lastMsg.content
                            ) : (
                                'No messages yet'
                            )}
                        </Text>
                        {hasUnread && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.lightGreen} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>
            <FlatList
                data={conversations}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.lightGreen]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No conversations yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: colors.white,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: colors.darkGreen,
    },
    listContent: {
        paddingVertical: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    placeholderAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkGreen,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    bottomRow: {
        flexDirection: 'row',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
    unreadName: {
        fontWeight: '800',
        color: '#000',
    },
    unreadTime: {
        color: colors.lightGreen,
        fontWeight: '600',
    },
    unreadMessage: {
        fontWeight: '600',
        color: '#000',
    },
    badge: {
        backgroundColor: colors.error || '#E74C3C',
        borderRadius: 10,
        height: 20,
        minWidth: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
});

export default ConversationListScreen;
