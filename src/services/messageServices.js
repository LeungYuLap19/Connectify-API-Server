const fbAdmin = require('../config/firebase');
const messagesCollection = fbAdmin.db.collection('messages');

async function createChatroom(chatroom) {
    try {
        const chatroomRef = messagesCollection.doc();
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
            throw new Error('Chatroom nto found');
        }

        const chatroomData = querySnapshot.data();
        let updateMessages = [...chatroomData.messages, message];
        await chatroomRef.update({ messages: updateMessages });
        return true;
    } catch (error) {
        console.error('Error adding message', error);
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

        const userChatrooms = [];
        querySnapshot.forEach(doc => {
            const chatroom = doc.data();
            if (chatroom.users.some(user => user.id === userid)) {
                chatroom.messages.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
                userChatrooms.push({ id: doc.id, ...chatroom });
            }
        });

        userChatrooms.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

        return userChatrooms;
    } catch (error) {
        console.error('Error getting chatrooms', error);
        throw error;
    }
}

module.exports = {
    createChatroom, 
    addMessage,
    removeChatroom,
    getChatroomsByUserid
}