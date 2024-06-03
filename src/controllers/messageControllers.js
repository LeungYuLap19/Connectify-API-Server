const messageServices = require('../services/messageServices');

async function createChatroom(req, res) {
    try {
        const { chatroom } = req.body;
        const data = await messageServices.createChatroom(chatroom);
        res.status(200).json({ message: 'Chatroom created', data: data });
    } catch (error) {
        console.log('Error creating chatroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function addMessage(req, res) {
    try {
        const { message, chatroomid } = req.body;
        const done = await messageServices.addMessage(message, chatroomid);
        if (done) {
            res.status(200).json({ message: 'message added' });
        }
    } catch (error) {
        console.log('Error adding message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function addPhoto(req, res) {
    try {
        const { message, chatroomid } = req.body;
        const done = await messageServices.addPhoto(message, chatroomid);
        if (done) {
            res.status(200).json({ message: 'photo added' });
        }
    } catch (error) {
        console.log('Error adding photo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function removeChatroom(req, res) {
    try {
        const { chatroomid } = req.body;
        const done = await messageServices.removeChatroom(chatroomid);
        if (done) {
            res.status(200).json({ message: 'Chatroom removed' });
        } 
    } catch (error) {
        console.log('Error removing chatroom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getChatroomsByUserid(req, res) {
    try {
        const { userid } = req.body;
        const data = await messageServices.getChatroomsByUserid(userid);
        res.status(200).json({ message: 'Chatroom got', data: data });
    } catch (error) {
        console.log('Error getting chatrooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createChatroom, 
    addMessage,
    addPhoto,
    removeChatroom,
    getChatroomsByUserid
}