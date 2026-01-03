const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            trim: true,
            validate: { // Content is required if it's a text message
                validator: function (v) {
                    if (this.type === 'text') return v && v.length > 0;
                    return true;
                },
                message: 'Content required for text messages'
            }
        },
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'audio'],
            default: 'text'
        },
        mediaUrl: {
            type: String, // URL/Path to the stored file
            default: null
        },
        duration: {
            type: Number, // For audio/video duration in seconds
            default: null
        },
        readBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
