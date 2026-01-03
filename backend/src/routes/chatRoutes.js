const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const protect = require('../middlewares/authenticate');

// All routes are protected
router.use(protect);

router.post('/', chatController.startConversation);
router.get('/', chatController.getConversations);
router.get('/:conversationId/messages', chatController.getMessages);
router.post('/:conversationId/messages', chatController.sendMessage);
router.patch('/:conversationId/read', chatController.markAsRead);

module.exports = router;
