import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatBackground from '../../components/chat/ChatBackground';
import AttachmentMenu from '../../components/chat/AttachmentMenu';

const colors = require('../../styles/colors');

const ChatScreen = ({ route, navigation }) => {
    const { conversationId: initialConversationId, receiverName, receiverId, receiverProfileImage } = route.params;
    const { user } = useAuth();
    const [conversationId, setConversationId] = useState(initialConversationId);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const flatListRef = useRef(null);

    // ... (existing effects remain same, skipping specific lines to avoid breaking)

    // Helper to request library permissions
    const verifyLibraryPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'This app needs access to your photo library to share photos and videos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Helper to request camera permissions
    const verifyCameraPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'This app needs access to your camera to take photos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const handlePickImage = async () => {
        setMenuVisible(false);
        try {
            const hasPermission = await verifyLibraryPermissions();
            if (!hasPermission) return;

            // Using string literal array to strictly comply with "array of media types" 
            // and avoid potential "undefined" crashes with the Enum in some versions.
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: false, // Optional: set true if editing needed
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                await uploadAndSend(result.assets[0], 'image');
            }
        } catch (error) {
            console.error('Pick Image Error:', error);
            Alert.alert('Error', 'Failed to pick image from gallery.');
        }
    };

    const handleLaunchCamera = async () => {
        setMenuVisible(false);
        try {
            const hasPermission = await verifyCameraPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                await uploadAndSend(result.assets[0], 'image');
            }
        } catch (error) {
            console.error('Camera Launch Error:', error);
            Alert.alert('Error', 'Failed to open camera.');
        }
    };

    const handlePickVideo = async () => {
        setMenuVisible(false);
        try {
            const hasPermission = await verifyLibraryPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                await uploadAndSend(result.assets[0], 'video');
            }
        } catch (error) {
            console.error('Pick Video Error:', error);
            Alert.alert('Error', 'Failed to pick video.');
        }
    };

    const uploadAndSend = async (asset, type) => {
        setSending(true);
        try {
            // Prepare file object for upload
            const file = {
                uri: asset.uri,
                type: type === 'video' ? 'video/mp4' : 'image/jpeg',
                name: asset.fileName || 'upload'
            };

            // 1. Upload
            const uploadRes = await chatService.uploadFile(file);
            if (uploadRes.success) {
                // 2. Send Message
                await chatService.sendMessage(
                    conversationId,
                    type === 'image' ? '📷 Image' : '🎥 Video',
                    type,
                    uploadRes.fileUrl
                );
                fetchMessages();
            }
        } catch (error) {
            console.error('Upload flow error:', error);
            Alert.alert('Error', 'Failed to send file');
        } finally {
            setSending(false);
        }
    };

    const handleRecordVoice = () => {
        setMenuVisible(false);
        Alert.alert('Coming Soon', 'Voice recording logic (requires expo-av recording setup)');
    };

    // Hide default header to use custom one
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    // Initialize Conversation
    useEffect(() => {
        const initChat = async () => {
            if (conversationId) {
                fetchMessages();
                markMessagesRead();
            } else if (receiverId) {
                try {
                    const data = await chatService.startConversation(receiverId);
                    if (data && data.conversation) {
                        setConversationId(data.conversation._id);
                    }
                } catch (error) {
                    console.error('Error initializing chat:', error);
                }
            }
        };

        const markMessagesRead = async () => {
            if (conversationId) {
                try {
                    await chatService.markAsRead(conversationId);
                } catch (error) {
                    console.error('Error marking read:', error);
                }
            }
        };

        initChat();
    }, [conversationId, receiverId]);

    // Polling
    useEffect(() => {
        if (!conversationId) return;
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [conversationId]);

    const fetchMessages = async () => {
        if (!conversationId) return;
        try {
            const data = await chatService.getMessages(conversationId);
            if (data && data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;
        if (!conversationId) {
            console.error('No conversation ID');
            return;
        }

        const content = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            await chatService.sendMessage(conversationId, content);
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            setInputText(content);
        } finally {
            setSending(false);
        }
    };

    // Identify current user ID
    const currentUserId = user?._id || user?.id;

    return (
        <View style={styles.container}>
            <ChatHeader
                receiverName={receiverName}
                receiverProfileImage={receiverProfileImage}
            />

            <AttachmentMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onPickImage={handlePickImage}
                onLaunchCamera={handleLaunchCamera}
                onPickVideo={handlePickVideo}
                onRecordVoice={handleRecordVoice}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardAvoid}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <View style={styles.contentContainer}>
                    <ChatBackground />

                    {loading && messages.length === 0 ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={colors.sageGreen} />
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => (
                                <MessageBubble
                                    message={item}
                                    isMe={item.sender._id === currentUserId || item.sender === currentUserId}
                                />
                            )}
                            inverted
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>

                {/* Input Bar */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.attachButton}
                        onPress={() => setMenuVisible(true)}
                    >
                        <Ionicons name="add" size={24} color="#007AFF" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Say hi 👋"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="send" size={18} color="#FFF" style={{ marginLeft: 2 }} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F6F6',
    },
    keyboardAvoid: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12, // Increased horizontal padding
        paddingVertical: 12,   // Increased vertical padding
        paddingBottom: 30,     // Lift it up significantly from the bottom
        backgroundColor: '#F6F6F6',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    attachButton: {
        padding: 10,
        marginBottom: 4, // Align with input
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 24, // More rounded
        paddingHorizontal: 16,
        paddingVertical: 12, // Taller input
        paddingTop: 12,
        marginHorizontal: 8,
        maxHeight: 120,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        marginBottom: Platform.OS === 'ios' ? 0 : 0,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF', // Standard Blue or App Green? WA is Green/Blue. Sticking to Blue for 'Send' or Green?
        // Let's use specific Green to match bubble
        backgroundColor: '#128C7E', // WhatsApp Teal Green
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: '#B4B4B4',
    },
});

export default ChatScreen;
