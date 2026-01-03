const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const chatService = {
    /**
     * Start a conversation between two users or return existing one
     */
    startConversation: async (senderId, receiverId) => {
        // Check if conversation exists
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('participants', 'fullName profileImage isDriver');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
            await conversation.populate('participants', 'fullName profileImage isDriver');
        }

        return conversation;
    },

    /**
     * Get all conversations for a user
     */
    getUserConversations: async (userId) => {
        const conversations = await Conversation.find({
            participants: userId
        })
            .sort({ updatedAt: -1 })
            .populate('participants', 'fullName profileImage isDriver')
            .populate('lastMessage')
            .lean();

        // Calculate unread messages for each conversation
        const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                sender: { $ne: userId },
                readAt: null
            });
            return { ...conv, unreadCount };
        }));

        return conversationsWithUnread;
    },

    /**
     * Mark messages in a conversation as read
     */
    markAsRead: async (userId, conversationId) => {
        await Message.updateMany(
            {
                conversationId,
                sender: { $ne: userId },
                readAt: null
            },
            {
                $set: { readAt: new Date() }
            }
        );
        return { success: true };
    },

    /**
     * Get messages for a conversation
     */
    getMessages: async (conversationId, limit = 50, skip = 0) => {
        return await Message.find({ conversationId })
            .sort({ createdAt: -1 }) // Newest first for chat UI
            .limit(limit)
            .skip(skip)
            .populate('sender', 'fullName profileImage');
    },

    /**
     * Send a message
     */
    sendMessage: async (senderId, conversationId, content) => {
        const message = await Message.create({
            conversationId,
            sender: senderId,
            content
        });

        // Update conversation's last message and timestamp
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: new Date()
        });

        // Populate sender for immediate UI display
        await message.populate('sender', 'fullName profileImage');
        return message;
    },

    /**
     * Check if user is participant in conversation
     */
    isParticipant: async (conversationId, userId) => {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        });
        return !!conversation;
    },

    /**
     * Get conversation details safely
     */
    getConversationById: async (conversationId) => {
        return await Conversation.findById(conversationId)
            .populate('participants', 'fullName profileImage isDriver');
    }
};

module.exports = chatService;
