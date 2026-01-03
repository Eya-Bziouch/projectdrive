import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { getRelativeTime } from '../../utils/timeUtils';
import Constants from 'expo-constants';

// Helper to resolve URL if it's relative
const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const API_URL = 'http://192.168.1.97:3000';
    return `${API_URL}${url}`;
};

const colors = require('../../styles/colors');

// Separate component to handle video player hook safely
const VideoBubble = ({ uri, style }) => {
    const player = useVideoPlayer(uri, player => {
        player.loop = false;
        // player.play(); // Auto-play if needed, but manual is better for chat
    });

    return (
        <View style={style}>
            <VideoView
                style={{ width: '100%', height: '100%', borderRadius: 8 }}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
            />
        </View>
    );
};

const MessageBubble = ({ message, isMe }) => {
    return (
        <View style={[
            styles.row,
            isMe ? styles.rowMyMessage : styles.rowTheirMessage
        ]}>
            <View style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.theirBubble
            ]}>
                {message.type === 'image' && message.mediaUrl ? (
                    <Image
                        source={{ uri: getFullUrl(message.mediaUrl) }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                    />
                ) : message.type === 'video' && message.mediaUrl ? (
                    <VideoBubble
                        uri={getFullUrl(message.mediaUrl)}
                        style={styles.mediaVideo}
                    />
                ) : message.type === 'audio' && message.mediaUrl ? (
                    <View style={styles.audioContainer}>
                        <Ionicons name="play-circle" size={30} color={isMe ? '#FFF' : '#555'} />
                        <View style={styles.audioLine} />
                        <Text style={{ color: isMe ? '#FFF' : '#555', fontSize: 10 }}>Audio</Text>
                    </View>
                ) : (
                    <Text style={[
                        styles.text,
                        isMe ? styles.myText : styles.theirText
                    ]}>
                        {message.content}
                    </Text>
                )}

                <View style={styles.metaContainer}>
                    <Text style={[
                        styles.time,
                        isMe ? styles.myTime : styles.theirTime
                    ]}>
                        {getRelativeTime(message.createdAt)}
                    </Text>
                    {/* Read receipts could go here */}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        width: '100%',
        marginVertical: 2, // Tighter spacing
        flexDirection: 'row',
        paddingHorizontal: 8,
    },
    rowMyMessage: {
        justifyContent: 'flex-end',
    },
    rowTheirMessage: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '75%',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8, // Less rounded, more square-ish like WA
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    myBubble: {
        backgroundColor: '#E7FFDB', // WhatsApp Outgoing Green
        borderTopRightRadius: 0,
        marginLeft: 40, // constraints
    },
    theirBubble: {
        backgroundColor: '#FFFFFF', // WhatsApp Incoming White
        borderTopLeftRadius: 0,
        marginRight: 40, // constraints
    },
    mediaImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 4,
    },
    mediaVideo: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 4,
        backgroundColor: '#000',
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        minWidth: 150,
    },
    audioLine: {
        height: 2,
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginHorizontal: 8,
    },
    text: {
        fontSize: 15,
        lineHeight: 20,
        color: '#111',
    },
    myText: {
        color: '#111',
    },
    theirText: {
        color: '#111',
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 2,
    },
    time: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.45)', // Grey text for time
    },
    myTime: {
        color: 'rgba(0,0,0,0.45)',
    },
    theirTime: {
        color: 'rgba(0,0,0,0.45)',
    },
});

export default MessageBubble;
