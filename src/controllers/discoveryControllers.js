const discoveryServices = require('../services/discoveryServices');

async function randomPosts(req, res) {
    try {
        const { userid, lastPostIndex, seed } = req.body;
        const { data, lastIndex } = await discoveryServices.randomPosts(userid, lastPostIndex, seed);
        res.status(200).json({ message: 'got posts', data: data, lastIndex: lastIndex });
    } catch (error) {
        console.log('Error getting posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    randomPosts,
}