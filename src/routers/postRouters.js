const postControllers = require('../controllers/postControllers');
const express = require('express');
const router = express.Router();

router.post('/createPost', postControllers.createPost);
router.post('/getPostsByUserid', postControllers.getPostsByUserId);
router.post('/toggleLikeOnPost', postControllers.toggleLikeOnPost);
router.post('/addComment', postControllers.addComment);
router.get('/getPostsFromFollowing', postControllers.getPostsFromFollowing);

module.exports = router;