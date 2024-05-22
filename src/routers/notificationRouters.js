const notificationControllers = require('../controllers/notificationControllers');
const express = require('express');
const router = express.Router();

router.post('/createNotification', notificationControllers.createNotification);
router.get('/getNotifications/:userid', notificationControllers.getNotifications);
router.post('/removeNotification', notificationControllers.removeNotification);
router.post('/removeAllNotifications', notificationControllers.removeAllNotifications);

module.exports = router;