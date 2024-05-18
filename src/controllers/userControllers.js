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

module.exports = {
    searchUsernames
}