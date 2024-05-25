const userServices = require('../services/userServices');

async function searchUsernames(req, res) {
    try {
        const input = req.params.input;
        const data = await userServices.searchUsernames(input);
        if (data) {
            res.status(200).json({message: 'usernames found', data: data});
        }
    } catch (error) {
        console.error('Error searching usernames:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 

async function getUser(req, res) {
    try {
        const userid = req.params.userid;
        const data = await userServices.getUser(userid);
        res.status(200).json({message: 'user found', data: data});
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function toggleFollowUser(req, res) {
    try {
        const { userid, followerid } = req.body;
        const { updatedFollowers, updatedFollowings } = 
            await userServices.toggleFollowUser(userid, followerid);

        if (updatedFollowers && updatedFollowings) {
            res.status(200).json({message: 'usernames found', followers: updatedFollowers, followings: updatedFollowings});
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    searchUsernames,
    getUser,
    toggleFollowUser
}