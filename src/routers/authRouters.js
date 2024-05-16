const authControllers = require('../controllers/authControllers');
const express = require('express');
const router = express.Router();

router.post('/createUser', authControllers.createUser);
router.post('/userLogin', authControllers.userLogin);

module.exports = router;