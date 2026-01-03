import apiService from './api';

const chatService = {
    /**
     * Start a conversation or get existing one
     * @param {string} receiverId - ID of user to chat with
     */
    startConversation: async (receiverId) => {
        const response = await apiService.post('/chat', { receiverId });
        return response.data;
    },

    /**
     * Get user's conversation list
     */
    getConversations: async () => {
        const response = await apiService.get('/chat');
        return response.data;
    },

    /**
     * Get messages for a conversation
     * @param {string} conversationId
     */
    getMessages: async (conversationId) => {
        const response = await apiService.get(`/chat/${conversationId}/messages`);
        return response.data;
    },

    /**
     * Send a message
     * @param {string} conversationId
     * @param {string} content
     */
    sendMessage: async (conversationId, content) => {
        // Fallback for logic still using old signature (just text)
        const response = await apiService.post(`/chat/${conversationId}/messages`, { content, type: 'text' });
        return response.data;
    },

    /**
     * Mark messages as read
     * @param {string} conversationId 
     */
    markAsRead: async (conversationId) => {
        const response = await apiService.patch(`/chat/${conversationId}/read`);
        return response.data;
    },

    /**
     * Upload a file
     * @param {object} file - { uri, type, name }
     */
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType || 'image/jpeg', // Default or from picker
            name: file.fileName || 'upload.jpg'
        });

        const response = await apiService.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Send a message (text or media)
     * @param {string} conversationId
     * @param {string} content - Text content or "Image"/"Video"
     * @param {string} type - 'text', 'image', 'video', 'audio'
     * @param {string} mediaUrl - URL from upload
     * @param {number} duration - length in seconds
     */
    sendMessage: async (conversationId, content, type = 'text', mediaUrl = null, duration = null) => {
        const payload = {
            content,
            type,
            mediaUrl,
            duration
        };
        const response = await apiService.post(`/chat/${conversationId}/messages`, payload);
        return response.data;
    }
};

export default chatService;
