const fuzzysort = require('fuzzysort');
const fbAdmin = require('../config/firebase');
const usersCollection = fbAdmin.db.collection('users');

async function searchUsernames(input) {
    try {
        // Fetch all users from the collection
        const querySnapshot = await usersCollection.get();
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Use fuzzysort to search usernames
        const results = fuzzysort.go(input, users, { key: 'username' });

        // Return the results with the matched user data
        return results.map(result => result.obj);
    } catch (error) {
        console.error('Error searching usernames:', error);
        throw error;
    }
}

module.exports = {
    searchUsernames,
}