const messageControllers = require('../controllers/messageControllers');
const express = require('express');
const router = express.Router();

router.post('/createChatroom', messageControllers.createChatroom);
router.post('/addMessage', messageControllers.addMessage);
router.post('/addPhoto', messageControllers.addPhoto);
router.post('/removeChatroom', messageControllers.removeChatroom);
router.post('/getChatroomsByUserid', messageControllers.getChatroomsByUserid);

module.exports = router;