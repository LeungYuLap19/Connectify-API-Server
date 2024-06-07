const discoveryServices = require('../services/discoveryServices');

async function discoverUsers(req, res) {
    try {
        const userid = req.params.userid;
        const data = await discoveryServices.discoverUsers(userid);
        res.status(200).json({ message: 'get users succeed', data: data });
    } catch (error) {
        console.log('Error getting users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    discoverUsers,
}