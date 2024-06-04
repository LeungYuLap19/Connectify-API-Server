const fbAdmin = require('../config/firebase');
const { uploadImage, getImage } = require('./storageServices');
const messagesCollection = fbAdmin.db.collection('messages');
const { v4: uuidv4 } = require('uuid');

async function createChatroom(chatroom) {
    try {
        const chatroomRef = messagesCollection.doc();
        const message = chatroom.messages[0];

        if (message.photo) {
            const imageUrl = await uploadImage(message.photo, chatroomRef.id, uuidv4());
            message.photo = imageUrl;
        }
    
        await chatroomRef.set(chatroom);
        return chatroomRef.id;
    } catch (error) {
        console.error('Error creating chatroom', error);
        throw error;
    }
}

async function addMessage(message, chatroomid) {
    try {
        const chatroomRef = messagesCollection.doc(chatroomid);
        const querySnapshot = await chatroomRef.get();

        if (!querySnapshot.exists) {
            throw new Error('Chatroom not found');
        }

        const chatroomData = querySnapshot.data();
        let updateMessages = [...chatroomData.messages, message];
        await chatroomRef.update({ messages: updateMessages, lastTime: message.dateTime });
        return true;
    } catch (error) {
        console.error('Error adding message', error);
        throw error;
    }
}

async function addPhoto(message, chatroomid) {
    try {
        const chatroomRef = messagesCollection.doc(chatroomid)
        const querySnapshot = await chatroomRef.get();

        if (!querySnapshot.exists) {
            throw new Error('Chatroom not found');
        }

        const imageUrl = await uploadImage(message.photo, chatroomid, uuidv4());

        const chatroomData = querySnapshot.data();
        const newMessage = {...message, photo: imageUrl};

        const updateMessages = [...chatroomData.messages, newMessage];
        await chatroomRef.update({ messages: updateMessages, lastTime: message.dateTime });
        return true;
    } catch (error) {
        console.error('Error adding photo', error);
        throw error;
    }
}

async function removeChatroom(chatroomid) {
    try {
        await messagesCollection.doc(chatroomid).delete();
        return true;
    } catch (error) {
        console.error('Error removing chatroom', error);
        throw error;
    }
}

async function getChatroomsByUserid(userid) {
    try {
        const querySnapshot = await messagesCollection.get();

        const userChatroomsPromises = querySnapshot.docs.map(async doc => {
            const chatroom = doc.data();
            if (chatroom.users.some(user => user.id === userid)) {
                const chatroomData = await processChatroomData(chatroom);
                chatroomData.messages.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
                chatroomData.id = doc.id; 
                return chatroomData;
            }
        });

        let userChatrooms = await Promise.all(userChatroomsPromises);
        userChatrooms = userChatrooms.filter(chatroom => chatroom !== undefined);
        userChatrooms.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

        return userChatrooms;
    } catch (error) {
        console.error('Error getting chatrooms', error);
        throw error;
    }
}

async function processChatroomData(chatroom) {
    const messages = chatroom.messages;

    const processedMessagesPromises = messages.map(async (message) => {
        if (!message.photo) {
            return message;
        }
        const image64 = await getImage(message.photo); 
        return { ...message, photo: image64 }; 
    });

    const processedMessages = await Promise.all(processedMessagesPromises);

    const chatroomData = { ...chatroom, messages: processedMessages };
    return chatroomData;
}

module.exports = {
    createChatroom, 
    addMessage,
    addPhoto, 
    removeChatroom,
    getChatroomsByUserid
}