const userControllers = require('../controllers/userControllers');
const express = require('express');
const router = express.Router();

router.get('/searchUsernames/:input', userControllers.searchUsernames);

module.exports = router;