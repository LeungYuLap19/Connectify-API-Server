const discoveryControllers = require('../controllers/discoveryControllers');
const express = require('express');
const router = express.Router();

router.get('/discoverUsers/:userid', discoveryControllers.discoverUsers);

module.exports = router;