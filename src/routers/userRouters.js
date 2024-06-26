const userControllers = require('../controllers/userControllers');
const express = require('express');
const router = express.Router();

router.get('/searchUsernames/:input', userControllers.searchUsernames);
router.get('/getUser/:userid', userControllers.getUser);
router.post('/toggleFollowUser', userControllers.toggleFollowUser);
router.post('/getListUsers', userControllers.getListUsers);
router.post('/setIcon', userControllers.setIcon);
router.post('/setBackground', userControllers.setBackground);

module.exports = router;