const tokenControllers = require('../controllers/tokenControllers');
const express = require('express');
const router = express.Router();

router.post('/refreshAccessToken', tokenControllers.refreshAccessToken);
router.post('/cleanTokens', tokenControllers.cleanTokens);

module.exports = router;