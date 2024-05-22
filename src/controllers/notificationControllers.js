const notificationServices = require('../services/notificationServices');

async function createNotification(req, res) {
    try {
        const { notification } = req.body;
        const data = await notificationServices.createNotification(notification);
        res.status(200).json({ message: 'Notification created', data: data });
    } catch (error) {
        console.log('Error creating notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getNotifications(req, res) {
    try {
        const userid = req.params.userid;
        const data = await notificationServices.getNotifications(userid);
        res.status(200).json({ message: 'Got notifications', data: data });
    } catch (error) {
        console.log('Error getting notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function removeNotification(req, res) {
    try {
        const { notificationid } = req.body;
        const done = await notificationServices.removeNotification(notificationid);
        if (done) {
            res.status(200).json({ message: 'Removed notification' });
        }
    } catch (error) {
        console.log('Error removing notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function removeAllNotifications(req, res) {
    try {
        const { userid } = req.body;
        const done = await notificationServices.removeAllNotifications(userid);
        if (done) {
            res.status(200).json({ message: 'Removed all notifications' });
        }
    } catch (error) {
        console.log('Error removing all notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createNotification,
    getNotifications,
    removeNotification,
    removeAllNotifications
}