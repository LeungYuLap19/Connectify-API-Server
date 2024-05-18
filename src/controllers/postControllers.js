const postServices = require('../services/postServices');

async function createPost(req, res) {
    try {
        const { postData } = req.body;
        const done = await postServices.createPost(postData);
        if (done) {
            res.status(200).json({message: 'Post created successfully', done: done});
        }
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getPostsByUserId(req, res) {
    try {
        const { userid } = req.body;
        const posts = await postServices.getPostsByUserId(userid);
        res.status(200).json({message: 'Post created successfully', data: posts});
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function toggleLikeOnPost(req, res) {
    try {
        const { userid, postid } = req.body;
        const updatedLikes = await postServices.toggleLikeOnPost(postid, userid);
        if (updatedLikes) {
            res.status(200).json({message: 'Toggle like', likes: updatedLikes});
        }
    } catch (error) {
        console.error('Error toggling like on post:', error);
        if (error.message === 'Post not found') {
            return res.status(400).json({ error: 'Post not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createPost,
    getPostsByUserId,
    toggleLikeOnPost
}