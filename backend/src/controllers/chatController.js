const chatService = require('../services/chatService');

const startConversation = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ success: false, message: 'Receiver ID is required' });
        }

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ success: false, message: 'Cannot message yourself' });
        }

        const conversation = await chatService.startConversation(senderId, receiverId);

        res.status(200).json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await chatService.getUserConversations(userId);
        console.log('User Conversations:', JSON.stringify(conversations, null, 2)); // DEBUG LOG

        res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        // Security check
        const isParticipant = await chatService.isParticipant(conversationId, userId);
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const messages = await chatService.getMessages(conversationId);

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        // Security check
        const isParticipant = await chatService.isParticipant(conversationId, userId);
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const message = await chatService.sendMessage(userId, conversationId, content);

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        // Security check
        const isParticipant = await chatService.isParticipant(conversationId, userId);
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await chatService.markAsRead(userId, conversationId);

        res.status(200).json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead
};
