const fbAdmin = require('../config/firebase');

const notificationCollection = fbAdmin.db.collection('notifications');

async function createNotification(notification) {
    try {
        const notificationRef = notificationCollection.doc();
        await notificationRef.set(notification);
        return notificationRef.id;
    } catch (error) {
        console.error('Error creating notification', error);
        throw error;
    }
}

async function getNotifications(userid) {
    try {
        const querySnapshot = await notificationCollection.where('toUser', '==', userid).get();

        const notifications = [];
        querySnapshot.forEach(doc => {
            const data = {
                id: doc.id,
                ...doc.data()
            };
            notifications.push(data);
        });

        notifications.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        return notifications; 
    } catch (error) {
        console.error('Error getting notifications', error);
        throw error;
    }
}

async function removeNotification(notificationid) {
    try {
        await notificationCollection.doc(notificationid).delete();
        return true;
    } catch (error) {
        console.error('Error removing notification', error);
        throw error;
    }
} 

async function removeAllNotifications(userid) {
    try {
        const querySnapshot = await notificationCollection.where('toUser', '==', userid).get();
        
        querySnapshot.forEach(doc => {
            removeNotification(doc.id)
        });
        return true;
    } catch (error) {
        console.error('Error removing all notifications', error);
        throw error;
    }
}

module.exports = {
    createNotification,
    getNotifications,
    removeNotification,
    removeAllNotifications
}