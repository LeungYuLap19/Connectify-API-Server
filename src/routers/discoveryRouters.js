const discoveryControllers = require('../controllers/discoveryControllers');
const express = require('express');
const router = express.Router();

router.post('/randomPosts', discoveryControllers.randomPosts);

module.exports = router;