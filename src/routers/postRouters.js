const postControllers = require('../controllers/postControllers');
const express = require('express');
const router = express.Router();

router.post('/createPost', postControllers.createPost);
router.post('/getPostsByUserid', postControllers.getPostsByUserId);

module.exports = router;