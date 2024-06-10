const fbAdmin = require('../config/firebase');
const { getUser } = require('./userServices');

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
        const userPromises = [];

        querySnapshot.forEach(doc => {
            const notificationData = {
                id: doc.id,
                ...doc.data()
            };
            notifications.push(notificationData);
            const userPromise = getUser(notificationData.fromUser);
            userPromises.push(userPromise);
        });

        const usersData = await Promise.all(userPromises);
        const notificationsWithUserData = notifications.map((notification, index) => {
            notification.fromUser = usersData[index];
            return notification;
        });
        notificationsWithUserData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        return notificationsWithUserData;
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