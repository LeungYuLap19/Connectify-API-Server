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

module.exports = {
    createPost,
}